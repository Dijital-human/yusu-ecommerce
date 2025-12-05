/**
 * k6 Load Testing Script / k6 Yükləmə Test Scripti
 * Load testing script for Ulustore API endpoints
 * Ulustore API endpoint-ləri üçün yükləmə test scripti
 * 
 * Usage / İstifadə:
 *   k6 run scripts/load-test/k6-script.js
 * 
 * Options / Seçimlər:
 *   --vus 100 (virtual users)
 *   --duration 30s (test duration)
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics / Xüsusi metrikalar
const errorRate = new Rate('errors');

// Test configuration / Test konfiqurasiyası
export const options = {
  stages: [
    { duration: '30s', target: 50 },  // Ramp up to 50 users / 50 istifadəçiyə qədər artır
    { duration: '1m', target: 50 },   // Stay at 50 users / 50 istifadəçidə qal
    { duration: '30s', target: 100 }, // Ramp up to 100 users / 100 istifadəçiyə qədər artır
    { duration: '1m', target: 100 },  // Stay at 100 users / 100 istifadəçidə qal
    { duration: '30s', target: 0 },   // Ramp down to 0 users / 0 istifadəçiyə qədər azalt
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s / Sorğuların 95%-i 2 saniyədən az olmalıdır
    http_req_failed: ['rate<0.01'],     // Error rate should be less than 1% / Xəta dərəcəsi 1%-dən az olmalıdır
    errors: ['rate<0.01'],
  },
};

// Base URL / Əsas URL
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

/**
 * Test GET /api/v1/products endpoint
 */
export function testProductsEndpoint() {
  const url = `${BASE_URL}/api/v1/products?page=1&limit=12`;
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const response = http.get(url, params);
  
  const success = check(response, {
    'products status is 200': (r) => r.status === 200,
    'products response time < 2s': (r) => r.timings.duration < 2000,
    'products has data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.success === true && Array.isArray(body.data);
      } catch {
        return false;
      }
    },
  });
  
  errorRate.add(!success);
  return response;
}

/**
 * Test GET /api/v1/categories endpoint
 */
export function testCategoriesEndpoint() {
  const url = `${BASE_URL}/api/v1/categories`;
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const response = http.get(url, params);
  
  const success = check(response, {
    'categories status is 200': (r) => r.status === 200,
    'categories response time < 1s': (r) => r.timings.duration < 1000,
    'categories has data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.success === true && Array.isArray(body.data);
      } catch {
        return false;
      }
    },
  });
  
  errorRate.add(!success);
  return response;
}

/**
 * Test GET /api/search endpoint
 */
export function testSearchEndpoint() {
  const searchTerms = ['phone', 'laptop', 'shirt', 'shoes', 'watch'];
  const searchTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
  const url = `${BASE_URL}/api/search?q=${searchTerm}&page=1&limit=12`;
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const response = http.get(url, params);
  
  const success = check(response, {
    'search status is 200': (r) => r.status === 200,
    'search response time < 2s': (r) => r.timings.duration < 2000,
    'search has data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.success === true;
      } catch {
        return false;
      }
    },
  });
  
  errorRate.add(!success);
  return response;
}

/**
 * Test GET /api/health endpoint
 */
export function testHealthEndpoint() {
  const url = `${BASE_URL}/api/health`;
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const response = http.get(url, params);
  
  const success = check(response, {
    'health status is 200': (r) => r.status === 200,
    'health response time < 500ms': (r) => r.timings.duration < 500,
    'health has status': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.status === 'ok';
      } catch {
        return false;
      }
    },
  });
  
  errorRate.add(!success);
  return response;
}

/**
 * Main test function / Əsas test funksiyası
 */
export default function () {
  // Test different endpoints / Müxtəlif endpoint-ləri test et
  testHealthEndpoint();
  sleep(1);
  
  testProductsEndpoint();
  sleep(1);
  
  testCategoriesEndpoint();
  sleep(1);
  
  testSearchEndpoint();
  sleep(1);
}

/**
 * Setup function (runs once before all VUs) / Setup funksiyası (bütün VU-lardan əvvəl bir dəfə işləyir)
 */
export function setup() {
  console.log(`🚀 Starting load test against ${BASE_URL} / Yükləmə testi başlayır`);
  return { baseUrl: BASE_URL };
}

/**
 * Teardown function (runs once after all VUs) / Teardown funksiyası (bütün VU-lardan sonra bir dəfə işləyir)
 */
export function teardown(data) {
  console.log(`✅ Load test completed / Yükləmə testi tamamlandı`);
}

