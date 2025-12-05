/**
 * Real-Time Client / Real-Time Klient
 * Client-side real-time connection with SSE and WebSocket fallback
 * SSE və WebSocket fallback ilə client-side real-time bağlantı
 */

import { RealtimeEvent, RealtimeEventType } from './sse';

/**
 * Connection state / Bağlantı vəziyyəti
 */
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

/**
 * Reconnection configuration / Yenidən bağlantı konfiqurasiyası
 */
export interface ReconnectionConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

/**
 * Default reconnection config / Default yenidən bağlantı konfiqurasiyası
 */
const DEFAULT_RECONNECTION_CONFIG: ReconnectionConfig = {
  maxRetries: 10,
  initialDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2,
};

/**
 * Real-Time Client Class / Real-Time Klient Sinifi
 */
export class RealtimeClient {
  private sseConnection: EventSource | null = null;
  private wsConnection: WebSocket | null = null;
  private state: ConnectionState = 'disconnected';
  private eventQueue: RealtimeEvent[] = [];
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private config: ReconnectionConfig;
  private eventHandlers: Map<RealtimeEventType, Set<(event: RealtimeEvent) => void>> = new Map();
  private stateChangeHandlers: Set<(state: ConnectionState) => void> = new Set();

  constructor(
    private sseUrl: string,
    private wsUrl?: string,
    config?: Partial<ReconnectionConfig>
  ) {
    this.config = { ...DEFAULT_RECONNECTION_CONFIG, ...config };
  }

  /**
   * Connect to real-time service / Real-time xidmətinə qoşul
   */
  connect(): void {
    if (this.state === 'connected' || this.state === 'connecting') {
      return;
    }

    this.setState('connecting');
    this.tryConnectSSE();
  }

  /**
   * Try to connect via SSE / SSE vasitəsilə qoşulmağa cəhd et
   */
  private tryConnectSSE(): void {
    try {
      this.sseConnection = new EventSource(this.sseUrl);

      this.sseConnection.onopen = () => {
        this.setState('connected');
        this.reconnectAttempts = 0;
        this.processEventQueue();
      };

      this.sseConnection.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleEvent(data);
        } catch (error) {
          console.error('Failed to parse SSE message / SSE mesajını parse etmək uğursuz oldu', error);
        }
      };

      this.sseConnection.onerror = (error) => {
        console.error('SSE connection error / SSE bağlantı xətası', error);
        this.handleConnectionError();
      };
    } catch (error) {
      console.error('Failed to create SSE connection / SSE bağlantısı yaratmaq uğursuz oldu', error);
      this.handleConnectionError();
    }
  }

  /**
   * Try to connect via WebSocket / WebSocket vasitəsilə qoşulmağa cəhd et
   */
  private tryConnectWebSocket(): void {
    if (!this.wsUrl) {
      console.warn('WebSocket URL not provided / WebSocket URL verilməyib');
      this.scheduleReconnect();
      return;
    }

    try {
      this.wsConnection = new WebSocket(this.wsUrl);

      this.wsConnection.onopen = () => {
        this.setState('connected');
        this.reconnectAttempts = 0;
        this.processEventQueue();
      };

      this.wsConnection.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleEvent(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message / WebSocket mesajını parse etmək uğursuz oldu', error);
        }
      };

      this.wsConnection.onerror = (error) => {
        console.error('WebSocket connection error / WebSocket bağlantı xətası', error);
        this.handleConnectionError();
      };

      this.wsConnection.onclose = () => {
        this.handleConnectionError();
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection / WebSocket bağlantısı yaratmaq uğursuz oldu', error);
      this.handleConnectionError();
    }
  }

  /**
   * Handle connection error / Bağlantı xətasını idarə et
   */
  private handleConnectionError(): void {
    this.closeConnections();
    
    if (this.reconnectAttempts < this.config.maxRetries) {
      this.setState('reconnecting');
      this.scheduleReconnect();
    } else {
      this.setState('error');
    }
  }

  /**
   * Schedule reconnection with exponential backoff / Exponential backoff ilə yenidən bağlantını planla
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    const delay = Math.min(
      this.config.initialDelay * Math.pow(this.config.backoffMultiplier, this.reconnectAttempts),
      this.config.maxDelay
    );

    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      // Try WebSocket if SSE failed / SSE uğursuz olduqda WebSocket-ə cəhd et
      if (this.sseConnection === null && this.wsConnection === null) {
        this.tryConnectWebSocket();
      } else {
        this.tryConnectSSE();
      }
    }, delay);
  }

  /**
   * Close all connections / Bütün bağlantıları bağla
   */
  private closeConnections(): void {
    if (this.sseConnection) {
      this.sseConnection.close();
      this.sseConnection = null;
    }

    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
  }

  /**
   * Disconnect from real-time service / Real-time xidmətindən ayrıl
   */
  disconnect(): void {
    this.closeConnections();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.setState('disconnected');
    this.reconnectAttempts = 0;
    this.eventQueue = [];
  }

  /**
   * Set connection state / Bağlantı vəziyyətini təyin et
   */
  private setState(state: ConnectionState): void {
    if (this.state !== state) {
      this.state = state;
      this.stateChangeHandlers.forEach(handler => handler(state));
    }
  }

  /**
   * Handle incoming event / Gələn hadisəni idarə et
   */
  private handleEvent(event: RealtimeEvent): void {
    // Queue event if disconnected / Bağlantı kəsildikdə hadisəni növbəyə qoy
    if (this.state !== 'connected') {
      this.eventQueue.push(event);
      return;
    }

    // Process event / Hadisəni işlə
    const handlers = this.eventHandlers.get(event.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error('Event handler error / Hadisə handler xətası', error, { eventType: event.type });
        }
      });
    }

    // Also call handlers for 'all' events / 'all' hadisələri üçün də handler-ləri çağır
    const allHandlers = this.eventHandlers.get('*' as RealtimeEventType);
    if (allHandlers) {
      allHandlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error('Event handler error / Hadisə handler xətası', error, { eventType: event.type });
        }
      });
    }
  }

  /**
   * Process queued events / Növbədəki hadisələri işlə
   */
  private processEventQueue(): void {
    while (this.eventQueue.length > 0 && this.state === 'connected') {
      const event = this.eventQueue.shift();
      if (event) {
        this.handleEvent(event);
      }
    }
  }

  /**
   * Subscribe to event type / Hadisə tipinə abunə ol
   */
  on(eventType: RealtimeEventType | '*', handler: (event: RealtimeEvent) => void): () => void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }

    this.eventHandlers.get(eventType)!.add(handler);

    // Return unsubscribe function / Abunəni ləğv etmə funksiyasını qaytar
    return () => {
      const handlers = this.eventHandlers.get(eventType);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.eventHandlers.delete(eventType);
        }
      }
    };
  }

  /**
   * Subscribe to state changes / Vəziyyət dəyişikliklərinə abunə ol
   */
  onStateChange(handler: (state: ConnectionState) => void): () => void {
    this.stateChangeHandlers.add(handler);
    
    // Return unsubscribe function / Abunəni ləğv etmə funksiyasını qaytar
    return () => {
      this.stateChangeHandlers.delete(handler);
    };
  }

  /**
   * Get current state / Cari vəziyyəti al
   */
  getState(): ConnectionState {
    return this.state;
  }

  /**
   * Check if connected / Bağlı olub olmadığını yoxla
   */
  isConnected(): boolean {
    return this.state === 'connected';
  }
}

