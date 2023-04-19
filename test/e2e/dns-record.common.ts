import { test, expect } from '@playwright/test';

import type { Page } from '@playwright/test';
import type { DnsRecord } from '@prisma/client';

export const fillDnsRecordFormStep = (
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

export const checkDnsRecordStep = (
  dnsRecord: Required<Pick<DnsRecord, 'type' | 'subdomain' | 'value'>> &
    Partial<Pick<DnsRecord, 'ports' | 'course' | 'description'>>,
  page: Page
) => {
  return test.step('validate DNS Record data', async () => {
    // Navigate to edit page to check for values
    const dnsRecordRow = page.locator('table tr').last();
    await dnsRecordRow.getByRole('button', { name: 'Edit DNS record' }).click();

    await expect(page.getByLabel('Name*')).toHaveValue(dnsRecord.subdomain);
    await expect(page.getByRole('combobox', { name: 'Type' })).toHaveValue(dnsRecord.type);
    await expect(page.getByLabel('Value*')).toHaveValue(dnsRecord.value);
    await expect(page.getByLabel('Ports')).toHaveValue(dnsRecord.ports || '');
    await expect(page.getByLabel('Course')).toHaveValue(dnsRecord.course || '');
    await expect(page.getByLabel('Description')).toHaveValue(dnsRecord.description || '');
  });
};
