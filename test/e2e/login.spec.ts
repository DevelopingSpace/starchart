import { test, expect } from '@playwright/test';
test.describe('authenticated', () => {
  test('and redirect to /', async ({ page }) => {
    await page.goto('http://localhost:8080/login?redirectTo=%2F');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.getByLabel('Username').click();
    await page.getByLabel('Username').fill('user1');
    await page.getByLabel('Password').click();
    await page.getByLabel('Password').fill('user1pass');
    await page.getByLabel('Password').press('Enter');

    const title = await page.getByRole('heading', { name: 'Starchart' });
    const userText = await page.getByText('user1', { exact: true });

    await expect(page).toHaveURL(/localhost:8080/);
    await expect(title).toContainText('Starchart');
    await expect(userText).toContainText('user1');
  });

  test('and redirect to /dev', async ({ page }) => {
    await page.goto('http://localhost:8080/login?redirectTo=%2Fdev');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.getByLabel('Username').click();
    await page.getByLabel('Username').fill('user1');
    await page.getByLabel('Password').click();
    await page.getByLabel('Password').fill('user1pass');
    await page.getByLabel('Password').press('Enter');

    const title = await page.getByRole('heading', { name: 'Starchart - Dev' });
    const userText = await page.getByText(
      'Welcome user1! NOTE: this page is only used for development testing.'
    );

    await expect(page).toHaveURL(/localhost:8080\/dev/);
    await expect(title).toContainText('Starchart');
    await expect(userText).toContainText('user1');
  });
});

test.describe('authentication API calls', () => {});
