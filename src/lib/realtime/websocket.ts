/**
 * WebSocket Service / WebSocket Xidməti
 * Provides WebSocket fallback for real-time updates when SSE fails
 * SSE uğursuz olduqda real-time yeniləmələr üçün WebSocket fallback təmin edir
 */

import { logger } from '@/lib/utils/logger';
import { RealtimeEvent, RealtimeEventType } from './sse';

/**
 * WebSocket connection interface / WebSocket bağlantı interfeysi
 */
interface WebSocketConnection {
  id: string;
  userId?: string;
  ws: any; // WebSocket instance
  connectedAt: Date;
  lastPing: Date;
  isAlive: boolean;
}

/**
 * Connection pool manager / Bağlantı pool meneceri
 */
class WebSocketService {
  private connections: Map<string, WebSocketConnection> = new Map();
  private nextId = 1;
  private readonly maxConnections = 10000; // Max connections limit
  private readonly heartbeatInterval = 30000; // 30 seconds
  private readonly connectionTimeout = 60000; // 60 seconds
  private heartbeatTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.startHeartbeat();
  }

  /**
   * Start heartbeat mechanism / Heartbeat mexanizmini başlat
   */
  private startHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }

    this.heartbeatTimer = setInterval(() => {
      this.checkConnections();
    }, this.heartbeatInterval);
  }

  /**
   * Check and cleanup dead connections / Ölü bağlantıları yoxla və təmizlə
   */
  private checkConnections(): void {
    const now = new Date();
    const connectionsToRemove: string[] = [];

    this.connections.forEach((conn, id) => {
      // Check if connection is alive / Bağlantının canlı olub olmadığını yoxla
      if (!conn.isAlive) {
        connectionsToRemove.push(id);
        return;
      }

      // Check connection timeout / Bağlantı timeout-unu yoxla
      const timeSinceLastPing = now.getTime() - conn.lastPing.getTime();
      if (timeSinceLastPing > this.connectionTimeout) {
        logger.warn('WebSocket connection timeout / WebSocket bağlantı timeout', { id, userId: conn.userId });
        connectionsToRemove.push(id);
        return;
      }

      // Send ping / Ping göndər
      try {
        conn.isAlive = false;
        if (conn.ws.readyState === 1) { // WebSocket.OPEN
          conn.ws.ping();
        }
      } catch (error) {
        logger.error('Failed to ping WebSocket connection / WebSocket bağlantısına ping göndərmək uğursuz oldu', error, { id });
        connectionsToRemove.push(id);
      }
    });

    // Remove dead connections / Ölü bağlantıları sil
    connectionsToRemove.forEach(id => {
      this.removeConnection(id);
    });

    logger.debug('WebSocket heartbeat check / WebSocket heartbeat yoxlaması', {
      activeConnections: this.connections.size,
      removedConnections: connectionsToRemove.length,
    });
  }

  /**
   * Add WebSocket connection / WebSocket bağlantısı əlavə et
   */
  addConnection(ws: any, userId?: string): string {
    // Check max connections limit / Maksimum bağlantı limitini yoxla
    if (this.connections.size >= this.maxConnections) {
      logger.warn('WebSocket max connections reached / WebSocket maksimum bağlantı sayına çatdı', {
        maxConnections: this.maxConnections,
        currentConnections: this.connections.size,
      });
      ws.close(1008, 'Server at capacity / Server tutumda');
      throw new Error('Max connections reached / Maksimum bağlantı sayına çatdı');
    }

    const id = `ws_${this.nextId++}`;
    const connection: WebSocketConnection = {
      id,
      userId,
      ws,
      connectedAt: new Date(),
      lastPing: new Date(),
      isAlive: true,
    };

    this.connections.set(id, connection);

    // Setup connection handlers / Bağlantı handler-lərini quraşdır
    ws.on('pong', () => {
      const conn = this.connections.get(id);
      if (conn) {
        conn.isAlive = true;
        conn.lastPing = new Date();
      }
    });

    ws.on('close', () => {
      this.removeConnection(id);
    });

    ws.on('error', (error: Error) => {
      logger.error('WebSocket error / WebSocket xətası', error, { id, userId });
      this.removeConnection(id);
    });

    logger.info('WebSocket connection added / WebSocket bağlantısı əlavə edildi', { id, userId, totalConnections: this.connections.size });

    return id;
  }

  /**
   * Remove WebSocket connection / WebSocket bağlantısını sil
   */
  removeConnection(id: string): void {
    const connection = this.connections.get(id);
    if (connection) {
      try {
        if (connection.ws.readyState === 1) { // WebSocket.OPEN
          connection.ws.close();
        }
      } catch (error) {
        // Ignore errors when closing / Bağlanarkən xətaları nəzərə alma
      }
      this.connections.delete(id);
      logger.info('WebSocket connection removed / WebSocket bağlantısı silindi', { id, userId: connection.userId, totalConnections: this.connections.size });
    }
  }

  /**
   * Broadcast event to all connections / Hadisəni bütün bağlantılara yayımla
   */
  broadcast(event: RealtimeEvent): void {
    const connections = Array.from(this.connections.values());
    let sentCount = 0;
    let errorCount = 0;

    connections.forEach(conn => {
      try {
        // If event has userId, only send to that user / Əgər hadisədə userId varsa, yalnız o istifadəçiyə göndər
        if (event.userId && conn.userId && conn.userId !== event.userId) {
          return;
        }

        if (conn.ws.readyState === 1) { // WebSocket.OPEN
          conn.ws.send(JSON.stringify(event));
          sentCount++;
        } else {
          // Connection is not open, remove it / Bağlantı açıq deyil, sil
          this.removeConnection(conn.id);
        }
      } catch (error) {
        errorCount++;
        logger.error('Failed to send WebSocket event / WebSocket hadisəsini göndərmək uğursuz oldu', error, {
          connectionId: conn.id,
          eventType: event.type,
        });
        // Remove failed connection / Uğursuz bağlantını sil
        this.removeConnection(conn.id);
      }
    });

    logger.debug('WebSocket event broadcasted / WebSocket hadisəsi yayımlandı', {
      eventType: event.type,
      sentCount,
      errorCount,
      totalConnections: connections.length,
    });
  }

  /**
   * Send event to specific user / Hadisəni müəyyən istifadəçiyə göndər
   */
  sendToUser(userId: string, event: RealtimeEvent): void {
    const connections = Array.from(this.connections.values());
    let sentCount = 0;
    let errorCount = 0;

    connections.forEach(conn => {
      if (conn.userId === userId) {
        try {
          if (conn.ws.readyState === 1) { // WebSocket.OPEN
            conn.ws.send(JSON.stringify(event));
            sentCount++;
          } else {
            // Connection is not open, remove it / Bağlantı açıq deyil, sil
            this.removeConnection(conn.id);
          }
        } catch (error) {
          errorCount++;
          logger.error('Failed to send WebSocket event to user / İstifadəçiyə WebSocket hadisəsini göndərmək uğursuz oldu', error, {
            connectionId: conn.id,
            userId,
            eventType: event.type,
          });
          // Remove failed connection / Uğursuz bağlantını sil
          this.removeConnection(conn.id);
        }
      }
    });

    logger.debug('WebSocket event sent to user / İstifadəçiyə WebSocket hadisəsi göndərildi', {
      userId,
      eventType: event.type,
      sentCount,
      errorCount,
    });
  }

  /**
   * Get connection count / Bağlantı sayını al
   */
  getConnectionCount(): number {
    return this.connections.size;
  }

  /**
   * Get connection metrics / Bağlantı metrikalarını al
   */
  getMetrics(): {
    totalConnections: number;
    connectionsByUser: Record<string, number>;
    averageConnectionDuration: number;
  } {
    const connections = Array.from(this.connections.values());
    const now = new Date();
    const connectionsByUser: Record<string, number> = {};
    let totalDuration = 0;

    connections.forEach(conn => {
      // Count connections by user / İstifadəçiyə görə bağlantıları say
      if (conn.userId) {
        connectionsByUser[conn.userId] = (connectionsByUser[conn.userId] || 0) + 1;
      }

      // Calculate average connection duration / Orta bağlantı müddətini hesabla
      const duration = now.getTime() - conn.connectedAt.getTime();
      totalDuration += duration;
    });

    return {
      totalConnections: connections.length,
      connectionsByUser,
      averageConnectionDuration: connections.length > 0 ? totalDuration / connections.length : 0,
    };
  }

  /**
   * Cleanup / Təmizləmə
   */
  cleanup(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    // Close all connections / Bütün bağlantıları bağla
    this.connections.forEach((conn, id) => {
      this.removeConnection(id);
    });

    logger.info('WebSocket service cleaned up / WebSocket xidməti təmizləndi');
  }
}

// Global WebSocket service instance / Qlobal WebSocket xidmət instance
export const wsService = new WebSocketService();

/**
 * Emit real-time event via WebSocket / WebSocket vasitəsilə real-time hadisə yayımla
 */
export function emitWebSocketEvent(type: RealtimeEventType, data: any, userId?: string): void {
  const event: RealtimeEvent = {
    type,
    data,
    timestamp: new Date().toISOString(),
    userId,
  };

  if (userId) {
    wsService.sendToUser(userId, event);
  } else {
    wsService.broadcast(event);
  }
}

