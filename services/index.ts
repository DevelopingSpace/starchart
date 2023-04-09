import { init as expirationNotificationsInit } from './expiration/expiration-notification.server';
import { addReconcilerJob } from './reconciler/reconciler-queue.server';

export async function init() {
  return Promise.all([
    // Start processing DNS record expiration notifications
    expirationNotificationsInit(),
    // Start the reconciler
    addReconcilerJob(),
  ]);
}
