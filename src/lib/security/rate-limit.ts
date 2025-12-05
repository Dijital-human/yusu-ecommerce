/**
 * Rate Limiting Service / Rate Limiting Xidməti
 * Redis-based rate limiting for API protection
 * API qorunması üçün Redis əsaslı rate limiting
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';
import { getRedisClient } from '@/lib/cache/redis';

/**
 * Rate limit configuration / Rate limit konfiqurasiyası
 */
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds / Vaxt pəncərəsi millisaniyələrdə
  maxRequests: number; // Maximum requests per window / Pəncərə başına maksimum sorğu
  keyGenerator?: (request: NextRequest) => string; // Custom key generator / Xüsusi açar generator
  skipSuccessfulRequests?: boolean; // Skip counting successful requests / Uğurlu sorğuları saymadan keç
  skipFailedRequests?: boolean; // Skip counting failed requests / Uğursuz sorğuları saymadan keç
}

/**
 * Rate limit result / Rate limit nəticəsi
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  total: number;
}

/**
 * Default rate limit configurations / Default rate limit konfiqurasiyaları
 */
export const DEFAULT_RATE_LIMITS = {
  // General API / Ümumi API
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes / 15 dəqiqə
    maxRequests: 100,
  },
  // Authentication endpoints / Autentifikasiya endpoint-ləri
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes / 15 dəqiqə
    maxRequests: 5,
  },
  // Search endpoints / Axtarış endpoint-ləri
  search: {
    windowMs: 60 * 1000, // 1 minute / 1 dəqiqə
    maxRequests: 30,
  },
  // Payment endpoints / Ödəniş endpoint-ləri
  payment: {
    windowMs: 60 * 1000, // 1 minute / 1 dəqiqə
    maxRequests: 10,
  },
  // Order creation / Sifariş yaratma
  order: {
    windowMs: 60 * 1000, // 1 minute / 1 dəqiqə
    maxRequests: 5,
  },
};

/**
 * Generate rate limit key / Rate limit açarı yarat
 */
function generateRateLimitKey(request: NextRequest, config: RateLimitConfig): string {
  if (config.keyGenerator) {
    return config.keyGenerator(request);
  }

  // Default: Use IP address / Default: IP ünvanından istifadə et
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  const path = new URL(request.url).pathname;
  return `rate_limit:${path}:${ip}`;
}

/**
 * Check rate limit / Rate limit-i yoxla
 */
export async function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  try {
    const redis = getRedisClient();
    if (!redis) {
      // If Redis is not available, allow request / Əgər Redis mövcud deyilsə, sorğuya icazə ver
      logger.warn('Redis not available, skipping rate limit / Redis mövcud deyil, rate limit-i atlayır');
      return {
        allowed: true,
        remaining: config.maxRequests,
        resetTime: Date.now() + config.windowMs,
        total: 0,
      };
    }

    const key = generateRateLimitKey(request, config);
    const windowStart = Math.floor(Date.now() / config.windowMs) * config.windowMs;
    const redisKey = `${key}:${windowStart}`;

    // Get current count / Cari sayı al
    const count = await redis.get(redisKey);
    const currentCount = count ? parseInt(count, 10) : 0;

    // Check if limit exceeded / Limitin aşılıb-aşılmadığını yoxla
    if (currentCount >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: windowStart + config.windowMs,
        total: currentCount,
      };
    }

    // Increment count / Sayı artır
    const newCount = currentCount + 1;
    await redis.setex(redisKey, Math.ceil(config.windowMs / 1000), newCount.toString());

    return {
      allowed: true,
      remaining: config.maxRequests - newCount,
      resetTime: windowStart + config.windowMs,
      total: newCount,
    };
  } catch (error) {
    logger.error('Rate limit check failed / Rate limit yoxlaması uğursuz oldu', error);
    // On error, allow request / Xəta zamanı sorğuya icazə ver
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetTime: Date.now() + config.windowMs,
      total: 0,
    };
  }
}

/**
 * Rate limit middleware / Rate limit middleware
 */
export async function rateLimitMiddleware(
  request: NextRequest,
  config: RateLimitConfig
): Promise<NextResponse | null> {
  const result = await checkRateLimit(request, config);

  if (!result.allowed) {
    logger.warn('Rate limit exceeded / Rate limit aşıldı', {
      key: generateRateLimitKey(request, config),
      total: result.total,
      resetTime: new Date(result.resetTime).toISOString(),
    });

    return NextResponse.json(
      {
        error: 'Too many requests / Çox sayda sorğu',
        errorAz: 'Çox sayda sorğu',
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.resetTime.toString(),
        },
      }
    );
  }

  // Add rate limit headers / Rate limit header-ləri əlavə et
  return null;
}

