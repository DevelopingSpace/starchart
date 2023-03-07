import { test, expect } from '@playwright/test';

test('Login w User 1', async ({ page }) => {
  await page.goto('/login?redirectTo=%2F');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByLabel('Username').click();
  await page.getByLabel('Username').fill('user1');
  await page.getByLabel('Password').click();
  await page.getByLabel('Password').fill('user1pass');
  await page.getByRole('button', { name: 'Login' }).click();
  const locator = page.getByText('user1', { exact: true });
  const starchartHeading = page.getByRole('heading', { name: 'Starchart' });
  await expect(locator).toHaveCount(1);
  await expect(starchartHeading).toHaveCount(1);
});
