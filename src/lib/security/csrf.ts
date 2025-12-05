/**
 * CSRF Protection Service / CSRF Qorunması Xidməti
 * Provides CSRF token generation and validation
 * CSRF token yaratma və yoxlama funksionallığı təmin edir
 */

import { NextRequest, NextResponse } from 'next/server';
import { randomBytes, createHmac } from 'crypto';
import { logger } from '@/lib/utils/logger';
import { getRedisClient } from '@/lib/cache/redis';

/**
 * CSRF token configuration / CSRF token konfiqurasiyası
 */
const CSRF_SECRET = process.env.NEXTAUTH_SECRET || process.env.CSRF_SECRET || 'change-me-in-production';
const CSRF_TOKEN_LENGTH = 32;
const CSRF_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour / 1 saat
const CSRF_TOKEN_HEADER = 'X-CSRF-Token';
const CSRF_COOKIE_NAME = 'csrf-token';

/**
 * Generate CSRF token / CSRF token yarat
 */
export function generateCSRFToken(): string {
  const token = randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
  const hmac = createHmac('sha256', CSRF_SECRET);
  hmac.update(token);
  const signature = hmac.digest('hex');
  return `${token}.${signature}`;
}

/**
 * Validate CSRF token / CSRF token-i doğrula
 */
export async function validateCSRFToken(token: string, cookieToken?: string): Promise<boolean> {
  if (!token) {
    return false;
  }

  // Split token and signature / Token və imzanı ayır
  const [tokenPart, signature] = token.split('.');
  
  if (!tokenPart || !signature) {
    return false;
  }

  // Verify HMAC signature / HMAC imzanı yoxla
  const hmac = createHmac('sha256', CSRF_SECRET);
  hmac.update(tokenPart);
  const expectedSignature = hmac.digest('hex');
  
  if (signature !== expectedSignature) {
    return false;
  }

  // If cookie token provided, verify it matches / Əgər cookie token təmin edilibsə, uyğunluğunu yoxla
  if (cookieToken) {
    const [cookieTokenPart] = cookieToken.split('.');
    if (cookieTokenPart !== tokenPart) {
      return false;
    }
  }

  // Check token in Redis (if available) / Token-i Redis-də yoxla (əgər mövcuddursa)
  try {
    const redis = getRedisClient();
    if (redis) {
      const redisKey = `csrf_token:${tokenPart}`;
      const exists = await redis.exists(redisKey);
      if (!exists) {
        return false;
      }
      // Mark token as used / Token-i istifadə olunmuş kimi qeyd et
      await redis.del(redisKey);
    }
  } catch (error) {
    logger.error('CSRF token validation error / CSRF token doğrulama xətası', error);
  }

  return true;
}

/**
 * Store CSRF token / CSRF token-i saxla
 */
export async function storeCSRFToken(token: string): Promise<void> {
  try {
    const redis = getRedisClient();
    if (redis) {
      const [tokenPart] = token.split('.');
      const redisKey = `csrf_token:${tokenPart}`;
      await redis.setex(redisKey, Math.ceil(CSRF_TOKEN_EXPIRY / 1000), '1');
    }
  } catch (error) {
    logger.error('Failed to store CSRF token / CSRF token-i saxlamaq uğursuz oldu', error);
  }
}

/**
 * Get CSRF token from request / Request-dən CSRF token-i al
 */
export function getCSRFTokenFromRequest(request: NextRequest): {
  token: string | null;
  cookieToken: string | null;
} {
  // Try to get token from header / Header-dan token almağa cəhd et
  const token = request.headers.get(CSRF_TOKEN_HEADER);

  // Try to get token from cookie / Cookie-dən token almağa cəhd et
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value || null;

  return { token, cookieToken };
}

/**
 * CSRF protection middleware / CSRF qorunması middleware
 */
export async function csrfProtectionMiddleware(
  request: NextRequest
): Promise<NextResponse | null> {
  // Skip CSRF protection for GET, HEAD, OPTIONS requests / GET, HEAD, OPTIONS sorğuları üçün CSRF qorunmasını keç
  const method = request.method;
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return null;
  }

  // Get token from request / Request-dən token al
  const { token, cookieToken } = getCSRFTokenFromRequest(request);

  if (!token) {
    logger.warn('CSRF token missing / CSRF token çatışmır', {
      method,
      path: new URL(request.url).pathname,
    });

    return NextResponse.json(
      {
        error: 'CSRF token is required / CSRF token tələb olunur',
        errorAz: 'CSRF token tələb olunur',
      },
      { status: 403 }
    );
  }

  // Validate token / Token-i doğrula
  const isValid = await validateCSRFToken(token, cookieToken || undefined);
  if (!isValid) {
    logger.warn('Invalid CSRF token / Etibarsız CSRF token', {
      method,
      path: new URL(request.url).pathname,
    });

    return NextResponse.json(
      {
        error: 'Invalid CSRF token / Etibarsız CSRF token',
        errorAz: 'Etibarsız CSRF token',
      },
      { status: 403 }
    );
  }

  // Token is valid / Token etibarlıdır
  return null;
}

/**
 * CSRF protection wrapper for API routes / API route-lar üçün CSRF qorunması wrapper
 */
export function withCSRFProtection<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const csrfResponse = await csrfProtectionMiddleware(request);
    if (csrfResponse) {
      return csrfResponse;
    }

    return handler(request, ...args);
  };
}

