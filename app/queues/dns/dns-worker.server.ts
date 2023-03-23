import { UnrecoverableError, Worker } from 'bullmq';
import { DnsRecordStatus } from '@prisma/client';

import { redis } from '~/lib/redis.server';
import logger from '~/lib/logger.server';
import { deleteDnsRecordById, updateDnsRecordById } from '~/models/dns-record.server';
import {
  createDnsRecord,
  upsertDnsRecord,
  deleteDnsRecord,
  getChangeStatus,
} from '~/lib/dns.server';

import type { DnsRecord } from '@prisma/client';

type DnsOperation = 'create' | 'update' | 'delete';

type DnsChangeData = {
  dnsOperation: DnsOperation;
  username: DnsRecord['username'];
  type: DnsRecord['type'];
  fqdn: string;
  value: DnsRecord['value'];
  changeId?: string;
  dnsStatus?: string;
};

enum Step {
  Route53Change,
  WaitOnRoute53Change,
  SyncChangeToDatabase,
  Finished,
}

export type DnsJobData = DnsChangeData & { dnsRecordId: DnsRecord['id']; step?: Step };

export const dnsWorker = new Worker<DnsJobData>(
  'dns-queue',
  async (job) => {
    logger.debug('dns-worker started');
    let { step = Step.Route53Change } = job.data;

    while (step !== Step.Finished) {
      switch (step) {
        case Step.Route53Change: {
          const changeId = await executeChange({
            ...job.data,
          });
          step = Step.WaitOnRoute53Change;
          await job.update({ ...job.data, changeId, step });
          break;
        }

        case Step.WaitOnRoute53Change: {
          const dnsStatus = await waitOnChange(job.data.changeId);
          step = Step.SyncChangeToDatabase;
          await job.update({ ...job.data, dnsStatus, step });
          break;
        }

        case Step.SyncChangeToDatabase: {
          const { dnsRecordId, dnsOperation, dnsStatus } = job.data;
          await syncChange(dnsRecordId, dnsOperation, dnsStatus);
          step = Step.Finished;
          await job.update({ ...job.data, step });
          return step;
        }

        default: {
          throw new UnrecoverableError(`invalid step: ${step}`);
        }
      }
    }
  },
  {
    connection: redis,
    limiter: {
      max: 5,
      duration: 1_000,
    },
  }
);

async function executeChange({ dnsOperation, username, type, fqdn, value }: DnsChangeData) {
  logger.debug(
    `Route53 DNS change: ${dnsOperation} ${fqdn}=${value} with type=${type} for user=${username}`
  );

  try {
    switch (dnsOperation) {
      case 'create':
        return createDnsRecord(username, type, fqdn, value);
      case 'update':
        return upsertDnsRecord(username, type, fqdn, value);
      case 'delete':
        return deleteDnsRecord(username, type, fqdn, value);
      default:
        throw new UnrecoverableError(`Invalid DNS Operation: ${dnsOperation}`);
    }
  } catch (error) {
    logger.warn(
      `Route53 DNS change error: unable to ${dnsOperation} ${fqdn} (value=${value}) for user=${username}`,
      error
    );
    throw error;
  }
}

async function waitOnChange(changeId?: string) {
  logger.debug(`Checking status of Route53 DNS Change ${changeId}`);

  // If we don't get back a Change ID, it means there's nothing to
  // wait on and everything is already in sync.
  if (!changeId) {
    return 'INSYNC';
  }

  // Otherwise, see if Route53 has finished syncing this change
  const status = await getChangeStatus(changeId);

  if (status === 'PENDING') {
    throw new Error(`Route53 DNS Change ${changeId} still pending`);
  }

  return status;
}

async function syncChange(id: DnsRecord['id'], dnsOperation: DnsOperation, dnsStatus?: string) {
  logger.debug(`Syncing DNS record id=${id} with DNS status=${dnsStatus} to database`);

  try {
    switch (dnsOperation) {
      case 'delete':
        if (dnsStatus === 'INSYNC') {
          return deleteDnsRecordById(id);
        }
        break;
      default:
        return updateDnsRecordById(id, {
          status: dnsStatus === 'INSYNC' ? DnsRecordStatus.active : DnsRecordStatus.error,
        });
    }
  } catch (error) {
    logger.warn(`Unable to update status of DNS record id=${id} in DB`, error);
    throw error;
  }
}
