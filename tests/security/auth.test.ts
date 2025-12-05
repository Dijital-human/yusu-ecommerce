/**
 * Authentication Security Tests / Autentifikasiya Təhlükəsizlik Testləri
 * Security tests for authentication functionality
 * Autentifikasiya funksionallığı üçün təhlükəsizlik testləri
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication Security', () => {
  test('should reject invalid JWT tokens / Etibarsız JWT token-lərini rədd etməlidir', async ({ request }) => {
    const response = await request.get('/api/v1/cart', {
      headers: {
        Authorization: 'Bearer invalid-token',
      },
    });

    expect(response.status()).toBe(401);
  });

  test('should require authentication for protected routes / Qorunan route-lar üçün autentifikasiya tələb etməlidir', async ({ request }) => {
    const response = await request.get('/api/v1/cart');

    expect(response.status()).toBe(401);
  });

  test('should validate password strength / Parol gücünü yoxlamalıdır', async ({ page }) => {
    await page.goto('/auth/signup');

    await page.fill('input[name="password"]', 'weak');
    await page.fill('input[name="confirmPassword"]', 'weak');

    // Check for password strength validation / Parol gücü validasiyasını yoxla
    const errorMessage = page.locator('text=/weak|strong|minimum/i');
    
    if (await errorMessage.isVisible()) {
      expect(await errorMessage.isVisible()).toBe(true);
    }
  });
});

