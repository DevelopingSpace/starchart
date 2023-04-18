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

// constant for notification frequency in days
const NOTIFICATION_FREQUENCY = 7;

// name for the queue
const expirationNotificationQueueName = 'expiration-notification';

// Queue initialization
let expirationNotificationQueue: Queue;

// Worker
let expirationNotificationWorker: Worker;

export function init() {
  logger.debug(
    'Expiration Notifications init: adding jobs for certificate/DNS record expiration notices'
  );

  // Queue initialization
  expirationNotificationQueue = new Queue(expirationNotificationQueueName, {
    connection: redis,
  });

  expirationNotificationQueue.on('error', (err) => {
    logger.warn(
      'Notifications: Error running check for DNS Records/Certificates about to expire',
      err
    );
  });

  // worker instance to process DNS Record/Certificates expiration notification jobs
  expirationNotificationWorker = new Worker(
    expirationNotificationQueueName,
    async (job) => {
      try {
        logger.debug(`Notifications: processing job ${job.name}`);
        let dnsRecords = await getExpiringDnsRecords();
        await Promise.all(
          dnsRecords.map(async ({ id, subdomain, expiresAt, user }) => {
            await updateStatusAndNotify('dns-record', id, {
              emailAddress: user.email,
              subject: 'My.Custom.Domain DNS record approaching expiration',
              message: `${
                user.displayName
              }, this is a friendly reminder that your DNS record with subdomain: ${subdomain} will expire on: ${expiresAt.toLocaleDateString(
                'en-CA'
              )}. Log in to My.Custom.Domain to renew.`,
            });
          })
        );
        let certificates = await getExpiringCertificates();
        await Promise.all(
          certificates.map(async ({ id, domain, validTo, user }) => {
            await updateStatusAndNotify('certificate', id, {
              emailAddress: user.email,
              subject: 'My.Custom.Domain certificate approaching expiration',
              message: `${
                user.displayName
              }, this is a friendly reminder that your certificate with domain: ${domain} will expire ${
                validTo ? `on: ${validTo.toLocaleDateString('en-CA')}` : `in less than 30 days.`
              }. Log in to My.Custom.Domain to renew. `,
            });
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

  Promise.all([
    addExpirationNotifications('certificate'),
    addExpirationNotifications('dns-record'),
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

const updateNotificationStatus = (type: string, id: number) => {
  switch (type) {
    case 'certificate':
      return prisma.certificate.update({
        where: {
          id,
        },
        data: {
          lastNotified: new Date(),
        },
      });
    case 'dns-record':
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
const getExpiringCertificates = () => {
  return prisma.certificate.findMany({
    where: {
      validTo: {
        lte: dayjs().add(30, 'd').toDate(),
      },
      status: 'issued',

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
    include: { user: true },
  });
};

const getExpiringDnsRecords = () => {
  return prisma.dnsRecord.findMany({
    where: {
      expiresAt: {
        lte: dayjs().add(30, 'd').toDate(),
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
    include: { user: true },
  });
};
// function to add jobs
async function addExpirationNotifications(type: string) {
  let jobName = `${expirationNotificationQueueName}-${type}-expiry`;
  return expirationNotificationQueue.add(jobName, {
    repeat: { every: 5 * 60 * 1000 },
  });
}

// function to update notification and add notification jobs
const updateStatusAndNotify = async (type: string, id: number, data: NotificationData) => {
  const { emailAddress, subject, message } = data;
  await updateNotificationStatus(type, id);
  await addNotification({
    emailAddress,
    subject,
    message,
  });
};
