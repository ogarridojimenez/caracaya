import { test, expect } from '@playwright/test';

test('homepage loads correctly', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Caraballo/);
});

test('login page loads', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByText('Inicia sesión')).toBeVisible();
});

test('products page loads for admin', async ({ page }) => {
  await page.goto('/admin/productos');
  await expect(page.getByText('Gestión de Productos')).toBeVisible();
});

test('login as admin and redirect to admin dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'admin@caracaya.com');
  await page.fill('input[type="password"]', 'Test123!');
  await page.click('button:has-text("Iniciar sesión")');
  await page.waitForURL('/admin');
  await expect(page).toHaveURL('/admin');
});