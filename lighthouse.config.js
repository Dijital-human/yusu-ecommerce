/**
 * Lighthouse CI Configuration / Lighthouse CI Konfiqurasiyası
 * This file configures Lighthouse CI for performance testing
 * Bu fayl performans testləri üçün Lighthouse CI konfiqurasiyasını təyin edir
 */

module.exports = {
  ci: {
    collect: {
      // Collect from local server / Lokal server-dən topla
      startServerCommand: 'npm start',
      url: ['http://localhost:3000'],
      numberOfRuns: 3,
    },
    assert: {
      // Performance budgets / Performans büdcələri
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        'categories:pwa': ['warn', { minScore: 0.6 }],
        
        // Specific metrics / Xüsusi metrikalar
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 4000 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        'speed-index': ['warn', { maxNumericValue: 3000 }],
      },
    },
    upload: {
      // Upload to temporary public storage / Müvəqqəti public storage-a yüklə
      target: 'temporary-public-storage',
    },
  },
}
