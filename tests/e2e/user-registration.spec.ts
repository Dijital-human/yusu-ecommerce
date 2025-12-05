/**
 * User Registration E2E Tests / İstifadəçi Qeydiyyatı E2E Testləri
 * End-to-end tests for user registration flow
 * İstifadəçi qeydiyyatı axını üçün end-to-end testlər
 */

import { test, expect } from '@playwright/test';

test.describe('User Registration', () => {
  test('should register new user successfully / Yeni istifadəçini uğurla qeydiyyatdan keçirməlidir', async ({ page }) => {
    await page.goto('/auth/signup');

    // Fill registration form / Qeydiyyat formasını doldur
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', `test-${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!');

    // Submit form / Formu göndər
    await page.click('button[type="submit"]');

    // Wait for success message or redirect / Uğur mesajı və ya yönləndirməni gözlə
    await expect(page).toHaveURL(/.*\/auth\/signin|.*\/dashboard/, { timeout: 10000 });
  });

  test('should show validation errors for invalid input / Etibarsız giriş üçün validasiya xətalarını göstərməlidir', async ({ page }) => {
    await page.goto('/auth/signup');

    // Try to submit empty form / Boş formu göndərməyə cəhd et
    await page.click('button[type="submit"]');

    // Check for validation errors / Validasiya xətalarını yoxla
    await expect(page.locator('text=/invalid|required|error/i')).toBeVisible();
  });
});

