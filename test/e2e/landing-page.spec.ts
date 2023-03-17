import { test, expect } from '@playwright/test';
import { loggedInAsUser } from './utils';

test.describe('landing page link', () => {
  loggedInAsUser();

  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    const dnsCard = page.getByRole('heading', { name: 'DNS Records' });
    const certCard = page.getByRole('heading', { name: 'Certificate' });

    await expect(dnsCard).toContainText('DNS Records');
    await expect(certCard).toContainText('Certificate');
  });

  test('Manage DNS Records Link Button', async ({ page }) => {
    await page.getByRole('link', { name: 'Manage DNS Records' }).click();
    await expect(page).toHaveURL('/domains');
  });

  test('Manage DNS Records Instruction Link', async ({ page }) => {
    await page
      .getByRole('paragraph')
      .filter({
        hasText: 'DNS Record: Lorem Ipsum is simply dummy text of the printing and typesetting ind',
      })
      .getByRole('link', { name: 'to learn more, see these instructions...' })
      .click();

    await expect(page).toHaveURL('/domains/instructions');
  });

  test('Manage Certificate Link Button', async ({ page }) => {
    await page.getByRole('link', { name: 'Manage Certificate' }).click();
    await expect(page).toHaveURL('/certificate');
  });

  test('Manage Certificate Instruction Link', async ({ page }) => {
    await page
      .getByRole('paragraph')
      .filter({
        hasText:
          'Certificate: Lorem Ipsum is simply dummy text of the printing and typesetting ind',
      })
      .getByRole('link', { name: 'to learn more, see these instructions...' })
      .click();
    await expect(page).toHaveURL('/certificate/instructions');
  });
});
