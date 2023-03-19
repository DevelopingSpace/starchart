import { test, expect } from '@playwright/test';

test('Login with User 1', async ({ page }) => {
  await page.goto('/login?redirectTo=%2F');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByLabel('Username').fill('user1');
  await page.getByLabel('Password').fill('user1pass');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL('/');

  const locator = page.locator('#header-user');
  const starchartHeading = page.getByRole('heading', { name: 'My.Custom.Domain' });

  await expect(locator).toContainText('user1');
  await expect(starchartHeading).toContainText('My.Custom.Domain');
});

test('Login with User 1 dev redirect', async ({ page }) => {
  await page.goto('/login?redirectTo=%2Fdomains');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByLabel('Username').fill('user1');
  await page.getByLabel('Password').fill('user1pass');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL('/domains');

  const locator1 = page.locator('#header-user');
  const userInNav = page.getByRole('heading', { name: 'My.Custom.Domain' });
  const domainHeading = page.getByRole('heading', { name: 'Domains' });

  await expect(locator1).toContainText('user1');
  await expect(userInNav).toContainText('My.Custom.Domain');
  await expect(domainHeading).toContainText('Domains');
});
