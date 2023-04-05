import { test as setup } from '@playwright/test';

const userFile = 'test/e2e/.auth/user.json';

const adminFile = 'test/e2e/.auth/admin.json';

// User 1 has student role
// See simplesamlphp-users.php
setup('authenticate as user', async ({ page }) => {
  await page.goto('/login?redirectTo=%2F');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByLabel('Username').fill('user1');
  await page.getByLabel('Password').fill('user1pass');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL('/');

  await page.context().storageState({ path: userFile });
});

// User 3 has admin role
// See simplesamlphp-users.php
setup('authenticate as admin', async ({ page }) => {
  await page.goto('/login?redirectTo=%2F');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByLabel('Username').fill('user3');
  await page.getByLabel('Password').fill('user3pass');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL('/');

  await page.context().storageState({ path: adminFile });
});
