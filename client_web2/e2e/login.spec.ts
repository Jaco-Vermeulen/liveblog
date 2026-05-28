import { test, expect } from '@playwright/test';

test.describe('auth', () => {
  test('login page renders', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /welkom terug/i })).toBeVisible();
    await expect(page.getByLabel(/gebruikersnaam/i)).toBeVisible();
  });

  test('admin can log in and reach blog list', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/gebruikersnaam/i).fill('admin');
    await page.getByLabel(/wagwoord/i).fill('admin');
    await page.getByRole('button', { name: /meld aan/i }).click();
    await expect(page).toHaveURL(/\/liveblog/);
    await expect(page.getByText(/regstreekse blog/i).first()).toBeVisible();
  });

  test('invalid credentials show error', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/gebruikersnaam/i).fill('not-a-user');
    await page.getByLabel(/wagwoord/i).fill('wrong');
    await page.getByRole('button', { name: /meld aan/i }).click();
    await expect(page.getByText(/ongeldige/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });
});
