/**
 * Event Types / Event Tipləri
 * Type definitions for event-driven architecture
 * Event-driven architecture üçün type tərifləri
 */

/**
 * Event type / Event tipi
 */
export type EventType = 
  // Order events / Sifariş event-ləri
  | 'order.created'
  | 'order.updated'
  | 'order.cancelled'
  | 'order.completed'
  | 'order.payment.failed'
  | 'order.payment.succeeded'
  // Product events / Məhsul event-ləri
  | 'product.created'
  | 'product.updated'
  | 'product.deleted'
  | 'product.stock.low'
  | 'product.stock.out'
  // User events / İstifadəçi event-ləri
  | 'user.registered'
  | 'user.updated'
  | 'user.deleted'
  | 'user.login'
  | 'user.logout'
  | 'user.notification'
  // Cart events / Səbət event-ləri
  | 'cart.item.added'
  | 'cart.item.removed'
  | 'cart.cleared'
  // Wishlist events / İstək siyahısı event-ləri
  | 'wishlist.item.added'
  | 'wishlist.item.removed';

/**
 * Event priority / Event prioriteti
 */
export type EventPriority = 'low' | 'normal' | 'high' | 'critical';

/**
 * Event payload / Event payload-u
 */
export interface EventPayload {
  [key: string]: any;
}

/**
 * Event metadata / Event metadata-sı
 */
export interface EventMetadata {
  timestamp: string;
  userId?: string;
  requestId?: string;
  sessionId?: string;
  source?: string;
  [key: string]: any;
}

/**
 * Event / Event
 */
export interface Event {
  type: EventType;
  payload: EventPayload;
  metadata: EventMetadata;
  priority?: EventPriority;
}

/**
 * Event handler function / Event handler funksiyası
 */
export type EventHandler = (event: Event) => Promise<void> | void;

/**
 * Event handler registration / Event handler qeydiyyatı
 */
export interface EventHandlerRegistration {
  handler: EventHandler;
  priority?: EventPriority;
  async?: boolean;
}

