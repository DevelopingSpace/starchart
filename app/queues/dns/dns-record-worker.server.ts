import { UnrecoverableError, Worker } from 'bullmq';
import { RecordStatus } from '@prisma/client';

import { redis } from '~/lib/redis.server';
import logger from '~/lib/logger.server';
import { createRecord, upsertRecord, deleteRecord, getChangeStatus } from '~/lib/dns.server';
import * as db from '~/models/record.server';

import type { Record } from '@prisma/client';

export const dbRecordUpdateQueueName = 'db-record-update';
export const dnsRecordUpdateQueueName = 'dns-record-update';
export const checkDnsStatusQueueName = 'check-dns-status';
export const syncDbStatusQueueName = 'sync-db-status';

export enum WorkType {
  create = 'create',
  update = 'update',
  delete = 'delete',
}
export interface JobRecord {
  workType?: WorkType;
  id?: Record['id'];
  username: Record['username'];
  type: Record['type'];
  name: Record['name'];
  value: Record['value'];
}

export type addDbRecordJobRecordResult = Record['id'];
export type dnsRecordUpdateJobRecordResult = string;

export const dbRecordWorker = new Worker<JobRecord>(
  dbRecordUpdateQueueName,
  async (job) => {
    const { workType, id, username, type, name, value } = job.data;
    logger.debug(`${workType} DB record in DB`);

    const data = { username, type, name, value };

    try {
      switch (workType) {
        case 'create':
          if (await db.doesRecordExist(data)) {
            throw new Error('Record already exists');
          }

          const result = await db.createRecord(data);
          return result.id as addDbRecordJobRecordResult;
        case 'update':
          const status = RecordStatus.pending;
          await db.updateRecordById(id!, type, name, value, status);
          break;
        case 'delete':
          await db.deleteRecordById(id!);
          break;
        default:
          throw new UnrecoverableError(`Invalid work type: ${workType}`);
      }
    } catch (error) {
      logger.warn('Could not update record in DB', error);
      throw error;
    }
  },
  { connection: redis }
);

export const dnsRecordWorker = new Worker<JobRecord, dnsRecordUpdateJobRecordResult>(
  dnsRecordUpdateQueueName,
  async (job) => {
    const { workType, username, type, name, value } = job.data;
    logger.debug(`${workType} DNS record in Route 53`);

    try {
      switch (workType) {
        case 'create':
          return createRecord(username, type, name.toLowerCase(), value);

        case 'update':
          return upsertRecord(username, type, name.toLowerCase(), value);

        case 'delete':
          return deleteRecord(username, type, name.toLowerCase(), value);

        default:
          throw new UnrecoverableError(`Invalid work type: ${workType}`);
      }
    } catch (error) {
      logger.warn('Could not update record in Route53', error);
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
      item.includes(dnsRecordUpdateQueueName)
    );

    if (!createDnsRecordJobKey) {
      throw new Error(`Could not receive data from child job ${dnsRecordUpdateQueueName}`);
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

    const { workType } = job.data;
    let recordId: Record['id'];

    const childJobValues = await job.getChildrenValues();
    const keysForChildValues = Object.keys(childJobValues);

    switch (workType) {
      case 'create':
        if (keysForChildValues.length !== 2) {
          throw new UnrecoverableError('Invalid children values from previous workers');
        }

        const dbRecordUpdateJobKey = keysForChildValues.find((item) =>
          item.includes(dbRecordUpdateQueueName)
        );
        if (!dbRecordUpdateJobKey) {
          throw new Error(`Could not receive data from child job ${dbRecordUpdateQueueName}`);
        }

        recordId = childJobValues[dbRecordUpdateJobKey] as addDbRecordJobRecordResult;
        break;
      case 'update':
        recordId = job.data.id;
        break;
      default:
        throw new UnrecoverableError(`Invalid work type: ${workType}`);
    }

    const checkStatusJobKey = keysForChildValues.find((item) =>
      item.includes(checkDnsStatusQueueName)
    );

    if (!checkStatusJobKey) {
      throw new Error(`Could not receive data from child job ${checkDnsStatusQueueName}`);
    }

    const dnsStatus = childJobValues[checkStatusJobKey] as dnsRecordUpdateJobRecordResult;

    try {
      const status = dnsStatus === 'INSYNC' ? RecordStatus.active : RecordStatus.error;
      await db.updateRecordStatusById(recordId, status);
    } catch (error) {
      logger.warn('Could not update the record in DB', error);
      throw error;
    }
  },
  { connection: redis }
);

process.on('SIGINT', () =>
  Promise.all([
    dbRecordWorker.close(),
    dnsRecordWorker.close(),
    checkDnsStatusWorker.close(),
    syncDbStatusWorker.close(),
  ])
);
