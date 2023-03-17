import { UnrecoverableError, Worker } from 'bullmq';
import { RecordStatus } from '@prisma/client';
import { redis } from '~/lib/redis.server';
import logger from '~/lib/logger.server';
import { deleteRecordById, updateRecordStatusById } from '~/models/record.server';
import type { PollDnsStatusJobResult } from './poll-dns-status-worker.server';
import { pollDnsStatusQueueName } from './poll-dns-status-worker.server';

import type { Record } from '@prisma/client';
import type { WorkType } from '../add-record-flow.server';

export const syncDbStatusQueueName = 'sync-db-status';

export interface DbRecordSynchronizerData {
  workType: WorkType;
  id: Record['id'];
}

export const syncDbStatusWorker = new Worker<DbRecordSynchronizerData>(
  syncDbStatusQueueName,
  async (job) => {
    const { workType, id } = job.data;
    logger.debug(`${workType} sync DB with DNS`);

    if (!id) {
      throw new UnrecoverableError(`Invalid work type: ${workType}`);
    }

    const childJobValues = await job.getChildrenValues();

    const pollDnsStatusJobKey = Object.keys(childJobValues).find((item) =>
      item.includes(pollDnsStatusQueueName)
    );

    if (!pollDnsStatusJobKey) {
      throw new Error(`Could not receive data from child job ${pollDnsStatusQueueName}`);
    }

    const dnsStatus = childJobValues[pollDnsStatusJobKey] as PollDnsStatusJobResult;

    try {
      switch (workType) {
        case 'delete':
          if (dnsStatus === 'INSYNC') {
            await deleteRecordById(id);
          }
          break;
        default:
          const status = dnsStatus === 'INSYNC' ? RecordStatus.active : RecordStatus.error;
          await updateRecordStatusById(id, status);
          break;
      }
    } catch (error) {
      logger.warn('Could not update the record in DB', error);
      throw error;
    }
  },
  { connection: redis }
);
