/**
 * Input Validation Security Tests / Giriş Validasiyası Təhlükəsizlik Testləri
 * Security tests for input validation
 * Giriş validasiyası üçün təhlükəsizlik testləri
 */

import { test, expect } from '@playwright/test';

test.describe('Input Validation Security', () => {
  test('should prevent SQL injection / SQL injection-u qarşısını almalıdır', async ({ request }) => {
    const maliciousInput = "'; DROP TABLE users; --";

    const response = await request.post('/api/v1/search', {
      data: {
        query: maliciousInput,
      },
    });

    // Should not return 500 error (SQL error) / 500 xətası qaytarmamalıdır (SQL xətası)
    expect(response.status()).not.toBe(500);
  });

  test('should prevent XSS attacks / XSS hücumlarının qarşısını almalıdır', async ({ page }) => {
    const xssPayload = '<script>alert("XSS")</script>';

    await page.goto('/search');
    
    const searchInput = page.locator('input[type="search"]').first();
    
    if (await searchInput.isVisible()) {
      await searchInput.fill(xssPayload);
      await searchInput.press('Enter');

      // Check that script tags are escaped / Script tag-lərinin escape edildiyini yoxla
      const pageContent = await page.content();
      expect(pageContent).not.toContain('<script>alert');
    }
  });

  test('should sanitize user input / İstifadəçi girişini təmizləməlidir', async ({ request }) => {
    const maliciousInput = '<img src=x onerror=alert(1)>';

    const response = await request.post('/api/v1/products', {
      data: {
        name: maliciousInput,
      },
    });

    // Should handle input safely / Girişi təhlükəsiz idarə etməlidir
    expect(response.status()).not.toBe(500);
  });
});

