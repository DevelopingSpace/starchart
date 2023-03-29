import { Worker } from 'bullmq';
import { redis } from '~/lib/redis.server';
import logger from '~/lib/logger.server';
import * as challengeModel from '~/models/challenge.server';
import { setIsReconciliationNeeded } from '~/models/system-state.server';

import type { CertificateJobData } from './certificateJobTypes.server';

export const dnsCleanerQueueName = 'certificate-cleanDns';

export const dnsCleanerWorker = new Worker<CertificateJobData>(
  dnsCleanerQueueName,
  async (job) => {
    const { rootDomain, certificateId } = job.data;

    logger.info('Removing challenge DNS records', { rootDomain, certificateId });

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

    logger.info('Challenges removed (cascading to records), reconciler triggered');
  },
  { connection: redis }
);

process.on('SIGINT', () => dnsCleanerWorker.close());
