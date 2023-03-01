import { UnrecoverableError, Worker } from 'bullmq';
import { RecordStatus } from '@prisma/client';

import { redis } from '~/lib/redis.server';
import { prisma } from '~/db.server';
import logger from '~/lib/logger.server';
import { setMonthsFromNow } from '~/lib/domains.server';
import { createRecord, getChangeStatus } from '~/lib/dns.server';

import type { Record } from '@prisma/client';

export const addDbRecordQueueName = 'add-db-record';
export const createDnsRecordQueueName = 'create-dns-record';
export const checkDnsStatusQueueName = 'check-dns-status';
export const syncDbStatusQueueName = 'sync-db-status';

export interface JobRecord {
  username: Record['username'];
  type: Record['type'];
  name: Record['name'];
  value: Record['value'];
}

export type addDbRecordJobRecordResult = Record['id'];
export type addDnsRecordJobRecordResult = string;

export const addDbRecordWorker = new Worker<JobRecord, addDbRecordJobRecordResult>(
  addDbRecordQueueName,
  async (job) => {
    logger.debug('Creating a record in DB');
    const { username, type, name, value } = job.data;

    const existingRecords = await prisma.record.count({
      where: {
        type,
        name,
        value,
      },
    });

    if (existingRecords) {
      throw new Error('Record already exists');
    }

    try {
      const result = await prisma.record.create({
        data: {
          username,
          type,
          name,
          value,
          expiresAt: setMonthsFromNow(6),
          status: RecordStatus.pending,
        },
      });
      return result.id;
    } catch (error) {
      logger.warn('Could not create a record in DB', error);
      throw error;
    }
  },
  { connection: redis }
);

export const createDnsRecordWorker = new Worker<JobRecord, addDnsRecordJobRecordResult>(
  createDnsRecordQueueName,
  async (job) => {
    logger.debug('Creating a record in Route 53');
    const { username, type, name, value } = job.data;

    try {
      return createRecord(username, type, name.toLowerCase(), value);
    } catch (error) {
      logger.warn('Could not create a record in Route53', error);
      throw error;
    }
  },
  { connection: redis }
);

export const checkDnsStatusWorker = new Worker(
  checkDnsStatusQueueName,
  async (job) => {
    logger.debug('Checking Route53 readiness');

    const childJobValues: { [jobKey: string]: string } = await job.getChildrenValues();
    const createDnsRecordJobKey = Object.keys(childJobValues).find((item) =>
      item.includes(createDnsRecordQueueName)
    );

    if (!createDnsRecordJobKey) {
      throw new Error(`Could not receive data from child job ${createDnsRecordQueueName}`);
    }
    const changeId = childJobValues[createDnsRecordJobKey];

    const status = await getChangeStatus(changeId);

    if (status === 'PENDING') {
      throw new Error('Change status is still pending');
    }
    return status;
  },
  { connection: redis }
);

export const syncDbStatusWorker = new Worker(
  syncDbStatusQueueName,
  async (job) => {
    logger.debug('Sync DB status with DNS');

    const childJobValues = await job.getChildrenValues();
    const keysForChildValues = Object.keys(childJobValues);
    if (keysForChildValues.length !== 2) {
      throw new UnrecoverableError('Invalid children values from previous workers');
    }

    const addDbRecordJobKey = keysForChildValues.find((item) =>
      item.includes(addDbRecordQueueName)
    );
    const checkStatusJobKey = keysForChildValues.find((item) =>
      item.includes(checkDnsStatusQueueName)
    );

    if (!addDbRecordJobKey) {
      throw new Error(`Could not receive data from child job ${addDbRecordQueueName}`);
    }
    if (!checkStatusJobKey) {
      throw new Error(`Could not receive data from child job ${checkDnsStatusQueueName}`);
    }
    const recordId = childJobValues[addDbRecordJobKey] as addDbRecordJobRecordResult;
    const status = childJobValues[checkStatusJobKey] as addDnsRecordJobRecordResult;

    try {
      await prisma.record.update({
        where: {
          id: recordId,
        },
        data: {
          status: status === 'INSYNC' ? RecordStatus.active : RecordStatus.error,
        },
      });
    } catch (error) {
      logger.warn('Could not update the record in DB', error);
      throw error;
    }
  },
  { connection: redis }
);
