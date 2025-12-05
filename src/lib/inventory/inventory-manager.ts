/**
 * Advanced Inventory Manager / İrəliləmiş Anbar Meneceri
 * Provides advanced inventory management features
 * İrəliləmiş anbar idarəetmə xüsusiyyətləri təmin edir
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/utils/logger';
import { cache, cacheKeys } from '@/lib/cache/cache-wrapper';
import { emitRealtimeEvent } from '@/lib/realtime/sse';

/**
 * Stock reservation interface / Stok rezervasiyası interfeysi
 */
export interface StockReservation {
  id: string;
  productId: string;
  quantity: number;
  orderId?: string;
  userId?: string;
  expiresAt: Date;
  status: 'pending' | 'confirmed' | 'expired' | 'cancelled';
}

/**
 * Low stock alert interface / Aşağı stok xəbərdarlığı interfeysi
 */
export interface LowStockAlert {
  productId: string;
  productName: string;
  currentStock: number;
  minStock: number;
  sellerId: string;
  severity: 'low' | 'critical' | 'out_of_stock';
}

/**
 * Stock forecast interface / Stok proqnozu interfeysi
 */
export interface StockForecast {
  productId: string;
  currentStock: number;
  predictedDemand: number;
  daysUntilOutOfStock: number;
  recommendedOrderQuantity: number;
}

// In-memory stock reservations (in production, use Redis or database)
// Yaddaşda stok rezervasiyaları (production-da Redis və ya veritabanı istifadə edin)
const stockReservations = new Map<string, StockReservation>();

/**
 * Reserve stock for an order / Sifariş üçün stok rezerv et
 */
export async function reserveStock(
  productId: string,
  quantity: number,
  orderId?: string,
  userId?: string,
  reservationTTL: number = 15 * 60 * 1000 // 15 minutes default / 15 dəqiqə default
): Promise<StockReservation | null> {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, stock: true, name: true, sellerId: true },
    });

    if (!product) {
      logger.error('Product not found for stock reservation / Stok rezervasiyası üçün məhsul tapılmadı', undefined, { productId });
      return null;
    }

    // Check available stock (excluding pending reservations) / Mövcud stoku yoxla (gözləyən rezervasiyalar istisna olmaqla)
    const availableStock = await getAvailableStock(productId);

    if (availableStock < quantity) {
      logger.warn('Insufficient stock for reservation / Rezervasiya üçün kifayət qədər stok yoxdur', { productId, quantity, availableStock });
      return null;
    }

    const reservation: StockReservation = {
      id: `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productId,
      quantity,
      orderId,
      userId,
      expiresAt: new Date(Date.now() + reservationTTL),
      status: 'pending',
    };

    stockReservations.set(reservation.id, reservation);

    // Schedule expiration check / Son istifadə tarixi yoxlamasını planlaşdır
    setTimeout(() => {
      expireReservation(reservation.id).catch(err => 
        logger.error('Failed to expire reservation / Rezervasiyanı sona çatdırmaq uğursuz oldu', err)
      );
    }, reservationTTL);

    // Invalidate product cache / Məhsul cache-i invalide et
    await cache.delete(cacheKeys.productDetails(productId));

    logger.info('Stock reserved / Stok rezerv edildi', { reservationId: reservation.id, productId, quantity });

    return reservation;
  } catch (error) {
    logger.error('Failed to reserve stock / Stok rezerv etmək uğursuz oldu', error, { productId, quantity });
    return null;
  }
}

/**
 * Confirm stock reservation / Stok rezervasiyasını təsdiq et
 */
export async function confirmReservation(reservationId: string): Promise<boolean> {
  try {
    const reservation = stockReservations.get(reservationId);

    if (!reservation || reservation.status !== 'pending') {
      logger.warn('Invalid reservation for confirmation / Təsdiq üçün yanlış rezervasiya', { reservationId });
      return false;
    }

    // Check if reservation expired / Rezervasiyanın sona çatıb-çatmadığını yoxla
    if (new Date() > reservation.expiresAt) {
      reservation.status = 'expired';
      stockReservations.delete(reservationId);
      logger.warn('Reservation expired / Rezervasiya sona çatıb', { reservationId });
      return false;
    }

    // Update product stock / Məhsul stokunu yenilə
    const product = await prisma.product.update({
      where: { id: reservation.productId },
      data: {
        stock: {
          decrement: reservation.quantity,
        },
      },
      select: { id: true, stock: true, name: true, sellerId: true },
    });

    reservation.status = 'confirmed';
    stockReservations.delete(reservationId);

    // Check for low stock alert / Aşağı stok xəbərdarlığını yoxla
    await checkLowStockAlert(product.id, product.sellerId);

    // Invalidate product cache / Məhsul cache-i invalide et
    await cache.delete(cacheKeys.productDetails(reservation.productId));

    // Emit real-time stock update event / Real-time stok yeniləmə hadisəsi yayımla
    emitRealtimeEvent('order.new' as any, {
      productId: reservation.productId,
      newStock: product.stock,
      quantity: reservation.quantity,
      type: 'decrement',
      eventType: 'inventory.stock.updated',
    }, product.sellerId);

    logger.info('Stock reservation confirmed / Stok rezervasiyası təsdiq edildi', { reservationId, productId: reservation.productId, quantity: reservation.quantity });

    return true;
  } catch (error) {
    logger.error('Failed to confirm reservation / Rezervasiyanı təsdiq etmək uğursuz oldu', error, { reservationId });
    return false;
  }
}

/**
 * Cancel stock reservation / Stok rezervasiyasını ləğv et
 */
export async function cancelReservation(reservationId: string): Promise<boolean> {
  try {
    const reservation = stockReservations.get(reservationId);

    if (!reservation) {
      return false;
    }

    reservation.status = 'cancelled';
    stockReservations.delete(reservationId);

    // Invalidate product cache / Məhsul cache-i invalide et
    await cache.delete(cacheKeys.productDetails(reservation.productId));

    logger.info('Stock reservation cancelled / Stok rezervasiyası ləğv edildi', { reservationId });

    return true;
  } catch (error) {
    logger.error('Failed to cancel reservation / Rezervasiyanı ləğv etmək uğursuz oldu', error, { reservationId });
    return false;
  }
}

/**
 * Expire stock reservation / Stok rezervasiyasını sona çatdır
 */
async function expireReservation(reservationId: string): Promise<void> {
  const reservation = stockReservations.get(reservationId);

  if (reservation && reservation.status === 'pending') {
    reservation.status = 'expired';
    stockReservations.delete(reservationId);

    // Invalidate product cache / Məhsul cache-i invalide et
    await cache.delete(cacheKeys.productDetails(reservation.productId));

    logger.info('Stock reservation expired / Stok rezervasiyası sona çatdı', { reservationId });
  }
}

/**
 * Get available stock (excluding pending reservations) / Mövcud stoku al (gözləyən rezervasiyalar istisna olmaqla)
 */
export async function getAvailableStock(productId: string): Promise<number> {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { stock: true },
    });

    if (!product) {
      return 0;
    }

    // Calculate reserved quantity / Rezerv edilmiş miqdarı hesabla
    const reservedQuantity = Array.from(stockReservations.values())
      .filter(res => res.productId === productId && res.status === 'pending')
      .reduce((sum, res) => sum + res.quantity, 0);

    return Math.max(0, product.stock - reservedQuantity);
  } catch (error) {
    logger.error('Failed to get available stock / Mövcud stoku almaq uğursuz oldu', error, { productId });
    return 0;
  }
}

/**
 * Update product stock / Məhsul stokunu yenilə
 */
export async function updateProductStock(
  productId: string,
  quantity: number,
  operation: 'increment' | 'decrement' | 'set' = 'set',
  reason?: string
): Promise<boolean> {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, stock: true, name: true, sellerId: true },
    });

    if (!product) {
      logger.error('Product not found for stock update / Stok yeniləməsi üçün məhsul tapılmadı', undefined, { productId });
      return false;
    }

    let updateData: { stock: number } | { stock: { increment: number } } | { stock: { decrement: number } };

    switch (operation) {
      case 'increment':
        updateData = { stock: { increment: quantity } };
        break;
      case 'decrement':
        updateData = { stock: { decrement: quantity } };
        break;
      case 'set':
      default:
        updateData = { stock: quantity };
        break;
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData,
      select: { id: true, stock: true, name: true, sellerId: true },
    });

    // Check for low stock alert / Aşağı stok xəbərdarlığını yoxla
    await checkLowStockAlert(productId, updatedProduct.sellerId);

    // Invalidate product cache / Məhsul cache-i invalide et
    await cache.delete(cacheKeys.productDetails(productId));

    // Emit real-time stock update event / Real-time stok yeniləmə hadisəsi yayımla
    emitRealtimeEvent('order.new' as any, {
      productId,
      newStock: updatedProduct.stock,
      quantity,
      operation,
      reason,
      eventType: 'inventory.stock.updated',
    }, updatedProduct.sellerId);

    logger.info('Product stock updated / Məhsul stoku yeniləndi', { productId, newStock: updatedProduct.stock, operation, reason });

    return true;
  } catch (error) {
    logger.error('Failed to update product stock / Məhsul stokunu yeniləmək uğursuz oldu', error, { productId, quantity, operation });
    return false;
  }
}

/**
 * Check for low stock alert / Aşağı stok xəbərdarlığını yoxla
 */
async function checkLowStockAlert(productId: string, sellerId: string): Promise<void> {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, stock: true },
    });

    if (!product) {
      return;
    }

    // Default min stock threshold (can be configured per product) / Default minimum stok həddi (məhsul başına konfiqurasiya edilə bilər)
    const minStock = 10; // TODO: Get from product settings or seller preferences / TODO: Məhsul tənzimlərindən və ya satıcı üstünlüklərindən al

    if (product.stock <= 0) {
      // Out of stock alert / Stok bitib xəbərdarlığı
      const alert: LowStockAlert = {
        productId: product.id,
        productName: product.name,
        currentStock: product.stock,
        minStock,
        sellerId,
        severity: 'out_of_stock',
      };

      await sendLowStockAlert(alert);
    } else if (product.stock < minStock) {
      // Low stock alert / Aşağı stok xəbərdarlığı
      const alert: LowStockAlert = {
        productId: product.id,
        productName: product.name,
        currentStock: product.stock,
        minStock,
        sellerId,
        severity: product.stock < minStock / 2 ? 'critical' : 'low',
      };

      await sendLowStockAlert(alert);
    }
  } catch (error) {
    logger.error('Failed to check low stock alert / Aşağı stok xəbərdarlığını yoxlamaq uğursuz oldu', error, { productId });
  }
}

/**
 * Send low stock alert / Aşağı stok xəbərdarlığını göndər
 */
async function sendLowStockAlert(alert: LowStockAlert): Promise<void> {
  try {
    // Emit real-time alert event / Real-time xəbərdarlıq hadisəsi yayımla
    emitRealtimeEvent('order.new' as any, {
      ...alert,
      eventType: 'inventory.low_stock',
    }, alert.sellerId);

    // TODO: Send email notification / TODO: Email bildirişi göndər
    // TODO: Store alert in database / TODO: Xəbərdarlığı veritabanında saxla

    logger.warn('Low stock alert sent / Aşağı stok xəbərdarlığı göndərildi', alert);
  } catch (error) {
    logger.error('Failed to send low stock alert / Aşağı stok xəbərdarlığını göndərmək uğursuz oldu', error, alert);
  }
}

/**
 * Get stock forecast for a product / Məhsul üçün stok proqnozu al
 */
export async function getStockForecast(productId: string, days: number = 30): Promise<StockForecast | null> {
  try {
    const cacheKey = `stock_forecast:${productId}:${days}`;

    // Try to get from cache / Cache-dən almağa cəhd et
    const cached = await cache.get<StockForecast>(cacheKey);
    if (cached) {
      return cached;
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, stock: true, name: true },
    });

    if (!product) {
      return null;
    }

    // Get order history for the product / Məhsul üçün sifariş tarixçəsini al
    const orderItems = await prisma.orderItem.findMany({
      where: {
        productId,
        order: {
          status: { in: ['CONFIRMED', 'DELIVERED'] },
          createdAt: {
            gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000), // Last N days / Son N gün
          },
        },
      },
      select: {
        quantity: true,
        order: {
          select: {
            createdAt: true,
          },
        },
      },
    });

    // Calculate average daily demand / Orta günlük tələbi hesabla
    const totalQuantity = orderItems.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0);
    const averageDailyDemand = days > 0 ? totalQuantity / days : 0;

    // Predict days until out of stock / Stokun bitməsinə qədər günləri proqnozlaşdır
    const daysUntilOutOfStock = averageDailyDemand > 0 
      ? Math.floor(product.stock / averageDailyDemand) 
      : Infinity;

    // Recommended order quantity (safety stock + predicted demand) / Tövsiyə olunan sifariş miqdarı (təhlükəsizlik stoku + proqnozlaşdırılmış tələb)
    const safetyStock = 20; // Days of safety stock / Təhlükəsizlik stoku günləri
    const recommendedOrderQuantity = Math.ceil(averageDailyDemand * (daysUntilOutOfStock + safetyStock));

    const forecast: StockForecast = {
      productId,
      currentStock: product.stock,
      predictedDemand: averageDailyDemand,
      daysUntilOutOfStock: daysUntilOutOfStock === Infinity ? 999 : daysUntilOutOfStock,
      recommendedOrderQuantity: Math.max(0, recommendedOrderQuantity - product.stock),
    };

    // Cache forecast for 1 hour / Proqnozu 1 saat cache et
    await cache.set(cacheKey, forecast, 3600);

    return forecast;
  } catch (error) {
    logger.error('Failed to get stock forecast / Stok proqnozu almaq uğursuz oldu', error, { productId, days });
    return null;
  }
}

/**
 * Get low stock products for a seller / Satıcı üçün aşağı stoklu məhsulları al
 */
export async function getLowStockProducts(sellerId: string, minStock: number = 10): Promise<LowStockAlert[]> {
  try {
    const products = await prisma.product.findMany({
      where: {
        sellerId,
        stock: {
          lte: minStock,
        },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        stock: true,
        sellerId: true,
      },
    });

    return products.map((product: { id: string; name: string; stock: number; sellerId: string }) => ({
      productId: product.id,
      productName: product.name,
      currentStock: product.stock,
      minStock,
      sellerId: product.sellerId,
      severity: product.stock === 0 
        ? 'out_of_stock' 
        : product.stock < minStock / 2 
          ? 'critical' 
          : 'low',
    }));
  } catch (error) {
    logger.error('Failed to get low stock products / Aşağı stoklu məhsulları almaq uğursuz oldu', error, { sellerId });
    return [];
  }
}

