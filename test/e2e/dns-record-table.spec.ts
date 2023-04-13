import { test, expect } from '@playwright/test';
import { DnsRecordType } from '@prisma/client';

import { loggedInAsUser } from './utils';
import { prisma } from '../../app/db.server';
import { fillDnsRecordFormStep, checkDnsRecordStep } from './dns-record.common';

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
    await fillDnsRecordFormStep({ subdomain: 'test', type: 'A', value: '192.168.1.1' }, page);
    await page.getByRole('button', { name: 'Create' }).click();
    // Expect (and wait) to get to DNS Records table
    await expect(page).toHaveURL('/dns-records');
  });

  test.afterEach(async () => {
    await prisma.dnsRecord.deleteMany();
  });

  test('edit DNS Record', async ({ page }) => {
    const newDnsRecordData = {
      subdomain: 'test1',
      type: DnsRecordType.TXT,
      value: 'edit test',
      ports: 'port1, port2',
      course: 'test course',
      description: 'test description',
    };
    // Navigate to edit page
    const dnsRecordRow = page.locator('table tr').last();
    await dnsRecordRow.getByRole('button', { name: 'Edit DNS record' }).click();

    await fillDnsRecordFormStep(newDnsRecordData, page);
    await page.getByRole('button', { name: 'Update' }).click();
    // Except to be redirected to DNS Records table
    await expect(page).toHaveURL('/dns-records');
    // Check that new values were saved
    await checkDnsRecordStep(newDnsRecordData, page);
  });

  test('delete DNS Record', async ({ page }) => {
    // Click on delete button in table
    const dnsRecordRow = page.locator('table tr').last();
    await dnsRecordRow.getByRole('button', { name: 'Delete DNS record' }).click();
    // Click on delete button in modal
    await page.getByRole('button', { name: 'Delete' }).click();
    // Since there should be no DNS Records at this point, the table shouldn't exist
    await expect(page.locator('table')).toBeHidden();
  });
});
