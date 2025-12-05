/**
 * Error Aggregation Service / Xəta Aqreqasiya Xidməti
 * Groups similar errors and tracks error frequency and trends
 * Oxşar xətaları qruplaşdırır və xəta tezliyini və trendlərini izləyir
 */

import { logger } from '@/lib/utils/logger';
import { prisma } from '@/lib/db';

/**
 * Aggregated error interface / Aqreqasiya edilmiş xəta interfeysi
 */
export interface AggregatedError {
  id: string;
  message: string;
  errorType: string;
  stackTrace?: string;
  count: number;
  firstSeen: Date;
  lastSeen: Date;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  affectedUsers: number;
  affectedEndpoints: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  trend: 'increasing' | 'stable' | 'decreasing';
}

/**
 * Error frequency tracking / Xəta tezliyi izləmə
 */
interface ErrorFrequency {
  errorId: string;
  count: number;
  timestamp: Date;
}

// In-memory error aggregation store (in production, use database)
// Yaddaşda xəta aqreqasiya saxlama (production-da veritabanı istifadə et)
const errorStore: Map<string, AggregatedError> = new Map();
const errorFrequencyStore: ErrorFrequency[] = [];

/**
 * Group similar errors by message and stack trace / Mesaj və stack trace-ə görə oxşar xətaları qruplaşdır
 */
function generateErrorKey(message: string, stackTrace?: string): string {
  // Normalize error message / Xəta mesajını normallaşdır
  const normalizedMessage = message
    .replace(/\d+/g, 'N') // Replace numbers with N / Rəqəmləri N ilə əvəz et
    .replace(/['"]/g, '') // Remove quotes / Dırnaqları sil
    .trim();

  // Extract first few lines of stack trace / Stack trace-in ilk bir neçə sətirini çıxar
  const normalizedStack = stackTrace
    ? stackTrace
        .split('\n')
        .slice(0, 3)
        .join('\n')
        .replace(/\d+/g, 'N')
    : '';

  return `${normalizedMessage}:${normalizedStack}`;
}

/**
 * Aggregate error / Xətanı aqreqasiya et
 */
export async function aggregateError(
  error: Error,
  context?: {
    userId?: string;
    endpoint?: string;
    metadata?: Record<string, any>;
  }
): Promise<void> {
  try {
    const errorKey = generateErrorKey(error.message, error.stack);
    const existingError = errorStore.get(errorKey);

    if (existingError) {
      // Update existing error / Mövcud xətanı yenilə
      existingError.count++;
      existingError.lastSeen = new Date();
      
      if (context?.userId && !existingError.affectedUsers.toString().includes(context.userId)) {
        existingError.affectedUsers++;
      }
      
      if (context?.endpoint && !existingError.affectedEndpoints.includes(context.endpoint)) {
        existingError.affectedEndpoints.push(context.endpoint);
      }

      // Update severity based on frequency / Tezliyə görə severity-ni yenilə
      if (existingError.count > 100) {
        existingError.severity = 'critical';
      } else if (existingError.count > 50) {
        existingError.severity = 'high';
      } else if (existingError.count > 20) {
        existingError.severity = 'medium';
      }

      errorStore.set(errorKey, existingError);
    } else {
      // Create new aggregated error / Yeni aqreqasiya edilmiş xəta yarat
      const newError: AggregatedError = {
        id: errorKey,
        message: error.message,
        errorType: error.name || 'Error',
        stackTrace: error.stack,
        count: 1,
        firstSeen: new Date(),
        lastSeen: new Date(),
        resolved: false,
        affectedUsers: context?.userId ? 1 : 0,
        affectedEndpoints: context?.endpoint ? [context.endpoint] : [],
        severity: 'low',
        trend: 'stable',
      };

      errorStore.set(errorKey, newError);
    }

    // Track error frequency / Xəta tezliyini izlə
    errorFrequencyStore.push({
      errorId: errorKey,
      count: 1,
      timestamp: new Date(),
    });

    // Keep only last 1000 frequency records / Yalnız son 1000 tezlik qeydini saxla
    if (errorFrequencyStore.length > 1000) {
      errorFrequencyStore.shift();
    }

    logger.debug('Error aggregated / Xəta aqreqasiya edildi', {
      errorKey,
      message: error.message,
      count: errorStore.get(errorKey)?.count,
    });
  } catch (err) {
    logger.error('Failed to aggregate error / Xətanı aqreqasiya etmək uğursuz oldu', err);
  }
}

/**
 * Get aggregated errors / Aqreqasiya edilmiş xətaları al
 */
export function getAggregatedErrors(options?: {
  resolved?: boolean;
  severity?: AggregatedError['severity'];
  limit?: number;
}): AggregatedError[] {
  let errors = Array.from(errorStore.values());

  // Filter by resolved status / Həll olunmuş statusa görə filtrlə
  if (options?.resolved !== undefined) {
    errors = errors.filter((e) => e.resolved === options.resolved);
  }

  // Filter by severity / Severity-yə görə filtrlə
  if (options?.severity) {
    errors = errors.filter((e) => e.severity === options.severity);
  }

  // Sort by count (descending) / Sayına görə sırala (azalan)
  errors.sort((a, b) => b.count - a.count);

  // Limit results / Nəticələri məhdudlaşdır
  if (options?.limit) {
    errors = errors.slice(0, options.limit);
  }

  return errors;
}

/**
 * Mark error as resolved / Xətanı həll olunmuş kimi işarələ
 */
export function markErrorAsResolved(errorId: string, resolvedBy?: string): void {
  const error = errorStore.get(errorId);
  if (error) {
    error.resolved = true;
    error.resolvedAt = new Date();
    error.resolvedBy = resolvedBy;
    errorStore.set(errorId, error);

    logger.info('Error marked as resolved / Xəta həll olunmuş kimi işarələndi', {
      errorId,
      resolvedBy,
    });
  }
}

/**
 * Calculate error trends / Xəta trendlərini hesabla
 */
export function calculateErrorTrends(): void {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  errorStore.forEach((error, errorId) => {
    const recentErrors = errorFrequencyStore.filter(
      (f) => f.errorId === errorId && f.timestamp.getTime() > oneHourAgo
    );
    const olderErrors = errorFrequencyStore.filter(
      (f) => f.errorId === errorId && f.timestamp.getTime() > oneDayAgo && f.timestamp.getTime() <= oneHourAgo
    );

    const recentCount = recentErrors.reduce((sum, e) => sum + e.count, 0);
    const olderCount = olderErrors.reduce((sum, e) => sum + e.count, 0);

    if (recentCount > olderCount * 1.2) {
      error.trend = 'increasing';
    } else if (recentCount < olderCount * 0.8) {
      error.trend = 'decreasing';
    } else {
      error.trend = 'stable';
    }

    errorStore.set(errorId, error);
  });
}

// Calculate trends every 5 minutes / Hər 5 dəqiqədə bir trendləri hesabla
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    calculateErrorTrends();
  }, 5 * 60 * 1000);
}

