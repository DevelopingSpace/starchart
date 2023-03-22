import { Queue, QueueEvents } from 'bullmq';
import { DnsRecordStatus } from '@prisma/client';

import { redis } from '~/lib/redis.server';
import logger from '~/lib/logger.server';
import { updateDnsRecordById } from '~/models/dns-record.server';
import { dnsWorker } from './dns-worker.server';

import type { DnsJobData } from './dns-worker.server';

export const dnsQueue = new Queue<DnsJobData>('dns-queue', { connection: redis });
const dnsQueueEvents = new QueueEvents('dns-queue', { connection: redis });

declare global {
  var __dns_queue_init__: boolean;
}

function init() {
  logger.debug('DNS Queue and DNS Worker init');

  /**
   * When a DNS job fails, clean up the status in the db
   */
  dnsQueueEvents.on('failed', async ({ jobId }) => {
    const job = await dnsQueue.getJob(jobId);
    if (job) {
      const { dnsRecordId } = job.data;
      try {
        await updateDnsRecordById(dnsRecordId, {
          status: DnsRecordStatus.error,
        });
        logger.debug(`DNS job failed, synced record id=${dnsRecordId} to error status`, job.data);
      } catch (err) {
        logger.error(
          `DNS job failed, unable to sync record id=${dnsRecordId} to error status`,
          job.data,
          err
        );
      }
    }
  });

  process.on('SIGTERM', async () => {
    await dnsWorker.close();
    await dnsQueue.close();
  });
}

if (process.env.NODE_ENV === 'production') {
  init();
} else {
  // Only do this setup once in dev
  if (!global.__dns_queue_init__) {
    init();
    global.__dns_queue_init__ = true;
  }
}
