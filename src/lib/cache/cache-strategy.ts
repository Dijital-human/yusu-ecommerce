/**
 * Advanced Caching Strategy / Qabaqcıl Cache Strategiyası
 * Provides advanced caching strategies for static pages, API responses, and database queries
 * Statik səhifələr, API cavabları və veritabanı sorğuları üçün qabaqcıl cache strategiyaları təmin edir
 */

import { logger } from "@/lib/utils/logger";

export interface CacheConfig {
  ttl: number; // Time to live in seconds / Yaşama müddəti saniyələrlə
  staleWhileRevalidate?: number; // Stale while revalidate in seconds / Yeniləmə zamanı köhnə məlumatı göstərmə müddəti saniyələrlə
  tags?: string[]; // Cache tags for invalidation / Cache invalidation üçün tag-lər
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  tags?: string[];
}

/**
 * Cache storage (in-memory for now, can be extended to Redis) / Cache saxlama (hazırda memory-də, Redis-ə genişləndirilə bilər)
 */
const cacheStore = new Map<string, CacheEntry<any>>();

/**
 * Get cache entry / Cache girişini al
 */
export function getCacheEntry<T>(key: string): T | null {
  try {
    const entry = cacheStore.get(key);
    if (!entry) return null;

    const now = Date.now();
    const age = now - entry.timestamp;

    // Check if cache is expired / Cache-in vaxtı keçib-keçmədiyini yoxla
    if (age > entry.ttl * 1000) {
      cacheStore.delete(key);
      return null;
    }

    return entry.data as T;
  } catch (error) {
    logger.error('Failed to get cache entry / Cache girişini almaq uğursuz oldu', error instanceof Error ? error : new Error(String(error)));
    return null;
  }
}

/**
 * Set cache entry / Cache girişini təyin et
 */
export function setCacheEntry<T>(key: string, data: T, config: CacheConfig): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: config.ttl,
      tags: config.tags,
    };

    cacheStore.set(key, entry);

    logger.debug('Cache entry set / Cache girişi təyin edildi', { key, ttl: config.ttl });
  } catch (error) {
    logger.error('Failed to set cache entry / Cache girişini təyin etmək uğursuz oldu', error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Invalidate cache by tag / Cache-i tag-ə görə invalidation et
 */
export function invalidateCacheByTag(tag: string): void {
  try {
    let invalidatedCount = 0;

    cacheStore.forEach((entry, key) => {
      if (entry.tags && entry.tags.includes(tag)) {
        cacheStore.delete(key);
        invalidatedCount++;
      }
    });

    logger.info('Cache invalidated by tag / Cache tag-ə görə invalidation edildi', { tag, invalidatedCount });
  } catch (error) {
    logger.error('Failed to invalidate cache by tag / Cache-i tag-ə görə invalidation etmək uğursuz oldu', error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Invalidate cache by key / Cache-i key-ə görə invalidation et
 */
export function invalidateCacheByKey(key: string): void {
  try {
    const deleted = cacheStore.delete(key);
    if (deleted) {
      logger.info('Cache invalidated by key / Cache key-ə görə invalidation edildi', { key });
    }
  } catch (error) {
    logger.error('Failed to invalidate cache by key / Cache-i key-ə görə invalidation etmək uğursuz oldu', error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Clear all cache / Bütün cache-i təmizlə
 */
export function clearCache(): void {
  try {
    const count = cacheStore.size;
    cacheStore.clear();
    logger.info('Cache cleared / Cache təmizləndi', { count });
  } catch (error) {
    logger.error('Failed to clear cache / Cache-i təmizləmək uğursuz oldu', error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Get cache statistics / Cache statistikalarını al
 */
export function getCacheStats(): {
  size: number;
  keys: string[];
  entries: Array<{ key: string; age: number; ttl: number }>;
} {
  try {
    const now = Date.now();
    const entries: Array<{ key: string; age: number; ttl: number }> = [];

    cacheStore.forEach((entry, key) => {
      const age = now - entry.timestamp;
      entries.push({
        key,
        age: Math.floor(age / 1000), // Age in seconds / Yaş saniyələrlə
        ttl: entry.ttl,
      });
    });

    return {
      size: cacheStore.size,
      keys: Array.from(cacheStore.keys()),
      entries,
    };
  } catch (error) {
    logger.error('Failed to get cache stats / Cache statistikalarını almaq uğursuz oldu', error instanceof Error ? error : new Error(String(error)));
    return {
      size: 0,
      keys: [],
      entries: [],
    };
  }
}

/**
 * Cache key generators / Cache key generator-ləri
 */
export const cacheKeys = {
  product: (id: string) => `product:${id}`,
  productList: (filters: string) => `product:list:${filters}`,
  category: (id: string) => `category:${id}`,
  categoryList: () => 'category:list',
  order: (id: string) => `order:${id}`,
  user: (id: string) => `user:${id}`,
  cart: (userId: string) => `cart:${userId}`,
  wishlist: (userId: string) => `wishlist:${userId}`,
};

/**
 * Cache tags / Cache tag-ləri
 */
export const cacheTags = {
  products: 'products',
  categories: 'categories',
  orders: 'orders',
  users: 'users',
  cart: 'cart',
  wishlist: 'wishlist',
};

/**
 * Default cache configurations / Default cache konfiqurasiyaları
 */
export const defaultCacheConfigs: Record<string, CacheConfig> = {
  product: {
    ttl: 3600, // 1 hour / 1 saat
    staleWhileRevalidate: 7200, // 2 hours / 2 saat
    tags: [cacheTags.products],
  },
  productList: {
    ttl: 1800, // 30 minutes / 30 dəqiqə
    staleWhileRevalidate: 3600, // 1 hour / 1 saat
    tags: [cacheTags.products],
  },
  category: {
    ttl: 7200, // 2 hours / 2 saat
    staleWhileRevalidate: 14400, // 4 hours / 4 saat
    tags: [cacheTags.categories],
  },
  categoryList: {
    ttl: 3600, // 1 hour / 1 saat
    staleWhileRevalidate: 7200, // 2 hours / 2 saat
    tags: [cacheTags.categories],
  },
  order: {
    ttl: 300, // 5 minutes / 5 dəqiqə
    tags: [cacheTags.orders],
  },
  user: {
    ttl: 600, // 10 minutes / 10 dəqiqə
    tags: [cacheTags.users],
  },
  cart: {
    ttl: 300, // 5 minutes / 5 dəqiqə
    tags: [cacheTags.cart],
  },
  wishlist: {
    ttl: 300, // 5 minutes / 5 dəqiqə
    tags: [cacheTags.wishlist],
  },
};

