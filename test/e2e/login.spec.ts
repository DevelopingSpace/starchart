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
  await page.goto('/login?redirectTo=%2Fdomains');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByLabel('Username').fill('user1');
  await page.getByLabel('Password').fill('user1pass');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL('http://localhost:8080/domains');
  const locator1 = page.getByText('user1');
  const userInNav = page.getByRole('heading', { name: 'My.Custom.Domain' });
  const domainHeading = page.getByRole('heading', { name: 'Domains' });
  await expect(locator1).toContainText('user1');
  await expect(userInNav).toContainText('My.Custom.Domain');
  await expect(domainHeading).toContainText('Domains');
});
