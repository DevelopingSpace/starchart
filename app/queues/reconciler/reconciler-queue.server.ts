import logger from '~/lib/logger.server';
import { reconcilerQueue } from './reconciler-worker.server';

reconcilerQueue.on('error', (err) => {
  logger.error('Reconciler encountered an error', err);
});

// function to add jobs
export const addReconcilerJob = async () => {
  logger.info('Starting DNS reconciler queue');

  const jobName = `reconciler-scheduler`;

  try {
    // Remove all previously existing repeatable jobs
    // This is important because multiple repeatable jobs can exist and they persist
    // within redis (even with the same key)
    const repeatableJobs = await reconcilerQueue.getRepeatableJobs();
    Promise.all(repeatableJobs.map(({ key }) => reconcilerQueue.removeRepeatableByKey(key)));

    return await reconcilerQueue.add(
      jobName,
      {},
      {
        repeatJobKey: jobName,
        repeat: { every: 2 * 60 * 1000 },
      }
    );
  } catch (err) {
    logger.error(`Failed to start reconciler queue: ${err}`);
  }
};
