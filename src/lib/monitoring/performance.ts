/**
 * Performance Monitoring Service / Performans Monitorinq Xidməti
 * Provides performance tracking and monitoring
 * Performans izləmə və monitorinq təmin edir
 */

import { logger } from '@/lib/utils/logger';

/**
 * Performance metric types / Performans metrik tipləri
 */
export type PerformanceMetricType = 
  | 'api_response_time'
  | 'database_query_time'
  | 'page_load_time'
  | 'core_web_vital'
  | 'memory_usage'
  | 'cpu_usage';

/**
 * Core Web Vitals metrics / Core Web Vitals metrikaları
 */
export interface CoreWebVitals {
  lcp?: number; // Largest Contentful Paint / Ən böyük məzmun rəngləmə
  fid?: number; // First Input Delay / İlk giriş gecikməsi
  cls?: number; // Cumulative Layout Shift / Kümülatif layout dəyişikliyi
  fcp?: number; // First Contentful Paint / İlk məzmun rəngləməsi
  ttfb?: number; // Time to First Byte / İlk bayta vaxt
  inp?: number; // Interaction to Next Paint / Növbəti rəngləməyə qədər qarşılıqlı əlaqə
}

/**
 * Performance metric interface / Performans metrik interfeysi
 */
export interface PerformanceMetric {
  type: PerformanceMetricType;
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * API performance metric / API performans metrikası
 */
export interface APIPerformanceMetric {
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  timestamp: string;
  userId?: string;
  metadata?: Record<string, any>;
}

/**
 * Database query performance metric / Veritabanı sorğu performans metrikası
 */
export interface DatabasePerformanceMetric {
  query: string;
  queryTime: number;
  timestamp: string;
  table?: string;
  operation?: string;
  metadata?: Record<string, any>;
}

// In-memory metric storage (in production, use database or external monitoring service)
// Yaddaşda metrik saxlama (production-da veritabanı və ya xarici monitorinq xidməti istifadə edin)
const metricsStore: PerformanceMetric[] = [];
const apiMetricsStore: APIPerformanceMetric[] = [];
const dbMetricsStore: DatabasePerformanceMetric[] = [];

/**
 * Track performance metric / Performans metrikini izlə
 */
export function trackPerformanceMetric(metric: PerformanceMetric): void {
  try {
    metricsStore.push(metric);

    // Keep only last 1000 metrics to prevent memory issues / Yaddaş problemlərini qarşısını almaq üçün yalnız son 1000 metriki saxla
    if (metricsStore.length > 1000) {
      metricsStore.shift();
    }

    logger.info('Performance metric tracked / Performans metriki izləndi', {
      type: metric.type,
      name: metric.name,
      value: metric.value,
      unit: metric.unit,
    });

    // TODO: Send to external monitoring service (Prometheus, DataDog, etc.)
    // TODO: Xarici monitorinq xidmətinə göndər (Prometheus, DataDog və s.)
  } catch (error) {
    logger.error('Failed to track performance metric / Performans metrikini izləmək uğursuz oldu', error, metric);
  }
}

/**
 * Track API response time / API cavab vaxtını izlə
 */
export function trackAPIResponseTime(
  endpoint: string,
  method: string,
  responseTime: number,
  statusCode: number,
  userId?: string,
  metadata?: Record<string, any>
): void {
  try {
    const metric: APIPerformanceMetric = {
      endpoint,
      method,
      responseTime,
      statusCode,
      timestamp: new Date().toISOString(),
      userId,
      metadata,
    };

    apiMetricsStore.push(metric);

    // Keep only last 1000 API metrics / Yalnız son 1000 API metrikini saxla
    if (apiMetricsStore.length > 1000) {
      apiMetricsStore.shift();
    }

    // Track as general performance metric / Ümumi performans metrikası kimi izlə
    trackPerformanceMetric({
      type: 'api_response_time',
      name: `${method} ${endpoint}`,
      value: responseTime,
      unit: 'ms',
      timestamp: metric.timestamp,
      metadata: {
        statusCode,
        userId,
        ...metadata,
      },
    });

    // Log slow API calls (> 1 second) / Yavaş API çağırışlarını log et (> 1 saniyə)
    if (responseTime > 1000) {
      logger.warn('Slow API call detected / Yavaş API çağırışı aşkar edildi', {
        endpoint,
        method,
        responseTime,
        statusCode,
      });
    }
  } catch (error) {
    logger.error('Failed to track API response time / API cavab vaxtını izləmək uğursuz oldu', error, { endpoint, method });
  }
}

/**
 * Track database query time / Veritabanı sorğu vaxtını izlə
 */
export function trackDatabaseQueryTime(
  query: string,
  queryTime: number,
  table?: string,
  operation?: string,
  metadata?: Record<string, any>
): void {
  try {
    const metric: DatabasePerformanceMetric = {
      query: query.substring(0, 200), // Truncate long queries / Uzun sorğuları kəs
      queryTime,
      timestamp: new Date().toISOString(),
      table,
      operation,
      metadata,
    };

    dbMetricsStore.push(metric);

    // Keep only last 1000 DB metrics / Yalnız son 1000 DB metrikini saxla
    if (dbMetricsStore.length > 1000) {
      dbMetricsStore.shift();
    }

    // Track as general performance metric / Ümumi performans metrikası kimi izlə
    trackPerformanceMetric({
      type: 'database_query_time',
      name: table || query.substring(0, 50),
      value: queryTime,
      unit: 'ms',
      timestamp: metric.timestamp,
      metadata: {
        table,
        operation,
        ...metadata,
      },
    });

    // Log slow queries (> 500ms) / Yavaş sorğuları log et (> 500ms)
    if (queryTime > 500) {
      logger.warn('Slow database query detected / Yavaş veritabanı sorğusu aşkar edildi', {
        query: query.substring(0, 100),
        queryTime,
        table,
        operation,
      });
    }
  } catch (error) {
    logger.error('Failed to track database query time / Veritabanı sorğu vaxtını izləmək uğursuz oldu', error, { query });
  }
}

/**
 * Track page load time / Səhifə yükləmə vaxtını izlə
 */
export function trackPageLoadTime(
  page: string,
  loadTime: number,
  metadata?: Record<string, any>
): void {
  trackPerformanceMetric({
    type: 'page_load_time',
    name: page,
    value: loadTime,
    unit: 'ms',
    timestamp: new Date().toISOString(),
    metadata,
  });
}

/**
 * Track Core Web Vitals / Core Web Vitals izlə
 */
export function trackCoreWebVitals(
  page: string,
  vitals: CoreWebVitals,
  metadata?: Record<string, any>
): void {
  try {
    if (vitals.lcp !== undefined) {
      trackPerformanceMetric({
        type: 'core_web_vital',
        name: `${page} - LCP`,
        value: vitals.lcp,
        unit: 'ms',
        timestamp: new Date().toISOString(),
        metadata: { ...metadata, vital: 'LCP' },
      });
    }

    if (vitals.fid !== undefined) {
      trackPerformanceMetric({
        type: 'core_web_vital',
        name: `${page} - FID`,
        value: vitals.fid,
        unit: 'ms',
        timestamp: new Date().toISOString(),
        metadata: { ...metadata, vital: 'FID' },
      });
    }

    if (vitals.cls !== undefined) {
      trackPerformanceMetric({
        type: 'core_web_vital',
        name: `${page} - CLS`,
        value: vitals.cls,
        unit: 'score',
        timestamp: new Date().toISOString(),
        metadata: { ...metadata, vital: 'CLS' },
      });
    }

    if (vitals.fcp !== undefined) {
      trackPerformanceMetric({
        type: 'core_web_vital',
        name: `${page} - FCP`,
        value: vitals.fcp,
        unit: 'ms',
        timestamp: new Date().toISOString(),
        metadata: { ...metadata, vital: 'FCP' },
      });
    }

    if (vitals.ttfb !== undefined) {
      trackPerformanceMetric({
        type: 'core_web_vital',
        name: `${page} - TTFB`,
        value: vitals.ttfb,
        unit: 'ms',
        timestamp: new Date().toISOString(),
        metadata: { ...metadata, vital: 'TTFB' },
      });
    }

    if (vitals.inp !== undefined) {
      trackPerformanceMetric({
        type: 'core_web_vital',
        name: `${page} - INP`,
        value: vitals.inp,
        unit: 'ms',
        timestamp: new Date().toISOString(),
        metadata: { ...metadata, vital: 'INP' },
      });
    }
  } catch (error) {
    logger.error('Failed to track Core Web Vitals / Core Web Vitals izləmək uğursuz oldu', error, { page, vitals });
  }
}

/**
 * Get API performance statistics / API performans statistikalarını al
 */
export function getAPIPerformanceStats(
  endpoint?: string,
  startDate?: Date,
  endDate?: Date
): {
  totalRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  errorRate: number;
  requestsPerMinute: number;
} {
  let metrics = [...apiMetricsStore];

  if (endpoint) {
    metrics = metrics.filter(m => m.endpoint === endpoint);
  }

  if (startDate || endDate) {
    metrics = metrics.filter(m => {
      const timestamp = new Date(m.timestamp);
      if (startDate && timestamp < startDate) return false;
      if (endDate && timestamp > endDate) return false;
      return true;
    });
  }

  if (metrics.length === 0) {
    return {
      totalRequests: 0,
      averageResponseTime: 0,
      minResponseTime: 0,
      maxResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      errorRate: 0,
      requestsPerMinute: 0,
    };
  }

  const responseTimes = metrics.map(m => m.responseTime).sort((a, b) => a - b);
  const totalRequests = metrics.length;
  const averageResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / totalRequests;
  const minResponseTime = responseTimes[0];
  const maxResponseTime = responseTimes[responseTimes.length - 1];
  const p95Index = Math.floor(totalRequests * 0.95);
  const p99Index = Math.floor(totalRequests * 0.99);
  const p95ResponseTime = responseTimes[p95Index] || 0;
  const p99ResponseTime = responseTimes[p99Index] || 0;

  const errorCount = metrics.filter(m => m.statusCode >= 400).length;
  const errorRate = (errorCount / totalRequests) * 100;

  // Calculate requests per minute / Dəqiqədə sorğu sayını hesabla
  const timeSpan = startDate && endDate 
    ? (endDate.getTime() - startDate.getTime()) / (1000 * 60) 
    : 1; // Default to 1 minute if no date range / Əgər tarix aralığı yoxdursa default olaraq 1 dəqiqə
  const requestsPerMinute = totalRequests / Math.max(timeSpan, 1);

  return {
    totalRequests,
    averageResponseTime,
    minResponseTime,
    maxResponseTime,
    p95ResponseTime,
    p99ResponseTime,
    errorRate,
    requestsPerMinute,
  };
}

/**
 * Get database performance statistics / Veritabanı performans statistikalarını al
 */
export function getDatabasePerformanceStats(
  table?: string,
  startDate?: Date,
  endDate?: Date
): {
  totalQueries: number;
  averageQueryTime: number;
  minQueryTime: number;
  maxQueryTime: number;
  p95QueryTime: number;
  p99QueryTime: number;
  slowQueries: number;
} {
  let metrics = [...dbMetricsStore];

  if (table) {
    metrics = metrics.filter(m => m.table === table);
  }

  if (startDate || endDate) {
    metrics = metrics.filter(m => {
      const timestamp = new Date(m.timestamp);
      if (startDate && timestamp < startDate) return false;
      if (endDate && timestamp > endDate) return false;
      return true;
    });
  }

  if (metrics.length === 0) {
    return {
      totalQueries: 0,
      averageQueryTime: 0,
      minQueryTime: 0,
      maxQueryTime: 0,
      p95QueryTime: 0,
      p99QueryTime: 0,
      slowQueries: 0,
    };
  }

  const queryTimes = metrics.map(m => m.queryTime).sort((a, b) => a - b);
  const totalQueries = metrics.length;
  const averageQueryTime = queryTimes.reduce((sum, time) => sum + time, 0) / totalQueries;
  const minQueryTime = queryTimes[0];
  const maxQueryTime = queryTimes[queryTimes.length - 1];
  const p95Index = Math.floor(totalQueries * 0.95);
  const p99Index = Math.floor(totalQueries * 0.99);
  const p95QueryTime = queryTimes[p95Index] || 0;
  const p99QueryTime = queryTimes[p99Index] || 0;
  const slowQueries = metrics.filter(m => m.queryTime > 500).length;

  return {
    totalQueries,
    averageQueryTime,
    minQueryTime,
    maxQueryTime,
    p95QueryTime,
    p99QueryTime,
    slowQueries,
  };
}

/**
 * Get all performance metrics / Bütün performans metrikalarını al
 */
export function getPerformanceMetrics(
  type?: PerformanceMetricType,
  startDate?: Date,
  endDate?: Date,
  limit: number = 100
): PerformanceMetric[] {
  let metrics = [...metricsStore];

  if (type) {
    metrics = metrics.filter(m => m.type === type);
  }

  if (startDate || endDate) {
    metrics = metrics.filter(m => {
      const timestamp = new Date(m.timestamp);
      if (startDate && timestamp < startDate) return false;
      if (endDate && timestamp > endDate) return false;
      return true;
    });
  }

  // Sort by timestamp (newest first) / Tarixə görə sırala (ən yenilər əvvəl)
  metrics.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return metrics.slice(0, limit);
}

