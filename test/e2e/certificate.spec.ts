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

    await page.getByRole('button', { name: 'Request a Certificate' }).click();

    const loadingPageText = page
      .locator('div')
      .filter({
        hasText: 'We have received your request, and will notify you when your certificate is read',
      })
      .nth(1);

    await loadingPageText.waitFor();
  });

  // test('Dispaly Certificate', async ({ page }) => {
  //   //Copy Key Toast Text
  //   await page.getByRole('button', { name: 'Copy Public Key' }).click();
  //   await page.getByRole('button', { name: 'Copy Private Key' }).click();

  //   const publicCopyToastText = page.getByText('Public Key was copied to the clipboard');
  //   const privateCopyToastText = page.getByText('Private Key was copied to the clipboard');

  //   await publicCopyToastText.waitFor();
  //   await privateCopyToastText.waitFor();

  //   //Download Key Toast Text
  //   await page.getByRole('button', { name: 'Download Public Key' }).click();
  //   await page.getByRole('button', { name: 'Download Private Key' }).click();

  //   const publicDownloadToastText = page.getByText('Public Key is Downloaded');
  //   const privateDownloadToastText = page.getByText('Private Key is Downloaded');

  //   await publicDownloadToastText.waitFor();
  //   await privateDownloadToastText.waitFor();

  //   //Text Titles
  //   const publicKey = page.getByRole('heading', { name: 'Public Key' });
  //   const privateKey = page.getByRole('heading', { name: 'Private Key' });

  //   await expect(publicKey).toContainText('Public Key');
  //   await expect(privateKey).toContainText('Private Key');
  // });
});
