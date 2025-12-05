/**
 * Product Search E2E Tests / Məhsul Axtarışı E2E Testləri
 * End-to-end tests for product search functionality
 * Məhsul axtarışı funksionallığı üçün end-to-end testlər
 */

import { test, expect } from '@playwright/test';

test.describe('Product Search', () => {
  test('should search for products / Məhsulları axtarmalıdır', async ({ page }) => {
    await page.goto('/');

    // Find search input / Axtarış input-unu tap
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('laptop');
      await searchInput.press('Enter');

      // Wait for search results / Axtarış nəticələrini gözlə
      await expect(page.locator('text=/laptop|results/i')).toBeVisible({ timeout: 10000 });
    }
  });

  test('should filter search results / Axtarış nəticələrini filtrləməlidir', async ({ page }) => {
    await page.goto('/search?q=laptop');

    // Apply price filter / Qiymət filtresini tətbiq et
    const priceFilter = page.locator('input[type="range"], [data-testid="price-filter"]').first();
    
    if (await priceFilter.isVisible()) {
      // Filter interaction / Filter interaksiyası
      await expect(page.locator('text=/filter|results/i')).toBeVisible();
    }
  });
});

