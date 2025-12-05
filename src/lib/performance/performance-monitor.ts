/**
 * Performance Monitor Service / Performans Monitor Xidməti
 * Tracks and reports performance metrics
 * Performans metrikalarını izləyir və hesabat verir
 */

import { logger } from "@/lib/utils/logger";

export interface PerformanceMetrics {
  pageLoadTime: number; // milliseconds / millisaniyələr
  apiResponseTime: number; // milliseconds / millisaniyələr
  databaseQueryTime: number; // milliseconds / millisaniyələr
  coreWebVitals: {
    lcp: number; // Largest Contentful Paint / Ən böyük kontent rəngləmə
    fid: number; // First Input Delay / İlk input gecikməsi
    cls: number; // Cumulative Layout Shift / Kümülyativ layout dəyişməsi
  };
  timestamp: Date;
}

export interface PageLoadMetrics {
  domContentLoaded: number;
  loadComplete: number;
  firstPaint: number;
  firstContentfulPaint: number;
  timeToInteractive: number;
}

/**
 * Track page load time / Səhifə yüklənmə vaxtını izlə
 */
export function trackPageLoadTime(): PageLoadMetrics | null {
  if (typeof window === 'undefined') return null;

  try {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');

    const metrics: PageLoadMetrics = {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
      timeToInteractive: navigation.domInteractive - navigation.fetchStart,
    };

    // Log metrics / Metrikaları logla
    logger.info('Page load metrics / Səhifə yüklənmə metrikaları', metrics);

    // Send to analytics / Analytics-ə göndər
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_load_time', {
        value: metrics.loadComplete,
        custom_parameter: 'page_load',
      });
    }

    return metrics;
  } catch (error) {
    logger.error('Failed to track page load time / Səhifə yüklənmə vaxtını izləmək uğursuz oldu', error instanceof Error ? error : new Error(String(error)));
    return null;
  }
}

/**
 * Track API response time / API cavab vaxtını izlə
 */
export function trackApiResponseTime(url: string, startTime: number, endTime: number): void {
  try {
    const responseTime = endTime - startTime;

    logger.info('API response time / API cavab vaxtı', {
      url,
      responseTime,
      timestamp: new Date().toISOString(),
    });

    // Send to analytics / Analytics-ə göndər
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'api_response_time', {
        url,
        value: responseTime,
        custom_parameter: 'api_performance',
      });
    }

    // Alert if response time is too high / Əgər cavab vaxtı çox yüksəkdirsə xəbərdar et
    if (responseTime > 5000) {
      logger.warn('Slow API response detected / Yavaş API cavabı aşkar edildi', {
        url,
        responseTime,
      });
    }
  } catch (error) {
    logger.error('Failed to track API response time / API cavab vaxtını izləmək uğursuz oldu', error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Track database query time / Veritabanı sorğu vaxtını izlə
 */
export function trackDatabaseQueryTime(query: string, startTime: number, endTime: number): void {
  try {
    const queryTime = endTime - startTime;

    logger.info('Database query time / Veritabanı sorğu vaxtı', {
      query: query.substring(0, 100), // Log first 100 chars / İlk 100 simvolu logla
      queryTime,
      timestamp: new Date().toISOString(),
    });

    // Alert if query time is too high / Əgər sorğu vaxtı çox yüksəkdirsə xəbərdar et
    if (queryTime > 1000) {
      logger.warn('Slow database query detected / Yavaş veritabanı sorğusu aşkar edildi', {
        query: query.substring(0, 100),
        queryTime,
      });
    }
  } catch (error) {
    logger.error('Failed to track database query time / Veritabanı sorğu vaxtını izləmək uğursuz oldu', error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Track Core Web Vitals / Core Web Vitals izlə
 */
export function trackCoreWebVitals(): void {
  if (typeof window === 'undefined') return;

  try {
    // Track LCP (Largest Contentful Paint) / LCP izlə
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        const lcp = lastEntry.renderTime || lastEntry.loadTime;

        logger.info('LCP metric / LCP metrikası', { lcp });

        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'web_vitals', {
            name: 'LCP',
            value: Math.round(lcp),
            event_category: 'Web Vitals',
          });
        }
      });

      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    }

    // Track FID (First Input Delay) / FID izlə
    if ('PerformanceObserver' in window) {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          const fid = entry.processingStart - entry.startTime;

          logger.info('FID metric / FID metrikası', { fid });

          if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'web_vitals', {
              name: 'FID',
              value: Math.round(fid),
              event_category: 'Web Vitals',
            });
          }
        });
      });

      fidObserver.observe({ entryTypes: ['first-input'] });
    }

    // Track CLS (Cumulative Layout Shift) / CLS izlə
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });

        logger.info('CLS metric / CLS metrikası', { cls: clsValue });

        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'web_vitals', {
            name: 'CLS',
            value: Math.round(clsValue * 1000) / 1000,
            event_category: 'Web Vitals',
          });
        }
      });

      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }
  } catch (error) {
    logger.error('Failed to track Core Web Vitals / Core Web Vitals izləmək uğursuz oldu', error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Initialize performance monitoring / Performans izləməsini başlat
 */
export function initializePerformanceMonitoring(): void {
  if (typeof window === 'undefined') return;

  try {
    // Track page load time / Səhifə yüklənmə vaxtını izlə
    if (document.readyState === 'complete') {
      trackPageLoadTime();
    } else {
      window.addEventListener('load', () => {
        trackPageLoadTime();
      });
    }

    // Track Core Web Vitals / Core Web Vitals izlə
    trackCoreWebVitals();

    logger.info('Performance monitoring initialized / Performans izləməsi başladıldı');
  } catch (error) {
    logger.error('Failed to initialize performance monitoring / Performans izləməsini başlatmaq uğursuz oldu', error instanceof Error ? error : new Error(String(error)));
  }
}

