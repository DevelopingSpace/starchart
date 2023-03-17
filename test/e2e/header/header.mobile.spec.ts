import { test, expect } from '@playwright/test';
import { loggedInAsUser } from '../utils';

test.describe('navigate to links through mobile', () => {
  loggedInAsUser();

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('navigate to certificate and domain (mobile)', async ({ page }) => {
    await page.click('.header-hamburger');
    await page.getByRole('link', { name: 'Certificate', exact: true }).click();
    await expect(page).toHaveURL('/certificate');

    await page.click('.header-hamburger');
    await page.getByRole('link', { name: 'Domains', exact: true }).click();
    await expect(page).toHaveURL('/domains');
  });
});
