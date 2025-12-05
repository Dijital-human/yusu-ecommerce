/**
 * Cache Metrics Utility / Cache Metrikaları Utility-si
 * Tracks cache performance metrics including hit rate, miss rate, and response times
 * Cache performans metrikalarını izləyir, o cümlədən hit rate, miss rate və response time-ları
 */

import { logger } from '@/lib/utils/logger';

/**
 * Cache metrics interface / Cache metrikaları interfeysi
 */
export interface CacheMetrics {
  hits: number;
  misses: number;
  totalRequests: number;
  hitRate: number;
  missRate: number;
  averageResponseTime: number;
  totalResponseTime: number;
  cacheSize: number;
  evictions: number;
  errors: number;
  timestamp: string;
}

/**
 * Cache metrics storage / Cache metrikaları saxlama
 * In-memory storage for cache metrics (can be extended to use Redis for distributed systems)
 * Cache metrikaları üçün in-memory saxlama (distributed sistemlər üçün Redis istifadə edilə bilər)
 */
class CacheMetricsStore {
  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    totalRequests: 0,
    hitRate: 0,
    missRate: 0,
    averageResponseTime: 0,
    totalResponseTime: 0,
    cacheSize: 0,
    evictions: 0,
    errors: 0,
    timestamp: new Date().toISOString(),
  };

  private responseTimes: number[] = [];
  private readonly maxResponseTimeSamples = 1000; // Keep last 1000 samples / Son 1000 nümunəni saxla

  /**
   * Record cache hit / Cache hit qeyd et
   */
  recordHit(responseTime: number = 0): void {
    this.metrics.hits++;
    this.metrics.totalRequests++;
    this.recordResponseTime(responseTime);
    this.updateRates();
  }

  /**
   * Record cache miss / Cache miss qeyd et
   */
  recordMiss(responseTime: number = 0): void {
    this.metrics.misses++;
    this.metrics.totalRequests++;
    this.recordResponseTime(responseTime);
    this.updateRates();
  }

  /**
   * Record cache error / Cache xətası qeyd et
   */
  recordError(): void {
    this.metrics.errors++;
  }

  /**
   * Record cache eviction / Cache eviction qeyd et
   */
  recordEviction(): void {
    this.metrics.evictions++;
  }

  /**
   * Record response time / Response time qeyd et
   */
  private recordResponseTime(responseTime: number): void {
    if (responseTime > 0) {
      this.responseTimes.push(responseTime);
      this.metrics.totalResponseTime += responseTime;

      // Keep only last N samples / Yalnız son N nümunəni saxla
      if (this.responseTimes.length > this.maxResponseTimeSamples) {
        const removed = this.responseTimes.shift();
        if (removed) {
          this.metrics.totalResponseTime -= removed;
        }
      }

      // Calculate average / Orta hesabla
      const sampleCount = this.responseTimes.length;
      this.metrics.averageResponseTime = sampleCount > 0
        ? this.metrics.totalResponseTime / sampleCount
        : 0;
    }
  }

  /**
   * Update hit/miss rates / Hit/miss rate-ləri yenilə
   */
  private updateRates(): void {
    const total = this.metrics.totalRequests;
    if (total > 0) {
      this.metrics.hitRate = (this.metrics.hits / total) * 100;
      this.metrics.missRate = (this.metrics.misses / total) * 100;
    }
  }

  /**
   * Update cache size / Cache ölçüsünü yenilə
   */
  updateCacheSize(size: number): void {
    this.metrics.cacheSize = size;
  }

  /**
   * Get current metrics / Hazırkı metrikaları al
   */
  getMetrics(): CacheMetrics {
    return {
      ...this.metrics,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Reset metrics / Metrikaları sıfırla
   */
  reset(): void {
    this.metrics = {
      hits: 0,
      misses: 0,
      totalRequests: 0,
      hitRate: 0,
      missRate: 0,
      averageResponseTime: 0,
      totalResponseTime: 0,
      cacheSize: 0,
      evictions: 0,
      errors: 0,
      timestamp: new Date().toISOString(),
    };
    this.responseTimes = [];
  }

  /**
   * Get metrics summary / Metrikalar xülasəsini al
   */
  getSummary(): {
    hitRate: number;
    missRate: number;
    totalRequests: number;
    averageResponseTime: number;
    cacheSize: number;
  } {
    return {
      hitRate: this.metrics.hitRate,
      missRate: this.metrics.missRate,
      totalRequests: this.metrics.totalRequests,
      averageResponseTime: this.metrics.averageResponseTime,
      cacheSize: this.metrics.cacheSize,
    };
  }
}

// Global cache metrics store instance / Qlobal cache metrikaları store instance
const cacheMetricsStore = new CacheMetricsStore();

/**
 * Record cache hit / Cache hit qeyd et
 */
export function recordCacheHit(responseTime: number = 0): void {
  cacheMetricsStore.recordHit(responseTime);
}

/**
 * Record cache miss / Cache miss qeyd et
 */
export function recordCacheMiss(responseTime: number = 0): void {
  cacheMetricsStore.recordMiss(responseTime);
}

/**
 * Record cache error / Cache xətası qeyd et
 */
export function recordCacheError(): void {
  cacheMetricsStore.recordError();
}

/**
 * Record cache eviction / Cache eviction qeyd et
 */
export function recordCacheEviction(): void {
  cacheMetricsStore.recordEviction();
}

/**
 * Update cache size / Cache ölçüsünü yenilə
 */
export function updateCacheSize(size: number): void {
  cacheMetricsStore.updateCacheSize(size);
}

/**
 * Get cache metrics / Cache metrikalarını al
 */
export function getCacheMetrics(): CacheMetrics {
  return cacheMetricsStore.getMetrics();
}

/**
 * Get cache metrics summary / Cache metrikaları xülasəsini al
 */
export function getCacheMetricsSummary() {
  return cacheMetricsStore.getSummary();
}

/**
 * Reset cache metrics / Cache metrikalarını sıfırla
 */
export function resetCacheMetrics(): void {
  cacheMetricsStore.reset();
  logger.info('Cache metrics reset / Cache metrikaları sıfırlandı');
}

