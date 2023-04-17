import { Worker, UnrecoverableError } from 'bullmq';
import { CertificateStatus } from '@prisma/client';
import { redis } from '~/lib/redis.server';
import logger from '~/lib/logger.server';
import LetsEncrypt from '~/lib/lets-encrypt.server';
import * as certificateModel from '~/models/certificate.server';
import { addNotification } from '../notifications/notifications.server';

import type { CertificateJobData } from './certificateJobTypes.server';

export const orderCompleterQueueName = 'certificate-completeOrder';

export const orderCompleterWorker = new Worker<CertificateJobData>(
  orderCompleterQueueName,
  async (job) => {
    const { rootDomain, certificateId } = job.data;

    logger.info('Attempting to complete ACME order with the provider', {
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
    let certificate: string;
    let privateKey: string;
    let chain: string;
    let validFrom: Date;
    let validTo: Date;
    try {
      await letsEncrypt.recallOrder(certificateEntry.orderUrl!);

      ({ privateKey, certificate, chain, validFrom, validTo } = await letsEncrypt.completeOrder());
    } catch (e) {
      logger.error('failed to finalize certificate', e);

      // rethrow
      throw e;
    }

    await certificateModel.updateCertificateById(certificateId, {
      certificate,
      chain,
      privateKey,
      validFrom,
      validTo,
      status: CertificateStatus.issued,
    });

    logger.info(`Certificate ${certificateId} successfully issued and stored`);
    // send success email notification
    logger.debug(
      `Sending success notification email for certificate with id=${certificateEntry.id}, username=${certificateEntry.username}, domain=${certificateEntry.domain}`
    );
    await addNotification({
      emailAddress: certificateEntry.user.email,
      subject: 'My.Custom.Domain certificate ready',
      message: `${certificateEntry.user.displayName}, your certificate with domain: *.${certificateEntry.domain} is ready. Log in to My.Custom.Domain to view/manage it.`,
    });
  },
  { connection: redis }
);

process.on('SIGINT', () => orderCompleterWorker.close());
