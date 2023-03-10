import { FlowProducer } from 'bullmq';
import {
  dbRecordUpdateQueueName,
  dnsRecordUpdateQueueName,
  checkDnsStatusQueueName,
  syncDbStatusQueueName,
} from './dns-record-worker.server';
import { redis } from '~/lib/redis.server';
import { WorkType } from './dns-record-worker.server';

import type { FlowJob } from 'bullmq';
import type { JobRecord } from './dns-record-worker.server';
import { buildDomain } from '~/utils';

const flowProducer = new FlowProducer({ connection: redis });

export const addDnsRequest = async ({ username, type, name, value }: JobRecord) => {
  const fullRecordName = buildDomain(username, name);

  // Step 1. Create a record in MySQL for a domain with pending status
  const addDbRecord: FlowJob = {
    name: `addDbRecord:${name}-${username}`,
    queueName: dbRecordUpdateQueueName,
    data: { workType: WorkType.create, username, type, name: fullRecordName, value } as JobRecord,
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
    queueName: dnsRecordUpdateQueueName,
    data: { workType: WorkType.create, username, type, name: fullRecordName, value } as JobRecord,
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
    data: { workType: WorkType.create } as JobRecord,
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

export const updateDnsRequest = async ({ id, username, type, name, value }: JobRecord) => {
  const fullRecordName = buildDomain(username, name);

  // Step 1. Update the record in MySQL with pending status
  const updateDbRecord: FlowJob = {
    name: `updateDbRecord:${name}-${username}`,
    queueName: dbRecordUpdateQueueName,
    data: {
      workType: WorkType.update,
      id,
      username,
      type,
      name: fullRecordName,
      value,
    } as JobRecord,
    opts: {
      failParentOnFailure: true,
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 15_000,
      },
    },
  };

  // Step 2. Request Route53 to update the record
  const updateDnsRecord: FlowJob = {
    name: `updateDnsRecord:${name}-${username}`,
    queueName: dnsRecordUpdateQueueName,
    children: [updateDbRecord],
    data: { workType: WorkType.update, username, type, name: fullRecordName, value } as JobRecord,
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
    children: [updateDnsRecord],
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
    children: [checkDnsStatus],
    data: { workType: WorkType.update, id } as Partial<JobRecord>,
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

export const deleteDnsRequest = async ({ id, username, type, name, value }: JobRecord) => {
  const fullRecordName = buildDomain(username, name);

  // Step 1. Request Route53 to delete the record
  const updateDnsRecord: FlowJob = {
    name: `deleteDnsRecord:${name}-${username}`,
    queueName: dnsRecordUpdateQueueName,
    data: { workType: WorkType.delete, username, type, name: fullRecordName, value } as JobRecord,
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
  const checkDnsStatus: FlowJob = {
    name: `checkDnsStatus:${name}-${username}`,
    queueName: checkDnsStatusQueueName,
    children: [updateDnsRecord],
    opts: {
      failParentOnFailure: true,
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 60_000,
      },
    },
  };

  // Step 3. Delete the record in MySQL
  const updateDbRecord: FlowJob = {
    name: `deleteDbRecord:${name}-${username}`,
    queueName: dbRecordUpdateQueueName,
    data: { workType: WorkType.delete, id } as JobRecord,
    children: [checkDnsStatus],
    opts: {
      failParentOnFailure: true,
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 15_000,
      },
    },
  };

  return flowProducer.add(updateDbRecord);
};
