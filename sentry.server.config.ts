/**
 * Sentry Server Configuration / Sentry Server Konfiqurasiyası
 * This file configures Sentry for server-side (Node.js)
 * Bu fayl server-side (Node.js) üçün Sentry konfiqurasiya edir
 */

import * as Sentry from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN;
const environment = process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development';
const enabled = process.env.SENTRY_ENABLED !== 'false';

if (dsn && enabled) {
  Sentry.init({
    dsn,
    environment,
    
    // Performance monitoring / Performans monitorinqi
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
    
    // Release tracking / Release izləmə
    release: process.env.npm_package_version || undefined,
    
    // Ignore specific errors / Xüsusi xətaları ignore et
    ignoreErrors: [
      'Non-Error promise rejection captured',
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

