import { test, expect } from '@playwright/test';
import dayjs from 'dayjs';

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

  test.describe('creates a DNS Record and redirects to edit DNS Record page', () => {
    /**
     * Clean up after all tests are run
     * For some weird reason using afterEach to delete the one record doesn't work
     * The test is run before the records are deleted
     * Thus, we are using different values for the fields for the tests
     */
    test.afterAll(async () => {
      await prisma.dnsRecord.deleteMany();
    });

    test('when only required fields are filled', async ({ page }) => {
      await page.getByLabel('Name*').fill('test1-required');
      await page.getByRole('combobox', { name: 'Type' }).selectOption('A');
      await page.getByLabel('Value*').fill('192.168.1.1');
      await page.getByRole('button', { name: 'Create' }).click();

      // Check if we get redirected to the dns records table
      await expect(page).toHaveURL('/dns-records');
      // Check if the dns record was created correctly
      const dnsRecordRow = page.locator('table tr').nth(1); // First row is the header
      await expect(dnsRecordRow.locator('td').first()).toContainText(
        'test1-required.user1.starchart.com'
      );
      await expect(dnsRecordRow.locator('td').nth(1)).toContainText('A');
      await expect(dnsRecordRow.locator('td').nth(2)).toContainText('192.168.1.1');
      // Check the expiration date
      const expectedDate = dayjs().add(6, 'month').format('MM/DD/YYYY');
      await expect(dnsRecordRow.locator('td').nth(3)).toContainText(expectedDate);
    });

    test('when all fields are filled', async ({ page }) => {
      await page.getByLabel('Name*').fill('test2-all');
      await page.getByRole('combobox', { name: 'Type' }).selectOption('A');
      await page.getByLabel('Value*').fill('192.168.1.1');
      await page.getByLabel('Ports').fill('port1, port2');
      await page.getByLabel('Course').fill('test course');
      await page.getByLabel('Description').fill('test description');
      await page.getByRole('button', { name: 'Create' }).click();

      // Check if we get redirected to the dns records table
      await expect(page).toHaveURL('/dns-records');
      // Check if the dns record was created correctly
      const dnsRecordRow = page.locator('table tr').last();
      await expect(dnsRecordRow.locator('td').first()).toContainText(
        'test2-all.user1.starchart.com'
      );
      await expect(dnsRecordRow.locator('td').nth(1)).toContainText('A');
      await expect(dnsRecordRow.locator('td').nth(2)).toContainText('192.168.1.1');
      // Check the expiration date
      const expectedDate = dayjs().add(6, 'month').format('MM/DD/YYYY');
      await expect(dnsRecordRow.locator('td').nth(3)).toContainText(expectedDate);
    });
  });

  test('does not create DNS record if required fields are empty', async ({ page }) => {
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page).toHaveURL('/dns-records/new');
  });
});
