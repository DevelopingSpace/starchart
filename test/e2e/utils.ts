import { test } from '@playwright/test';

/**
 * Logs in as user using the shared auth state created in auth.setup.ts
 * This should be called at the top of a describe block or a test file
 */
export function loggedInAsUser() {
  return test.use({ storageState: 'test/e2e/.auth/user.json' });
}

export function loggedInAsAdmin() {
  return test.use({ storageState: 'test/e2e/.auth/admin.json' });
}
