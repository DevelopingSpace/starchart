import { Queue, QueueEvents } from 'bullmq';
import { DnsRecordStatus } from '@prisma/client';

import { redis } from '~/lib/redis.server';
import logger from '~/lib/logger.server';
import { updateDnsRecordById, getDnsRecordById } from '~/models/dns-record.server';
import { dnsWorker } from './dns-worker.server';
import { addNotification } from '../notifications/notifications.server';

import type { DnsJobData } from './dns-worker.server';
import type { DnsRecord } from '@prisma/client';

export const dnsQueue = new Queue<DnsJobData>('dns-queue', { connection: redis });
const dnsQueueEvents = new QueueEvents('dns-queue', { connection: redis });

declare global {
  var __dns_queue_init__: boolean;
}

function init() {
  logger.debug('DNS Queue and DNS Worker init');

  const sendDnsRecordStatusUpdateNotification = async (
    id: DnsRecord['id'],
    status: DnsRecord['status']
  ) => {
    const dnsRecord = await getDnsRecordById(id);
    if (!dnsRecord) {
      throw new Error(`Could not get DNS Record with id=${id}`);
    }
    const { username, subdomain, type, value, user } = dnsRecord;
    switch (status) {
      case DnsRecordStatus.error:
        logger.debug(
          `adding job to send error email notification for DNS record: username=${username}, subdomain=${subdomain}, type=${type}, value=${value}`
        );
        return addNotification({
          emailAddress: user.email,
          subject: `DNS Record: ${subdomain} encountered error`,
          message: `${username}, your DNS record with subdomain ${subdomain} encountered an error.`,
        });
      case DnsRecordStatus.active:
        logger.debug(
          `adding job to send active email notification for DNS record: username=${username}, subdomain=${subdomain}, type=${type}, value=${value}`
        );
        return addNotification({
          emailAddress: user.email,
          subject: `DNS Record: ${subdomain} is active`,
          message: `${username}, your DNS record with subdomain ${subdomain} is ready.`,
        });
    }
  };

  /**
   * When a DNS job fails, clean up the status in the db, and add email notification job
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
        await sendDnsRecordStatusUpdateNotification(dnsRecordId, DnsRecordStatus.error);
      } catch (err) {
        logger.error(
          `DNS job failed, unable to sync record id=${dnsRecordId} to error status and/or add notification`,
          job.data,
          err
        );
      }
    }
  });

  /**
   * When a DNS job completes, update the status in the db, and add email notification job
   */
  dnsQueueEvents.on('completed', async ({ jobId }) => {
    const job = await dnsQueue.getJob(jobId);
    if (job) {
      const { dnsRecordId } = job.data;
      try {
        await updateDnsRecordById(dnsRecordId, {
          status: DnsRecordStatus.active,
        });
        logger.debug(
          `DNS job completed, synced record id=${dnsRecordId} to active status`,
          job.data
        );
        await sendDnsRecordStatusUpdateNotification(dnsRecordId, DnsRecordStatus.active);
      } catch (err) {
        logger.error(
          `DNS job failed, unable to sync record id=${dnsRecordId} to active status and/or add notification`,
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
