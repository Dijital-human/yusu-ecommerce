/**
 * Event Bus / Event Bus
 * Central event bus for event-driven architecture
 * Event-driven architecture üçün mərkəzi event bus
 */

import { logger } from '@/lib/utils/logger';
import type {
  Event,
  EventType,
  EventHandler,
  EventHandlerRegistration,
  EventPayload,
  EventMetadata,
  EventPriority,
} from './types';

/**
 * Event bus configuration / Event bus konfiqurasiyası
 */
interface EventBusConfig {
  enabled: boolean;
  maxQueueSize: number;
  processingInterval: number; // milliseconds
  retryAttempts: number;
  retryDelay: number; // milliseconds
}

/**
 * Get event bus configuration from environment / Environment-dən event bus konfiqurasiyasını al
 */
function getEventBusConfig(): EventBusConfig {
  return {
    enabled: process.env.EVENT_BUS_ENABLED !== 'false', // Default: enabled
    maxQueueSize: parseInt(process.env.EVENT_BUS_MAX_QUEUE_SIZE || '1000', 10),
    processingInterval: parseInt(process.env.EVENT_BUS_PROCESSING_INTERVAL || '100', 10),
    retryAttempts: parseInt(process.env.EVENT_BUS_RETRY_ATTEMPTS || '3', 10),
    retryDelay: parseInt(process.env.EVENT_BUS_RETRY_DELAY || '1000', 10),
  };
}

const config = getEventBusConfig();

/**
 * Event handler registry / Event handler registry-si
 */
const handlers = new Map<EventType, EventHandlerRegistration[]>();

/**
 * Event queue / Event queue-su
 */
const eventQueue: Event[] = [];

/**
 * Processing flag / Processing flag-i
 */
let isProcessing = false;
let processingTimer: NodeJS.Timeout | null = null;

/**
 * Register event handler / Event handler qeydiyyatdan keçir
 */
export function on(
  eventType: EventType,
  handler: EventHandler,
  options?: {
    priority?: EventPriority;
    async?: boolean;
  }
): void {
  if (!config.enabled) {
    return;
  }

  const registration: EventHandlerRegistration = {
    handler,
    priority: options?.priority || 'normal',
    async: options?.async !== false, // Default: async
  };

  if (!handlers.has(eventType)) {
    handlers.set(eventType, []);
  }

  const eventHandlers = handlers.get(eventType)!;
  eventHandlers.push(registration);

  // Sort handlers by priority (critical > high > normal > low) / Handler-ləri prioritetə görə sırala
  eventHandlers.sort((a, b) => {
    const priorityOrder: Record<EventPriority, number> = {
      critical: 4,
      high: 3,
      normal: 2,
      low: 1,
    };
    return (priorityOrder[b.priority || 'normal'] || 0) - (priorityOrder[a.priority || 'normal'] || 0);
  });

  logger.debug(`Event handler registered / Event handler qeydiyyatdan keçdi: ${eventType}`, {
    eventType,
    priority: registration.priority,
    async: registration.async,
  });
}

/**
 * Unregister event handler / Event handler qeydiyyatdan çıxar
 */
export function off(eventType: EventType, handler: EventHandler): void {
  const eventHandlers = handlers.get(eventType);
  if (!eventHandlers) {
    return;
  }

  const index = eventHandlers.findIndex((reg) => reg.handler === handler);
  if (index !== -1) {
    eventHandlers.splice(index, 1);
    logger.debug(`Event handler unregistered / Event handler qeydiyyatdan çıxarıldı: ${eventType}`);
  }

  if (eventHandlers.length === 0) {
    handlers.delete(eventType);
  }
}

/**
 * Emit event / Event emit et
 */
export function emit(
  eventType: EventType,
  payload: EventPayload,
  metadata?: Partial<EventMetadata>
): void {
  if (!config.enabled) {
    return;
  }

  const event: Event = {
    type: eventType,
    payload,
    metadata: {
      timestamp: new Date().toISOString(),
      ...metadata,
    },
    priority: metadata?.priority || 'normal',
  };

  // Add to queue / Queue-ya əlavə et
  if (eventQueue.length >= config.maxQueueSize) {
    logger.warn('Event queue is full, dropping event / Event queue doludur, event atılır', {
      eventType,
      queueSize: eventQueue.length,
    });
    return;
  }

  eventQueue.push(event);

  // Start processing if not already processing / Əgər hələ processing yoxdursa başlat
  if (!isProcessing) {
    startProcessing();
  }

  logger.debug(`Event emitted / Event emit edildi: ${eventType}`, {
    eventType,
    payload,
  });
}

/**
 * Process event queue / Event queue-nu emal et
 */
async function processQueue(): Promise<void> {
  if (eventQueue.length === 0) {
    isProcessing = false;
    if (processingTimer) {
      clearTimeout(processingTimer);
      processingTimer = null;
    }
    return;
  }

  isProcessing = true;

  // Process events in batches / Event-ləri batch-lərlə emal et
  const batchSize = 10;
  const batch = eventQueue.splice(0, batchSize);

  for (const event of batch) {
    await processEvent(event);
  }

  // Continue processing if queue is not empty / Əgər queue boş deyilsə davam et
  if (eventQueue.length > 0) {
    processingTimer = setTimeout(() => {
      processQueue();
    }, config.processingInterval);
  } else {
    isProcessing = false;
    if (processingTimer) {
      clearTimeout(processingTimer);
      processingTimer = null;
    }
  }
}

/**
 * Process single event / Tək event-i emal et
 */
async function processEvent(event: Event): Promise<void> {
  const eventHandlers = handlers.get(event.type);
  if (!eventHandlers || eventHandlers.length === 0) {
    logger.debug(`No handlers registered for event / Event üçün handler qeydiyyatdan keçməyib: ${event.type}`);
    return;
  }

  // Execute handlers in order of priority / Handler-ləri prioritet sırası ilə yerinə yetir
  for (const registration of eventHandlers) {
    try {
      if (registration.async) {
        // Execute async (don't wait) / Async yerinə yetir (gözləmə)
        const result = registration.handler(event);
        if (result instanceof Promise) {
          result.catch((error) => {
            logger.error(`Async event handler failed / Async event handler uğursuz oldu: ${event.type}`, error instanceof Error ? error : new Error(String(error)), {
              eventType: event.type,
              handler: registration.handler.name,
            });
          });
        }
      } else {
        // Execute sync (wait) / Sync yerinə yetir (gözlə)
        await registration.handler(event);
      }
    } catch (error) {
      logger.error(`Event handler failed / Event handler uğursuz oldu: ${event.type}`, error instanceof Error ? error : new Error(String(error)), {
        eventType: event.type,
        handler: registration.handler.name,
      });

      // Retry logic for critical events / Kritik event-lər üçün retry logic
      if (event.priority === 'critical') {
        await retryHandler(registration, event);
      }
    }
  }
}

/**
 * Retry handler execution / Handler yerinə yetirməsini retry et
 */
async function retryHandler(registration: EventHandlerRegistration, event: Event): Promise<void> {
  for (let attempt = 1; attempt <= config.retryAttempts; attempt++) {
    try {
      await new Promise((resolve) => setTimeout(resolve, config.retryDelay * attempt));
      await registration.handler(event);
      logger.info(`Event handler retry succeeded / Event handler retry uğurlu oldu: ${event.type}`, {
        eventType: event.type,
        attempt,
      });
      return;
    } catch (error) {
      logger.warn(`Event handler retry failed / Event handler retry uğursuz oldu: ${event.type}`, {
        eventType: event.type,
        attempt,
        maxAttempts: config.retryAttempts,
      });
    }
  }

  logger.error(`Event handler retry exhausted / Event handler retry tükəndi: ${event.type}`, {
    eventType: event.type,
    maxAttempts: config.retryAttempts,
  });
}

/**
 * Start processing queue / Queue-nu emal etməyə başla
 */
function startProcessing(): void {
  if (isProcessing) {
    return;
  }

  processQueue().catch((error) => {
    logger.error('Event queue processing failed / Event queue processing uğursuz oldu', error instanceof Error ? error : new Error(String(error)));
    isProcessing = false;
  });
}

/**
 * Get event bus status / Event bus statusunu al
 */
export function getEventBusStatus(): {
  enabled: boolean;
  queueSize: number;
  registeredHandlers: number;
  isProcessing: boolean;
  config: EventBusConfig;
} {
  let totalHandlers = 0;
  handlers.forEach((handlers) => {
    totalHandlers += handlers.length;
  });

  return {
    enabled: config.enabled,
    queueSize: eventQueue.length,
    registeredHandlers: totalHandlers,
    isProcessing,
    config,
  };
}

/**
 * Clear event queue / Event queue-nu təmizlə
 */
export function clearQueue(): void {
  eventQueue.length = 0;
  logger.info('Event queue cleared / Event queue təmizləndi');
}

/**
 * Get registered handlers for event type / Event tipi üçün qeydiyyatdan keçmiş handler-ləri al
 */
export function getHandlers(eventType: EventType): EventHandlerRegistration[] {
  return handlers.get(eventType) || [];
}

/**
 * Initialize event bus / Event bus-i işə sal
 */
export function initializeEventBus(): void {
  if (!config.enabled) {
    logger.info('Event bus disabled / Event bus söndürülüb');
    return;
  }

  logger.info('Event bus initialized / Event bus işə salındı', {
    enabled: config.enabled,
    maxQueueSize: config.maxQueueSize,
    processingInterval: config.processingInterval,
  });

  // Start processing queue / Queue-nu emal etməyə başla
  startProcessing();
}

