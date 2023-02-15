import { Worker } from 'bullmq';
import { redis } from '~/lib/redis.server';
import logger from '~/lib/logger.server';

export interface OrderCompleterData {
  rootDomain: string;
}

export const orderCompleterQueueName = 'certificate-completeOrder';

export const orderCompleterWorker = new Worker<OrderCompleterData>(
  orderCompleterQueueName,
  async (job) => {
    const { rootDomain } = job.data;
    logger.info(`TODO complete order for ${rootDomain}`);
  },
  { connection: redis }
);
