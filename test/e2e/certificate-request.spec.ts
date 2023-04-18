import { test, expect } from '@playwright/test';
import { loggedInAsUser } from './utils';

test.describe('Certificate Page', () => {
  loggedInAsUser();

  test.beforeEach(async ({ page }) => {
    await page.goto('/certificate');
  });

  test('Request a Certificate', async ({ page }) => {
    const titleHeader = page.getByRole('heading', { name: 'Certificate' });
    const domainName = page.getByText('user1.starchart.com');

    await expect(domainName).toContainText('user1.starchart.com');
    await expect(titleHeader).toContainText('Certificate');

    const requestButton = page.getByRole('button', { name: 'Request a Certificate' });

    await expect(requestButton).toHaveText('Request a Certificate');
  });
});
