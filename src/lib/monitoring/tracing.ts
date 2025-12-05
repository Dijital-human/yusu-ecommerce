/**
 * Distributed Tracing Utility / Distributed Tracing Utility-si
 * Provides OpenTelemetry-based distributed tracing for request tracking
 * Request tracking üçün OpenTelemetry əsaslı distributed tracing təmin edir
 */

import { trace, context, SpanStatusCode, SpanKind } from '@opentelemetry/api';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { logger } from '@/lib/utils/logger';

/**
 * Tracing configuration / Tracing konfiqurasiyası
 */
const TRACING_ENABLED = process.env.OTEL_ENABLED === 'true' || process.env.NODE_ENV === 'production';
const OTEL_SERVICE_NAME = process.env.OTEL_SERVICE_NAME || 'yusu-ecommerce';
const OTEL_EXPORTER_ENDPOINT = process.env.OTEL_EXPORTER_ENDPOINT || 'http://localhost:4318/v1/traces';

let sdk: NodeSDK | null = null;

/**
 * Initialize OpenTelemetry SDK / OpenTelemetry SDK-nı işə sal
 */
export async function initializeTracing(): Promise<void> {
  if (!TRACING_ENABLED) {
    logger.info('Tracing disabled / Tracing söndürülüb');
    return;
  }

  try {
    // Set environment variables for NodeSDK configuration / NodeSDK konfiqurasiyası üçün environment variables təyin et
    process.env.OTEL_SERVICE_NAME = OTEL_SERVICE_NAME;
    if (process.env.npm_package_version) {
      process.env.OTEL_SERVICE_VERSION = process.env.npm_package_version;
    }
    process.env.OTEL_DEPLOYMENT_ENVIRONMENT = process.env.NODE_ENV || 'development';
    process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT = OTEL_EXPORTER_ENDPOINT;
    
    // Initialize NodeSDK - it will read configuration from environment variables
    // NodeSDK-nı işə sal - konfiqurasiyanı environment variables-dan oxuyacaq
    sdk = new NodeSDK();

    sdk.start();
    logger.info(`Tracing initialized / Tracing işə salındı: ${OTEL_SERVICE_NAME} -> ${OTEL_EXPORTER_ENDPOINT}`);
  } catch (error) {
    logger.error('Failed to initialize tracing / Tracing işə salmaq uğursuz oldu', error);
  }
}

/**
 * Shutdown tracing SDK / Tracing SDK-nı söndür
 */
export async function shutdownTracing(): Promise<void> {
  if (sdk) {
    try {
      await sdk.shutdown();
      logger.info('Tracing shutdown / Tracing söndürüldü');
    } catch (error) {
      logger.error('Failed to shutdown tracing / Tracing söndürmək uğursuz oldu', error);
    }
  }
}

/**
 * Get tracer instance / Tracer instance al
 */
export function getTracer(name: string = OTEL_SERVICE_NAME) {
  return trace.getTracer(name);
}

/**
 * Create a span for a function / Funksiya üçün span yarat
 */
export async function traceFunction<T>(
  spanName: string,
  fn: (span: any) => Promise<T>,
  attributes?: Record<string, string | number | boolean>
): Promise<T> {
  if (!TRACING_ENABLED) {
    const mockSpan = {
      setAttribute: () => {},
      setStatus: () => {},
      end: () => {},
      recordException: () => {},
    };
    return fn(mockSpan);
  }

  const tracer = getTracer();
  const span = tracer.startSpan(spanName, {
    kind: SpanKind.INTERNAL,
    attributes,
  });

  try {
    const result = await fn(span);
    span.setStatus({ code: SpanStatusCode.OK });
    return result;
  } catch (error) {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error instanceof Error ? error.message : String(error),
    });
    span.recordException(error instanceof Error ? error : new Error(String(error)));
    throw error;
  } finally {
    span.end();
  }
}

/**
 * Create a span for database query / Database sorğusu üçün span yarat
 */
export async function traceDatabaseQuery<T>(
  operation: string,
  table: string,
  query: () => Promise<T>,
  attributes?: Record<string, string | number | boolean>
): Promise<T> {
  return traceFunction(
    `db.${operation}`,
    async (span) => {
      span.setAttribute('db.operation', operation);
      span.setAttribute('db.table', table);
      span.setAttribute('db.system', 'postgresql');
      
      if (attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
          span.setAttribute(key, value);
        });
      }

      const startTime = Date.now();
      try {
        const result = await query();
        const duration = Date.now() - startTime;
        span.setAttribute('db.duration', duration);
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        span.setAttribute('db.duration', duration);
        span.setAttribute('db.error', true);
        throw error;
      }
    }
  );
}

/**
 * Create a span for cache operation / Cache əməliyyatı üçün span yarat
 */
export async function traceCacheOperation<T>(
  operation: string,
  key: string,
  cacheFn: () => Promise<T>,
  attributes?: Record<string, string | number | boolean>
): Promise<T> {
  return traceFunction(
    `cache.${operation}`,
    async (span) => {
      span.setAttribute('cache.operation', operation);
      span.setAttribute('cache.key', key);
      
      if (attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
          span.setAttribute(key, value);
        });
      }

      const startTime = Date.now();
      try {
        const result = await cacheFn();
        const duration = Date.now() - startTime;
        span.setAttribute('cache.duration', duration);
        span.setAttribute('cache.hit', operation === 'get' && result !== null);
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        span.setAttribute('cache.duration', duration);
        span.setAttribute('cache.error', true);
        throw error;
      }
    }
  );
}

/**
 * Create a span for service call / Service çağırışı üçün span yarat
 */
export async function traceServiceCall<T>(
  serviceName: string,
  method: string,
  serviceFn: () => Promise<T>,
  attributes?: Record<string, string | number | boolean>
): Promise<T> {
  return traceFunction(
    `${serviceName}.${method}`,
    async (span) => {
      span.setAttribute('service.name', serviceName);
      span.setAttribute('service.method', method);
      
      if (attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
          span.setAttribute(key, value);
        });
      }

      return serviceFn();
    }
  );
}

/**
 * Get current span / Hazırkı span al
 */
export function getCurrentSpan() {
  if (!TRACING_ENABLED) {
    return null;
  }
  
  return trace.getActiveSpan();
}

/**
 * Add attributes to current span / Hazırkı span-ə atributlar əlavə et
 */
export function addSpanAttributes(attributes: Record<string, string | number | boolean>): void {
  if (!TRACING_ENABLED) {
    return;
  }

  const span = getCurrentSpan();
  if (span) {
    Object.entries(attributes).forEach(([key, value]) => {
      span.setAttribute(key, value);
    });
  }
}

/**
 * Record exception in current span / Hazırkı span-də exception qeyd et
 */
export function recordSpanException(error: Error): void {
  if (!TRACING_ENABLED) {
    return;
  }

  const span = getCurrentSpan();
  if (span) {
    span.recordException(error);
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error.message,
    });
  }
}

