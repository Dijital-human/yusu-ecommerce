/**
 * Alert Helpers / Alert Yardımçıları
 * Helper functions for triggering alerts in critical code paths
 * Kritik kod yollarında alert-ləri tetikləmək üçün yardımçı funksiyalar
 */

import { logger } from '@/lib/utils/logger';
import { checkAlerts, type AlertType, type AlertSeverity } from './alerts';
import { sendSlackAlert } from '@/lib/notifications/slack';
import { sendSms } from '@/lib/sms';
import { sendEmail } from '@/lib/email';

/**
 * Trigger custom alert / Fərdi alert tetiklə
 * This function can be called from anywhere in the codebase to trigger alerts
 * Bu funksiya kod bazasının hər yerindən alert-ləri tetikləmək üçün çağırıla bilər
 */
export async function triggerAlert(
  type: AlertType,
  severity: AlertSeverity,
  message: string,
  messageAz: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    // Log the alert / Alert-i log et
    const logLevel = severity === 'critical' ? 'error' : severity === 'warning' ? 'warn' : 'info';
    logger[logLevel](`Alert triggered: ${message} / Xəbərdarlıq tetikləndi: ${messageAz}`, {
      type,
      severity,
      metadata,
    });

    // Trigger alert check which will evaluate all alert rules / Alert yoxlamasını tetiklə ki, bütün alert qaydaları qiymətləndirilsin
    await checkAlerts();

    // Send notification via configured channels / Konfiqurasiya edilmiş kanallar vasitəsilə bildiriş göndər
    const notificationPromises: Promise<boolean>[] = [];

    // Slack notification / Slack bildirişi
    if (process.env.SLACK_WEBHOOK_URL) {
      notificationPromises.push(
        sendSlackAlert(
          `Alert: ${type}`,
          `${message}\n\n${messageAz}`,
          severity === 'critical' ? 'critical' : severity === 'warning' ? 'warning' : 'info',
          metadata ? Object.entries(metadata).map(([key, value]) => ({
            title: key,
            value: String(value),
            short: true,
          })) : undefined
        )
      );
    }

    // Email notification for critical alerts / Kritik alert-lər üçün email bildirişi
    if (severity === 'critical' && process.env.ALERT_EMAIL_RECIPIENTS) {
      const recipients = process.env.ALERT_EMAIL_RECIPIENTS.split(',');
      for (const recipient of recipients) {
        notificationPromises.push(
          sendEmail(
            recipient.trim(),
            `🚨 Critical Alert: ${type}`,
            `
              <h2>Critical Alert / Kritik Xəbərdarlıq</h2>
              <p><strong>Type / Tip:</strong> ${type}</p>
              <p><strong>Severity / Ağırlıq:</strong> ${severity}</p>
              <p><strong>Message / Mesaj:</strong> ${message}</p>
              <p><strong>Message (AZ) / Mesaj (AZ):</strong> ${messageAz}</p>
              ${metadata ? `<pre>${JSON.stringify(metadata, null, 2)}</pre>` : ''}
            `,
            `Critical Alert: ${message}`
          ).then(() => true).catch(() => false)
        );
      }
    }

    // SMS notification for critical alerts / Kritik alert-lər üçün SMS bildirişi
    if (severity === 'critical' && process.env.ALERT_PHONE_NUMBERS) {
      const phoneNumbers = process.env.ALERT_PHONE_NUMBERS.split(',');
      for (const phone of phoneNumbers) {
        notificationPromises.push(
          sendSms(
            phone.trim(),
            `🚨 Critical Alert: ${message}`
          )
        );
      }
    }

    // Send all notifications in parallel / Bütün bildirişləri paralel göndər
    await Promise.allSettled(notificationPromises);
  } catch (error) {
    logger.error('Failed to trigger alert / Alert tetikləmək uğursuz oldu', error, {
      type,
      severity,
      message,
    });
  }
}

/**
 * Trigger alert for API error / API xətası üçün alert tetiklə
 */
export async function triggerAPIErrorAlert(
  endpoint: string,
  statusCode: number,
  error: Error | string,
  metadata?: Record<string, any>
): Promise<void> {
  const errorMessage = error instanceof Error ? error.message : error;
  const severity: AlertSeverity = statusCode >= 500 ? 'critical' : statusCode >= 400 ? 'warning' : 'info';

  await triggerAlert(
    'api_error_rate',
    severity,
    `API error on ${endpoint}: ${errorMessage} (Status: ${statusCode})`,
    `${endpoint} endpoint-də API xətası: ${errorMessage} (Status: ${statusCode})`,
    {
      endpoint,
      statusCode,
      error: errorMessage,
      ...metadata,
    }
  );
}

/**
 * Trigger alert for high API response time / Yüksək API cavab vaxtı üçün alert tetiklə
 */
export async function triggerAPIResponseTimeAlert(
  endpoint: string,
  responseTime: number,
  threshold: number = 1000
): Promise<void> {
  if (responseTime > threshold) {
    await triggerAlert(
      'api_response_time',
      responseTime > threshold * 2 ? 'critical' : 'warning',
      `High API response time on ${endpoint}: ${responseTime}ms (threshold: ${threshold}ms)`,
      `${endpoint} endpoint-də yüksək API cavab vaxtı: ${responseTime}ms (limit: ${threshold}ms)`,
      {
        endpoint,
        responseTime,
        threshold,
      }
    );
  }
}

/**
 * Trigger alert for database error / Veritabanı xətası üçün alert tetiklə
 */
export async function triggerDatabaseErrorAlert(
  operation: string,
  error: Error | string,
  metadata?: Record<string, any>
): Promise<void> {
  const errorMessage = error instanceof Error ? error.message : error;
  
  await triggerAlert(
    'database_query_time',
    'critical',
    `Database error during ${operation}: ${errorMessage}`,
    `${operation} əməliyyatı zamanı veritabanı xətası: ${errorMessage}`,
    {
      operation,
      error: errorMessage,
      ...metadata,
    }
  );
}

/**
 * Trigger alert for high database query time / Yüksək veritabanı sorğu vaxtı üçün alert tetiklə
 */
export async function triggerDatabaseQueryTimeAlert(
  query: string,
  queryTime: number,
  threshold: number = 500
): Promise<void> {
  if (queryTime > threshold) {
    await triggerAlert(
      'database_query_time',
      queryTime > threshold * 2 ? 'critical' : 'warning',
      `Slow database query: ${query.substring(0, 100)}... (${queryTime}ms, threshold: ${threshold}ms)`,
      `Yavaş veritabanı sorğusu: ${query.substring(0, 100)}... (${queryTime}ms, limit: ${threshold}ms)`,
      {
        query: query.substring(0, 200), // Limit query length / Sorğu uzunluğunu məhdudlaşdır
        queryTime,
        threshold,
      }
    );
  }
}

/**
 * Trigger alert for cache issues / Cache problemləri üçün alert tetiklə
 */
export async function triggerCacheAlert(
  operation: string,
  error: Error | string,
  metadata?: Record<string, any>
): Promise<void> {
  const errorMessage = error instanceof Error ? error.message : error;
  
  await triggerAlert(
    'cache_hit_rate',
    'warning',
    `Cache issue during ${operation}: ${errorMessage}`,
    `${operation} əməliyyatı zamanı cache problemi: ${errorMessage}`,
    {
      operation,
      error: errorMessage,
      ...metadata,
    }
  );
}

/**
 * Trigger alert for payment processing error / Ödəniş emalı xətası üçün alert tetiklə
 */
export async function triggerPaymentErrorAlert(
  orderId: string,
  paymentProvider: string,
  error: Error | string,
  metadata?: Record<string, any>
): Promise<void> {
  const errorMessage = error instanceof Error ? error.message : error;
  
  await triggerAlert(
    'custom',
    'critical',
    `Payment processing error for order ${orderId} (${paymentProvider}): ${errorMessage}`,
    `Sifariş ${orderId} üçün ödəniş emalı xətası (${paymentProvider}): ${errorMessage}`,
    {
      orderId,
      paymentProvider,
      error: errorMessage,
      ...metadata,
    }
  );
}

/**
 * Trigger alert for order processing error / Sifariş emalı xətası üçün alert tetiklə
 */
export async function triggerOrderErrorAlert(
  orderId: string,
  operation: string,
  error: Error | string,
  metadata?: Record<string, any>
): Promise<void> {
  const errorMessage = error instanceof Error ? error.message : error;
  
  await triggerAlert(
    'custom',
    'critical',
    `Order processing error for order ${orderId} during ${operation}: ${errorMessage}`,
    `Sifariş ${orderId} üçün sifariş emalı xətası (${operation} əməliyyatı zamanı): ${errorMessage}`,
    {
      orderId,
      operation,
      error: errorMessage,
      ...metadata,
    }
  );
}

/**
 * Trigger alert for inventory issues / İnventar problemləri üçün alert tetiklə
 */
export async function triggerInventoryAlert(
  productId: string,
  issue: string,
  severity: AlertSeverity = 'warning',
  metadata?: Record<string, any>
): Promise<void> {
  await triggerAlert(
    'custom',
    severity,
    `Inventory issue for product ${productId}: ${issue}`,
    `Məhsul ${productId} üçün inventar problemi: ${issue}`,
    {
      productId,
      issue,
      ...metadata,
    }
  );
}

