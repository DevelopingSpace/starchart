import { Worker, Queue } from 'bullmq';

import { redis } from '~/lib/redis.server';
import { executeChangeSet } from './route53-client.server';
import logger from '~/lib/logger.server';
import DnsDbCompareStructureGenerator from './DnsDbCompareStructureGenerator.server';
import Route53CompareStructureGenerator from './Route53CompareStructureGenerator.server';
import {
  createRemovedChangeSetFromCompareStructures,
  createUpsertedChangeSetFromCompareStructures,
} from './createChangeSetFromCompareStructures.server';
import { getIsReconciliationNeeded, setIsReconciliationNeeded } from '~/models/system-state.server';

import type { Change } from '@aws-sdk/client-route-53';

// S3 limit for a ChangeSet
const CHANGE_SET_MAX_SIZE = 1000;
const reconcilerQueueName = 'reconciler';

// Queue initialization
export const reconcilerQueue = new Queue(reconcilerQueueName, {
  connection: redis,
});

const createChangeSet = async (): Promise<Change[]> => {
  const [dbStructure, route53Structure] = await Promise.all([
    new DnsDbCompareStructureGenerator().generate(),
    new Route53CompareStructureGenerator().generate(),
  ]);

  const changeSet = [
    ...createRemovedChangeSetFromCompareStructures({ dbStructure, route53Structure }),
    ...createUpsertedChangeSetFromCompareStructures({ dbStructure, route53Structure }),
  ];

  return changeSet;
};

/**
 * NORMAL MODE
 *
 * Execute the complete changeSet at once
 */
const pushChangesBulk = async (changeSet: Change[]): Promise<boolean> => {
  const recordSetsToPush = Math.min(CHANGE_SET_MAX_SIZE, changeSet.length);

  logger.debug(
    `Reconciler NORMAL MODE - Reconciler intends to push the following ${recordSetsToPush} changes`,
    {
      changeSet,
    }
  );

  await executeChangeSet(changeSet.slice(0, CHANGE_SET_MAX_SIZE));

  // Return boolean => Is additional reconciliation needed
  return changeSet.length > CHANGE_SET_MAX_SIZE;
};

/**
 * LIMP MODE
 *
 * Try each change in the set one by one, isolate the offending one
 */
const pushChangesIndividually = async (changeSet: Change[]) => {
  for (const change of changeSet) {
    try {
      logger.debug(`Reconciler LIMP MODE - Reconciler intends to push the following change`, {
        change,
      });

      await executeChangeSet([change]);
    } catch (error) {
      logger.error(`Reconciler LIMP MODE - the following single change failed`, {
        change,
        error,
      });
    }
  }
};

const reconcilerWorker = new Worker(
  reconcilerQueueName,
  async () => {
    /**
     * When a BullMQ worker is added, it will behave as single
     * threaded ... will only execute one job at a time.
     * But, if we use multiple instances, i.e. our docker swarm,
     * we have one worker per instance, taking jobs from the queue.
     *
     * When you add a repeat job to a queue, it is a special thing,
     * not a regular job. It causes the queue system to keep adding
     * delayed `regular` jobs when the repeat pattern/integer
     * dictates it.
     *
     * In theory, it would be possible, that a job is running long
     * (more than our job repeat time), so the second swarm
     * node would pick up the next scheduled job, causing the system
     * to run two reconcilers in parallel.
     *
     * For this reason, I'm asking the BullMQ system ... tell me
     * how many active jobs are there (this includes the current
     * job too, that we are in right now). If the answer is > 1,
     * it means that there was a pre-existing job already running,
     * when we were started ==> we must exit to inhibit concurrency
     */

    const activeJobs = (await reconcilerQueue.getJobs('active'))
      // BullMQ bug, sometimes I get an array element with `undefined`, that should not be possible
      .filter((v) => !!v);

    if (activeJobs.length > 1) {
      logger.debug('Reconciler - Inhibiting concurrent run');
      return;
    }

    // Only run if reconciler was explicitly requested
    if (!(await getIsReconciliationNeeded())) {
      logger.debug('Reconciler - skipping current job, reconciler not needed.');
      return;
    }

    /**
     * Create a kind of checkpoint, saying
     * "what is in the db right now, will all be handled"
     *
     * If it is not the case, we will set it back to true later!
     *
     * This is needed to inhibit a race condition when reconciliation is
     * not done as a record has been changed after us getting DB data but
     * before the flag was set to off
     */
    await setIsReconciliationNeeded(false);

    const changeSet = await createChangeSet();

    if (!changeSet.length) {
      logger.debug('Reconciler - found no changes to be pushed');
      return;
    }

    try {
      // First, we try to bulk push all the cahnges at once.
      const isAdditionalReconciliationNeeded = await pushChangesBulk(changeSet);

      /**
       * If we got > CHANGE_SET_MAX_SIZE changes, don't keep hammering Route53,
       * but leave this flag on. It will cause the reconciler to continue
       * it's work 2 minutes later in the next queue run
       */

      if (isAdditionalReconciliationNeeded) {
        logger.debug('Reconciler - Change set too large, setting flag back to true');
        await setIsReconciliationNeeded(true);
      }
    } catch (error) {
      // If that fails, we switch to limp mode, that pushes changes one by one
      // This way we can pinpoint the offending change in the set
      logger.error('Reconciler - Change set failed, switching to limp mode', { error });
      await pushChangesIndividually(changeSet); // This can never throw
    }

    /**
     * Update system state
     *
     * If changeSet is < CHANGE_SET_MAX_SIZE elements, then dns data that has been
     * altered (before we started) have now been reconciled If change happened since,
     * those did set the flag to true, causing us to run again in 2 minutes or so.
     */

    logger.debug('Reconciler - job complete');
  },
  { connection: redis }
);

process.on('SIGINT', () => reconcilerWorker.close());
