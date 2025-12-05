/**
 * Order Events / Sifariş Event-ləri
 * Order-related event handlers and utilities
 * Sifarişlə bağlı event handler-ləri və utility-lər
 */

import { emit } from './event-bus';
import { on } from './event-bus';
import { invalidateOrderCache, invalidateRelatedCaches } from '@/lib/cache/cache-invalidator';
import { sendOrderConfirmation } from '@/lib/email';
import { sendNewOrderEmailToSeller } from '@/lib/notifications/seller-order-email';
import { emitRealtimeEvent } from '@/lib/realtime/sse';
import { logger } from '@/lib/utils/logger';
import type { Event } from './types';

/**
 * Emit order created event / Sifariş yaradıldı event-i emit et
 */
export function emitOrderCreated(order: any, userId: string, requestId?: string): void {
  emit('order.created', {
    orderId: order.id,
    orderNumber: order.orderNumber,
    userId,
    sellerId: order.sellerId,
    totalAmount: order.totalAmount,
    status: order.status,
    items: order.items?.map((item: any) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
    })),
  }, {
    userId,
    requestId,
    priority: 'high',
  });
}

/**
 * Emit order updated event / Sifariş yeniləndi event-i emit et
 */
export function emitOrderUpdated(orderId: string, updates: any, userId?: string, requestId?: string): void {
  emit('order.updated', {
    orderId,
    updates,
  }, {
    userId,
    requestId,
    priority: 'normal',
  });
}

/**
 * Emit order cancelled event / Sifariş ləğv edildi event-i emit et
 */
export function emitOrderCancelled(orderId: string, reason?: string, userId?: string, requestId?: string): void {
  emit('order.cancelled', {
    orderId,
    reason,
  }, {
    userId,
    requestId,
    priority: 'high',
  });
}

/**
 * Emit order completed event / Sifariş tamamlandı event-i emit et
 */
export function emitOrderCompleted(orderId: string, userId?: string, requestId?: string): void {
  emit('order.completed', {
    orderId,
  }, {
    userId,
    requestId,
    priority: 'normal',
  });
}

/**
 * Emit order payment failed event / Sifariş ödənişi uğursuz oldu event-i emit et
 */
export function emitOrderPaymentFailed(orderId: string, reason?: string, userId?: string, requestId?: string): void {
  emit('order.payment.failed', {
    orderId,
    reason,
  }, {
    userId,
    requestId,
    priority: 'critical',
  });
}

/**
 * Emit order payment succeeded event / Sifariş ödənişi uğurlu oldu event-i emit et
 */
export function emitOrderPaymentSucceeded(orderId: string, paymentIntentId: string, userId?: string, requestId?: string): void {
  emit('order.payment.succeeded', {
    orderId,
    paymentIntentId,
  }, {
    userId,
    requestId,
    priority: 'high',
  });
}

/**
 * Register order event handlers / Sifariş event handler-lərini qeydiyyatdan keçir
 */
export function registerOrderEventHandlers(): void {
  // Order created handler / Sifariş yaradıldı handler-i
  on('order.created', async (event: Event) => {
    try {
      const { orderId, userId, sellerId } = event.payload;

      // Send order confirmation email / Sifariş təsdiq email-i göndər
      try {
        await sendOrderConfirmation(orderId);
      } catch (error) {
        logger.error('Failed to send order confirmation email / Sifariş təsdiq email-i göndərmək uğursuz oldu', error instanceof Error ? error : new Error(String(error)), {
          orderId,
        });
      }

      // Send new order email to seller / Satıcıya yeni sifariş email-i göndər
      try {
        await sendNewOrderEmailToSeller(orderId, sellerId);
      } catch (error) {
        logger.error('Failed to send new order email to seller / Satıcıya yeni sifariş email-i göndərmək uğursuz oldu', error instanceof Error ? error : new Error(String(error)), {
          orderId,
          sellerId,
        });
      }

      // Emit real-time event / Real-time event emit et
      try {
        emitRealtimeEvent('order.new', {
          orderId,
          userId,
        }, userId);
      } catch (error) {
        logger.error('Failed to emit real-time event / Real-time event emit etmək uğursuz oldu', error instanceof Error ? error : new Error(String(error)), {
          orderId,
        });
      }

      // Invalidate cache / Cache-i invalidate et
      try {
        await invalidateOrderCache(orderId, userId);
        await invalidateRelatedCaches('order', orderId, { userId });
        // Also invalidate seller cache / Həmçinin satıcı cache-ini invalidate et
        if (sellerId) {
          await invalidateRelatedCaches('user', sellerId, { userId });
        }
      } catch (error) {
        logger.error('Failed to invalidate cache / Cache-i invalidate etmək uğursuz oldu', error instanceof Error ? error : new Error(String(error)), {
          orderId,
        });
      }
    } catch (error) {
      logger.error('Order created event handler failed / Sifariş yaradıldı event handler-i uğursuz oldu', error instanceof Error ? error : new Error(String(error)), {
        eventType: event.type,
      });
    }
  }, {
    priority: 'high',
    async: true,
  });

  // Order updated handler / Sifariş yeniləndi handler-i
  on('order.updated', async (event: Event) => {
    try {
      const { orderId, updates } = event.payload;

      // Invalidate cache / Cache-i invalidate et
      await invalidateOrderCache(orderId);
      if (updates.userId) {
        await invalidateRelatedCaches('order', orderId, {
          userId: updates.userId,
        });
      }

      // Emit real-time event if status changed / Əgər status dəyişibsə real-time event emit et
      if (updates.status) {
        emitRealtimeEvent('order.update', {
          orderId,
          status: updates.status,
        });
      }
    } catch (error) {
      logger.error('Order updated event handler failed / Sifariş yeniləndi event handler-i uğursuz oldu', error instanceof Error ? error : new Error(String(error)), {
        eventType: event.type,
      });
    }
  }, {
    priority: 'normal',
    async: true,
  });

  // Order cancelled handler / Sifariş ləğv edildi handler-i
  on('order.cancelled', async (event: Event) => {
    try {
      const { orderId } = event.payload;

      // Invalidate cache / Cache-i invalidate et
      await invalidateOrderCache(orderId);
      await invalidateRelatedCaches('order', orderId);

      // Emit real-time event / Real-time event emit et
      emitRealtimeEvent('order.update', {
        orderId,
        status: 'CANCELLED',
      });
    } catch (error) {
      logger.error('Order cancelled event handler failed / Sifariş ləğv edildi event handler-i uğursuz oldu', error instanceof Error ? error : new Error(String(error)), {
        eventType: event.type,
      });
    }
  }, {
    priority: 'high',
    async: true,
  });

  // Order payment succeeded handler / Sifariş ödənişi uğurlu oldu handler-i
  on('order.payment.succeeded', async (event: Event) => {
    try {
      const { orderId } = event.payload;

      // Invalidate cache / Cache-i invalidate et
      await invalidateOrderCache(orderId);
      await invalidateRelatedCaches('order', orderId);

      // Emit real-time event / Real-time event emit et
      emitRealtimeEvent('order.update', {
        orderId,
        paymentStatus: 'PAID',
      });
    } catch (error) {
      logger.error('Order payment succeeded event handler failed / Sifariş ödənişi uğurlu oldu event handler-i uğursuz oldu', error instanceof Error ? error : new Error(String(error)), {
        eventType: event.type,
      });
    }
  }, {
    priority: 'high',
    async: true,
  });

  // Order payment failed handler / Sifariş ödənişi uğursuz oldu handler-i
  on('order.payment.failed', async (event: Event) => {
    try {
      const { orderId } = event.payload;

      // Invalidate cache / Cache-i invalidate et
      await invalidateOrderCache(orderId);
      await invalidateRelatedCaches('order', orderId);

      // Emit real-time event / Real-time event emit et
      emitRealtimeEvent('order.update', {
        orderId,
        paymentStatus: 'FAILED',
      });
    } catch (error) {
      logger.error('Order payment failed event handler failed / Sifariş ödənişi uğursuz oldu event handler-i uğursuz oldu', error instanceof Error ? error : new Error(String(error)), {
        eventType: event.type,
      });
    }
  }, {
    priority: 'critical',
    async: true,
  });

  logger.info('Order event handlers registered / Sifariş event handler-ləri qeydiyyatdan keçdi');
}

