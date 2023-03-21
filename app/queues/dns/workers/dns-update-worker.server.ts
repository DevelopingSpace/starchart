import { UnrecoverableError, Worker } from 'bullmq';

import { redis } from '~/lib/redis.server';
import logger from '~/lib/logger.server';
import { createRecord, upsertRecord, deleteRecord } from '~/lib/dns.server';

import type { WorkType } from '../add-record-flow.server';
import type { Record } from '@prisma/client';

export const dnsUpdateQueueName = 'dns-record-update';

export interface DnsUpdaterData {
  workType: WorkType;
  username: Record['username'];
  type: Record['type'];
  fqdn: string;
  value: Record['value'];
}

export type DnsRecordUpdateJobResult = string;

export const dnsUpdateWorker = new Worker<DnsUpdaterData, DnsRecordUpdateJobResult>(
  dnsUpdateQueueName,
  async (job) => {
    const { workType, username, type, fqdn, value } = job.data;
    const name = fqdn.toLowerCase();
    logger.debug(`${workType} DNS record in Route 53`);

    try {
      switch (workType) {
        case 'create':
          return createRecord(username, type, name, value);

        case 'update':
          return upsertRecord(username, type, name, value);

        case 'delete':
          return deleteRecord(username, type, name, value);

        default:
          throw new UnrecoverableError(`Invalid work type: ${workType}`);
      }
    } catch (error) {
      logger.warn('Could not update record in Route53', error);
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
