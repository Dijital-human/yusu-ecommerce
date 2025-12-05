/**
 * APM (Application Performance Monitoring) Utility / APM Utility-si
 * Provides integration with APM tools (Sentry, New Relic, Datadog, etc.)
 * APM alətləri ilə inteqrasiya təmin edir (Sentry, New Relic, Datadog və s.)
 */

import { logger } from '@/lib/utils/logger';
import { trackAPIResponseTime, trackDatabaseQueryTime, trackPerformanceMetric } from './performance';

/**
 * APM Provider Interface / APM Provider Interfeysi
 */
export interface APMProvider {
  /**
   * Track transaction / Transaction izlə
   */
  trackTransaction(name: string, duration: number, metadata?: Record<string, any>): void;
  
  /**
   * Track error / Xəta izlə
   */
  trackError(error: Error, context?: Record<string, any>): void;
  
  /**
   * Track custom metric / Custom metriki izlə
   */
  trackMetric(name: string, value: number, unit?: string, metadata?: Record<string, any>): void;
  
  /**
   * Start transaction / Transaction başlat
   */
  startTransaction(name: string, metadata?: Record<string, any>): string;
  
  /**
   * End transaction / Transaction bitir
   */
  endTransaction(transactionId: string, status?: 'success' | 'error'): void;
  
  /**
   * Set user context / İstifadəçi konteksti təyin et
   */
  setUser(userId: string, metadata?: Record<string, any>): void;
}

/**
 * APM Configuration / APM Konfiqurasiyası
 */
interface APMConfig {
  enabled: boolean;
  provider: 'sentry' | 'newrelic' | 'datadog' | 'custom' | 'none';
  serviceName: string;
  environment: string;
  sampleRate?: number; // 0-1, percentage of transactions to track / 0-1, izlənəcək transaction-ların faizi
}

/**
 * Default APM configuration / Default APM konfiqurasiyası
 */
const apmConfig: APMConfig = {
  enabled: process.env.APM_ENABLED === 'true' || process.env.NODE_ENV === 'production',
  provider: (process.env.APM_PROVIDER as APMConfig['provider']) || 'none',
  serviceName: process.env.APM_SERVICE_NAME || process.env.OTEL_SERVICE_NAME || 'yusu-ecommerce',
  environment: process.env.NODE_ENV || 'development',
  sampleRate: parseFloat(process.env.APM_SAMPLE_RATE || '1.0'),
};

/**
 * In-memory APM provider (fallback when no external APM is configured)
 * In-memory APM provider (xarici APM konfiqurasiya edilmədikdə fallback)
 */
class InMemoryAPMProvider implements APMProvider {
  private transactions: Map<string, { name: string; startTime: number; metadata?: Record<string, any> }> = new Map();
  
  trackTransaction(name: string, duration: number, metadata?: Record<string, any>): void {
    if (!apmConfig.enabled) return;
    
    logger.info('APM Transaction tracked / APM Transaction izləndi', {
      name,
      duration,
      metadata,
    });
    
    // Also track as performance metric / Həmçinin performans metriki kimi izlə
    trackPerformanceMetric({
      type: 'api_response_time',
      name: `apm.${name}`,
      value: duration,
      unit: 'ms',
      timestamp: new Date().toISOString(),
      metadata,
    });
  }
  
  trackError(error: Error, context?: Record<string, any>): void {
    if (!apmConfig.enabled) return;
    
    logger.error('APM Error tracked / APM Xətası izləndi', error, context);
  }
  
  trackMetric(name: string, value: number, unit: string = 'ms', metadata?: Record<string, any>): void {
    if (!apmConfig.enabled) return;
    
    logger.info('APM Metric tracked / APM Metriki izləndi', {
      name,
      value,
      unit,
      metadata,
    });
    
    trackPerformanceMetric({
      type: 'api_response_time',
      name: `apm.${name}`,
      value,
      unit,
      timestamp: new Date().toISOString(),
      metadata,
    });
  }
  
  startTransaction(name: string, metadata?: Record<string, any>): string {
    if (!apmConfig.enabled) return '';
    
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    this.transactions.set(transactionId, {
      name,
      startTime: Date.now(),
      metadata,
    });
    
    return transactionId;
  }
  
  endTransaction(transactionId: string, status: 'success' | 'error' = 'success'): void {
    if (!apmConfig.enabled || !transactionId) return;
    
    const transaction = this.transactions.get(transactionId);
    if (!transaction) return;
    
    const duration = Date.now() - transaction.startTime;
    this.trackTransaction(transaction.name, duration, {
      ...transaction.metadata,
      status,
    });
    
    this.transactions.delete(transactionId);
  }
  
  setUser(userId: string, metadata?: Record<string, any>): void {
    if (!apmConfig.enabled) return;
    
    logger.info('APM User context set / APM İstifadəçi konteksti təyin edildi', {
      userId,
      metadata,
    });
  }
}

/**
 * Sentry APM Provider (when Sentry is configured)
 * Sentry APM Provider (Sentry konfiqurasiya edildikdə)
 */
class SentryAPMProvider implements APMProvider {
  private sentry: any;
  
  constructor() {
    try {
      // Dynamic import to avoid errors if Sentry is not installed
      // Sentry quraşdırılmadıqda xətaların qarşısını almaq üçün dynamic import
      // Use eval to avoid build-time errors / Build-time xətaların qarşısını almaq üçün eval istifadə et
      this.sentry = eval('require')('@sentry/nextjs');
    } catch (error) {
      logger.warn('Sentry not available, using in-memory provider / Sentry mövcud deyil, in-memory provider istifadə edilir');
      this.sentry = null;
    }
  }
  
  trackTransaction(name: string, duration: number, metadata?: Record<string, any>): void {
    if (!apmConfig.enabled || !this.sentry) return;
    
    try {
      this.sentry.metrics.distribution(name, duration, {
        tags: metadata,
        unit: 'millisecond',
      });
    } catch (error) {
      logger.error('Failed to track Sentry transaction / Sentry transaction izləmək uğursuz oldu', error);
    }
  }
  
  trackError(error: Error, context?: Record<string, any>): void {
    if (!apmConfig.enabled || !this.sentry) return;
    
    try {
      this.sentry.captureException(error, {
        contexts: {
          custom: context,
        },
      });
    } catch (err) {
      logger.error('Failed to track Sentry error / Sentry xətasını izləmək uğursuz oldu', err);
    }
  }
  
  trackMetric(name: string, value: number, unit: string = 'ms', metadata?: Record<string, any>): void {
    if (!apmConfig.enabled || !this.sentry) return;
    
    try {
      this.sentry.metrics.gauge(name, value, {
        tags: metadata,
        unit,
      });
    } catch (error) {
      logger.error('Failed to track Sentry metric / Sentry metriki izləmək uğursuz oldu', error);
    }
  }
  
  startTransaction(name: string, metadata?: Record<string, any>): string {
    if (!apmConfig.enabled || !this.sentry) return '';
    
    try {
      const transaction = this.sentry.startTransaction({
        name,
        op: 'http.server',
        data: metadata,
      });
      return transaction.traceId || '';
    } catch (error) {
      logger.error('Failed to start Sentry transaction / Sentry transaction başlatmaq uğursuz oldu', error);
      return '';
    }
  }
  
  endTransaction(transactionId: string, status: 'success' | 'error' = 'success'): void {
    if (!apmConfig.enabled || !this.sentry || !transactionId) return;
    
    try {
      const transaction = this.sentry.getCurrentHub()?.getScope()?.getTransaction();
      if (transaction) {
        transaction.setStatus(status === 'success' ? 'ok' : 'internal_error');
        transaction.finish();
      }
    } catch (error) {
      logger.error('Failed to end Sentry transaction / Sentry transaction bitirmək uğursuz oldu', error);
    }
  }
  
  setUser(userId: string, metadata?: Record<string, any>): void {
    if (!apmConfig.enabled || !this.sentry) return;
    
    try {
      this.sentry.setUser({
        id: userId,
        ...metadata,
      });
    } catch (error) {
      logger.error('Failed to set Sentry user / Sentry istifadəçisini təyin etmək uğursuz oldu', error);
    }
  }
}

/**
 * Get APM provider instance / APM provider instance al
 */
function getAPMProvider(): APMProvider {
  if (!apmConfig.enabled) {
    return new InMemoryAPMProvider();
  }
  
  switch (apmConfig.provider) {
    case 'sentry':
      return new SentryAPMProvider();
    case 'newrelic':
    case 'datadog':
      // TODO: Implement New Relic and Datadog providers
      // TODO: New Relic və Datadog provider-ləri tətbiq et
      logger.warn(`APM provider ${apmConfig.provider} not yet implemented, using in-memory provider / APM provider ${apmConfig.provider} hələ tətbiq edilməyib, in-memory provider istifadə edilir`);
      return new InMemoryAPMProvider();
    case 'custom':
    case 'none':
    default:
      return new InMemoryAPMProvider();
  }
}

// Global APM provider instance / Qlobal APM provider instance
let apmProvider: APMProvider | null = null;

/**
 * Initialize APM / APM-ni işə sal
 */
export function initializeAPM(): void {
  if (!apmConfig.enabled) {
    logger.info('APM disabled / APM söndürülüb');
    return;
  }
  
  try {
    apmProvider = getAPMProvider();
    logger.info(`APM initialized with provider: ${apmConfig.provider} / APM provider ilə işə salındı: ${apmConfig.provider}`);
  } catch (error) {
    logger.error('Failed to initialize APM / APM işə salmaq uğursuz oldu', error);
    apmProvider = new InMemoryAPMProvider();
  }
}

/**
 * Get APM provider / APM provider al
 */
export function getAPM(): APMProvider {
  if (!apmProvider) {
    apmProvider = getAPMProvider();
  }
  return apmProvider;
}

/**
 * Track API transaction / API transaction izlə
 */
export function trackAPITransaction(
  endpoint: string,
  method: string,
  duration: number,
  statusCode: number,
  metadata?: Record<string, any>
): void {
  if (!apmConfig.enabled || Math.random() > (apmConfig.sampleRate || 1.0)) {
    return;
  }
  
  const apm = getAPM();
  const transactionName = `${method} ${endpoint}`;
  
  apm.trackTransaction(transactionName, duration, {
    endpoint,
    method,
    statusCode,
    ...metadata,
  });
  
  // Also track using performance monitoring / Həmçinin performance monitoring ilə izlə
  trackAPIResponseTime(endpoint, method, duration, statusCode, undefined, metadata);
}

/**
 * Track database transaction / Database transaction izlə
 */
export function trackDBTransaction(
  query: string,
  duration: number,
  table?: string,
  operation?: string,
  metadata?: Record<string, any>
): void {
  if (!apmConfig.enabled || Math.random() > (apmConfig.sampleRate || 1.0)) {
    return;
  }
  
  const apm = getAPM();
  const transactionName = `db.${table || 'query'}.${operation || 'unknown'}`;
  
  apm.trackTransaction(transactionName, duration, {
    query: query.substring(0, 200),
    table,
    operation,
    ...metadata,
  });
  
  // Also track using performance monitoring / Həmçinin performance monitoring ilə izlə
  trackDatabaseQueryTime(query, duration, table, operation, metadata);
}

/**
 * Track error with APM / APM ilə xəta izlə
 */
export function trackAPMError(error: Error, context?: Record<string, any>): void {
  if (!apmConfig.enabled) return;
  
  const apm = getAPM();
  apm.trackError(error, {
    service: apmConfig.serviceName,
    environment: apmConfig.environment,
    ...context,
  });
}

/**
 * Track custom metric with APM / APM ilə custom metriki izlə
 */
export function trackAPMMetric(
  name: string,
  value: number,
  unit: string = 'ms',
  metadata?: Record<string, any>
): void {
  if (!apmConfig.enabled) return;
  
  const apm = getAPM();
  apm.trackMetric(name, value, unit, {
    service: apmConfig.serviceName,
    environment: apmConfig.environment,
    ...metadata,
  });
}

/**
 * Start APM transaction / APM transaction başlat
 */
export function startAPMTransaction(name: string, metadata?: Record<string, any>): string {
  if (!apmConfig.enabled) return '';
  
  const apm = getAPM();
  return apm.startTransaction(name, {
    service: apmConfig.serviceName,
    environment: apmConfig.environment,
    ...metadata,
  });
}

/**
 * End APM transaction / APM transaction bitir
 */
export function endAPMTransaction(transactionId: string, status: 'success' | 'error' = 'success'): void {
  if (!apmConfig.enabled || !transactionId) return;
  
  const apm = getAPM();
  apm.endTransaction(transactionId, status);
}

/**
 * Set APM user context / APM istifadəçi konteksti təyin et
 */
export function setAPMUser(userId: string, metadata?: Record<string, any>): void {
  if (!apmConfig.enabled) return;
  
  const apm = getAPM();
  apm.setUser(userId, {
    service: apmConfig.serviceName,
    environment: apmConfig.environment,
    ...metadata,
  });
}

