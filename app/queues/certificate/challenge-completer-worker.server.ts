import { Worker } from 'bullmq';
import { redis } from '~/lib/redis.server';
import logger from '~/lib/logger.server';

export interface ChallengeCompleterData {
  rootDomain: string;
  username: string;
}

export const challengeCompleterQueueName = 'certificate-completeChallenges';

export const challengeCompleterWorker = new Worker<ChallengeCompleterData>(
  challengeCompleterQueueName,
  async (job) => {
    const { rootDomain } = job.data;
    logger.info(`TODO complete challenges for ${rootDomain}`);
  },
  { connection: redis }
);
