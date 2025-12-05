/**
 * Sentry Client Configuration / Sentry Client Konfiqurasiyası
 * This file configures Sentry for client-side (browser)
 * Bu fayl client-side (brauzer) üçün Sentry konfiqurasiya edir
 */

import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const environment = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development';
const enabled = process.env.SENTRY_ENABLED !== 'false';

if (dsn && enabled) {
  Sentry.init({
    dsn,
    environment,
    
    // Performance monitoring / Performans monitorinqi
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
    
    // Session replay / Session replay
    replaysSessionSampleRate: environment === 'production' ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0,
    
    // Release tracking / Release izləmə
    release: process.env.npm_package_version || undefined,
    
    // Trace propagation targets / Trace propagation hədəfləri
    tracePropagationTargets: [
      'localhost',
      /^https:\/\/.*\.yusu\.com/,
      /^https:\/\/.*\.ulustore\.com/,
      /^https:\/\/ulustore\.com/,
    ],
    
    // Integrations / İnteqrasiyalar
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    
    // Ignore specific errors / Xüsusi xətaları ignore et
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      'NetworkError',
      'Failed to fetch',
      'ChunkLoadError',
    ],
    
    // Filter out sensitive data / Həssas məlumatları filtrlə
    beforeSend(event, hint) {
      // Remove sensitive data from event / Event-dən həssas məlumatları sil
      if (event.request) {
        delete event.request.cookies;
        if (event.request.headers) {
          delete event.request.headers['authorization'];
          delete event.request.headers['cookie'];
        }
      }
      
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
      }
      
      return event;
    },
  });
}

