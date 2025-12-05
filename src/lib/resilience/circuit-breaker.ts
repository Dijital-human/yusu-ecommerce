/**
 * Circuit Breaker Pattern Implementation / Circuit Breaker Pattern Implementasiyası
 * Prevents cascading failures by stopping requests to failing services
 * Uğursuz xidmətlərə sorğuları dayandıraraq kaskad uğursuzluqları qarşısını alır
 */

import { logger } from '@/lib/utils/logger';

export enum CircuitState {
  CLOSED = 'CLOSED',     // Normal operation / Normal işləmə
  OPEN = 'OPEN',         // Circuit is open, requests are blocked / Circuit açıqdır, sorğular bloklanır
  HALF_OPEN = 'HALF_OPEN' // Testing if service recovered / Xidmətin bərpa olub-olmadığını test edir
}

export interface CircuitBreakerConfig {
  failureThreshold: number;      // Number of failures before opening / Açılmadan əvvəl uğursuzluq sayı
  successThreshold: number;      // Number of successes to close from half-open / Half-open-dan bağlamaq üçün uğur sayı
  timeout: number;               // Timeout in milliseconds before attempting half-open / Half-open cəhdindən əvvəl timeout (ms)
  resetTimeout: number;           // Time to wait before attempting reset / Reset cəhdindən əvvəl gözləmə vaxtı (ms)
}

export interface CircuitBreakerStats {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailureTime: number | null;
  lastSuccessTime: number | null;
  totalRequests: number;
  totalFailures: number;
  totalSuccesses: number;
}

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 60000,      // 1 minute / 1 dəqiqə
  resetTimeout: 30000,  // 30 seconds / 30 saniyə
};

/**
 * Circuit Breaker Class / Circuit Breaker Class
 */
export class CircuitBreaker {
  private config: CircuitBreakerConfig;
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number = 0;
  private successes: number = 0;
  private lastFailureTime: number | null = null;
  private lastSuccessTime: number | null = null;
  private totalRequests: number = 0;
  private totalFailures: number = 0;
  private totalSuccesses: number = 0;
  private resetTimer: NodeJS.Timeout | null = null;

  constructor(
    private name: string,
    config?: Partial<CircuitBreakerConfig>
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Execute function with circuit breaker protection / Circuit breaker qorunması ilə funksiyanı yerinə yetir
   */
  async execute<T>(
    fn: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<T> {
    this.totalRequests++;

    // Check if circuit is open / Circuit-in açıq olub-olmadığını yoxla
    if (this.state === CircuitState.OPEN) {
      const timeSinceLastFailure = this.lastFailureTime
        ? Date.now() - this.lastFailureTime
        : Infinity;

      // Try to transition to half-open / Half-open-a keçməyə cəhd et
      if (timeSinceLastFailure >= this.config.timeout) {
        this.state = CircuitState.HALF_OPEN;
        this.successes = 0;
        logger.info(`Circuit breaker ${this.name} transitioning to HALF_OPEN / Circuit breaker ${this.name} HALF_OPEN-a keçir`);
      } else {
        // Circuit is still open, use fallback or throw error / Circuit hələ də açıqdır, fallback istifadə et və ya xəta at
        logger.warn(`Circuit breaker ${this.name} is OPEN, request blocked / Circuit breaker ${this.name} açıqdır, sorğu bloklanır`);
        
        if (fallback) {
          return await fallback();
        }
        
        throw new Error(`Circuit breaker ${this.name} is OPEN / Circuit breaker ${this.name} açıqdır`);
      }
    }

    try {
      // Execute the function / Funksiyanı yerinə yetir
      const result = await fn();
      
      // Success / Uğur
      this.onSuccess();
      return result;
    } catch (error) {
      // Failure / Uğursuzluq
      this.onFailure();
      
      // Use fallback if available / Mövcuddursa fallback istifadə et
      if (fallback) {
        logger.warn(`Circuit breaker ${this.name} failure, using fallback / Circuit breaker ${this.name} uğursuzluq, fallback istifadə olunur`, error instanceof Error ? error : new Error(String(error)));
        return await fallback();
      }
      
      throw error;
    }
  }

  /**
   * Handle success / Uğuru idarə et
   */
  private onSuccess(): void {
    this.totalSuccesses++;
    this.lastSuccessTime = Date.now();
    this.failures = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successes++;
      
      // If enough successes, close the circuit / Əgər kifayət qədər uğur varsa, circuit-i bağla
      if (this.successes >= this.config.successThreshold) {
        this.state = CircuitState.CLOSED;
        this.successes = 0;
        logger.info(`Circuit breaker ${this.name} closed after recovery / Circuit breaker ${this.name} bərpadan sonra bağlandı`);
      }
    }
  }

  /**
   * Handle failure / Uğursuzluğu idarə et
   */
  private onFailure(): void {
    this.totalFailures++;
    this.lastFailureTime = Date.now();
    this.failures++;
    this.successes = 0;

    // If in half-open state, immediately open / Əgər half-open vəziyyətindədirsə, dərhal aç
    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.OPEN;
      logger.warn(`Circuit breaker ${this.name} opened from HALF_OPEN / Circuit breaker ${this.name} HALF_OPEN-dan açıldı`);
      this.scheduleReset();
      return;
    }

    // Check if threshold reached / Limit-ə çatıb-çatmadığını yoxla
    if (this.failures >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN;
      logger.error(`Circuit breaker ${this.name} opened after ${this.failures} failures / Circuit breaker ${this.name} ${this.failures} uğursuzluqdan sonra açıldı`);
      this.scheduleReset();
    }
  }

  /**
   * Schedule reset attempt / Reset cəhdini planlaşdır
   */
  private scheduleReset(): void {
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
    }

    this.resetTimer = setTimeout(() => {
      if (this.state === CircuitState.OPEN) {
        this.state = CircuitState.HALF_OPEN;
        this.successes = 0;
        logger.info(`Circuit breaker ${this.name} attempting reset to HALF_OPEN / Circuit breaker ${this.name} HALF_OPEN-a reset cəhd edir`);
      }
    }, this.config.resetTimeout);
  }

  /**
   * Get current stats / Cari statistikaları al
   */
  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      totalRequests: this.totalRequests,
      totalFailures: this.totalFailures,
      totalSuccesses: this.totalSuccesses,
    };
  }

  /**
   * Reset circuit breaker / Circuit breaker-i reset et
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.successes = 0;
    this.lastFailureTime = null;
    this.lastSuccessTime = null;
    
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
      this.resetTimer = null;
    }
    
    logger.info(`Circuit breaker ${this.name} manually reset / Circuit breaker ${this.name} manual reset edildi`);
  }
}

/**
 * Circuit breaker instances storage / Circuit breaker instance-ları saxlama
 */
const circuitBreakers = new Map<string, CircuitBreaker>();

/**
 * Get or create circuit breaker / Circuit breaker al və ya yarat
 */
export function getCircuitBreaker(
  name: string,
  config?: Partial<CircuitBreakerConfig>
): CircuitBreaker {
  if (!circuitBreakers.has(name)) {
    circuitBreakers.set(name, new CircuitBreaker(name, config));
  }
  return circuitBreakers.get(name)!;
}

/**
 * Circuit breaker for external API calls / Xarici API çağırışları üçün circuit breaker
 */
export const externalApiCircuitBreaker = getCircuitBreaker('external-api', {
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 60000,
  resetTimeout: 30000,
});

/**
 * Circuit breaker for database operations / Veritabanı əməliyyatları üçün circuit breaker
 */
export const databaseCircuitBreaker = getCircuitBreaker('database', {
  failureThreshold: 10,
  successThreshold: 3,
  timeout: 30000,
  resetTimeout: 15000,
});

