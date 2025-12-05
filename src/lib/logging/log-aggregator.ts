/**
 * Log Aggregator / Log Aqreqatoru
 * Provides structured logging and log aggregation for ELK stack
 * ELK stack üçün strukturlaşdırılmış logging və log aggregation təmin edir
 */

import { logger } from '@/lib/utils/logger';

/**
 * Log levels / Log səviyyələri
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/**
 * Log context / Log konteksti
 */
export interface LogContext {
  userId?: string;
  requestId?: string;
  sessionId?: string;
  endpoint?: string;
  method?: string;
  ip?: string;
  userAgent?: string;
  [key: string]: any;
}

/**
 * Structured log entry / Strukturlaşdırılmış log qeydi
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  messageAz?: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  metadata?: Record<string, any>;
}

/**
 * Log aggregator configuration / Log aggregator konfiqurasiyası
 */
interface LogAggregatorConfig {
  enabled: boolean;
  serviceName: string;
  environment: string;
  logstashEnabled: boolean;
  logstashHost?: string;
  logstashPort?: number;
  batchSize: number;
  flushInterval: number; // milliseconds
}

/**
 * Get log aggregator configuration from environment / Environment-dən log aggregator konfiqurasiyasını al
 */
function getLogAggregatorConfig(): LogAggregatorConfig {
  return {
    enabled: process.env.LOGSTASH_ENABLED === 'true' || process.env.NODE_ENV === 'production',
    serviceName: process.env.LOGSTASH_SERVICE_NAME || process.env.APM_SERVICE_NAME || 'yusu-ecommerce',
    environment: process.env.NODE_ENV || 'development',
    logstashEnabled: process.env.LOGSTASH_ENABLED === 'true',
    logstashHost: process.env.LOGSTASH_HOST || 'localhost',
    logstashPort: parseInt(process.env.LOGSTASH_PORT || '5000', 10),
    batchSize: parseInt(process.env.LOGSTASH_BATCH_SIZE || '100', 10),
    flushInterval: parseInt(process.env.LOGSTASH_FLUSH_INTERVAL || '5000', 10), // 5 seconds default
  };
}

const config = getLogAggregatorConfig();

/**
 * Log entry buffer for batching / Batch üçün log entry buffer
 */
const logBuffer: LogEntry[] = [];
let flushTimer: NodeJS.Timeout | null = null;

/**
 * Create structured log entry / Strukturlaşdırılmış log qeydi yarat
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  messageAz?: string,
  context?: LogContext,
  error?: Error,
  metadata?: Record<string, any>
): LogEntry {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(messageAz && { messageAz }),
    ...(context && { context }),
    ...(error && {
      error: {
        name: error.name,
        message: error.message,
        ...(error.stack && { stack: error.stack }),
      },
    }),
    ...(metadata && { metadata }),
  };

  return entry;
}

/**
 * Add log entry to buffer / Log qeydini buffer-ə əlavə et
 */
function addToBuffer(entry: LogEntry): void {
  if (!config.enabled) {
    return;
  }

  logBuffer.push(entry);

  // Flush if buffer is full / Əgər buffer dolubsa flush et
  if (logBuffer.length >= config.batchSize) {
    flushLogs();
  } else if (!flushTimer) {
    // Set up flush timer / Flush timer quraşdır
    flushTimer = setTimeout(() => {
      flushLogs();
    }, config.flushInterval);
  }
}

/**
 * Flush logs to Logstash / Log-ları Logstash-ə göndər
 */
async function flushLogs(): Promise<void> {
  if (logBuffer.length === 0 || !config.logstashEnabled) {
    return;
  }

  const logsToFlush = logBuffer.splice(0, config.batchSize);
  
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }

  try {
    // Import Logstash client dynamically / Logstash client-i dinamik import et
    const { sendLogsToLogstash } = await import('./logstash-client');
    await sendLogsToLogstash(logsToFlush);
  } catch (error) {
    // Fallback to console logging if Logstash fails / Əgər Logstash uğursuz olarsa console logging-ə keç
    console.error('Failed to send logs to Logstash / Log-ları Logstash-ə göndərmək uğursuz oldu:', error);
    // Also log to standard logger / Standart logger-ə də log et
    logger.error('Failed to send logs to Logstash / Log-ları Logstash-ə göndərmək uğursuz oldu', error);
  }
}

/**
 * Log debug message / Debug mesajı log et
 */
export function logDebug(message: string, messageAz?: string, context?: LogContext, metadata?: Record<string, any>): void {
  const entry = createLogEntry('debug', message, messageAz, context, undefined, metadata);
  
  // Always log to standard logger / Həmişə standart logger-ə log et
  logger.debug(message, context);
  
  // Add to buffer for aggregation / Aggregation üçün buffer-ə əlavə et
  addToBuffer(entry);
}

/**
 * Log info message / Info mesajı log et
 */
export function logInfo(message: string, messageAz?: string, context?: LogContext, metadata?: Record<string, any>): void {
  const entry = createLogEntry('info', message, messageAz, context, undefined, metadata);
  
  // Always log to standard logger / Həmişə standart logger-ə log et
  logger.info(message, context);
  
  // Add to buffer for aggregation / Aggregation üçün buffer-ə əlavə et
  addToBuffer(entry);
}

/**
 * Log warning message / Warning mesajı log et
 */
export function logWarn(message: string, messageAz?: string, context?: LogContext, error?: Error, metadata?: Record<string, any>): void {
  const entry = createLogEntry('warn', message, messageAz, context, error, metadata);
  
  // Always log to standard logger / Həmişə standart logger-ə log et
  logger.warn(message, error);
  
  // Add to buffer for aggregation / Aggregation üçün buffer-ə əlavə et
  addToBuffer(entry);
}

/**
 * Log error message / Error mesajı log et
 */
export function logError(message: string, messageAz: string, error: Error, context?: LogContext, metadata?: Record<string, any>): void {
  const entry = createLogEntry('error', message, messageAz, context, error, metadata);
  
  // Always log to standard logger / Həmişə standart logger-ə log et
  logger.error(message, error, context);
  
  // Add to buffer for aggregation / Aggregation üçün buffer-ə əlavə et
  addToBuffer(entry);
}

/**
 * Log fatal error / Fatal xəta log et
 */
export function logFatal(message: string, messageAz: string, error: Error, context?: LogContext, metadata?: Record<string, any>): void {
  const entry = createLogEntry('fatal', message, messageAz, context, error, metadata);
  
  // Always log to standard logger / Həmişə standart logger-ə log et
  logger.error(message, error, context);
  
  // Add to buffer for aggregation / Aggregation üçün buffer-ə əlavə et
  addToBuffer(entry);
  
  // Flush immediately for fatal errors / Fatal xətalar üçün dərhal flush et
  flushLogs();
}

/**
 * Flush all pending logs / Bütün gözləyən log-ları flush et
 */
export async function flushAllLogs(): Promise<void> {
  await flushLogs();
}

/**
 * Initialize log aggregator / Log aggregator-i işə sal
 */
export function initializeLogAggregator(): void {
  if (!config.enabled) {
    logger.info('Log aggregation disabled / Log aggregation söndürülüb');
    return;
  }

  logger.info('Log aggregator initialized / Log aggregator işə salındı', {
    serviceName: config.serviceName,
    environment: config.environment,
    logstashEnabled: config.logstashEnabled,
  });

  // Flush logs on process exit / Process çıxanda log-ları flush et
  process.on('beforeExit', async () => {
    await flushAllLogs();
  });

  process.on('SIGINT', async () => {
    await flushAllLogs();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await flushAllLogs();
    process.exit(0);
  });
}

/**
 * Get log aggregator status / Log aggregator statusunu al
 */
export function getLogAggregatorStatus(): {
  enabled: boolean;
  logstashEnabled: boolean;
  bufferSize: number;
  config: LogAggregatorConfig;
} {
  return {
    enabled: config.enabled,
    logstashEnabled: config.logstashEnabled,
    bufferSize: logBuffer.length,
    config,
  };
}

