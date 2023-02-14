import { Worker } from 'bullmq';
import { redis } from '~/lib/redis.server';
import logger from '~/lib/logger.server';

export interface OrderCreatorData {
  rootDomain: string;
}

export const orderCreatorQueueName = 'certificate-createOrder';

export const orderCreatorWorker = new Worker<OrderCreatorData>(
  orderCreatorQueueName,
  async (job) => {
    const { rootDomain } = job.data;
    logger.info(`TODO create order for ${rootDomain}`);
  },
  { connection: redis }
);
