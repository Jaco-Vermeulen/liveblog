import { test, expect } from '@playwright/test';

async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel(/gebruikersnaam/i).fill('admin');
  await page.getByLabel(/wagwoord/i).fill('admin');
  await page.getByRole('button', { name: /meld aan/i }).click();
  await expect(page).toHaveURL(/\/liveblog/);
}

test.describe('settings (admin)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('general settings page loads', async ({ page }) => {
    await page.goto('/settings/general');
    await expect(page).toHaveURL(/\/settings\/general/);
    await expect(page.getByRole('button', { name: /stoor/i })).toBeVisible();
  });

  test('instance settings page loads', async ({ page }) => {
    await page.goto('/settings/instance-settings');
    await expect(page).toHaveURL(/\/settings\/instance-settings/);
  });
});
