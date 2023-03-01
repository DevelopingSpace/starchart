import { FlowProducer } from 'bullmq';
import {
  addDbRecordQueueName,
  createDnsRecordQueueName,
  checkDnsStatusQueueName,
  syncDbStatusQueueName,
} from './create-record-worker.server';
import { redis } from '~/lib/redis.server';

import type { FlowJob } from 'bullmq';
import type { JobRecord } from './create-record-worker.server';

const flowProducer = new FlowProducer({ connection: redis });

export const addDnsRequest = async ({ username, type, name, value }: JobRecord) => {
  // Step 1. Create a record in MySQL for a domain with pending status
  const addDbRecord: FlowJob = {
    name: `addDbRecord:${name}-${username}`,
    queueName: addDbRecordQueueName,
    data: { username, type, name, value } as JobRecord,
    opts: {
      failParentOnFailure: true,
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 15_000,
      },
    },
  };

  // Step 2. Request Route53 to create a record
  const createDnsRecord: FlowJob = {
    name: `createDnsRecord:${name}-${username}`,
    queueName: createDnsRecordQueueName,
    data: { username, type, name, value } as JobRecord,
    opts: {
      failParentOnFailure: true,
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 15_000,
      },
    },
  };

  // Step 3. Poll Route53 to check connection status of the domain until it's ready
  const checkDnsStatus: FlowJob = {
    name: `checkDnsStatus:${name}-${username}`,
    queueName: checkDnsStatusQueueName,
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

  // Step 4. Update the MySQL record with the active or error status
  const syncDbStatus: FlowJob = {
    name: `syncDbStatus:${name}-${username}`,
    queueName: syncDbStatusQueueName,
    children: [addDbRecord, checkDnsStatus],
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
