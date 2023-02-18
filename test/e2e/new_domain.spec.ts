/* eslint-disable testing-library/prefer-screen-queries */
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Sign In' }).click();
});

test.describe('creating a new domain', () => {
  test('redirects to edit domain page if successful', async ({ page }) => {
    await page.getByRole('link', { name: 'Domains' }).click();
    await page.getByRole('button', { name: 'Create new domain' }).click();
    await page.getByPlaceholder('Domain Name').click();
    await page.getByPlaceholder('Domain Name').fill('test');
    await page.getByRole('combobox').selectOption('A');
    await page.getByPlaceholder('Value').fill('test');
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page).toHaveURL(/.*domains\/[0-9]*/);
  });
});
