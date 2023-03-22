import { Worker, UnrecoverableError } from 'bullmq';
import { redis } from '~/lib/redis.server';
import logger from '~/lib/logger.server';
import LetsEncrypt from '~/lib/lets-encrypt.server';
import * as certificateModel from '~/models/certificate.server';

import type { DnsRecord } from '@prisma/client';

export interface ChallengeCompleterData {
  rootDomain: string;
  username: string;
  certificateId: DnsRecord['id'];
}

export const challengeCompleterQueueName = 'certificate-completeChallenges';

export const challengeCompleterWorker = new Worker<ChallengeCompleterData>(
  challengeCompleterQueueName,
  async (job) => {
    const { rootDomain, certificateId } = job.data;

    logger.info('Attempting to complete ACME challenges with the provider', {
      rootDomain,
      certificateId,
    });

    /**
     * Reload certificate URL from DB
     */
    let certificateEntry;
    try {
      certificateEntry = await certificateModel.getCertificateById(certificateId);
    } catch (e) {
      // If we cannot recall the record from db, it's certainly an unrecoverable error
      logger.error(
        `Failed to reload certificate ${certificateId} from DB, rethrowing error as Unrecoverable`,
        e
      );

      const newError = new UnrecoverableError((e as Error).message);
      newError.stack = (e as Error).stack;
      throw newError;
    }

    /**
     * Initialize Let's Encrypt
     */
    let letsEncrypt;
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
     * Recall certificate status in the letsEncrypt object
     */
    try {
      logger.debug(
        `Attempting to recall order ${certificateId} using ${certificateEntry.orderUrl}`
      );
      await letsEncrypt.recallOrder(certificateEntry.orderUrl!);
    } catch (e) {
      logger.error(`Failed to recall order`, e);

      throw e;
    }

    /**
     * Complete challenges
     */
    let areCertificateChallengesComplete = false;
    try {
      logger.debug(`Attempting to complete challenges with the ACME provider`, { certificateId });
      areCertificateChallengesComplete = await letsEncrypt.verifyChallenges();
    } catch (e) {
      logger.error(`Failed to completed challenges for order order ${certificateId}`, e);

      throw e;
    }

    if (!areCertificateChallengesComplete) {
      logger.info('Challenges are not yet ready', {
        rootDomain,
        certificateId,
      });

      // Adding more detail in debug log level
      logger.debug('Challenges are not yet ready', {
        rootDomain,
        certificateId,
        challengeBundles: letsEncrypt.challengeBundles,
      });

      throw new Error('Challenges are not yet ready');
    }

    logger.info('All Challenges has been approved by the ACME provider', {
      rootDomain,
      certificateId,
    });
  },
  { connection: redis }
);

process.on('SIGINT', () => challengeCompleterWorker.close());
