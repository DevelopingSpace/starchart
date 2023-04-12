import { test, expect } from '@playwright/test';

import { loggedInAsUser } from './utils';
import { prisma } from '../../app/db.server';

test.describe('not authenticated', () => {
  test('redirects to login page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/.*login.*/);
  });
});

test.describe('authenticated as user', () => {
  loggedInAsUser();

  test.beforeEach(async ({ page }) => {
    await page.goto('/dns-records/new');
  });

  /**
   * Clean up after all tests are run
   * For some weird reason using afterEach to delete the one record doesn't work
   * Thus, we are using different values for the fields for the tests
   */
  test.afterAll(async () => {
    await prisma.dnsRecord.deleteMany();
  });

  test('redirects to edit DNS record page when required fields are filled', async ({ page }) => {
    await page.getByLabel('Name*').fill('required-test');
    await page.getByRole('combobox', { name: 'Type' }).selectOption('A');
    await page.getByLabel('Value*').fill('192.168.1.1');
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page).toHaveURL('/dns-records');
  });

  test('redirects to edit DNS record page when all fields are filled', async ({ page }) => {
    await page.getByLabel('Name*').fill('all-test');
    await page.getByRole('combobox', { name: 'Type' }).selectOption('A');
    await page.getByLabel('Value*').fill('192.168.1.1');
    await page.getByLabel('Ports').fill('port1, port2');
    await page.getByLabel('Course').fill('test course');
    await page.getByLabel('Description').fill('test description');
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page).toHaveURL('/dns-records');
  });

  test('does not create DNS record if required fields are empty', async ({ page }) => {
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page).toHaveURL('/dns-records/new');
  });
});
