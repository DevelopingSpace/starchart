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

  test('Manage DNS Records Button', async ({ page }) => {
    await page.getByRole('link', { name: 'Manage DNS Records' }).click();

    await expect(page).toHaveURL('/dns-records');
  });

  test('DNS Records Instructions Link', async ({ page }) => {
    await page
      .getByRole('paragraph')
      .filter({
        hasText:
          'DNS Record is a data stored in Domain Name System (DNS) servers, which maps a value to a domain name',
      })
      .getByRole('link', { name: 'to learn more, see these instructions...' })
      .click();

    await expect(page).toHaveURL('/dns-records/instructions');
  });

  test('Manage Certificate Button', async ({ page }) => {
    await page.getByRole('link', { name: 'Manage Certificate' }).click();

    await expect(page).toHaveURL('/certificate');
  });

  test('Certificate Instructions Link', async ({ page }) => {
    await page
      .getByRole('paragraph')
      .filter({
        hasText: 'When a client visits your website that has an HTTPS (Hypertext Transfer ',
      })
      .getByRole('link', { name: 'to learn more, see these instructions...' })
      .click();

    await expect(page).toHaveURL('/certificate/instructions');
  });
});
