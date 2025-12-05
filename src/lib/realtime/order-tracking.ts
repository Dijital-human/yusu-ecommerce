/**
 * Real-Time Order Tracking / Real-Time Sifariş İzləmə
 * Server-Sent Events (SSE) and WebSocket support for real-time order tracking
 * Real-time sifariş izləmə üçün Server-Sent Events (SSE) və WebSocket dəstəyi
 */

import { logger } from '@/lib/utils/logger';
import { getReadClient } from '@/lib/db/query-client';

export interface OrderTrackingUpdate {
  orderId: string;
  status: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  estimatedDelivery?: Date;
  courier?: {
    name: string;
    phone?: string;
  };
  timestamp: Date;
  description?: string;
}

/**
 * Subscribe to order tracking updates / Sifariş izləmə yeniləmələrinə abunə ol
 */
export async function subscribeToOrderTracking(
  orderId: string,
  onUpdate: (update: OrderTrackingUpdate) => void
): Promise<() => void> {
  // For now, use polling. In production, use SSE or WebSocket
  // İndilik polling istifadə et. Production-da SSE və ya WebSocket istifadə et
  let isActive = true;
  let lastUpdateTime = new Date();

  const pollInterval = setInterval(async () => {
    if (!isActive) {
      clearInterval(pollInterval);
      return;
    }

    try {
      const readClient = await getReadClient();
      const order = await (readClient as any).order.findUnique({
        where: { id: orderId },
        include: {
          shipping: {
            include: {
              courier: true,
            },
          },
        },
      });

      if (!order) {
        return;
      }

      // Check if order was updated / Sifarişin yenilənib-yenilənmədiyini yoxla
      const updatedAt = new Date(order.updatedAt);
      if (updatedAt > lastUpdateTime) {
        const update: OrderTrackingUpdate = {
          orderId: order.id,
          status: order.status,
          estimatedDelivery: order.shipping?.estimatedDelivery
            ? new Date(order.shipping.estimatedDelivery)
            : undefined,
          courier: order.shipping?.courier
            ? {
                name: order.shipping.courier.name || 'Unknown',
                phone: order.shipping.courier.phone || undefined,
              }
            : undefined,
          timestamp: updatedAt,
          description: getStatusDescription(order.status),
        };

        onUpdate(update);
        lastUpdateTime = updatedAt;
      }
    } catch (error) {
      logger.error('Error polling order tracking updates / Sifariş izləmə yeniləmələrini polling etmək xətası', error);
    }
  }, 5000); // Poll every 5 seconds / Hər 5 saniyədə bir polling et

  // Return unsubscribe function / Abunəlik ləğv etmə funksiyasını qaytar
  return () => {
    isActive = false;
    clearInterval(pollInterval);
  };
}

/**
 * Get status description / Status təsvirini al
 */
function getStatusDescription(status: string): string {
  const descriptions: Record<string, string> = {
    PENDING: 'Order is pending / Sifariş gözləyir',
    CONFIRMED: 'Order confirmed / Sifariş təsdiqləndi',
    PROCESSING: 'Order is being processed / Sifariş emal olunur',
    SHIPPED: 'Order has been shipped / Sifariş göndərildi',
    IN_TRANSIT: 'Order is in transit / Sifariş yoldadır',
    OUT_FOR_DELIVERY: 'Order is out for delivery / Sifariş çatdırılma üçün çıxıb',
    DELIVERED: 'Order has been delivered / Sifariş çatdırıldı',
    CANCELLED: 'Order has been cancelled / Sifariş ləğv edildi',
    RETURNED: 'Order has been returned / Sifariş qaytarıldı',
  };

  return descriptions[status] || `Order status: ${status}`;
}

/**
 * Get order tracking timeline / Sifariş izləmə zaman xəttini al
 */
export async function getOrderTrackingTimeline(orderId: string): Promise<OrderTrackingUpdate[]> {
  try {
    const readClient = await getReadClient();
    
    // Get order with status history / Status tarixçəsi ilə sifarişi al
    const order = await (readClient as any).order.findUnique({
      where: { id: orderId },
      include: {
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
        shipping: {
          include: {
            courier: true,
            trackingEvents: {
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
    });

    if (!order) {
      return [];
    }

    const timeline: OrderTrackingUpdate[] = [];

    // Add status history events / Status tarixçəsi hadisələrini əlavə et
    if (order.statusHistory) {
      order.statusHistory.forEach((event: any) => {
        timeline.push({
          orderId: order.id,
          status: event.status,
          timestamp: new Date(event.createdAt),
          description: getStatusDescription(event.status),
        });
      });
    }

    // Add shipping tracking events / Çatdırılma izləmə hadisələrini əlavə et
    if (order.shipping?.trackingEvents) {
      order.shipping.trackingEvents.forEach((event: any) => {
        timeline.push({
          orderId: order.id,
          status: event.status || order.status,
          location: event.location
            ? {
                latitude: event.location.latitude,
                longitude: event.location.longitude,
                address: event.location.address,
              }
            : undefined,
          timestamp: new Date(event.createdAt),
          description: event.description || getStatusDescription(event.status || order.status),
        });
      });
    }

    // Sort by timestamp / Timestamp-ə görə sırala
    timeline.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return timeline;
  } catch (error) {
    logger.error('Error getting order tracking timeline / Sifariş izləmə zaman xəttini almaq xətası', error);
    return [];
  }
}

