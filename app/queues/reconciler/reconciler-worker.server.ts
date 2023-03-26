import { Worker, Queue } from 'bullmq';
import { redis } from '~/lib/redis.server';
import { executeChangeSet } from '~/lib/dns.server';
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
    // When BullMQ is running on multiple nodes (Docker swarm), we need to make sure our concurrency is 1
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

    const changeSet = await createChangeSet();

    if (!changeSet.length) {
      logger.debug('Reconciler - found no changes to be pushed');
      await setIsReconciliationNeeded(false);
      return;
    }

    // We are defaulting to true, if everything fails, the queue will retry in 2 mins
    let isAdditionalReconciliationNeeded = true;
    try {
      // First, we try to bulk push all the cahnges at once.
      isAdditionalReconciliationNeeded = await pushChangesBulk(changeSet);
    } catch (error) {
      // If that fails, we switch to limp mode, that pushes changes one by one
      // This way we can pinpoint the offending change in the set
      logger.error('Reconciler - Change set failed, switching to limp mode', { error });

      await pushChangesIndividually(changeSet);
    }

    /**
     * Update system state
     *
     * If changeSet is < CHANGE_SET_MAX_SIZE elements, then dns data that has been altered
     * have now been reconciled
     */
    await setIsReconciliationNeeded(isAdditionalReconciliationNeeded);
    logger.debug('Reconciler - job complete', { isAdditionalReconciliationNeeded });
  },
  { connection: redis }
);

process.on('SIGINT', () => reconcilerWorker.close());
