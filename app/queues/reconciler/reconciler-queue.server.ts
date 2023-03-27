import logger from '~/lib/logger.server';
import { reconcilerQueue } from './reconciler-worker.server';

declare global {
  var __reconciler_queue_init__: boolean;
}

reconcilerQueue.on('error', (err) => {
  logger.error('Reconciler encountered an error', err);
});

// function to add jobs
export const addReconcilerJob = async () => {
  if (process.env.NODE_ENV !== 'production' && global.__reconciler_queue_init__) {
    // Only do this setup once if in dev
    return;
  }

  global.__reconciler_queue_init__ = true;

  logger.info('Starting DNS reconciler queue');

  const jobName = `reconciler-scheduler`;

  try {
    // Remove all previously existing repeatable jobs
    // This is important because multiple repeatable jobs can exist and they persist
    // within redis (even with the same key)
    const repeatableJobs = await reconcilerQueue.getRepeatableJobs();
    await Promise.all(repeatableJobs.map(({ key }) => reconcilerQueue.removeRepeatableByKey(key)));

    await reconcilerQueue.add(
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
