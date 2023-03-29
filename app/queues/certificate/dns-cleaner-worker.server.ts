import { Worker } from 'bullmq';
import { redis } from '~/lib/redis.server';
import logger from '~/lib/logger.server';
import * as challengeModel from '~/models/challenge.server';
import * as dnsRecordModel from '~/models/dns-record.server';

import type { CertificateJobData } from './certificateJobTypes.server';

export const dnsCleanerQueueName = 'certificate-cleanDns';

export const dnsCleanerWorker = new Worker<CertificateJobData>(
  dnsCleanerQueueName,
  async (job) => {
    const { rootDomain, certificateId } = job.data;

    logger.info('Removing challenge DNS records', { rootDomain, certificateId });

    const challenges = await challengeModel.getChallengesByCertificateId(certificateId);

    const promises = challenges.map(({ dnsRecordId }) =>
      dnsRecordModel.deleteDnsRecordById(dnsRecordId)
    );
    await Promise.all(promises);

    /**
     * No need to manually delete the challenges as
     * the database relation is set to cascade - dns record delete
     * will remove the row from the challenge table as well
     */

    logger.info('Challenge DNS records removed');
  },
  { connection: redis }
);

process.on('SIGINT', () => dnsCleanerWorker.close());
