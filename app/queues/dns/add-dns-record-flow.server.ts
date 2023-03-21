import { FlowProducer } from 'bullmq';
import { redis } from '~/lib/redis.server';
import { buildDomain } from '~/utils';
import { dnsUpdateQueueName } from './workers/dns-update-worker.server';
import { pollDnsStatusQueueName } from './workers/poll-dns-status-worker.server';
import { syncDbStatusQueueName } from './workers/sync-db-status-worker.server';
import { createUserDnsRecord } from '~/models/dns-record.server';

import type { FlowJob } from 'bullmq';
import type { DnsRecord } from '@prisma/client';
import type { DnsUpdaterData } from './workers/dns-update-worker.server';
import type { DbRecordSynchronizerData } from './workers/sync-db-status-worker.server';

export type Subdomain = { subdomain: string };

export type AddDnsRequestData = Pick<DnsRecord, 'username' | 'type' | 'value'> &
  Partial<Pick<DnsRecord, 'description' | 'course' | 'ports'>> &
  Subdomain;

export enum WorkType {
  create = 'create',
  update = 'update',
  delete = 'delete',
}

const flowProducer = new FlowProducer({ connection: redis });

export const addDnsRequest = async (data: AddDnsRequestData) => {
  const { username, type, subdomain, value } = data;

  const fqdn = buildDomain(username, subdomain);

  // Before running workflow. Add a record to DB
  const dnsRecordId = await createUserDnsRecord({
    username,
    type,
    subdomain,
    value,
  });

  // Step 1. Request Route53 to create a dns record
  const createDnsRecord: FlowJob = {
    name: `createDnsRecord:${subdomain}-${username}`,
    queueName: dnsUpdateQueueName,
    data: {
      workType: WorkType.create,
      username,
      type,
      fqdn,
      value,
    } as DnsUpdaterData,
    opts: {
      failParentOnFailure: true,
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 15_000,
      },
    },
  };

  // Step 2. Poll Route53 to check connection status of the domain until it's ready
  const pollDnsStatus: FlowJob = {
    name: `pollDnsStatus:${subdomain}-${username}`,
    queueName: pollDnsStatusQueueName,
    children: [createDnsRecord],
    opts: {
      failParentOnFailure: true,
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 60_000,
      },
    },
  };

  // Step 3. Update the MySQL record with the active or error status
  const syncDbStatus: FlowJob = {
    name: `syncDbStatus:${subdomain}-${username}`,
    queueName: syncDbStatusQueueName,
    children: [pollDnsStatus],
    data: { workType: WorkType.create, id: dnsRecordId } as DbRecordSynchronizerData,
    opts: {
      failParentOnFailure: true,
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 30_000,
      },
    },
  };

  return flowProducer.add(syncDbStatus);
};
