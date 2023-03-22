import { UnrecoverableError, Worker } from 'bullmq';

import { redis } from '~/lib/redis.server';
import logger from '~/lib/logger.server';
import { createDnsRecord, upsertDnsRecord, deleteDnsRecord } from '~/lib/dns.server';

import type { WorkType } from '../add-dns-record-flow.server';
import type { DnsRecord } from '@prisma/client';

export const dnsUpdateQueueName = 'dns-record-update';

export interface DnsUpdaterData {
  workType: WorkType;
  username: DnsRecord['username'];
  type: DnsRecord['type'];
  fqdn: string;
  value: DnsRecord['value'];
}

// We expect to get back a Change ID, so that we can wait on Route53
// to sync all changes.  However, in the case of delete, when a record
// is already gone from Route53, there is nothing to wait for, so there
// will be no Change ID (null)
export type DnsRecordUpdateJobResult = string | null;

export const dnsUpdateWorker = new Worker<DnsUpdaterData, DnsRecordUpdateJobResult>(
  dnsUpdateQueueName,
  async (job) => {
    const { workType, username, type, fqdn, value } = job.data;
    logger.debug(`${workType} DNS record in Route 53`);

    try {
      switch (workType) {
        case 'create':
          return createDnsRecord(username, type, fqdn, value);

        case 'update':
          return upsertDnsRecord(username, type, fqdn, value);

        case 'delete':
          return deleteDnsRecord(username, type, fqdn, value);

        default:
          throw new UnrecoverableError(`Invalid work type: ${workType}`);
      }
    } catch (error) {
      logger.warn('Could not update DNS record in Route53', error);
      throw error;
    }
  },
  {
    connection: redis,
    limiter: {
      max: 3,
      duration: 1_000,
    },
  }
);
