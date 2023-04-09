// Third party modules
import { Worker, Queue, UnrecoverableError } from 'bullmq';
import dayjs from 'dayjs';

// Internal modules
import { redis } from '~/lib/redis.server';
import logger from '~/lib/logger.server';
import { addNotification } from '~/queues/notifications/notifications.server';
import { prisma } from '~/db.server';

// Types
import type { NotificationData } from '~/queues/notifications/notifications.server';

declare global {
  var __expiration_init__: boolean;
}
export enum RecordType {
  Certificate = 'certificate',
  DnsRecord = 'record',
}
export interface ExpirationStatusPayload {
  type: RecordType;
}
// constant for notification frequency in days
const NOTIFICATION_FREQUENCY = 7;

// name for the queue
const expirationNotificationQueueName = 'expiration-notification';

// Queue initialization
let expirationNotificationQueue: Queue<ExpirationStatusPayload>;

// Worker
let expirationNotificationWorker: Worker<ExpirationStatusPayload>;

export function init() {
  logger.debug(
    'Expiration Notifications init: adding jobs for certificate/DNS record expiration notices'
  );

  // Queue initialization
  expirationNotificationQueue = new Queue<ExpirationStatusPayload>(
    expirationNotificationQueueName,
    {
      connection: redis,
    }
  );

  expirationNotificationQueue.on('error', (err) => {
    logger.warn(
      'Notifications: Error running check for DNS Records/Certificates about to expire',
      err
    );
  });

  // worker instance to process DNS Record/Certificates expiration notification jobs
  expirationNotificationWorker = new Worker<ExpirationStatusPayload>(
    expirationNotificationQueueName,
    async (job) => {
      const { type } = job.data;
      try {
        logger.debug(`Notifications: processing job ${job.name}`);
        let records = await getRecordsByExpiration(RecordType.DnsRecord);
        await Promise.all(
          records.map(async (record) => {
            if (!record.lastNotified || record.lastNotified < dayjs().subtract(30, 'd').toDate()) {
              await updateStatusAndNotify(type, record.id, {
                emailAddress: record.user.email,
                subject: `Sample ${type} expiration notice`,
                message: `Sample ${type} expiration notice message`,
              });
            }
          })
        );
        logger.debug(`Notifications: job ${job.name} completed`);
      } catch (err) {
        // fail job from repeating  - encountered error:
        logger.error(
          `Notifications: job ${job.name} failed, rethrowing error as Unrecoverable`,
          err
        );

        const newError = new UnrecoverableError((err as Error).message);
        newError.stack = (err as Error).stack;
        throw newError;
      }
    },
    { connection: redis }
  );

  //logic to execute if worker failed to process job
  expirationNotificationWorker.on('failed', (job, err) => {
    logger.warn(`Notifications: job ${job?.name} failed with error: `, err);
  });

  process.on('SIGINT', () => expirationNotificationWorker.close());

  return Promise.all([
    addExpirationNotifications(RecordType.Certificate),
    addExpirationNotifications(RecordType.DnsRecord),
  ]).catch((err) =>
    logger.error(`Unable to start expiration notification workers: ${err.message}`, err)
  );
}

if (process.env.NODE_ENV === 'production') {
  init();
} else {
  // Only do this setup once in dev
  if (!global.__expiration_init__) {
    init();
    global.__expiration_init__ = true;
  }
}

const updateNotificationStatus = (type: RecordType, id: number) => {
  switch (type) {
    case RecordType.Certificate:
      return prisma.certificate.update({
        where: {
          id,
        },
        data: {
          lastNotified: new Date(),
        },
      });
    case RecordType.DnsRecord:
      return prisma.dnsRecord.update({
        where: {
          id,
        },
        data: {
          lastNotified: new Date(),
        },
      });
  }
};

// fetch records by status based on type
const getRecordsByExpiration = (type: RecordType) => {
  switch (type) {
    case RecordType.Certificate:
      return prisma.certificate.findMany({
        where: {
          validTo: {
            lte: dayjs().add(1, 'M').toDate(),
          },
          OR: [
            {
              lastNotified: null,
            },
            {
              lastNotified: dayjs()
                .subtract(NOTIFICATION_FREQUENCY * 4, 'd')
                .toDate(),
            },
          ],
        },
        select: {
          user: true,
          id: true,
          lastNotified: true,
        },
      });
    case RecordType.DnsRecord:
      return prisma.dnsRecord.findMany({
        where: {
          expiresAt: {
            lte: dayjs().add(1, 'M').toDate(),
          },
          OR: [
            {
              lastNotified: null,
            },
            {
              lastNotified: dayjs()
                .subtract(NOTIFICATION_FREQUENCY * 4, 'd')
                .toDate(),
            },
          ],
        },
        select: {
          user: true,
          id: true,
          lastNotified: true,
        },
      });
  }
};

// function to add jobs
async function addExpirationNotifications(type: RecordType) {
  let jobName = `${expirationNotificationQueueName}-${type}`;
  return expirationNotificationQueue.add(
    jobName,
    { type },
    {
      repeat: { every: 5 * 60 * 1000 },
    }
  );
}

// function to update notification and add notification jobs
const updateStatusAndNotify = async (type: RecordType, id: number, data: NotificationData) => {
  const { emailAddress, subject, message } = data;
  await updateNotificationStatus(type, id);
  await addNotification({
    emailAddress,
    subject,
    message,
  });
};
