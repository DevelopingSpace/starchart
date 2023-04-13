import { test, expect } from '@playwright/test';
import dayjs from 'dayjs';

import type { Page } from '@playwright/test';

import { loggedInAsUser } from './utils';
import { prisma } from '../../app/db.server';
import type { DnsRecord } from '@prisma/client';
import { DnsRecordType } from '@prisma/client';

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

  const fillDnsRecordFormStep = (
    dnsRecord: Required<Pick<DnsRecord, 'type' | 'subdomain' | 'value'>> &
      Partial<Pick<DnsRecord, 'ports' | 'course' | 'description'>>,
    page: Page
  ) => {
    return test.step('fill DNS Record form', async () => {
      await page.getByLabel('Name*').fill(dnsRecord.subdomain);
      await page.getByRole('combobox', { name: 'Type' }).selectOption(dnsRecord.type);
      await page.getByLabel('Value*').fill(dnsRecord.value);
      await page.getByLabel('Ports').fill(dnsRecord.ports || '');
      await page.getByLabel('Course').fill(dnsRecord.course || '');
      await page.getByLabel('Description').fill(dnsRecord.description || '');
    });
  };

  const checkDnsRecordStep = (
    dnsRecord: Required<Pick<DnsRecord, 'type' | 'subdomain' | 'value'>> &
      Partial<Pick<DnsRecord, 'ports' | 'course' | 'description'>>,
    page: Page
  ) => {
    return test.step('validate DNS Record data', async () => {
      await expect(page.getByLabel('Name*')).toHaveValue(dnsRecord.subdomain);
      await expect(page.getByRole('combobox', { name: 'Type' })).toHaveValue(dnsRecord.type);
      await expect(page.getByLabel('Value*')).toHaveValue(dnsRecord.value);
      await expect(page.getByLabel('Ports')).toHaveValue(dnsRecord.ports || '');
      await expect(page.getByLabel('Course')).toHaveValue(dnsRecord.course || '');
      await expect(page.getByLabel('Description')).toHaveValue(dnsRecord.description || '');
    });
  };

  test.describe('accepts valid values based on type', () => {
    test.afterEach(async () => {
      await prisma.dnsRecord.deleteMany();
    });

    test.beforeEach(async ({ page }) => {
      await page.goto('/dns-records/new');
    });

    test('when only required fields are filled', async ({ page }) => {
      const dnsRecord = {
        subdomain: 'test1-required',
        type: DnsRecordType.A,
        value: '192.168.1.1',
      };

      await fillDnsRecordFormStep(dnsRecord, page);
      // Submit form
      await page.getByRole('button', { name: 'Create' }).click();

      // Check if we get redirected to the dns records table
      await expect(page).toHaveURL('/dns-records');

      // Check if the dns record was created correctly
      const dnsRecordRow = page.locator('table tr').last();
      await dnsRecordRow.getByRole('button', { name: 'Edit DNS record' }).click();
      await checkDnsRecordStep(dnsRecord, page);
    });

    test('when all fields are filled', async ({ page }) => {
      const dnsRecord = {
        subdomain: 'test2-all',
        type: DnsRecordType.A,
        value: '192.168.1.1',
        ports: 'port1, port2',
        course: 'test course',
        description: 'test description',
      };

      await fillDnsRecordFormStep(dnsRecord, page);
      // Submit form
      await page.getByRole('button', { name: 'Create' }).click();

      // Check if we get redirected to the dns records table
      await expect(page).toHaveURL('/dns-records');

      // Check if the dns record was created correctly
      const dnsRecordRow = page.locator('table tr').last();
      await dnsRecordRow.getByRole('button', { name: 'Edit DNS record' }).click();
      await checkDnsRecordStep(dnsRecord, page);
    });
  });

  test.describe('rejects invalid values based on type', () => {
    const invalidValueTypeMappings = [
      { type: DnsRecordType.A, value: 'invalid' },
      { type: DnsRecordType.AAAA, value: 'invalid' },
      { type: DnsRecordType.CNAME, value: '192.168.1.1' },
      { type: DnsRecordType.TXT, value: '' },
    ];
    for (let index = 0; index < invalidValueTypeMappings.length; index++) {
      const mapping = invalidValueTypeMappings[index];
      test(`when type is ${mapping.type} Record`, async ({ page }) => {
        const dnsRecord = {
          subdomain: 'test',
          type: mapping.type,
          value: mapping.value,
        };
        await fillDnsRecordFormStep(dnsRecord, page);
        await page.getByRole('button', { name: 'Create' }).click();
        // We expect to remain on the same page
        await expect(page).toHaveURL('/dns-records/new');
      });
    }
  });

  test('when required fields are empty', async ({ page }) => {
    await page.getByRole('button', { name: 'Create' }).click();
    // We expect to remain on the same page
    await expect(page).toHaveURL('/dns-records/new');
  });
});
