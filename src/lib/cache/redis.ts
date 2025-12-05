/**
 * Redis Client Configuration / Redis Client Konfiqurasiyası
 * Provides Redis client instance with connection management
 * Redis client instance təmin edir bağlantı idarəetməsi ilə
 */

import Redis from 'ioredis';
import { getRedisConfig } from '@/lib/env';
import { logger } from '@/lib/utils/logger';

// Global variable to store Redis client / Redis client-i saxlamaq üçün global dəyişən
const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined | null;
  redisFailed: boolean; // Flag to track if Redis connection failed / Redis bağlantısının uğursuz olduğunu izləmək üçün flag
};

// Redis client instance / Redis client instance
let redisClient: Redis | null = null;

/**
 * Get or create Redis client instance / Redis client instance al və ya yarat
 * Returns null if Redis is not configured / Redis konfiqurasiya edilməyibsə null qaytarır
 */
export function getRedisClient(): Redis | null {
  // If already created, return existing instance / Əgər artıq yaradılıbsa, mövcud instance qaytar
  if (redisClient) {
    return redisClient;
  }

  // If client creation failed before, don't try again / Əgər client yaradılması əvvəl uğursuz olubsa, yenidən cəhd etmə
  if (globalForRedis.redisFailed) {
    return null;
  }

  const config = getRedisConfig();
  
  // If Redis is not configured, return null / Əgər Redis konfiqurasiya edilməyibsə, null qaytar
  if (!config) {
    // Mark as not configured to avoid repeated checks / Təkrar yoxlamaları qarşısını almaq üçün konfiqurasiya edilmədiyini qeyd et
    globalForRedis.redisFailed = true;
    return null;
  }

  try {
    // Create Redis client / Redis client yarat
    redisClient = new Redis(config.url, {
      retryStrategy: (times) => {
        // Stop retrying after 3 attempts / 3 cəhddən sonra retry dayandır
        if (times > 3) {
          logger.warn('Redis connection failed after 3 attempts. Falling back to in-memory cache / Redis bağlantısı 3 cəhddən sonra uğursuz oldu. In-memory cache-ə keçir');
          return null; // Stop retrying / Retry dayandır
        }
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 1, // Reduce retries to avoid blocking / Bloklamanı qarşısını almaq üçün retry-ləri azalt
      enableReadyCheck: false, // Disable ready check to avoid blocking during build / Build zamanı bloklamanı qarşısını almaq üçün ready check-i deaktiv et
      enableOfflineQueue: false,
      lazyConnect: true, // Lazy connect - only connect when needed / Lazy connect - yalnız lazım olduqda bağlan
    });

    // Event handlers / Hadisə işləyiciləri
    redisClient.on('connect', () => {
      logger.info('Redis client connected / Redis client bağlandı');
    });

    redisClient.on('ready', () => {
      logger.info('Redis client ready / Redis client hazırdır');
    });

    redisClient.on('error', (error) => {
      // Only log error if it's not a connection error during build / Yalnız build zamanı connection xətası deyilsə error log et
      if (process.env.NODE_ENV !== 'production' || !error.message.includes('ENOTFOUND')) {
        logger.error('Redis client error / Redis client xətası', error);
      }
      // Mark as failed to avoid repeated attempts / Təkrar cəhdləri qarşısını almaq üçün uğursuz olduğunu qeyd et
      globalForRedis.redisFailed = true;
      redisClient = null;
    });

    redisClient.on('close', () => {
      logger.warn('Redis client closed / Redis client bağlandı');
      redisClient = null;
    });

    // In development, store the client globally / İnkişafda, client-i global olaraq saxla
    if (process.env.NODE_ENV !== 'production') {
      globalForRedis.redis = redisClient;
    }

    return redisClient;
  } catch (error) {
    logger.error('Failed to create Redis client / Redis client yaratmaq uğursuz oldu', error);
    // Mark as failed / Uğursuz olduğunu qeyd et
    globalForRedis.redisFailed = true;
    return null;
  }
}

/**
 * Close Redis connection / Redis bağlantısını bağla
 */
export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.quit();
      redisClient = null;
      logger.info('Redis connection closed / Redis bağlantısı bağlandı');
    } catch (error) {
      logger.error('Error closing Redis connection / Redis bağlantısını bağlama xətası', error);
    }
  }
}

/**
 * Test Redis connection / Redis bağlantısını test et
 */
export async function testRedisConnection(): Promise<boolean> {
  const client = getRedisClient();
  if (!client) {
    return false;
  }

  try {
    await client.ping();
    logger.info('Redis connection test successful / Redis bağlantı testi uğurlu');
    return true;
  } catch (error) {
    logger.error('Redis connection test failed / Redis bağlantı testi uğursuz oldu', error);
    return false;
  }
}

// Export default Redis client / Default Redis client export et
export default getRedisClient();

