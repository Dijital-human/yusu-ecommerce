/**
 * Retry Logic with Exponential Backoff / Exponential Backoff ilə Retry Məntiqi
 * Provides retry functionality with configurable backoff strategies
 * Konfiqurasiya edilə bilən backoff strategiyaları ilə retry funksionallığı təmin edir
 */

import { logger } from '@/lib/utils/logger';

export interface RetryConfig {
  maxAttempts: number;           // Maximum retry attempts / Maksimum retry cəhdləri
  initialDelay: number;         // Initial delay in milliseconds / İlkin gecikmə (ms)
  maxDelay: number;             // Maximum delay in milliseconds / Maksimum gecikmə (ms)
  multiplier: number;            // Exponential multiplier / Exponential multiplikator
  retryableErrors?: string[];   // List of retryable error messages / Retry edilə bilən xəta mesajları
  onRetry?: (attempt: number, error: Error) => void; // Callback on retry / Retry zamanı callback
}

const DEFAULT_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelay: 1000,      // 1 second / 1 saniyə
  maxDelay: 10000,         // 10 seconds / 10 saniyə
  multiplier: 2,
  retryableErrors: [
    'ECONNRESET',
    'ETIMEDOUT',
    'ENOTFOUND',
    'ECONNREFUSED',
    'EAI_AGAIN',
    'timeout',
    'network',
  ],
};

/**
 * Calculate delay with exponential backoff / Exponential backoff ilə gecikməni hesabla
 */
function calculateDelay(attempt: number, config: RetryConfig): number {
  const delay = config.initialDelay * Math.pow(config.multiplier, attempt - 1);
  return Math.min(delay, config.maxDelay);
}

/**
 * Check if error is retryable / Xətanın retry edilə bilən olub-olmadığını yoxla
 */
function isRetryableError(error: Error, config: RetryConfig): boolean {
  if (!config.retryableErrors || config.retryableErrors.length === 0) {
    return true; // Retry all errors if no filter specified / Əgər filter təyin edilməyibsə, bütün xətaları retry et
  }

  const errorMessage = error.message.toLowerCase();
  const errorName = error.name.toLowerCase();
  
  return config.retryableErrors.some(
    (retryableError) =>
      errorMessage.includes(retryableError.toLowerCase()) ||
      errorName.includes(retryableError.toLowerCase())
  );
}

/**
 * Retry function with exponential backoff / Exponential backoff ilə retry funksiyası
 */
export async function retry<T>(
  fn: () => Promise<T>,
  config?: Partial<RetryConfig>
): Promise<T> {
  const finalConfig: RetryConfig = { ...DEFAULT_CONFIG, ...config };
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    try {
      const result = await fn();
      
      if (attempt > 1) {
        logger.info(`Retry succeeded on attempt ${attempt} / Retry ${attempt} cəhdində uğurlu oldu`);
      }
      
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Check if error is retryable / Xətanın retry edilə bilən olub-olmadığını yoxla
      if (!isRetryableError(lastError, finalConfig)) {
        logger.warn(`Error is not retryable: ${lastError.message} / Xəta retry edilə bilməz: ${lastError.message}`);
        throw lastError;
      }

      // If this is the last attempt, throw error / Əgər bu son cəhddirsə, xəta at
      if (attempt >= finalConfig.maxAttempts) {
        logger.error(
          `Retry exhausted after ${attempt} attempts / ${attempt} cəhddən sonra retry tükəndi`,
          lastError
        );
        throw lastError;
      }

      // Calculate delay / Gecikməni hesabla
      const delay = calculateDelay(attempt, finalConfig);
      
      logger.warn(
        `Retry attempt ${attempt}/${finalConfig.maxAttempts} after ${delay}ms / ${delay}ms sonra ${attempt}/${finalConfig.maxAttempts} retry cəhdi`,
        { error: lastError.message, attempt, delay }
      );

      // Call onRetry callback if provided / Əgər təmin olunubsa onRetry callback-i çağır
      if (finalConfig.onRetry) {
        finalConfig.onRetry(attempt, lastError);
      }

      // Wait before retrying / Retry-dən əvvəl gözlə
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // This should never be reached, but TypeScript needs it / Bu heç vaxt çatılmamalıdır, amma TypeScript tələb edir
  throw lastError || new Error('Retry failed / Retry uğursuz oldu');
}

/**
 * Retry with custom condition / Xüsusi şərt ilə retry
 */
export async function retryWithCondition<T>(
  fn: () => Promise<T>,
  condition: (error: Error, attempt: number) => boolean,
  config?: Partial<RetryConfig>
): Promise<T> {
  const finalConfig: RetryConfig = { ...DEFAULT_CONFIG, ...config };
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    try {
      const result = await fn();
      
      if (attempt > 1) {
        logger.info(`Retry succeeded on attempt ${attempt} / Retry ${attempt} cəhdində uğurlu oldu`);
      }
      
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Check custom condition / Xüsusi şərti yoxla
      if (!condition(lastError, attempt)) {
        logger.warn(`Retry condition not met: ${lastError.message} / Retry şərti yerinə yetirilmədi: ${lastError.message}`);
        throw lastError;
      }

      // If this is the last attempt, throw error / Əgər bu son cəhddirsə, xəta at
      if (attempt >= finalConfig.maxAttempts) {
        logger.error(
          `Retry exhausted after ${attempt} attempts / ${attempt} cəhddən sonra retry tükəndi`,
          lastError
        );
        throw lastError;
      }

      // Calculate delay / Gecikməni hesabla
      const delay = calculateDelay(attempt, finalConfig);
      
      logger.warn(
        `Retry attempt ${attempt}/${finalConfig.maxAttempts} after ${delay}ms / ${delay}ms sonra ${attempt}/${finalConfig.maxAttempts} retry cəhdi`,
        { error: lastError.message, attempt, delay }
      );

      // Call onRetry callback if provided / Əgər təmin olunubsa onRetry callback-i çağır
      if (finalConfig.onRetry) {
        finalConfig.onRetry(attempt, lastError);
      }

      // Wait before retrying / Retry-dən əvvəl gözlə
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Retry failed / Retry uğursuz oldu');
}

/**
 * Retry decorator for functions / Funksiyalar üçün retry dekoratoru
 */
export function withRetry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  config?: Partial<RetryConfig>
): T {
  return (async (...args: Parameters<T>) => {
    return retry(() => fn(...args), config);
  }) as T;
}

