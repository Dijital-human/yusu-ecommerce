/**
 * Sentry Error Tracking & Performance Monitoring / Sentry Xəta İzləmə və Performans Monitorinqi
 * Provides Sentry integration for error tracking and APM
 * Xəta izləmə və APM üçün Sentry inteqrasiyası təmin edir
 */

import * as Sentry from '@sentry/nextjs';
import { logger } from '@/lib/utils/logger';

/**
 * Initialize Sentry / Sentry-ni başlat
 * Should be called early in the application lifecycle
 * Tətbiq həyat dövrünün əvvəlində çağırılmalıdır
 */
export function initSentry() {
  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
  const environment = process.env.SENTRY_ENVIRONMENT || process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development';
  const enabled = process.env.SENTRY_ENABLED !== 'false';

  // Only initialize if DSN is provided and enabled / Yalnız DSN verilibsə və aktivdirsə başlat
  if (!dsn || !enabled) {
    if (process.env.NODE_ENV === 'development') {
      logger.info('Sentry disabled or DSN not provided / Sentry deaktivdir və ya DSN verilməyib');
    }
    return;
  }

  try {
    Sentry.init({
      dsn,
      environment,
      
      // Performance monitoring / Performans monitorinqi
      tracesSampleRate: environment === 'production' ? 0.1 : 1.0, // 10% in production, 100% in dev / Production-da 10%, dev-də 100%
      
      // Session replay (optional) / Session replay (opsional)
      replaysSessionSampleRate: environment === 'production' ? 0.1 : 1.0,
      replaysOnErrorSampleRate: 1.0, // Always record on error / Xəta olduqda həmişə qeyd et
      
      // Release tracking / Release izləmə
      release: process.env.npm_package_version || undefined,
      
      // Ignore specific errors / Xüsusi xətaları ignore et
      ignoreErrors: [
        // Browser extensions / Brauzer extension-ləri
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured',
        // Network errors that are expected / Gözlənilən şəbəkə xətaları
        'NetworkError',
        'Failed to fetch',
        'ChunkLoadError',
      ],
      
      // Filter out sensitive data / Həssas məlumatları filtrlə
      beforeSend(event, hint) {
        // Remove sensitive data from event / Event-dən həssas məlumatları sil
        if (event.request) {
          // Remove cookies and headers / Cookie-ləri və header-ləri sil
          delete event.request.cookies;
          if (event.request.headers) {
            delete event.request.headers['authorization'];
            delete event.request.headers['cookie'];
          }
        }
        
        // Remove sensitive data from user context / User context-dən həssas məlumatları sil
        if (event.user) {
          delete event.user.email;
          delete event.user.ip_address;
        }
        
        return event;
      },
    });

    logger.info('Sentry initialized successfully / Sentry uğurla başladıldı', { environment });
  } catch (error) {
    logger.error('Failed to initialize Sentry / Sentry-ni başlatmaq uğursuz oldu', error);
  }
}

/**
 * Set user context for Sentry / Sentry üçün istifadəçi kontekstini təyin et
 */
export function setSentryUser(userId: string, email?: string, username?: string): void {
  Sentry.setUser({
    id: userId,
    email: email ? undefined : undefined, // Don't send email for privacy / Məxfilik üçün email göndərmə
    username,
  });
}

/**
 * Clear user context / İstifadəçi kontekstini təmizlə
 */
export function clearSentryUser(): void {
  Sentry.setUser(null);
}

/**
 * Capture exception / Xətanı tut
 */
export function captureException(error: Error, context?: Record<string, any>): void {
  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Capture message / Mesajı tut
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, any>): void {
  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
}

/**
 * Add breadcrumb / Breadcrumb əlavə et
 */
export function addBreadcrumb(message: string, category?: string, level?: Sentry.SeverityLevel, data?: Record<string, any>): void {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
  });
}

