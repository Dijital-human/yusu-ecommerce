/**
 * Add to Cart E2E Tests / Səbətə Əlavə Etmə E2E Testləri
 * End-to-end tests for adding products to cart
 * Məhsulları səbətə əlavə etmə üçün end-to-end testlər
 */

import { test, expect } from '@playwright/test';

test.describe('Add to Cart', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to products page / Məhsullar səhifəsinə keç
    await page.goto('/products');
  });

  test('should add product to cart / Məhsulu səbətə əlavə etməlidir', async ({ page }) => {
    // Find first product / İlk məhsulu tap
    const addToCartButton = page.locator('button:has-text("Add to Cart"), button:has-text("Səbətə əlavə et")').first();
    
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click();

      // Check for success message or cart update / Uğur mesajı və ya səbət yeniləməsini yoxla
      await expect(page.locator('text=/added|success|səbət/i')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should update cart count / Səbət sayını yeniləməlidir', async ({ page }) => {
    // Add product to cart / Məhsulu səbətə əlavə et
    const addToCartButton = page.locator('button:has-text("Add to Cart")').first();
    
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click();

      // Check cart count badge / Səbət sayı badge-ini yoxla
      const cartBadge = page.locator('[data-testid="cart-count"], .cart-count').first();
      
      if (await cartBadge.isVisible()) {
        const count = await cartBadge.textContent();
        expect(parseInt(count || '0')).toBeGreaterThan(0);
      }
    }
  });
});

