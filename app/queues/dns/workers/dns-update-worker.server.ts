import { UnrecoverableError, Worker } from 'bullmq';

import { redis } from '~/lib/redis.server';
import logger from '~/lib/logger.server';
import { createDnsRecord, upsertDnsRecord, deleteDnsRecord } from '~/lib/dns.server';

import type { WorkType } from '../add-record-flow.server';
import type { DnsRecord } from '@prisma/client';

export const dnsUpdateQueueName = 'dns-record-update';

export interface DnsUpdaterData {
  workType: WorkType;
  username: DnsRecord['username'];
  type: DnsRecord['type'];
  fqdn: string;
  value: DnsRecord['value'];
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
          return createDnsRecord(username, type, name, value);

        case 'update':
          return upsertDnsRecord(username, type, name, value);

        case 'delete':
          return deleteDnsRecord(username, type, name, value);

        default:
          throw new UnrecoverableError(`Invalid work type: ${workType}`);
      }
    } catch (error) {
      logger.warn('Could not update DNS record in Route53', error);
      throw error;
    }
  },
  { connection: redis }
);
