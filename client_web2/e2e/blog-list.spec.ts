import { test, expect } from '@playwright/test';

async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel(/gebruikersnaam/i).fill('admin');
  await page.getByLabel(/wagwoord/i).fill('admin');
  await page.getByRole('button', { name: /meld aan/i }).click();
  await expect(page).toHaveURL(/\/liveblog/);
}

test.describe('blog list', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('blog list toolbar and tabs', async ({ page }) => {
    await expect(page.getByPlaceholder(/soek/i)).toBeVisible();
    await page.getByRole('link', { name: 'Aktief', exact: true }).click();
    await expect(page).toHaveURL(/\/liveblog\/active/);
  });

  test('open create blog modal', async ({ page }) => {
    await page.getByRole('button', { name: /skep.*blog/i }).click();
    await expect(page.getByRole('heading', { name: /skep nuwe blog/i })).toBeVisible();
    await expect(page.getByLabel(/titel/i)).toBeVisible();
    await expect(page.getByText(/spanlede/i)).toBeVisible();
  });
});
