/**
 * Alert System / Xəbərdarlıq Sistemi
 * Provides alerting functionality for monitoring metrics
 * Monitorinq metrikaları üçün xəbərdarlıq funksionallığı təmin edir
 */

import { logger } from '@/lib/utils/logger';
import { getAPIPerformanceStats, getDatabasePerformanceStats } from './performance';
import { getCacheMetricsSummary } from '@/lib/cache/cache-metrics';
import { getConnectionPoolMetrics } from '@/lib/db';

/**
 * Alert severity levels / Xəbərdarlıq ağırlıq səviyyələri
 */
export type AlertSeverity = 'info' | 'warning' | 'critical';

/**
 * Alert type / Xəbərdarlıq tipi
 */
export type AlertType = 
  | 'api_error_rate'
  | 'api_response_time'
  | 'database_query_time'
  | 'database_connection_pool'
  | 'cache_hit_rate'
  | 'cache_response_time'
  | 'system_memory'
  | 'system_cpu'
  | 'custom';

/**
 * Alert configuration / Xəbərdarlıq konfiqurasiyası
 */
export interface AlertConfig {
  type: AlertType;
  severity: AlertSeverity;
  threshold: number; // Threshold value / Limit dəyəri
  comparison: 'gt' | 'lt' | 'eq'; // Greater than, Less than, Equal / Böyükdür, Kiçikdir, Bərabərdir
  duration?: number; // Duration in seconds before alert triggers / Xəbərdarlığın tetiklənməsindən əvvəl müddət (saniyələrlə)
  enabled: boolean;
  notificationChannels?: string[]; // Email, Slack, SMS, etc. / Email, Slack, SMS və s.
}

/**
 * Alert instance / Xəbərdarlıq instance-ı
 */
export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  messageAz: string;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
  metadata?: Record<string, any>;
}

/**
 * Alert rule / Xəbərdarlıq qaydası
 */
export interface AlertRule extends AlertConfig {
  id: string;
  name: string;
  nameAz: string;
  description?: string;
  descriptionAz?: string;
}

/**
 * Default alert rules / Default xəbərdarlıq qaydaları
 */
const defaultAlertRules: AlertRule[] = [
  {
    id: 'api_error_rate_high',
    name: 'High API Error Rate',
    nameAz: 'Yüksək API Xəta Dərəcəsi',
    type: 'api_error_rate',
    severity: 'critical',
    threshold: 5, // 5% error rate
    comparison: 'gt',
    duration: 60, // 1 minute
    enabled: true,
    description: 'API error rate exceeds 5%',
    descriptionAz: 'API xəta dərəcəsi 5%-dən çoxdur',
  },
  {
    id: 'api_response_time_high',
    name: 'High API Response Time',
    nameAz: 'Yüksək API Cavab Vaxtı',
    type: 'api_response_time',
    severity: 'warning',
    threshold: 1000, // 1 second
    comparison: 'gt',
    duration: 120, // 2 minutes
    enabled: true,
    description: 'API response time exceeds 1 second',
    descriptionAz: 'API cavab vaxtı 1 saniyədən çoxdur',
  },
  {
    id: 'database_query_time_high',
    name: 'High Database Query Time',
    nameAz: 'Yüksək Veritabanı Sorğu Vaxtı',
    type: 'database_query_time',
    severity: 'warning',
    threshold: 500, // 500ms
    comparison: 'gt',
    duration: 60,
    enabled: true,
    description: 'Database query time exceeds 500ms',
    descriptionAz: 'Veritabanı sorğu vaxtı 500ms-dən çoxdur',
  },
  {
    id: 'database_connection_pool_exhausted',
    name: 'Database Connection Pool Exhausted',
    nameAz: 'Veritabanı Connection Pool Tükənib',
    type: 'database_connection_pool',
    severity: 'critical',
    threshold: 80, // 80% of pool used
    comparison: 'gt',
    duration: 30,
    enabled: true,
    description: 'Database connection pool usage exceeds 80%',
    descriptionAz: 'Veritabanı connection pool istifadəsi 80%-dən çoxdur',
  },
  {
    id: 'cache_hit_rate_low',
    name: 'Low Cache Hit Rate',
    nameAz: 'Aşağı Cache Hit Rate',
    type: 'cache_hit_rate',
    severity: 'warning',
    threshold: 70, // 70% hit rate
    comparison: 'lt',
    duration: 300, // 5 minutes
    enabled: true,
    description: 'Cache hit rate falls below 70%',
    descriptionAz: 'Cache hit rate 70%-dən aşağıdır',
  },
  {
    id: 'cache_response_time_high',
    name: 'High Cache Response Time',
    nameAz: 'Yüksək Cache Cavab Vaxtı',
    type: 'cache_response_time',
    severity: 'warning',
    threshold: 50, // 50ms
    comparison: 'gt',
    duration: 120,
    enabled: true,
    description: 'Cache response time exceeds 50ms',
    descriptionAz: 'Cache cavab vaxtı 50ms-dən çoxdur',
  },
];

// In-memory alert storage (in production, use database) / Yaddaşda alert saxlama (production-da veritabanı istifadə et)
const activeAlerts: Map<string, Alert> = new Map();
const alertRules: Map<string, AlertRule> = new Map();

// Initialize default rules / Default qaydaları işə sal
defaultAlertRules.forEach(rule => {
  alertRules.set(rule.id, rule);
});

/**
 * Alert configuration from environment / Environment-dən alert konfiqurasiyası
 */
const ALERT_ENABLED = process.env.ALERT_ENABLED === 'true' || process.env.NODE_ENV === 'production';
const ALERT_CHECK_INTERVAL = parseInt(process.env.ALERT_CHECK_INTERVAL || '60000', 10); // Default: 60 seconds

/**
 * Check alert conditions and trigger alerts / Xəbərdarlıq şərtlərini yoxla və alert-ləri tetiklə
 */
export async function checkAlerts(): Promise<Alert[]> {
  if (!ALERT_ENABLED) {
    return [];
  }

  const triggeredAlerts: Alert[] = [];

  try {
    // Get current metrics / Hazırkı metrikaları al
    const [apiStats, dbStats, cacheMetrics, dbPoolMetrics] = await Promise.all([
      Promise.resolve(getAPIPerformanceStats()),
      Promise.resolve(getDatabasePerformanceStats()),
      Promise.resolve(getCacheMetricsSummary()),
      Promise.resolve(getConnectionPoolMetrics()),
    ]);

    // Check each alert rule / Hər alert qaydasını yoxla
    for (const rule of alertRules.values()) {
      if (!rule.enabled) continue;

      let shouldTrigger = false;
      let currentValue = 0;
      let message = '';
      let messageAz = '';

      switch (rule.type) {
        case 'api_error_rate':
          currentValue = apiStats.errorRate || 0;
          shouldTrigger = checkThreshold(currentValue, rule.threshold, rule.comparison);
          if (shouldTrigger) {
            message = `API error rate is ${currentValue.toFixed(2)}% (threshold: ${rule.threshold}%)`;
            messageAz = `API xəta dərəcəsi ${currentValue.toFixed(2)}%-dir (limit: ${rule.threshold}%)`;
          }
          break;

        case 'api_response_time':
          currentValue = apiStats.averageResponseTime || 0;
          shouldTrigger = checkThreshold(currentValue, rule.threshold, rule.comparison);
          if (shouldTrigger) {
            message = `API response time is ${currentValue.toFixed(2)}ms (threshold: ${rule.threshold}ms)`;
            messageAz = `API cavab vaxtı ${currentValue.toFixed(2)}ms-dir (limit: ${rule.threshold}ms)`;
          }
          break;

        case 'database_query_time':
          currentValue = dbStats.averageQueryTime || 0;
          shouldTrigger = checkThreshold(currentValue, rule.threshold, rule.comparison);
          if (shouldTrigger) {
            message = `Database query time is ${currentValue.toFixed(2)}ms (threshold: ${rule.threshold}ms)`;
            messageAz = `Veritabanı sorğu vaxtı ${currentValue.toFixed(2)}ms-dir (limit: ${rule.threshold}ms)`;
          }
          break;

        case 'database_connection_pool':
          if (dbPoolMetrics && !('error' in dbPoolMetrics) && 'maxConnections' in dbPoolMetrics && dbPoolMetrics.maxConnections > 0) {
            const poolUsagePercent = (dbPoolMetrics.activeConnections / dbPoolMetrics.maxConnections) * 100;
            currentValue = poolUsagePercent;
            shouldTrigger = checkThreshold(poolUsagePercent, rule.threshold, rule.comparison);
            if (shouldTrigger) {
              message = `Database connection pool usage is ${poolUsagePercent.toFixed(2)}% (threshold: ${rule.threshold}%)`;
              messageAz = `Veritabanı connection pool istifadəsi ${poolUsagePercent.toFixed(2)}%-dir (limit: ${rule.threshold}%)`;
            }
          }
          break;

        case 'cache_hit_rate':
          currentValue = cacheMetrics.hitRate || 0;
          shouldTrigger = checkThreshold(currentValue, rule.threshold, rule.comparison);
          if (shouldTrigger) {
            message = `Cache hit rate is ${currentValue.toFixed(2)}% (threshold: ${rule.threshold}%)`;
            messageAz = `Cache hit rate ${currentValue.toFixed(2)}%-dir (limit: ${rule.threshold}%)`;
          }
          break;

        case 'cache_response_time':
          currentValue = cacheMetrics.averageResponseTime || 0;
          shouldTrigger = checkThreshold(currentValue, rule.threshold, rule.comparison);
          if (shouldTrigger) {
            message = `Cache response time is ${currentValue.toFixed(2)}ms (threshold: ${rule.threshold}ms)`;
            messageAz = `Cache cavab vaxtı ${currentValue.toFixed(2)}ms-dir (limit: ${rule.threshold}ms)`;
          }
          break;

        default:
          continue;
      }

      if (shouldTrigger) {
        const alertId = `${rule.id}_${Date.now()}`;
        
        // Check if alert already exists / Alert artıq mövcuddursa yoxla
        const existingAlert = Array.from(activeAlerts.values())
          .find(a => a.type === rule.type && !a.resolved);
        
        if (!existingAlert) {
          const alert: Alert = {
            id: alertId,
            type: rule.type,
            severity: rule.severity,
            message,
            messageAz,
            timestamp: new Date(),
            resolved: false,
            metadata: {
              ruleId: rule.id,
              currentValue,
              threshold: rule.threshold,
              comparison: rule.comparison,
            },
          };

          activeAlerts.set(alertId, alert);
          triggeredAlerts.push(alert);

          // Log alert / Alert-i log et
          logger.warn(`Alert triggered: ${rule.name} / Xəbərdarlıq tetikləndi: ${rule.nameAz}`, {
            alertId,
            type: rule.type,
            severity: rule.severity,
            currentValue,
            threshold: rule.threshold,
          });

          // TODO: Send notification via configured channels / TODO: Konfiqurasiya edilmiş kanallar vasitəsilə bildiriş göndər
          // await sendAlertNotification(alert, rule);
        }
      } else {
        // Resolve existing alert if condition no longer met / Əgər şərt artıq yerinə yetirilmirsə mövcud alert-i həll et
        const existingAlert = Array.from(activeAlerts.values())
          .find(a => a.type === rule.type && !a.resolved);
        
        if (existingAlert) {
          existingAlert.resolved = true;
          existingAlert.resolvedAt = new Date();
          logger.info(`Alert resolved: ${rule.name} / Xəbərdarlıq həll edildi: ${rule.nameAz}`, {
            alertId: existingAlert.id,
            type: rule.type,
          });
        }
      }
    }
  } catch (error) {
    logger.error('Failed to check alerts / Alert-ləri yoxlamaq uğursuz oldu', error);
  }

  return triggeredAlerts;
}

/**
 * Check if value meets threshold condition / Dəyərin threshold şərtinə cavab verib-vermədiyini yoxla
 */
function checkThreshold(value: number, threshold: number, comparison: 'gt' | 'lt' | 'eq'): boolean {
  switch (comparison) {
    case 'gt':
      return value > threshold;
    case 'lt':
      return value < threshold;
    case 'eq':
      return value === threshold;
    default:
      return false;
  }
}

/**
 * Get active alerts / Aktiv alert-ləri al
 */
export function getActiveAlerts(): Alert[] {
  return Array.from(activeAlerts.values())
    .filter(alert => !alert.resolved)
    .sort((a, b) => {
      // Sort by severity (critical > warning > info) / Ağırlığa görə sırala (critical > warning > info)
      const severityOrder = { critical: 3, warning: 2, info: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
}

/**
 * Get all alerts (including resolved) / Bütün alert-ləri al (həll edilmişlər də daxil olmaqla)
 */
export function getAllAlerts(limit: number = 100): Alert[] {
  return Array.from(activeAlerts.values())
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
}

/**
 * Resolve alert / Alert-i həll et
 */
export function resolveAlert(alertId: string): boolean {
  const alert = activeAlerts.get(alertId);
  if (alert && !alert.resolved) {
    alert.resolved = true;
    alert.resolvedAt = new Date();
    logger.info(`Alert manually resolved / Alert əl ilə həll edildi`, { alertId });
    return true;
  }
  return false;
}

/**
 * Add or update alert rule / Alert qaydası əlavə et və ya yenilə
 */
export function upsertAlertRule(rule: AlertRule): void {
  alertRules.set(rule.id, rule);
  logger.info(`Alert rule updated / Alert qaydası yeniləndi`, { ruleId: rule.id });
}

/**
 * Remove alert rule / Alert qaydasını sil
 */
export function removeAlertRule(ruleId: string): boolean {
  const removed = alertRules.delete(ruleId);
  if (removed) {
    logger.info(`Alert rule removed / Alert qaydası silindi`, { ruleId });
  }
  return removed;
}

/**
 * Get all alert rules / Bütün alert qaydalarını al
 */
export function getAlertRules(): AlertRule[] {
  return Array.from(alertRules.values());
}

/**
 * Get alert rule by ID / ID-yə görə alert qaydasını al
 */
export function getAlertRule(ruleId: string): AlertRule | undefined {
  return alertRules.get(ruleId);
}

/**
 * Start alert checking interval / Alert yoxlama intervalını başlat
 */
let alertCheckInterval: NodeJS.Timeout | null = null;

export function startAlertChecking(): void {
  if (!ALERT_ENABLED) {
    logger.info('Alert system disabled / Alert sistemi söndürülüb');
    return;
  }

  if (alertCheckInterval) {
    logger.warn('Alert checking already started / Alert yoxlama artıq başladılıb');
    return;
  }

  // Run initial check / İlkin yoxlama apar
  checkAlerts();

  // Set up interval / Interval quraşdır
  alertCheckInterval = setInterval(() => {
    checkAlerts();
  }, ALERT_CHECK_INTERVAL);

  logger.info(`Alert checking started with interval ${ALERT_CHECK_INTERVAL}ms / Alert yoxlama ${ALERT_CHECK_INTERVAL}ms interval ilə başladıldı`);
}

/**
 * Stop alert checking interval / Alert yoxlama intervalını dayandır
 */
export function stopAlertChecking(): void {
  if (alertCheckInterval) {
    clearInterval(alertCheckInterval);
    alertCheckInterval = null;
    logger.info('Alert checking stopped / Alert yoxlama dayandırıldı');
  }
}

