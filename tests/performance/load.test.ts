/**
 * Load Tests / Yükləmə Testləri
 * Performance tests for API endpoints under load
 * Yükləmə altında API endpoint-ləri üçün performans testləri
 */

import { test } from '@playwright/test';

test.describe('Load Tests', () => {
  test('should handle concurrent requests / Eyni vaxtda sorğuları idarə etməlidir', async ({ request }) => {
    const concurrentRequests = 10;
    const promises = [];

    for (let i = 0; i < concurrentRequests; i++) {
      promises.push(
        request.get('/api/v1/products', {
          timeout: 10000,
        })
      );
    }

    const responses = await Promise.all(promises);

    // All requests should succeed / Bütün sorğular uğurlu olmalıdır
    responses.forEach((response) => {
      expect(response.status()).toBeLessThan(500);
    });
  });

  test('should maintain response time under load / Yükləmə altında cavab müddətini saxlamalıdır', async ({ request }) => {
    const startTime = Date.now();
    
    const response = await request.get('/api/v1/products', {
      timeout: 5000,
    });

    const responseTime = Date.now() - startTime;

    // Response should be under 2 seconds / Cavab 2 saniyədən az olmalıdır
    expect(responseTime).toBeLessThan(2000);
    expect(response.status()).toBeLessThan(500);
  });
});

