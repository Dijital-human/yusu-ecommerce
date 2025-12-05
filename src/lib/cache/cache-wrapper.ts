/**
 * Cache Wrapper Utility / Cache Wrapper Utility-si
 * Provides unified caching interface with Redis fallback to in-memory cache
 * Redis ilə birləşdirilmiş cache interfeysi təmin edir, in-memory cache-ə fallback
 */

import { getRedisClient } from './redis';
import { logger } from '@/lib/utils/logger';
import { recordCacheHit, recordCacheMiss, recordCacheError } from './cache-metrics';

// In-memory cache fallback / In-memory cache fallback
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class InMemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutes default

  set<T>(key: string, value: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { value, expiresAt });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired / Müddəti bitib-bilmədiyini yoxla
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  cleanExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Global in-memory cache instance / Qlobal in-memory cache instance
const inMemoryCache = new InMemoryCache();

// Clean expired entries every 5 minutes / Hər 5 dəqiqədə bir müddəti bitmiş qeydləri təmizlə
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    inMemoryCache.cleanExpired();
  }, 5 * 60 * 1000);
}

/**
 * Cache wrapper class / Cache wrapper sinifi
 * Uses Redis if available, falls back to in-memory cache / Redis mövcuddursa istifadə edir, in-memory cache-ə fallback
 */
class CacheWrapper {
  /**
   * Set cache entry / Cache qeydi təyin et
   */
  async set<T>(key: string, value: T, ttl: number = 3600): Promise<void> {
    const redis = getRedisClient();
    
    if (redis) {
      try {
        // Convert value to JSON string / Dəyəri JSON string-ə çevir
        const serialized = JSON.stringify(value);
        // Set with TTL in seconds / TTL ilə saniyələrdə təyin et
        await redis.setex(key, ttl, serialized);
      } catch (error) {
        logger.error('Redis set error, falling back to in-memory cache / Redis set xətası, in-memory cache-ə fallback', error);
        // Fallback to in-memory cache / In-memory cache-ə fallback
        inMemoryCache.set(key, value, ttl * 1000);
      }
    } else {
      // Use in-memory cache / In-memory cache istifadə et
      inMemoryCache.set(key, value, ttl * 1000);
    }
  }

  /**
   * Get cache entry / Cache qeydi al
   */
  async get<T>(key: string): Promise<T | null> {
    const startTime = Date.now();
    const redis = getRedisClient();
    
    if (redis) {
      try {
        const value = await redis.get(key);
        const responseTime = Date.now() - startTime;
        
        if (value === null) {
          recordCacheMiss(responseTime);
          return null;
        }
        
        // Parse JSON string / JSON string-i parse et
        recordCacheHit(responseTime);
        return JSON.parse(value) as T;
      } catch (error) {
        const responseTime = Date.now() - startTime;
        recordCacheError();
        logger.error('Redis get error, falling back to in-memory cache / Redis get xətası, in-memory cache-ə fallback', error);
        // Fallback to in-memory cache / In-memory cache-ə fallback
        const inMemoryValue = inMemoryCache.get<T>(key);
        if (inMemoryValue === null) {
          recordCacheMiss(responseTime);
        } else {
          recordCacheHit(responseTime);
        }
        return inMemoryValue;
      }
    } else {
      // Use in-memory cache / In-memory cache istifadə et
      const value = inMemoryCache.get<T>(key);
      const responseTime = Date.now() - startTime;
      
      if (value === null) {
        recordCacheMiss(responseTime);
      } else {
        recordCacheHit(responseTime);
      }
      
      return value;
    }
  }

  /**
   * Delete cache entry / Cache qeydi sil
   */
  async delete(key: string): Promise<void> {
    const redis = getRedisClient();
    
    if (redis) {
      try {
        await redis.del(key);
      } catch (error) {
        logger.error('Redis delete error, falling back to in-memory cache / Redis delete xətası, in-memory cache-ə fallback', error);
        // Fallback to in-memory cache / In-memory cache-ə fallback
        inMemoryCache.delete(key);
      }
    } else {
      // Use in-memory cache / In-memory cache istifadə et
      inMemoryCache.delete(key);
    }
  }

  /**
   * Delete multiple cache entries / Çoxlu cache qeydləri sil
   */
  async deleteMany(keys: string[]): Promise<void> {
    const redis = getRedisClient();
    
    if (redis) {
      try {
        if (keys.length > 0) {
          // Filter out wildcard patterns and handle them separately / Wildcard pattern-ləri filtrlə və ayrıca idarə et
          const exactKeys = keys.filter(key => !key.includes('*'));
          const wildcardKeys = keys.filter(key => key.includes('*'));

          // Delete exact keys / Dəqiq açarı sil
          if (exactKeys.length > 0) {
            await redis.del(...exactKeys);
          }

          // Handle wildcard patterns / Wildcard pattern-ləri idarə et
          for (const pattern of wildcardKeys) {
            const matchingKeys: string[] = [];
            let cursor = '0';
            
            do {
              const result = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
              cursor = result[0];
              matchingKeys.push(...result[1]);
            } while (cursor !== '0');

            if (matchingKeys.length > 0) {
              await redis.del(...matchingKeys);
            }
          }
        }
      } catch (error) {
        logger.error('Redis deleteMany error, falling back to in-memory cache / Redis deleteMany xətası, in-memory cache-ə fallback', error);
        // Fallback to in-memory cache / In-memory cache-ə fallback
        keys.forEach(key => {
          if (!key.includes('*')) {
            inMemoryCache.delete(key);
          }
        });
      }
    } else {
      // Use in-memory cache / In-memory cache istifadə et
      keys.forEach(key => {
        if (!key.includes('*')) {
          inMemoryCache.delete(key);
        }
      });
    }
  }

  /**
   * Clear all cache / Bütün cache-i təmizlə
   */
  async clear(): Promise<void> {
    const redis = getRedisClient();
    
    if (redis) {
      try {
        await redis.flushdb();
      } catch (error) {
        logger.error('Redis clear error, falling back to in-memory cache / Redis clear xətası, in-memory cache-ə fallback', error);
        // Fallback to in-memory cache / In-memory cache-ə fallback
        inMemoryCache.clear();
      }
    } else {
      // Use in-memory cache / In-memory cache istifadə et
      inMemoryCache.clear();
    }
  }

  /**
   * Check if key exists / Açarın mövcud olub-olmadığını yoxla
   */
  async exists(key: string): Promise<boolean> {
    const redis = getRedisClient();
    
    if (redis) {
      try {
        const result = await redis.exists(key);
        return result === 1;
      } catch (error) {
        logger.error('Redis exists error, falling back to in-memory cache / Redis exists xətası, in-memory cache-ə fallback', error);
        // Fallback to in-memory cache / In-memory cache-ə fallback
        return inMemoryCache.get(key) !== null;
      }
    } else {
      // Use in-memory cache / In-memory cache istifadə et
      return inMemoryCache.get(key) !== null;
    }
  }
}

// Global cache instance / Qlobal cache instance
export const cache = new CacheWrapper();

/**
 * Cache wrapper for async functions / Async funksiyalar üçün cache wrapper
 * Tries to get from cache first, if not found executes function and caches result
 * Əvvəlcə cache-dən almağa cəhd edir, tapılmasa funksiyanı icra edir və nəticəni cache edir
 */
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  // Try to get from cache / Cache-dən almağa cəhd et
  const cached = await cache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Execute function and cache result / Funksiyanı icra et və nəticəni cache et
  const result = await fn();
  await cache.set(key, result, ttl);
  return result;
}

// Cache key generators / Cache açar generatorları
export const cacheKeys = {
  product: (id: string) => `product:${id}`,
  products: (params: string) => `products:${params}`,
  productDetails: (id: string) => `productDetails:${id}`,
  category: (id: string) => `category:${id}`,
  categories: () => 'categories:all',
  search: (query: string) => `search:${query}`,
  suggestions: (query: string) => `suggestions:${query}`,
  recommendations: (type: string, userId?: string, productId?: string) => {
    let key = `recommendations:${type}`;
    if (userId) key += `:user:${userId}`;
    if (productId) key += `:product:${productId}`;
    return key;
  },
  user: (id: string) => `user:${id}`,
  order: (id: string) => `order:${id}`,
  orders: (userId: string, params?: string) => `orders:${userId}${params ? `:${params}` : ''}`,
};

