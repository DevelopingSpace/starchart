import { Worker } from 'bullmq';
import { redis } from '~/lib/redis.server';
import logger from '~/lib/logger.server';

export interface DnsWaiterData {
  rootDomain: string;
  username: string;
}

export const dnsWaiterQueueName = 'certificate-waitDns';

export const dnsWaiterWorker = new Worker<DnsWaiterData>(
  dnsWaiterQueueName,
  async (job) => {
    const { rootDomain } = job.data;
    logger.info(`TODO wait on DNS for ${rootDomain}`);
  },
  { connection: redis }
);
