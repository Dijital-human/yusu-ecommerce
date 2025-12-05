/**
 * Error Tracking Service / Xəta İzləmə Xidməti
 * Provides error tracking and reporting
 * Xəta izləmə və hesabat təmin edir
 */

import { logger } from '@/lib/utils/logger';

/**
 * Error severity levels / Xəta ağırlıq səviyyələri
 */
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Error context interface / Xəta konteksti interfeysi
 */
export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
  referrer?: string;
  [key: string]: any;
}

/**
 * Error report interface / Xəta hesabatı interfeysi
 */
export interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  severity: ErrorSeverity;
  context: ErrorContext;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

// In-memory error store (in production, use database or external error tracking service like Sentry)
// Yaddaşda xəta saxlama (production-da veritabanı və ya xarici xəta izləmə xidməti istifadə edin, məsələn Sentry)
const errorStore: ErrorReport[] = [];

/**
 * Capture and track error / Xətanı tut və izlə
 */
export function captureError(
  error: Error | unknown,
  severity: ErrorSeverity = 'medium',
  context: ErrorContext = {}
): string {
  try {
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    const errorReport: ErrorReport = {
      id: errorId,
      message: errorMessage,
      stack: errorStack,
      severity,
      context: {
        ...context,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
      resolved: false,
    };

    // Store error / Xətanı saxla
    errorStore.push(errorReport);

    // Log error / Xətanı log et
    logger.error('Error captured / Xəta tutuldu', error, {
      errorId,
      severity,
      context,
    });

    // TODO: Send to external error tracking service (Sentry, Rollbar, etc.)
    // TODO: Xarici xəta izləmə xidmətinə göndər (Sentry, Rollbar və s.)
    // Example: sendToSentry(errorReport);
    // Example: sendToRollbar(errorReport);

    return errorId;
  } catch (trackingError) {
    logger.error('Failed to capture error / Xətanı tutmaq uğursuz oldu', trackingError);
    return 'unknown';
  }
}

/**
 * Capture exception / İstisnanı tut
 */
export function captureException(
  error: Error,
  context: ErrorContext = {}
): string {
  return captureError(error, 'high', context);
}

/**
 * Capture message / Mesajı tut
 */
export function captureMessage(
  message: string,
  severity: ErrorSeverity = 'low',
  context: ErrorContext = {}
): string {
  return captureError(new Error(message), severity, context);
}

/**
 * Get error reports / Xəta hesabatlarını al
 */
export function getErrorReports(
  severity?: ErrorSeverity,
  resolved?: boolean,
  limit: number = 100
): ErrorReport[] {
  let reports = [...errorStore];

  if (severity) {
    reports = reports.filter(r => r.severity === severity);
  }

  if (resolved !== undefined) {
    reports = reports.filter(r => r.resolved === resolved);
  }

  // Sort by timestamp (newest first) / Tarixə görə sırala (ən yenilər əvvəl)
  reports.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return reports.slice(0, limit);
}

/**
 * Resolve error / Xətanı həll et
 */
export function resolveError(errorId: string, resolvedBy?: string): boolean {
  try {
    const errorReport = errorStore.find(e => e.id === errorId);
    
    if (!errorReport) {
      return false;
    }

    errorReport.resolved = true;
    errorReport.resolvedAt = new Date().toISOString();
    errorReport.resolvedBy = resolvedBy;

    logger.info('Error resolved / Xəta həll edildi', { errorId, resolvedBy });

    return true;
  } catch (error) {
    logger.error('Failed to resolve error / Xətanı həll etmək uğursuz oldu', error, { errorId });
    return false;
  }
}

/**
 * Get error statistics / Xəta statistikalarını al
 */
export function getErrorStatistics(): {
  total: number;
  bySeverity: Record<ErrorSeverity, number>;
  resolved: number;
  unresolved: number;
} {
  const total = errorStore.length;
  const bySeverity: Record<ErrorSeverity, number> = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  };

  let resolved = 0;
  let unresolved = 0;

  errorStore.forEach(error => {
    bySeverity[error.severity]++;
    if (error.resolved) {
      resolved++;
    } else {
      unresolved++;
    }
  });

  return {
    total,
    bySeverity,
    resolved,
    unresolved,
  };
}

/**
 * Clear resolved errors / Həll edilmiş xətaları təmizlə
 */
export function clearResolvedErrors(): number {
  const initialLength = errorStore.length;
  const unresolved = errorStore.filter(e => !e.resolved);
  errorStore.length = 0;
  errorStore.push(...unresolved);
  
  const cleared = initialLength - errorStore.length;
  logger.info('Resolved errors cleared / Həll edilmiş xətalar təmizləndi', { cleared });
  
  return cleared;
}

