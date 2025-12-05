/**
 * Security Monitoring Service / Təhlükəsizlik Monitorinq Xidməti
 * Provides security event tracking and monitoring
 * Təhlükəsizlik hadisə izləməsi və monitorinq təmin edir
 */

import { NextRequest } from 'next/server';
import { logger } from '@/lib/utils/logger';
import { getRedisClient } from '@/lib/cache/redis';

/**
 * Security event types / Təhlükəsizlik hadisə tipləri
 */
export enum SecurityEventType {
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  CSRF_FAILED = 'csrf_failed',
  XSS_ATTEMPT = 'xss_attempt',
  SQL_INJECTION_ATTEMPT = 'sql_injection_attempt',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  BRUTE_FORCE_ATTEMPT = 'brute_force_attempt',
  DDoS_ATTACK = 'ddos_attack',
  BOT_DETECTED = 'bot_detected',
}

/**
 * Security event interface / Təhlükəsizlik hadisə interfeysi
 */
export interface SecurityEvent {
  type: SecurityEventType;
  timestamp: string;
  ip: string;
  userAgent?: string;
  path: string;
  method: string;
  userId?: string;
  metadata?: Record<string, any>;
}

// In-memory event store (in production, use database or external service)
// Yaddaşda hadisə saxlama (production-da veritabanı və ya xarici xidmət istifadə et)
const securityEvents: SecurityEvent[] = [];

/**
 * Log security event / Təhlükəsizlik hadisəsini log et
 */
export async function logSecurityEvent(
  request: NextRequest,
  type: SecurityEventType,
  userId?: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;
    const url = new URL(request.url);

    const event: SecurityEvent = {
      type,
      timestamp: new Date().toISOString(),
      ip,
      userAgent,
      path: url.pathname,
      method: request.method,
      userId,
      metadata,
    };

    securityEvents.push(event);

    // Keep only last 1000 events to prevent memory issues / Yaddaş problemlərini qarşısını almaq üçün yalnız son 1000 hadisəni saxla
    if (securityEvents.length > 1000) {
      securityEvents.shift();
    }

    // Log to logger / Logger-ə log et
    logger.warn('Security event detected / Təhlükəsizlik hadisəsi aşkar edildi', event);

    // Store in Redis if available / Əgər mövcuddursa Redis-də saxla
    try {
      const redis = getRedisClient();
      if (redis) {
        const redisKey = `security_event:${type}:${ip}:${Date.now()}`;
        await redis.setex(redisKey, 86400, JSON.stringify(event)); // Store for 24 hours / 24 saat saxla
      }
    } catch (error) {
      logger.error('Failed to store security event in Redis / Təhlükəsizlik hadisəsini Redis-də saxlamaq uğursuz oldu', error);
    }

    // TODO: Send to external security monitoring service (Sentry, DataDog, etc.)
    // TODO: Xarici təhlükəsizlik monitorinq xidmətinə göndər (Sentry, DataDog və s.)
  } catch (error) {
    logger.error('Failed to log security event / Təhlükəsizlik hadisəsini log etmək uğursuz oldu', error);
  }
}

/**
 * Get security events / Təhlükəsizlik hadisələrini al
 */
export function getSecurityEvents(
  type?: SecurityEventType,
  startDate?: Date,
  endDate?: Date,
  limit: number = 100
): SecurityEvent[] {
  let events = [...securityEvents];

  if (type) {
    events = events.filter(e => e.type === type);
  }

  if (startDate || endDate) {
    events = events.filter(e => {
      const timestamp = new Date(e.timestamp);
      if (startDate && timestamp < startDate) return false;
      if (endDate && timestamp > endDate) return false;
      return true;
    });
  }

  // Sort by timestamp (newest first) / Tarixə görə sırala (ən yenilər əvvəl)
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return events.slice(0, limit);
}

/**
 * Detect suspicious activity / Şübhəli fəaliyyəti aşkar et
 */
export async function detectSuspiciousActivity(
  request: NextRequest,
  userId?: string
): Promise<boolean> {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
    const path = new URL(request.url).pathname;

    // Check for rapid requests from same IP / Eyni IP-dən sürətli sorğuları yoxla
    const redis = getRedisClient();
    if (redis) {
      const rapidRequestKey = `rapid_requests:${ip}`;
      const count = await redis.incr(rapidRequestKey);
      await redis.expire(rapidRequestKey, 60); // 1 minute window / 1 dəqiqəlik pəncərə

      if (count > 50) {
        await logSecurityEvent(request, SecurityEventType.SUSPICIOUS_ACTIVITY, userId, {
          reason: 'Rapid requests detected / Sürətli sorğular aşkar edildi',
          count,
        });
        return true;
      }
    }

    // Check for suspicious paths / Şübhəli yolları yoxla
    const suspiciousPaths = ['/admin', '/api/admin', '/api/payment', '/api/auth'];
    if (suspiciousPaths.some(sp => path.startsWith(sp))) {
      // Additional checks can be added here / Əlavə yoxlamalar burada əlavə edilə bilər
    }

    return false;
  } catch (error) {
    logger.error('Failed to detect suspicious activity / Şübhəli fəaliyyəti aşkar etmək uğursuz oldu', error);
    return false;
  }
}

