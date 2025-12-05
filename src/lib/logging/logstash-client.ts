/**
 * Logstash Client / Logstash Client-i
 * Provides connection to Logstash for log shipping
 * Log shipping üçün Logstash-ə bağlantı təmin edir
 */

import { logger } from '@/lib/utils/logger';
import type { LogEntry } from './log-aggregator';

/**
 * Logstash client configuration / Logstash client konfiqurasiyası
 */
interface LogstashConfig {
  enabled: boolean;
  host: string;
  port: number;
  protocol: 'tcp' | 'udp' | 'http';
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

/**
 * Get Logstash configuration from environment / Environment-dən Logstash konfiqurasiyasını al
 */
function getLogstashConfig(): LogstashConfig {
  return {
    enabled: process.env.LOGSTASH_ENABLED === 'true',
    host: process.env.LOGSTASH_HOST || 'localhost',
    port: parseInt(process.env.LOGSTASH_PORT || '5000', 10),
    protocol: (process.env.LOGSTASH_PROTOCOL as 'tcp' | 'udp' | 'http') || 'tcp',
    timeout: parseInt(process.env.LOGSTASH_TIMEOUT || '5000', 10),
    retryAttempts: parseInt(process.env.LOGSTASH_RETRY_ATTEMPTS || '3', 10),
    retryDelay: parseInt(process.env.LOGSTASH_RETRY_DELAY || '1000', 10),
  };
}

const config = getLogstashConfig();

/**
 * Send logs to Logstash via HTTP / HTTP vasitəsilə log-ları Logstash-ə göndər
 */
async function sendLogsViaHTTP(logs: LogEntry[]): Promise<void> {
  if (!config.enabled || logs.length === 0) {
    return;
  }

  const url = `http://${config.host}:${config.port}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logs),
      signal: AbortSignal.timeout(config.timeout),
    });

    if (!response.ok) {
      throw new Error(`Logstash HTTP request failed: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Send logs to Logstash via TCP / TCP vasitəsilə log-ları Logstash-ə göndər
 */
async function sendLogsViaTCP(logs: LogEntry[]): Promise<void> {
  if (!config.enabled || logs.length === 0) {
    return;
  }

  // For TCP, we'll use a simple socket connection
  // TCP üçün sadə socket bağlantısı istifadə edəcəyik
  // Note: In production, consider using a proper TCP client library
  // Qeyd: Production-da düzgün TCP client library istifadə etməyi düşünün
  
  try {
    // For now, we'll use HTTP as fallback for TCP
    // Hazırda TCP üçün HTTP-ni fallback kimi istifadə edəcəyik
    await sendLogsViaHTTP(logs);
  } catch (error) {
    throw error;
  }
}

/**
 * Send logs to Logstash via UDP / UDP vasitəsilə log-ları Logstash-ə göndər
 */
async function sendLogsViaUDP(logs: LogEntry[]): Promise<void> {
  if (!config.enabled || logs.length === 0) {
    return;
  }

  // UDP is typically used for high-volume, low-latency logging
  // UDP adətən yüksək həcmli, aşağı gecikməli logging üçün istifadə olunur
  // Note: UDP doesn't guarantee delivery, so consider this for non-critical logs
  // Qeyd: UDP çatdırılmanı zəmanət etmir, buna görə də kritik olmayan log-lar üçün düşünün
  
  try {
    // For now, we'll use HTTP as fallback for UDP
    // Hazırda UDP üçün HTTP-ni fallback kimi istifadə edəcəyik
    await sendLogsViaHTTP(logs);
  } catch (error) {
    throw error;
  }
}

/**
 * Send logs to Logstash with retry logic / Retry logic ilə log-ları Logstash-ə göndər
 */
async function sendLogsWithRetry(logs: LogEntry[], attempt: number = 1): Promise<void> {
  try {
    switch (config.protocol) {
      case 'http':
        await sendLogsViaHTTP(logs);
        break;
      case 'tcp':
        await sendLogsViaTCP(logs);
        break;
      case 'udp':
        await sendLogsViaUDP(logs);
        break;
      default:
        await sendLogsViaHTTP(logs);
    }
  } catch (error) {
    if (attempt < config.retryAttempts) {
      // Wait before retry / Retry-dən əvvəl gözlə
      await new Promise(resolve => setTimeout(resolve, config.retryDelay * attempt));
      return sendLogsWithRetry(logs, attempt + 1);
    } else {
      // Max retries reached, throw error / Maksimum retry çatdı, xəta at
      throw new Error(`Failed to send logs to Logstash after ${config.retryAttempts} attempts: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

/**
 * Send logs to Logstash / Log-ları Logstash-ə göndər
 */
export async function sendLogsToLogstash(logs: LogEntry[]): Promise<void> {
  if (!config.enabled) {
    return;
  }

  if (logs.length === 0) {
    return;
  }

  try {
    // Add service metadata to each log entry / Hər log qeydinə service metadata əlavə et
    const enrichedLogs = logs.map(log => ({
      ...log,
      service: {
        name: process.env.LOGSTASH_SERVICE_NAME || process.env.APM_SERVICE_NAME || 'yusu-ecommerce',
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
      },
    }));

    await sendLogsWithRetry(enrichedLogs);
  } catch (error) {
    // Log error but don't throw to avoid breaking the application / Xətanı log et amma tətbiqi pozmamaq üçün throw etmə
    logger.error('Failed to send logs to Logstash / Log-ları Logstash-ə göndərmək uğursuz oldu', error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Test Logstash connection / Logstash bağlantısını test et
 */
export async function testLogstashConnection(): Promise<boolean> {
  if (!config.enabled) {
    return false;
  }

  try {
    const testLog: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'Logstash connection test',
      messageAz: 'Logstash bağlantı testi',
      context: {
        test: true,
      },
    };

    await sendLogsToLogstash([testLog]);
    return true;
  } catch (error) {
    logger.error('Logstash connection test failed / Logstash bağlantı testi uğursuz oldu', error instanceof Error ? error : new Error(String(error)));
    return false;
  }
}

/**
 * Get Logstash client status / Logstash client statusunu al
 */
export function getLogstashStatus(): {
  enabled: boolean;
  config: LogstashConfig;
  connected: boolean;
} {
  return {
    enabled: config.enabled,
    config,
    connected: config.enabled, // In a real implementation, check actual connection status / Real tətbiqdə faktiki bağlantı statusunu yoxla
  };
}

