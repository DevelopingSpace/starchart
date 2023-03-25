import { test, expect } from '@playwright/test';

import { loggedInAsUser } from './utils';
import {
  getCertificateByUsername,
  createCertificate,
  deleteAllCertificateByUsername,
  updateCertificateById,
} from '../../app/models/certificate.server';

test.describe('Certificate Page', () => {
  loggedInAsUser();

  test.beforeEach(async ({ page }) => {
    test('Request a Certificate Page', async ({ page }) => {
      await page.goto('/certificate');
      await deleteAllCertificateByUsername('user1');
    });

    const titleHeader = page.getByRole('heading', { name: 'Certificate' });
    await page.waitForSelector('text=user1.starchart.com');

    await titleHeader.waitFor();

    await page.getByRole('button', { name: 'Request a Certificate' }).click();
    createCertificate({ username: 'user1', domain: 'user1.starchart.com' });

    const loadingPageText = page
      .locator('div')
      .filter({
        hasText: 'We have received your request, and will notify you when your certificate is read',
      })
      .nth(1);

    loadingPageText.waitFor();

    const certificate = await getCertificateByUsername('user1');
    await updateCertificateById(certificate.id, {
      status: 'issued',
      validFrom: new Date(),
      validTo: new Date(),
    });

    //Copy Key Toast Text
    await page.getByRole('button', { name: 'Copy Public Key' }).click();
    await page.getByRole('button', { name: 'Copy Private Key' }).click();

    const publicCopyToastText = page.getByText('Public Key was copied to the clipboard');
    const privateCopyToastText = page.getByText('Private Key was copied to the clipboard');

    await publicCopyToastText.waitFor();
    await privateCopyToastText.waitFor();

    //Download Key Toast Text
    await page.getByRole('button', { name: 'Download Public Key' }).click();
    await page.getByRole('button', { name: 'Download Private Key' }).click();

    const publicDownloadToastText = page.getByText('Public Key is Downloaded');
    const privateDownloadToastText = page.getByText('Private Key is Downloaded');

    await publicDownloadToastText.waitFor();
    await privateDownloadToastText.waitFor();

    //Text Titles
    const publicKey = page.getByRole('heading', { name: 'Public Key' });
    const privateKey = page.getByRole('heading', { name: 'Private Key' });

    await expect(publicKey).toContainText('Public Key');
    await expect(privateKey).toContainText('Private Key');
  });
});
