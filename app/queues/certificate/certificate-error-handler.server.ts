import { Queue, QueueEvents } from 'bullmq';
import logger from '~/lib/logger.server';
import { CertificateStatus } from '@prisma/client';
import { addNotification } from '../notifications/notifications.server';
import * as certificateModel from '~/models/certificate.server';
import * as challengeModel from '~/models/challenge.server';
import { setIsReconciliationNeeded } from '~/models/system-state.server';
import { dnsCleanerQueueName } from './dns-cleaner-worker.server';

import { redis } from '~/lib/redis.server';

import type { CertificateJobData } from './certificateJobTypes.server';
import type { QueueEventsListener } from 'bullmq';

declare global {
  var __cert_flow_error_handlers_init__: boolean;
}

/**
 * When one step in the queue fails, it fails all subsequent steps as well.
 * Because of this, we can attach a listener of type `failed` to the last one
 * to do the cleanup
 *
 *
 * Notes:
 * Worker.error('failed', () => {}) seems to be never called
 * Worker.on('failed', () => {}) is called on failures that are retried too
 * FlowProducer.on('error', () => {}) does not give back job id/data
 * For this reason, I have to use QueueEvents.
 *
 * To get the job data back from the QueueEvent, I have to treat the last
 * step of the flow as the separate queue that it is, and instantiate a
 * Queue object (only connecting to the redis queue, does nothing else)
 */

export const initCertificateErrorHandler = () => {
  if (process.env.NODE_ENV !== 'production' && global.__cert_flow_error_handlers_init__) {
    // Only do this setup once if in dev
    return;
  }

  global.__cert_flow_error_handlers_init__ = true;

  const dnsCleanerQueue = new Queue<CertificateJobData>(dnsCleanerQueueName, { connection: redis });
  const dnsCleanerQueueEvents = new QueueEvents(dnsCleanerQueueName, { connection: redis });

  const errorHandler: QueueEventsListener['failed'] = async ({ jobId }) => {
    try {
      const job = await dnsCleanerQueue.getJob(jobId);
      const { rootDomain, certificateId } = job?.data ?? {};

      if (!certificateId) {
        return;
      }

      logger.info('Certificate flow failed. Running cleanup', { rootDomain, certificateId });

      await certificateModel.updateCertificateById(certificateId, {
        status: CertificateStatus.failed,
        /**
         * Setting orderUrl to null, so if we get back the same cert request from the
         * ACME provider next time (as it deduplicates orders) we are not violating the
         * unique constraint of this field
         */
        orderUrl: null,
      });

      await challengeModel.deleteChallengesByCertificateId(certificateId);

      /**
       * No need to manually delete the dns records as
       * the database relation is set to cascade - challenge delete
       * will remove the row from the dnsRecords table as well
       *
       * After those records were cascade deleted, we can trigger
       * the reconciler as well
       */

      await setIsReconciliationNeeded(true);

      const certificateEntry = await certificateModel.getCertificateById(certificateId);

      logger.debug('Sending failure notification email', { rootDomain, certificateId });
      await addNotification({
        emailAddress: certificateEntry.user.email,
        subject: 'My.Custom.Domain certificate request failed',
        message: `${certificateEntry.user.displayName}, your certificate request with domain: *.${certificateEntry.domain} has failed. Log in to My.Custom.Domain to try again.`,
      });

      logger.info('Cleanup completed on failed certificate flow', { rootDomain, certificateId });
    } catch (e) {
      logger.error('Certificate cleanup encountered an error', e);
    }
  };

  dnsCleanerQueueEvents.on('failed', errorHandler);
};
