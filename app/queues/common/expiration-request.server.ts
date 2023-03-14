import { Worker, Queue, UnrecoverableError } from 'bullmq';

import { redis } from '~/lib/redis.server';
import logger from '~/lib/logger.server';

import { getExpiredRecords } from '~/models/record.server';
import { addNotification } from '../notifications/notifications.server';
import { deleteDnsRequest } from '../dns/delete-record-flow.server';

const { EXPIRATION_REPEAT_FREQUENCY_MS, JOB_REMOVAL_FREQUENCY_MS } = process.env;

// constant  for removing job on completion/failure (in milliseconds)
const JOB_REMOVAL_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
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
    repeat: { every: Number(EXPIRATION_REPEAT_FREQUENCY_MS) || 24 * 60 * 60 * 1000 },
    removeOnComplete: { age: Number(JOB_REMOVAL_FREQUENCY_MS) || JOB_REMOVAL_INTERVAL_MS },
    removeOnFail: { age: Number(JOB_REMOVAL_FREQUENCY_MS) || JOB_REMOVAL_INTERVAL_MS },
  });
}

// worker definition
const expirationRequestWorker = new Worker(
  expirationRequestQueueName,
  async (job) => {
    try {
      logger.info('process DNS record expiration');
      let dnsRecords = await getExpiredRecords();
      Promise.all(
        dnsRecords.map(async ({ id, username, type, subdomain, value, user }) => {
          // delete records from Route53 and DB
          await deleteDnsRequest({ id, username, type, subdomain, value });
          // add notification jobs (assuming deletion went successfully)
          await addNotification({
            emailAddress: user.email,
            subject: 'DNS record expiration subject',
            message: 'DNS record expiration message',
          });
        })
      );
    } catch (err) {
      throw new UnrecoverableError(`Unable to process DNS record expiration: ${err}`);
    }
    logger.info('TODO: process certificate expiration');
  },
  { connection: redis }
);

process.on('SIGINT', () => expirationRequestWorker.close());
