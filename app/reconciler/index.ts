import { executeChangeSet } from '~/lib/dns.server';
import logger from '~/lib/logger.server';
import readDbIntoCompareStructure from './readDbIntoCompareStructure.server';
import readRoute53IntoCompareStructure from './readRoute53IntoCompareStructure.server';
import {
  createRemovedChangeSetFromCompareStructures,
  createUpsertedChangeSetFromCompareStructures,
} from './createChangeSetFromCompareStructures';

// S3 limit for a ChangeSet
const CHANGE_SET_MAX_SIZE = 1000;

export const reconcile = async () => {
  const [dbStructure, route53Structure] = await Promise.all([
    readDbIntoCompareStructure(),
    readRoute53IntoCompareStructure(),
  ]);

  const changeSet = [
    ...createRemovedChangeSetFromCompareStructures({ dbStructure, route53Structure }),
    ...createUpsertedChangeSetFromCompareStructures({ dbStructure, route53Structure }),
  ];

  // Limiting the changeSet to 1000 items. AWS limit

  if (!changeSet.length) {
    logger.debug('Reconciler found no changes to be pushed');
    return;
  }

  logger.debug(`Reconciler intends to push the following ${changeSet.length} changes`, {
    changeSet,
  });

  await executeChangeSet(changeSet.slice(0, CHANGE_SET_MAX_SIZE));

  // Returning the changeSet size we are executing
  return Math.min(changeSet.length, CHANGE_SET_MAX_SIZE);
};
