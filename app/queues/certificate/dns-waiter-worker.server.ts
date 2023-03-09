import { Worker } from 'bullmq';
import { redis } from '~/lib/redis.server';
import logger from '~/lib/logger.server';
import LetsEncrypt from '~/lib/lets-encrypt.server';
import { getChildrenValuesOfQueueName } from '~/utils';
import * as challengeModel from '~/models/challenge.server';
import { orderCreatorQueueName } from './order-creator-worker.server';

import type { OrderCreatorOutputData } from './order-creator-worker.server';

export interface DnsWaiterData {
  rootDomain: string;
  username: string;
}

export const dnsWaiterQueueName = 'certificate-waitDns';

/**
 * This worker
 * - Takes the certificate id from the child "order-creator-worker"
 * - Reloads the challenges from DB
 * - Verifies each challenge
 *   - If all successful, completes this queue
 *   - If any fails, it throws, so BullMQ will retry
 */

export const dnsWaiterWorker = new Worker<DnsWaiterData>(
  dnsWaiterQueueName,
  async (job) => {
    const { rootDomain } = job.data;
    const childrenValues = await getChildrenValuesOfQueueName<OrderCreatorOutputData>({
      queueName: orderCreatorQueueName,
      job,
    });

    // Get the order creator return value
    const [orderCreatorRetval] = Object.values(childrenValues);

    logger.info('Checking challenges in DNS', {
      rootDomain,
      certificateId: orderCreatorRetval.certificateId,
    });

    const challenges = await challengeModel.getChallengesByCertificateId(
      orderCreatorRetval.certificateId
    );

    // Using a for .. of loop here instead of forEach to be able to await
    for (const challenge of challenges) {
      logger.debug('Checking challenge', {
        rootDomain,
        certificateId: orderCreatorRetval.certificateId,
        domain: challenge.domain,
        key: challenge.challengeKey,
      });

      const challengeResult = await LetsEncrypt.verifyChallenge({
        domain: challenge.domain,
        key: challenge.challengeKey,
      });

      if (!challengeResult) {
        logger.debug('Challenge **not found** in DNS', {
          rootDomain,
          certificateId: orderCreatorRetval.certificateId,
          domain: challenge.domain,
          key: challenge.challengeKey,
        });
        throw new Error(`At least one challenge is failing on ${rootDomain}`);
      }

      logger.info('All challenges successfully verified in DNS', {
        rootDomain,
        certificateId: orderCreatorRetval.certificateId,
      });
    }
  },
  { connection: redis }
);
