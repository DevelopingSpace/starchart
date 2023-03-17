import { test, expect } from '@playwright/test';
import { loggedInAsUser } from '../utils';

test.describe('navigate to links', () => {
  loggedInAsUser();

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('navigate to certificate and domain (desktop)', async ({ page }) => {
    await page.getByRole('link', { name: 'Certificate', exact: true }).click();
    await expect(page).toHaveURL('/certificate');

    await page.getByRole('link', { name: 'Domains', exact: true }).click();
    await expect(page).toHaveURL('/domains');
  });
});
