import { test, expect } from '@playwright/test';
import { loggedInAsUser } from './utils';
import { deleteAllCertificates } from '../../app/models/certificate.server';

test.describe('Certificate Page', () => {
  loggedInAsUser();

  test.beforeEach(async ({ page }) => {
    await page.goto('/certificate');
  });

  test.afterAll(async () => {
    await deleteAllCertificates();
  });

  test('Request a Certificate', async ({ page }) => {
    const titleHeader = page.getByRole('heading', { name: 'Certificate' });
    const domainName = page.getByText('user1.starchart.com');

    await expect(domainName).toContainText('user1.starchart.com');
    await expect(titleHeader).toContainText('Certificate');

    const requestButton = page.getByRole('button', { name: 'Request a Certificate' });

    await expect(requestButton).toHaveText('Request a Certificate');

    await requestButton.click();

    const loadingPageText = page
      .locator('div')
      .filter({
        hasText:
          'We have received your request, and will notify you by email when your certificate is ready.',
      })
      .nth(1);

    await page.waitForURL('/certificate');

    await expect(loadingPageText).toContainText(
      'We have received your request, and will notify you by email when your certificate is ready.'
    );
  });
});
