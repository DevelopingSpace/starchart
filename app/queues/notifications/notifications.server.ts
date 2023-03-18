import { Queue, Worker } from 'bullmq';

import { redis } from '~/lib/redis.server';
import logger from '~/lib/logger.server';
import sendNotification from '~/lib/notifications.server';
import { addExpirationRequest } from '../common/expiration-request.server';

export type NotificationData = {
  emailAddress: string;
  subject: string;
  message: string;
};

async function init() {
  try {
    logger.debug('Expiration Requests init: adding jobs for certificate/record expiration');
    await addExpirationRequest();
  } catch (err) {
    logger.error(`Unable to start expiration notification workers: ${err}`);
  }
}
if (process.env.NODE_ENV === 'production') {
  init();
} else {
  // Only do this setup once in dev
  if (!global.__expiration_request_init__) {
    init();
    global.__expiration_request_init__ = true;
  }
}

/**
 * This is the main way callers interact with the notifications
 * queue. It takes care of creating a unique job name.
 */
export const addNotification = (data: NotificationData) => {
  const jobName = `${data.emailAddress}:${data.subject}`;
  return notificationsQueue.add(jobName, data);
};

/**
 * A queue for keeping track of notifications we need to send to users
 */
export const notificationsQueue = new Queue<NotificationData>('notifications', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 60 * 1000 /* 1 minute */,
    },
  },
});

notificationsQueue.on('error', (err) => {
  logger.warn('notifications queue error', err);
});

/**
 * A worker for processing a notification job, sending an email to the user
 */
export const notificationsWorker = new Worker<NotificationData>(
  'notifications',
  async (job) => {
    const { emailAddress, subject, message } = job.data;
    try {
      await sendNotification(emailAddress, subject, message);
    } catch (err) {
      logger.warn(`unable to send notification to ${emailAddress}`, err);
      throw err;
    }
  },
  { connection: redis }
);

process.on('SIGINT', () => notificationsWorker.close());
