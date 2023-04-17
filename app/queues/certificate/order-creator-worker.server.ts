import { Worker, UnrecoverableError } from 'bullmq';
import { redis } from '~/lib/redis.server';
import logger from '~/lib/logger.server';
import LetsEncrypt from '~/lib/lets-encrypt.server';
import * as certificateModel from '~/models/certificate.server';
import * as challengeModel from '~/models/challenge.server';
import { createDnsRecord } from '~/models/dns-record.server';
import { getSubdomainFromFqdn } from '~/utils';

import type { ChallengeBundle } from '~/lib/lets-encrypt.server';
import type { CertificateJobData } from './certificateJobTypes.server';

export const orderCreatorQueueName = 'certificate-createOrder';

/**
 * This async fn handles adding challenges to DB and DNS
 */
const handleChallenges = async ({
  username,
  certificateId,
  bundles,
}: {
  username: CertificateJobData['username'];
  certificateId: CertificateJobData['certificateId'];
  bundles: ChallengeBundle[];
}): Promise<void> => {
  const challengeInsertPromises = bundles.map(
    async ({ domain, value: challengeKey }): Promise<void> => {
      logger.info(`Adding challenge to DNS`, { domain, challengeKey });

      let subdomain = '';
      try {
        subdomain = getSubdomainFromFqdn(username, domain);
      } catch (e) {
        // Let's rethrow this as an UnrecoverableError, but preserve the message and stack

        logger.error("Challenge domain is not a subdomain of the user's base domain", {
          username,
          domain,
        });

        const newError = new UnrecoverableError((e as Error).message);
        newError.stack = (e as Error).stack;
        throw newError;
      }

      const challengeRecord = await challengeModel.createChallenge({
        domain,
        challengeKey,
        certificateId,
      });

      /**
       * add challenge to DNS
       */
      await createDnsRecord({
        username,
        type: 'TXT',
        subdomain,
        value: challengeKey,
        challengeId: challengeRecord.id,
      });
    }
  );

  await Promise.all(challengeInsertPromises);
};

/**
 * This BullMQ job is the first in the chain when generating an SSL certificate
 *
 * It initializes Let's encrypt, creates an order, retrieves the challenges
 * stores all this information in the DB and also passes it down to the
 * next BullMQ worker in our flow
 */

export const orderCreatorWorker = new Worker<CertificateJobData>(
  orderCreatorQueueName,
  async (job) => {
    const { rootDomain, username, certificateId } = job.data;

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
     * Update order data in the DB
     */
    try {
      await certificateModel.updateCertificateById(certificateId, {
        orderUrl: letsEncrypt.order!.url,
      });
      logger.info(`Order created successfully, updated certificate with id: ${certificateId}`);
    } catch (e) {
      // Log and rethrow the same error to keep message and stack
      logger.error(`Failed to update certificate ${certificateId} in db`, e);
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
  },
  { connection: redis }
);

process.on('SIGINT', () => orderCreatorWorker.close());
