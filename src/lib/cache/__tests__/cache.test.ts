/**
 * Cache Service Unit Tests / Cache Xidməti Unit Testləri
 * Tests for cache wrapper functionality
 * Cache wrapper funksionallığı üçün testlər
 */

import { cache, cacheKeys, withCache } from '../cache-wrapper';
import { getRedisClient } from '../redis';

// Mock Redis client / Redis client-i mock et
jest.mock('../redis', () => ({
  getRedisClient: jest.fn(),
}));

// Mock logger / Logger-i mock et
jest.mock('@/lib/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('Cache Wrapper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Redis client to return null (use in-memory cache) / Redis client-i null qaytarmaq üçün mock et (in-memory cache istifadə et)
    (getRedisClient as jest.Mock).mockReturnValue(null);
  });

  describe('set', () => {
    it('should set cache value / Cache dəyərini təyin etməlidir', async () => {
      const key = 'test:key';
      const value = { test: 'data' };

      await cache.set(key, value, 3600);

      const result = await cache.get(key);
      expect(result).toEqual(value);
    });

    it('should set cache with custom TTL / Cache-i xüsusi TTL ilə təyin etməlidir', async () => {
      const key = 'test:ttl';
      const value = 'test value';

      await cache.set(key, value, 60);
      const result = await cache.get(key);
      expect(result).toBe(value);
    });
  });

  describe('get', () => {
    it('should return null for non-existent key / Mövcud olmayan açar üçün null qaytarmalıdır', async () => {
      const result = await cache.get('non:existent');
      expect(result).toBeNull();
    });

    it('should return cached value / Cache edilmiş dəyəri qaytarmalıdır', async () => {
      const key = 'test:get';
      const value = { id: 1, name: 'Test' };

      await cache.set(key, value);
      const result = await cache.get(key);

      expect(result).toEqual(value);
    });

    it('should handle complex objects / Mürəkkəb obyektləri idarə etməlidir', async () => {
      const key = 'test:complex';
      const value = {
        nested: {
          array: [1, 2, 3],
          object: { key: 'value' },
        },
      };

      await cache.set(key, value);
      const result = await cache.get(key);

      expect(result).toEqual(value);
    });
  });

  describe('delete', () => {
    it('should delete cached value / Cache edilmiş dəyəri silməlidir', async () => {
      const key = 'test:delete';
      const value = 'test value';

      await cache.set(key, value);
      await cache.delete(key);

      const result = await cache.get(key);
      expect(result).toBeNull();
    });

    it('should handle deleting non-existent key / Mövcud olmayan açarı silməni idarə etməlidir', async () => {
      await expect(cache.delete('non:existent')).resolves.not.toThrow();
    });
  });

  describe('withCache', () => {
    it('should return cached value if exists / Əgər varsa cache edilmiş dəyəri qaytarmalıdır', async () => {
      const key = 'test:withCache';
      const cachedValue = { cached: true };
      const fn = jest.fn().mockResolvedValue({ fresh: true });

      await cache.set(key, cachedValue);
      const result = await withCache(key, fn, 3600);

      expect(result).toEqual(cachedValue);
      expect(fn).not.toHaveBeenCalled();
    });

    it('should execute function and cache result if not cached / Əgər cache edilməyibsə funksiyanı icra etməli və nəticəni cache etməlidir', async () => {
      const key = 'test:withCache:new';
      const freshValue = { fresh: true };
      const fn = jest.fn().mockResolvedValue(freshValue);

      const result = await withCache(key, fn, 3600);

      expect(result).toEqual(freshValue);
      expect(fn).toHaveBeenCalledTimes(1);

      // Verify it's cached / Cache edildiyini yoxla
      const cached = await cache.get(key);
      expect(cached).toEqual(freshValue);
    });

    it('should handle function errors / Funksiya xətalarını idarə etməlidir', async () => {
      const key = 'test:withCache:error';
      const fn = jest.fn().mockRejectedValue(new Error('Function error'));

      await expect(withCache(key, fn, 3600)).rejects.toThrow('Function error');
    });
  });

  describe('cacheKeys', () => {
    it('should generate correct product key / Düzgün məhsul açarı yaratmalıdır', () => {
      const key = cacheKeys.product('123');
      expect(key).toBe('product:123');
    });

    it('should generate correct category key / Düzgün kateqoriya açarı yaratmalıdır', () => {
      const key = cacheKeys.category('456');
      expect(key).toBe('category:456');
    });

    it('should generate correct user key / Düzgün istifadəçi açarı yaratmalıdır', () => {
      const key = cacheKeys.user('789');
      expect(key).toBe('user:789');
    });
  });
});

