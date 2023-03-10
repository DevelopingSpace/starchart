import { test as setup } from '@playwright/test';

const userFile = 'test/e2e/.auth/user.json';

setup('authenticate as user', async ({ page }) => {
  await page.goto('/login?redirectTo=%2F');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByLabel('Username').fill('user1');
  await page.getByLabel('Password').fill('user1pass');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL('http://localhost:8080');

  await page.context().storageState({ path: userFile });
});
