import { Worker } from 'bullmq';
import { redis } from '~/lib/redis.server';
import logger from '~/lib/logger.server';

export interface DnsCleanerData {
  rootDomain: string;
  username: string;
  certificateId: number;
}

export const dnsCleanerQueueName = 'certificate-cleanDns';

export const dnsCleanerWorker = new Worker<DnsCleanerData>(
  dnsCleanerQueueName,
  async (job) => {
    const { rootDomain } = job.data;
    logger.info(`TODO clean DNS for ${rootDomain}`);
  },
  { connection: redis }
);

process.on('SIGINT', () => dnsCleanerWorker.close());
