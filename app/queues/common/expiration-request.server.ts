import { Worker, Queue, UnrecoverableError } from 'bullmq';

import { redis } from '~/lib/redis.server';
import logger from '~/lib/logger.server';

import { getExpiredDnsRecords, deleteDnsRecordById } from '~/models/dns-record.server';
import { addNotification } from '../notifications/notifications.server';

const { EXPIRATION_REPEAT_FREQUENCY_S, JOB_REMOVAL_FREQUENCY_S } = process.env;

// constant  for removing job on completion/failure (in seconds)
const JOB_REMOVAL_INTERVAL_S = 7 * 24 * 60 * 60; // 7 days
declare global {
  var __expiration_request_init__: boolean;
}
// queue name
const expirationRequestQueueName = 'expiration-request';

// queue initialization
const expirationRequestQueue = new Queue(expirationRequestQueueName, {
  connection: redis,
});

export function addExpirationRequest() {
  return expirationRequestQueue.add(expirationRequestQueueName, {
    repeat: { every: Number(EXPIRATION_REPEAT_FREQUENCY_S) * 1000 || 24 * 60 * 60 * 1000 },
    removeOnComplete: { age: Number(JOB_REMOVAL_FREQUENCY_S) || JOB_REMOVAL_INTERVAL_S },
    removeOnFail: { age: Number(JOB_REMOVAL_FREQUENCY_S) || JOB_REMOVAL_INTERVAL_S },
  });
}

// worker definition
const expirationRequestWorker = new Worker(
  expirationRequestQueueName,
  async () => {
    try {
      logger.info('process DNS record expiration');
      let dnsRecords = await getExpiredDnsRecords();
      await Promise.all(
        dnsRecords.map(async ({ id, user }) =>
          Promise.all([
            // delete records from Route53 and DB
            deleteDnsRecordById(id),
            // add notification jobs (assuming deletion went successfully)
            addNotification({
              emailAddress: user.email,
              subject: 'DNS record expiration subject',
              message: 'DNS record expiration message',
            }),
          ])
        )
      );
    } catch (err) {
      throw new UnrecoverableError(`Unable to process DNS record expiration: ${err}`);
    }
    logger.info('TODO: process certificate expiration');
  },
  { connection: redis }
);

process.on('SIGINT', () => expirationRequestWorker.close());
