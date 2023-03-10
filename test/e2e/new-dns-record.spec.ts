import { test, expect } from '@playwright/test';

test.describe('not authenticated', () => {
  test('redirects to login page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/.*login.*/);
  });
});

test.describe('authenticated as user', () => {
  // Use shared state for being logged in as user
  test.use({ storageState: 'test/e2e/.auth/user.json' });

  test('redirects to edit dns record page when required fields are filled', async ({ page }) => {
    await page.goto('/domains/new', { waitUntil: 'domcontentloaded' });
    await page.getByLabel('Record Name*').fill('test');
    await page.getByRole('combobox', { name: 'Type' }).selectOption('A');
    await page.getByLabel('Value*').fill('test');
    await page.getByLabel('Value*').press('Enter');
    await expect(page).toHaveURL(/.*domains\/[0-9]*/);
  });

  test('redirects to edit dns record page when all fields are filled', async ({ page }) => {
    await page.goto('/domains/new', { waitUntil: 'domcontentloaded' });
    await page.getByLabel('Record Name*').fill('test');
    await page.getByRole('combobox', { name: 'Type' }).selectOption('A');
    await page.getByLabel('Value*').fill('test');
    await page.getByLabel('Ports').fill('port1, port2');
    await page.getByLabel('Course').fill('test course');
    await page.getByLabel('Description').fill('test description');
    await page.getByLabel('Description').press('Enter');
    await expect(page).toHaveURL(/.*domains\/[0-9]*/);
  });

  test('does not create dns record if required fields are empty', async ({ page }) => {
    await page.goto('/domains/new', { waitUntil: 'domcontentloaded' });
    await page.getByLabel('Record Name*').press('Enter');
    await expect(page).toHaveURL(/.*domains\/new/);
  });
});
