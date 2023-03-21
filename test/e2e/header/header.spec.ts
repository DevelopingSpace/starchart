import { test, expect } from '@playwright/test';
import { loggedInAsUser } from '../utils';

test.describe('sign out of the account', () => {
  loggedInAsUser();

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('sign out', async ({ page }) => {
    await page.getByRole('banner').getByRole('button').click();
    await page.getByRole('menuitem', { name: 'Sign Out' }).click();
    await expect(page).toHaveURL('/logout');
  });
});
