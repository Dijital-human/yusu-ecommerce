/**
 * Server-Sent Events (SSE) Service / Server-Sent Events (SSE) Xidməti
 * Provides real-time updates using SSE
 * SSE istifadə edərək real-time yeniləmələr təmin edir
 */

import { logger } from '@/lib/utils/logger';

/**
 * Event types / Hadisə tipləri
 */
export type RealtimeEventType = 
  | 'order.status.update'
  | 'order.update'
  | 'order.new'
  | 'product.stock.update'
  | 'product.price.update'
  | 'product.new'
  | 'notification.new'
  | 'cart.update'
  | 'chat.room.created'
  | 'chat.room.assigned'
  | 'chat.room.closed'
  | 'chat.message.new'
  | 'chat.messages.read'
  | 'chat.typing';

/**
 * Realtime event interface / Real-time hadisə interfeysi
 */
export interface RealtimeEvent {
  type: RealtimeEventType;
  data: any;
  timestamp: string;
  userId?: string;
}

/**
 * Event subscribers / Hadisə abunəçiləri
 */
interface EventSubscriber {
  userId?: string;
  send: (event: RealtimeEvent) => void;
}

class SSEService {
  private subscribers: Map<string, EventSubscriber> = new Map();
  private nextId = 1;
  private readonly maxConnections = 10000; // Max connections limit
  private readonly connectionTimeout = 300000; // 5 minutes
  private connectionMetrics: Map<string, { connectedAt: Date; lastActivity: Date; messageCount: number }> = new Map();

  /**
   * Subscribe to real-time events / Real-time hadisələrə abunə ol
   */
  subscribe(userId: string | undefined, send: (event: RealtimeEvent) => void): string {
    // Check max connections limit / Maksimum bağlantı limitini yoxla
    if (this.subscribers.size >= this.maxConnections) {
      logger.warn('SSE max connections reached / SSE maksimum bağlantı sayına çatdı', {
        maxConnections: this.maxConnections,
        currentConnections: this.subscribers.size,
      });
      throw new Error('Max connections reached / Maksimum bağlantı sayına çatdı');
    }

    const id = `subscriber_${this.nextId++}`;
    this.subscribers.set(id, { userId, send });
    
    // Track connection metrics / Bağlantı metrikalarını izlə
    this.connectionMetrics.set(id, {
      connectedAt: new Date(),
      lastActivity: new Date(),
      messageCount: 0,
    });

    logger.info('SSE subscriber added / SSE abunəçisi əlavə edildi', { id, userId, totalConnections: this.subscribers.size });
    return id;
  }

  /**
   * Unsubscribe from real-time events / Real-time hadisələrdən abunəni ləğv et
   */
  unsubscribe(id: string): void {
    const subscriber = this.subscribers.get(id);
    this.subscribers.delete(id);
    this.connectionMetrics.delete(id);
    
    logger.info('SSE subscriber removed / SSE abunəçisi silindi', { 
      id, 
      userId: subscriber?.userId,
      totalConnections: this.subscribers.size 
    });
  }

  /**
   * Broadcast event to all subscribers / Hadisəni bütün abunəçilərə yayımla
   */
  broadcast(event: RealtimeEvent): void {
    const subscriberEntries = Array.from(this.subscribers.entries());
    let sentCount = 0;

    subscriberEntries.forEach(([id, subscriber]) => {
      try {
        // If event has userId, only send to that user / Əgər hadisədə userId varsa, yalnız o istifadəçiyə göndər
        if (event.userId && subscriber.userId && subscriber.userId !== event.userId) {
          return;
        }

        subscriber.send(event);
        sentCount++;
        // Update activity / Aktivliyi yenilə
        this.updateActivity(id);
      } catch (error) {
        logger.error('Failed to send SSE event / SSE hadisəsini göndərmək uğursuz oldu', error, { eventType: event.type });
      }
    });

    logger.info('SSE event broadcasted / SSE hadisəsi yayımlandı', { 
      eventType: event.type, 
      sentCount, 
      totalSubscribers: subscriberEntries.length 
    });
  }

  /**
   * Send event to specific user / Hadisəni müəyyən istifadəçiyə göndər
   */
  sendToUser(userId: string, event: RealtimeEvent): void {
    const subscriberEntries = Array.from(this.subscribers.entries());
    let sentCount = 0;

    subscriberEntries.forEach(([id, subscriber]) => {
      if (subscriber.userId === userId) {
        try {
          subscriber.send(event);
          sentCount++;
          // Update activity / Aktivliyi yenilə
          this.updateActivity(id);
        } catch (error) {
          logger.error('Failed to send SSE event to user / İstifadəçiyə SSE hadisəsini göndərmək uğursuz oldu', error, { userId, eventType: event.type });
        }
      }
    });

    logger.info('SSE event sent to user / İstifadəçiyə SSE hadisəsi göndərildi', { 
      userId, 
      eventType: event.type, 
      sentCount 
    });
  }

  /**
   * Get subscriber count / Abunəçi sayını al
   */
  getSubscriberCount(): number {
    return this.subscribers.size;
  }

  /**
   * Get connection metrics / Bağlantı metrikalarını al
   */
  getMetrics(): {
    totalConnections: number;
    connectionsByUser: Record<string, number>;
    averageConnectionDuration: number;
    averageMessagesPerConnection: number;
    totalMessages: number;
  } {
    const connections = Array.from(this.connectionMetrics.values());
    const now = new Date();
    const connectionsByUser: Record<string, number> = {};
    let totalDuration = 0;
    let totalMessages = 0;

    this.subscribers.forEach((subscriber, id) => {
      // Count connections by user / İstifadəçiyə görə bağlantıları say
      if (subscriber.userId) {
        connectionsByUser[subscriber.userId] = (connectionsByUser[subscriber.userId] || 0) + 1;
      }

      // Calculate metrics / Metrikaları hesabla
      const metrics = this.connectionMetrics.get(id);
      if (metrics) {
        const duration = now.getTime() - metrics.connectedAt.getTime();
        totalDuration += duration;
        totalMessages += metrics.messageCount;
      }
    });

    return {
      totalConnections: this.subscribers.size,
      connectionsByUser,
      averageConnectionDuration: connections.length > 0 ? totalDuration / connections.length : 0,
      averageMessagesPerConnection: connections.length > 0 ? totalMessages / connections.length : 0,
      totalMessages,
    };
  }

  /**
   * Update connection activity / Bağlantı aktivliyini yenilə
   */
  private updateActivity(id: string): void {
    const metrics = this.connectionMetrics.get(id);
    if (metrics) {
      metrics.lastActivity = new Date();
      metrics.messageCount++;
    }
  }

  /**
   * Cleanup idle connections / İşləməyən bağlantıları təmizlə
   */
  cleanupIdleConnections(): void {
    const now = new Date();
    const connectionsToRemove: string[] = [];

    this.connectionMetrics.forEach((metrics, id) => {
      const idleTime = now.getTime() - metrics.lastActivity.getTime();
      if (idleTime > this.connectionTimeout) {
        connectionsToRemove.push(id);
      }
    });

    connectionsToRemove.forEach(id => {
      logger.info('Removing idle SSE connection / İşləməyən SSE bağlantısı silinir', { id });
      this.unsubscribe(id);
    });

    if (connectionsToRemove.length > 0) {
      logger.info('Cleaned up idle SSE connections / İşləməyən SSE bağlantıları təmizləndi', {
        removedCount: connectionsToRemove.length,
        remainingConnections: this.subscribers.size,
      });
    }
  }
}

// Global SSE service instance / Qlobal SSE xidmət instance
export const sseService = new SSEService();

/**
 * Create SSE response / SSE cavabı yarat
 */
export function createSSEResponse(userId: string | undefined): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message / İlkin bağlantı mesajı göndər
      const initialMessage = `data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`;
      controller.enqueue(encoder.encode(initialMessage));

      // Subscribe to events / Hadisələrə abunə ol
      const subscriberId = sseService.subscribe(userId, (event) => {
        try {
          const message = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(message));
        } catch (error) {
          logger.error('Failed to send SSE message / SSE mesajını göndərmək uğursuz oldu', error);
        }
      });

      // Handle client disconnect / İstifadəçi bağlantısının kəsilməsini idarə et
      const cleanup = () => {
        sseService.unsubscribe(subscriberId);
        try {
          controller.close();
        } catch (error) {
          // Ignore errors when closing / Bağlanarkən xətaları nəzərə alma
        }
      };

      // Cleanup on close / Bağlananda təmizlə
      return cleanup;
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable buffering for nginx / Nginx üçün buffering-i deaktiv et
    },
  });
}

/**
 * Emit real-time event / Real-time hadisə yayımla
 * Supports both SSE and WebSocket fallback / Həm SSE, həm də WebSocket fallback dəstəkləyir
 */
export function emitRealtimeEvent(type: RealtimeEventType, data: any, userId?: string): void {
  const event: RealtimeEvent = {
    type,
    data,
    timestamp: new Date().toISOString(),
    userId,
  };

  // Emit via SSE / SSE vasitəsilə emit et
  try {
    if (userId) {
      sseService.sendToUser(userId, event);
    } else {
      sseService.broadcast(event);
    }
  } catch (error) {
    logger.error('SSE event emission failed, falling back to WebSocket / SSE hadisə yayımı uğursuz oldu, WebSocket-ə keçid', error);
  }

  // Also emit via WebSocket as fallback / Fallback kimi WebSocket vasitəsilə də emit et
  try {
    const { emitWebSocketEvent } = require('./websocket');
    emitWebSocketEvent(type, data, userId);
  } catch (error) {
    // WebSocket service might not be available / WebSocket xidməti mövcud olmaya bilər
    logger.debug('WebSocket event emission skipped / WebSocket hadisə yayımı atlandı', { error });
  }
}

