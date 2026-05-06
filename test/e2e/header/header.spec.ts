import { test, expect } from '@playwright/test';
import { loggedInAsUser } from '../utils';

test.describe('sign out of the account', () => {
  loggedInAsUser();

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('sign out', async ({ page }) => {
    // Listen for the navigation request to confirm logout was triggered
    const logoutRequest = page.waitForRequest((req) => req.url().includes('/logout'));

    await page.getByRole('banner').getByRole('button').click();
    await page.getByRole('menuitem', { name: 'Sign Out' }).click();

    // Verify the app's /logout route was hit, but don't actually wait on IdP
    const req = await logoutRequest;
    expect(req.url()).toContain('/logout');
  });
});
