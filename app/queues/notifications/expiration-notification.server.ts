// Third party modules
import { Worker, Queue, UnrecoverableError } from 'bullmq';
import dayjs from 'dayjs';

// Internal modules
import { redis } from '~/lib/redis.server';
import logger from '~/lib/logger.server';
import { addNotification } from './notifications.server';
import { prisma } from '~/db.server';

// Types
import type { NotificationData } from './notifications.server';

enum RecordType {
  Certificate = 'certificate',
  DnsRecord = 'record',
}
interface ExpirationStatusPayload {
  type: RecordType;
}
// constant for notification frequency in days
const NOTIFICATION_FREQUENCY = 7;
// name for the queue
const expirationNotificationQueueName = 'expiration-notification';

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
      return prisma.record.update({
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
      return prisma.record.findMany({
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
// Queue initialization
const expirationNotificationQueue = new Queue<ExpirationStatusPayload>(
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

// function to add jobs
const addExpirationNotifications = async (type: RecordType) => {
  let jobName = `${expirationNotificationQueueName}-${type}`;
  return expirationNotificationQueue.add(
    jobName,
    { type },
    {
      repeat: { every: 5 * 60 * 1000 },
    }
  );
};
// only way to interact add jobs
export const addRecordExpirationNotifications = async () =>
  addExpirationNotifications(RecordType.DnsRecord);
export const addCertificateExpirationNotifications = async () =>
  addExpirationNotifications(RecordType.Certificate);

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
// worker instance to process DNS Record/Certificates expiration notification jobs
export const expirationNotificationWorker = new Worker<ExpirationStatusPayload>(
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
      logger.error(`Notifications: job ${job.name} failed, rethrowing error as Unrecoverable`, err);

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
