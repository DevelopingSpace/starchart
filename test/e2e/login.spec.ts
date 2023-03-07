import { test, expect } from '@playwright/test';

test('Login with User 1', async ({ page }) => {
  await page.goto('/login?redirectTo=%2F');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByLabel('Username').fill('user1');
  await page.getByLabel('Password').fill('user1pass');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL('http://localhost:8080');
  const locator = page.getByText('user1', { exact: true });
  const starchartHeading = page.getByRole('heading', { name: 'Starchart' });
  await expect(locator).toContainText('user1');
  await expect(starchartHeading).toContainText('Starchart');
});

test('Login with User 1 dev redirect', async ({ page }) => {
  await page.goto('/login?redirectTo=%2Fdev');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByLabel('Username').fill('user1');
  await page.getByLabel('Password').fill('user1pass');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL('http://localhost:8080/dev');
  const locator1 = page.getByText(
    'Welcome user1! NOTE: this page is only used for development testing.'
  );
  const starchartHeading1 = page.getByRole('heading', { name: 'Starchart - Dev' });
  const devlink1 = page.getByRole('button', { name: 'Request DNS Record' });
  const devlink2 = page.getByRole('button', { name: 'Request Certificate' });
  await expect(locator1).toContainText('user1');
  await expect(starchartHeading1).toContainText('Starchart');
  await expect(devlink1).toContainText('DNS');
  await expect(devlink2).toContainText('Certificate');
});
