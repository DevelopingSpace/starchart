import { Worker, UnrecoverableError } from 'bullmq';
import { redis } from '~/lib/redis.server';
import logger from '~/lib/logger.server';
import LetsEncrypt from '~/lib/lets-encrypt.server';
import * as certificateModel from '~/models/certificate.server';
import * as challengeModel from '~/models/challenge.server';
import { addDnsRequest } from '~/queues/dns/add-dns-record-flow.server';

import type { ChallengeBundle } from '~/lib/lets-encrypt.server';

export interface OrderCreatorData {
  rootDomain: string;
  username: string;
}

export interface OrderCreatorOutputData {
  certificateId: number;
}

export const orderCreatorQueueName = 'certificate-createOrder';

/**
 * This async fn handles adding challenges to DB and DNS
 */
const handleChallenges = ({
  username,
  certificateId,
  bundles,
}: {
  username: string;
  certificateId: number;
  bundles: ChallengeBundle[];
}) => {
  const challengeInsertPromises = bundles.map(async ({ domain, value: challengeKey }) => {
    logger.info(`Adding challenge to DNS`, { domain, challengeKey });

    /**
     * add challenge to DNS
     */
    await addDnsRequest({
      username,
      type: 'TXT',
      subdomain: domain,
      value: challengeKey,
    });

    return challengeModel.createChallenge({
      domain,
      challengeKey,
      certificateId,
    });
  });

  return Promise.all(challengeInsertPromises);
};

/**
 * This BullMQ job is the first in the chain when generating an SSL certificate
 *
 * It initializes Let's encrypt, creates an order, retrieves the challenges
 * stores all this information in the DB and also passes it down to the
 * next BullMQ worker in our flow
 */

export const orderCreatorWorker = new Worker<OrderCreatorData, OrderCreatorOutputData>(
  orderCreatorQueueName,
  async (job) => {
    const { rootDomain, username } = job.data;

    logger.info(`Creating certificate order for ${rootDomain}`);

    let letsEncrypt;
    /**
     * Initialize Let's Encrypt
     */
    try {
      logger.debug("Initializing Let's encrypt");
      letsEncrypt = await new LetsEncrypt().initialize();
    } catch (e) {
      // If initialize failed, we almost certainly have a setup error.
      // Let's rethrow this as an UnrecoverableError, but preserve the message and stack

      logger.error("Failed to initialize Let's encrypt, rethrowing error as Unrecoverable", e);

      const newError = new UnrecoverableError((e as Error).message);
      newError.stack = (e as Error).stack;
      throw newError;
    }

    /**
     * We have a working LE now, let's create an order
     */
    try {
      logger.debug(`Creating ACME order for ${rootDomain}`);
      await letsEncrypt.createOrder(rootDomain);
    } catch (e) {
      // Log and rethrow the same error to keep message and stack
      logger.error("Failed to create a Let's Encrypt order", e);
      throw e;
    }
    logger.info(`Order created successfully`);

    /**
     * Store order data in the DB
     */
    let certificateId;
    try {
      // Destructuring assignment to existing variable
      ({ id: certificateId } = await certificateModel.createCertificate({
        username,
        domain: rootDomain,
        orderUrl: letsEncrypt.order!.url,
      }));
      logger.info(`Order created successfully, added to db with id: ${certificateId}`);
    } catch (e) {
      // Log and rethrow the same error to keep message and stack
      logger.error(`Failed to insert certificate into db`, e);
      throw e;
    }

    /**
     * Add challenges to DB and DNS, get back id, domain, challengeKey, for each of them
     */

    try {
      await handleChallenges({ username, certificateId, bundles: letsEncrypt.challengeBundles! });
      logger.info('All challenge entries have been added');
    } catch (e) {
      // Log and rethrow the same error to keep message and stack
      logger.error(`Failed to add challenge entries`, e);
      throw e;
    }

    /**
     * We will return this data to BullMQ, so subsequent jobs can make use of this information
     */
    return {
      certificateId,
    } as OrderCreatorOutputData;
  },
  { connection: redis }
);

process.on('SIGINT', () => orderCreatorWorker.close());
