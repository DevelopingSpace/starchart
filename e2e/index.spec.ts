import { test, expect } from '@playwright/test';

test.describe('not authenticated', () => {
  test('redirects to login page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/.*login.*/);
  });
});
