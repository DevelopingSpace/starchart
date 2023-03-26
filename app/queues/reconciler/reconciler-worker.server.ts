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
const pushChangesBulk = (changeSet: Change[]): boolean => {
  logger.debug(
    `NORMAL MODE - Reconciler intends to push the following ${Math.min(
      1000,
      changeSet.length
    )} changes`,
    {
      changeSet,
    }
  );
  executeChangeSet(changeSet.slice(0, CHANGE_SET_MAX_SIZE));

  // Return boolean => Is additional reconciliation needed
  return changeSet.length > 1000;
};

/**
 * LIMP MODE
 *
 * Try each change in the set one by one, isolate the offending one
 */
const pushChangesLimp = async (changeSet: Change[]) => {
  for (const change of changeSet) {
    try {
      logger.debug(`LIMP MODE - Reconciler intends to push the following change`, {
        change,
      });

      await executeChangeSet([change]);
    } catch (error) {
      logger.error(`LIMP MODE - the following single change failed`, {
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

    // Only run worker if needed
    if (!(await getIsReconciliationNeeded())) {
      logger.debug('Reconciler - Run not requested');
      return;
    }

    const changeSet = await createChangeSet();

    if (!changeSet.length) {
      logger.debug('Reconciler - found no changes to be pushed');
      await setIsReconciliationNeeded(false);
      return;
    }

    let isAdditionalReconciliationNeeded = true;
    try {
      isAdditionalReconciliationNeeded = await pushChangesBulk(changeSet);
    } catch (error) {
      logger.error('Reconciler - Change set failed, switching to limp mode', { error });

      await pushChangesLimp(changeSet);
    }

    /**
     * Update system state
     *
     * If  changeSet is < 1000 elements, then dns data that has been altered
     * have now been reconciled
     */
    await setIsReconciliationNeeded(isAdditionalReconciliationNeeded);
  },
  { connection: redis }
);

process.on('SIGINT', () => reconcilerWorker.close());
