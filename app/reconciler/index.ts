import { executeChangeSet } from '~/lib/dns.server';
import logger from '~/lib/logger.server';
import readDbIntoCompareStructure from './readDbIntoCompareStructure.server';
import readRuote53IntoCompareStructure from './readRuote53IntoCompareStructure.server';
import createChangeSetFromCompareStructures from './createChangeSetFromCompareStructures';

const reconciler = async () => {
  const dbStructure = await readDbIntoCompareStructure();
  const route53Structure = await readRuote53IntoCompareStructure();

  const changeSet = createChangeSetFromCompareStructures({ dbStructure, route53Structure });

  // Limiting the changeSet to 1000 items. AWS limit

  if (!changeSet.length) {
    logger.debug('Reconciler found no changes to be pushed');
    return;
  }

  logger.debug(`Reconciler intends to push the following ${changeSet.length} changes`, {
    changeSet,
  });

  await executeChangeSet(changeSet.slice(0, 1000));
};

export default reconciler;
