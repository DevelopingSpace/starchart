import { Worker } from 'bullmq';
import { redis } from '~/lib/redis.server';
import logger from '~/lib/logger.server';
import { getChangeStatus } from '~/lib/dns.server';
import { dnsUpdateQueueName } from './dns-update-worker.server';
import { getChildrenValuesOfQueueName } from '~/utils';

export const pollDnsStatusQueueName = 'poll-dns-status';

export type PollDnsStatusJobResult = string;

export const pollDnsStatusWorker = new Worker<void, PollDnsStatusJobResult>(
  pollDnsStatusQueueName,
  async (job) => {
    logger.debug('Checking Route53 readiness');

    const childrenValues = await getChildrenValuesOfQueueName<string>({
      queueName: dnsUpdateQueueName,
      job,
    });

    const [changeId] = Object.values(childrenValues);

    const status = (await getChangeStatus(changeId)) as PollDnsStatusJobResult;

    if (status === 'PENDING') {
      throw new Error('Change status is still pending');
    }
    return status;
  },
  { connection: redis }
);
