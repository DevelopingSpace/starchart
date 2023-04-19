import { test, expect } from '@playwright/test';
import { loggedInAsUser } from './utils';

test.describe('Landing Page', () => {
  loggedInAsUser();

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Contains DNS Record and Certificate cards', async ({ page }) => {
    const dnsCard = page.getByRole('heading', { name: 'DNS Records' });
    const certCard = page.getByRole('heading', { name: 'Certificate' });

    await expect(dnsCard).toContainText('DNS Records');
    await expect(certCard).toContainText('Certificate');
  });

  test('Create DNS Records Button', async ({ page }) => {
    await page.getByRole('link', { name: 'Create DNS Records' }).click();

    await expect(page).toHaveURL('/dns-records');
  });

  test('DNS Records Instructions Link', async ({ page }) => {
    await page.getByRole('link', { name: 'instructions page' }).click();

    await expect(page).toHaveURL('/dns-records/instructions');
  });

  test('Create Certificate Button', async ({ page }) => {
    await page.getByRole('link', { name: 'Create Certificate' }).click();

    await expect(page).toHaveURL('/certificate');
  });

  test('Certificate Instructions Link', async ({ page }) => {
    await page.getByRole('link', { name: 'information page' }).click();

    await expect(page).toHaveURL('/certificate/information');
  });
});
