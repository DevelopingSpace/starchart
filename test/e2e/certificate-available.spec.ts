import { test, expect } from '@playwright/test';
import dayjs from 'dayjs';
import { prisma } from '../../app/db.server';
import { deleteAllCertificates } from '../../app/models/certificate.server';
import { loggedInAsUser } from './utils';

test.describe('Certificate Page', () => {
  loggedInAsUser();

  test.beforeAll(async () => {
    await prisma.certificate.create({
      data: {
        username: 'user1',
        domain: 'user1.starchart.com',
        orderUrl: `orderUrl.starchart.com`,
        privateKey:
          '-----BEGIN CERTIFICATE-----ApfFCv0O65TYkp5jEWSlU8PhKYD43nXA=-----END CERTIFICATE-----',
        certificate:
          '-----BEGIN CERTIFICATE-----BpfFCv0OuF8AujEWv0Okp5jEWSlAuD43=-----END CERTIFICATE-----',
        chain:
          '-----BEGIN CERTIFICATE-----CjEWSlU8PhKYTYWSlU8hKYTYkp5jewDW=-----END CERTIFICATE-----',
        validFrom: new Date(),
        validTo: dayjs().add(1, 'day').toDate(),
        status: 'issued',
      },
    });
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/certificate');
  });

  test.afterAll(async () => {
    await deleteAllCertificates();
  });

  test('Copy Certificate', async ({ page }) => {
    //Copy Key Toast Text
    await page.getByRole('button', { name: 'Copy Public Certificate' }).click();
    const publicCopyToastText = page.getByText('Public Certificate was copied to the clipboard');
    await expect(publicCopyToastText).toContainText(
      'Public Certificate was copied to the clipboard'
    );
    await publicCopyToastText.waitFor();

    await page.getByRole('button', { name: 'Copy Private Key' }).click();
    const privateCopyToastText = page.getByText('Private Key was copied to the clipboard');
    await expect(privateCopyToastText).toContainText('Private Key was copied to the clipboard');
    await privateCopyToastText.waitFor();

    await page.getByRole('button', { name: 'Copy Intermediate Chain' }).click();
    const intermediateCopyToastText = page.getByText(
      'Intermediate Chain was copied to the clipboard'
    );
    await expect(intermediateCopyToastText).toContainText(
      'Intermediate Chain was copied to the clipboard'
    );
    await intermediateCopyToastText.waitFor();

    await page.getByRole('button', { name: 'Copy Full Chain' }).click();
    const fullChainCopyToastText = page.getByText('Full Chain was copied to the clipboard');
    await expect(fullChainCopyToastText).toContainText('Full Chain was copied to the clipboard');
    await fullChainCopyToastText.waitFor();
  });

  test('Download Certificate', async ({ page }) => {
    //Download Key Toast Text
    await page.getByRole('button', { name: 'Download Public Certificate' }).click();
    const publicDownloadToastText = page.getByText('Public Certificate is Downloaded');
    await expect(publicDownloadToastText).toContainText('Public Certificate is Downloaded');
    await publicDownloadToastText.waitFor();

    await page.getByRole('button', { name: 'Download Private Key' }).click();
    const privateDownloadToastText = page.getByText('Private Key is Downloaded');
    await expect(privateDownloadToastText).toContainText('Private Key is Downloaded');
    await privateDownloadToastText.waitFor();

    await page.getByRole('button', { name: 'Download Intermediate Chain' }).click();
    const intermediateDownloadToastText = page.getByText('Intermediate Chain is Downloaded');
    await expect(intermediateDownloadToastText).toContainText('Intermediate Chain is Downloaded');
    await intermediateDownloadToastText.waitFor();

    await page.getByRole('button', { name: 'Download Full Chain' }).click();
    const fullChainDownloadToastText = page.getByText('Full Chain is Downloaded');
    await expect(fullChainDownloadToastText).toContainText('Full Chain is Downloaded');
    await fullChainDownloadToastText.waitFor();

    //Text Titles
    const publicKey = page.getByRole('heading', { name: 'Public Certificate' });
    const privateKey = page.getByRole('heading', { name: 'Private Key' });
    const intermediateChain = page.getByRole('heading', { name: 'Intermediate Chain' });
    const fullChain = page.getByRole('heading', { name: 'Full Chain' });

    await expect(publicKey).toContainText('Public Certificate');
    await expect(privateKey).toContainText('Private Key');
    await expect(intermediateChain).toContainText('Intermediate Chain');
    await expect(fullChain).toContainText('Full Chain');
  });
});
