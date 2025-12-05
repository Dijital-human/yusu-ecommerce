/**
 * Real-Time Service / Real-Time Xidməti
 * Centralized real-time service for order status, stock, and cart updates
 * Sifariş statusu, stok və səbət yeniləmələri üçün mərkəzləşdirilmiş real-time xidmət
 */

import { emitRealtimeEvent, RealtimeEventType } from './sse';
import { logger } from '@/lib/utils/logger';
import { prisma } from '@/lib/db';

/**
 * Emit order status update / Sifariş status yeniləməsini emit et
 */
export async function emitOrderStatusUpdate(
  orderId: string,
  status: string,
  userId: string
): Promise<void> {
  try {
    // Fetch order details / Sifariş təfərrüatlarını al
    // Note: Using orders (plural) as per Prisma schema mapping / Qeyd: Prisma schema mapping-ə görə orders (çoğul) istifadə edilir
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        totalAmount: true,
      },
    });

    if (!order) {
      logger.warn(`Order not found for real-time update: ${orderId} / Real-time yeniləmə üçün sifariş tapılmadı: ${orderId}`);
      return;
    }

    // Get item count separately / Element sayını ayrıca al
    const itemCount = await prisma.order_items.count({
      where: { orderId: order.id },
    });

    emitRealtimeEvent('order.status.update', {
      orderId: order.id,
      status,
      total: parseFloat(order.totalAmount.toString()),
      itemCount,
    }, userId);

    logger.info('Order status update emitted / Sifariş status yeniləməsi emit edildi', {
      orderId,
      status,
      userId,
    });
  } catch (error) {
    logger.error('Failed to emit order status update / Sifariş status yeniləməsini emit etmək uğursuz oldu', error instanceof Error ? error : new Error(String(error)), {
      orderId,
      status,
      userId,
    });
  }
}

/**
 * Emit stock update / Stok yeniləməsini emit et
 */
export async function emitStockUpdate(
  productId: string,
  stock: number,
  previousStock: number
): Promise<void> {
  try {
    // Fetch product details / Məhsul təfərrüatlarını al
    // Note: Using products (plural) as per Prisma schema mapping / Qeyd: Prisma schema mapping-ə görə products (çoğul) istifadə edilir
    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        stock: true,
        isActive: true,
      },
    });

    if (!product) {
      logger.warn(`Product not found for stock update: ${productId} / Stok yeniləməsi üçün məhsul tapılmadı: ${productId}`);
      return;
    }

    // Only emit if stock changed significantly or became 0 / Yalnız əhəmiyyətli dəyişiklik və ya 0 olduqda emit et
    if (stock !== previousStock && (Math.abs(stock - previousStock) > 5 || stock === 0 || previousStock === 0)) {
      emitRealtimeEvent('product.stock.update', {
        productId: product.id,
        productName: product.name,
        stock,
        previousStock,
        isOutOfStock: stock === 0,
      });

      logger.info('Stock update emitted / Stok yeniləməsi emit edildi', {
        productId,
        stock,
        previousStock,
      });
    }
  } catch (error) {
    logger.error('Failed to emit stock update / Stok yeniləməsini emit etmək uğursuz oldu', error instanceof Error ? error : new Error(String(error)), {
      productId,
      stock,
    });
  }
}

/**
 * Emit price update / Qiymət yeniləməsini emit et
 */
export async function emitPriceUpdate(
  productId: string,
  price: number,
  previousPrice: number
): Promise<void> {
  try {
    // Fetch product details / Məhsul təfərrüatlarını al
    // Note: Using products (plural) as per Prisma schema mapping / Qeyd: Prisma schema mapping-ə görə products (çoğul) istifadə edilir
    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        price: true,
      },
    });

    if (!product) {
      logger.warn(`Product not found for price update: ${productId} / Qiymət yeniləməsi üçün məhsul tapılmadı: ${productId}`);
      return;
    }

    // Only emit if price changed significantly (>5%) / Yalnız əhəmiyyətli dəyişiklikdə (>5%) emit et
    const priceChangePercent = Math.abs((price - previousPrice) / previousPrice) * 100;
    if (priceChangePercent > 5) {
      emitRealtimeEvent('product.price.update', {
        productId: product.id,
        productName: product.name,
        price,
        previousPrice,
        priceChangePercent: Math.round(priceChangePercent * 100) / 100,
        isPriceIncrease: price > previousPrice,
      });

      logger.info('Price update emitted / Qiymət yeniləməsi emit edildi', {
        productId,
        price,
        previousPrice,
        priceChangePercent,
      });
    }
  } catch (error) {
    logger.error('Failed to emit price update / Qiymət yeniləməsini emit etmək uğursuz oldu', error instanceof Error ? error : new Error(String(error)), {
      productId,
      price,
    });
  }
}

/**
 * Emit cart update / Səbət yeniləməsini emit et
 */
export function emitCartUpdate(userId: string, cartData: {
  itemCount: number;
  total: number;
  items: Array<{ productId: string; quantity: number }>;
}): void {
  try {
    emitRealtimeEvent('cart.update', {
      itemCount: cartData.itemCount,
      total: cartData.total,
      items: cartData.items,
    }, userId);

    logger.debug('Cart update emitted / Səbət yeniləməsi emit edildi', {
      userId,
      itemCount: cartData.itemCount,
    });
  } catch (error) {
    logger.error('Failed to emit cart update / Səbət yeniləməsini emit etmək uğursuz oldu', error instanceof Error ? error : new Error(String(error)), {
      userId,
    });
  }
}

/**
 * Emit new product notification / Yeni məhsul bildirişini emit et
 */
export async function emitNewProductNotification(productId: string): Promise<void> {
  try {
    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        categoryId: true,
      },
    });

    if (!product) {
      return;
    }

    // Get category name separately / Kateqoriya adını ayrıca al
    const category = await prisma.categories.findUnique({
      where: { id: product.categoryId },
      select: {
        id: true,
        name: true,
      },
    });

    emitRealtimeEvent('product.new', {
      productId: product.id,
      productName: product.name,
      categoryId: product.categoryId,
      categoryName: category?.name || '',
    });

    logger.info('New product notification emitted / Yeni məhsul bildirişi emit edildi', {
      productId,
    });
  } catch (error) {
    logger.error('Failed to emit new product notification / Yeni məhsul bildirişini emit etmək uğursuz oldu', error instanceof Error ? error : new Error(String(error)), {
      productId,
    });
  }
}

