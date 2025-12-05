/**
 * Cart Analytics Service / Səbət Analitika Xidməti
 * Provides cart abandonment analytics
 * Səbət tərk etmə analitikası təmin edir
 */

import { prisma } from "@/lib/db";
import { parsePrice } from "@/lib/utils/price-helpers";
import { logger } from "@/lib/utils/logger";

export interface CartAbandonmentMetrics {
  totalAbandonedCarts: number;
  abandonedCartValue: number;
  abandonmentRate: number;
  averageAbandonedCartValue: number;
  topAbandonedProducts: Array<{
    productId: string;
    productName: string;
    abandonmentCount: number;
    totalValue: number;
  }>;
  abandonmentByTimeframe: {
    last24Hours: number;
    last48Hours: number;
    last7Days: number;
  };
}

export interface CartAbandonmentFilters {
  startDate?: Date;
  endDate?: Date;
  sellerId?: string;
  categoryId?: string;
}

/**
 * Calculate cart abandonment metrics / Səbət tərk etmə metrikalarını hesabla
 */
export async function calculateCartAbandonmentMetrics(
  filters?: CartAbandonmentFilters
): Promise<CartAbandonmentMetrics> {
  try {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last48Hours = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Build where clause for cart items / Səbət elementləri üçün where şərtini qur
    const cartWhere: any = {
      createdAt: {
        gte: filters?.startDate || last7Days,
        lte: filters?.endDate || now,
      },
    };

    // Get all cart items in the timeframe / Vaxt aralığındakı bütün səbət elementlərini al
    const cartItems = await prisma.cartItem.findMany({
      where: cartWhere,
      include: {
        product: {
          include: {
            category: true,
            seller: true,
          },
        },
        user: true,
      },
    });

    // Get all orders in the same timeframe / Eyni vaxt aralığındakı bütün sifarişləri al
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: filters?.startDate || last7Days,
          lte: filters?.endDate || now,
        },
        status: {
          notIn: ['CANCELLED', 'PAYMENT_FAILED'],
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Create a set of user-product pairs that were ordered / Sifariş verilmiş istifadəçi-məhsul cütlərinin çoxluğunu yarat
    const orderedPairs = new Set<string>();
    orders.forEach(order => {
      order.items.forEach(item => {
        orderedPairs.add(`${order.customerId}-${item.productId}`);
      });
    });

    // Group cart items by user / Səbət elementlərini istifadəçiyə görə qruplaşdır
    const userCarts = new Map<string, Array<typeof cartItems[0]>>();
    cartItems.forEach(item => {
      if (!userCarts.has(item.userId)) {
        userCarts.set(item.userId, []);
      }
      userCarts.get(item.userId)!.push(item);
    });

    // Calculate abandoned carts / Tərk edilmiş səbətləri hesabla
    const abandonedCarts: Array<{
      userId: string;
      items: typeof cartItems;
      value: number;
      createdAt: Date;
    }> = [];

    userCarts.forEach((items, userId) => {
      // Check if any item in this cart was ordered / Bu səbətdə hər hansı elementin sifariş verilib-verilmədiyini yoxla
      const hasOrderedItems = items.some(item => 
        orderedPairs.has(`${userId}-${item.productId}`)
      );

      if (!hasOrderedItems) {
        // This is an abandoned cart / Bu tərk edilmiş səbətdir
        const value = items.reduce((sum, item) => {
          return sum + parsePrice(item.product.price) * item.quantity;
        }, 0);

        abandonedCarts.push({
          userId,
          items,
          value,
          createdAt: items[0].createdAt, // Use oldest item's createdAt / Ən köhnə elementin createdAt-ini istifadə et
        });
      }
    });

    // Apply seller and category filters / Satıcı və kateqoriya filtrlərini tətbiq et
    let filteredAbandonedCarts = abandonedCarts;
    if (filters?.sellerId || filters?.categoryId) {
      filteredAbandonedCarts = abandonedCarts.filter(cart => {
        if (filters?.sellerId) {
          const hasSellerProduct = cart.items.some(item => 
            item.product.sellerId === filters.sellerId
          );
          if (!hasSellerProduct) return false;
        }
        if (filters?.categoryId) {
          const hasCategoryProduct = cart.items.some(item => 
            item.product.categoryId === filters.categoryId
          );
          if (!hasCategoryProduct) return false;
        }
        return true;
      });
    }

    // Calculate metrics / Metrikaları hesabla
    const totalAbandonedCarts = filteredAbandonedCarts.length;
    const abandonedCartValue = filteredAbandonedCarts.reduce((sum, cart) => sum + cart.value, 0);
    const averageAbandonedCartValue = totalAbandonedCarts > 0 
      ? abandonedCartValue / totalAbandonedCarts 
      : 0;

    // Calculate total carts for abandonment rate / Tərk etmə dərəcəsi üçün ümumi səbətləri hesabla
    const totalCarts = userCarts.size;
    const abandonmentRate = totalCarts > 0 
      ? (totalAbandonedCarts / totalCarts) * 100 
      : 0;

    // Calculate abandonment by timeframe / Vaxt çərçivəsinə görə tərk etməni hesabla
    const abandonmentByTimeframe = {
      last24Hours: filteredAbandonedCarts.filter(cart => 
        cart.createdAt >= last24Hours
      ).length,
      last48Hours: filteredAbandonedCarts.filter(cart => 
        cart.createdAt >= last48Hours
      ).length,
      last7Days: filteredAbandonedCarts.filter(cart => 
        cart.createdAt >= last7Days
      ).length,
    };

    // Calculate top abandoned products / Ən çox tərk edilən məhsulları hesabla
    const productAbandonment = new Map<string, {
      productId: string;
      productName: string;
      abandonmentCount: number;
      totalValue: number;
    }>();

    filteredAbandonedCarts.forEach(cart => {
      cart.items.forEach(item => {
        const key = item.productId;
        if (!productAbandonment.has(key)) {
          productAbandonment.set(key, {
            productId: item.productId,
            productName: item.product.name,
            abandonmentCount: 0,
            totalValue: 0,
          });
        }
        const product = productAbandonment.get(key)!;
        product.abandonmentCount += 1;
        product.totalValue += parsePrice(item.product.price) * item.quantity;
      });
    });

    const topAbandonedProducts = Array.from(productAbandonment.values())
      .sort((a, b) => b.abandonmentCount - a.abandonmentCount)
      .slice(0, 10);

    return {
      totalAbandonedCarts,
      abandonedCartValue,
      abandonmentRate,
      averageAbandonedCartValue,
      topAbandonedProducts,
      abandonmentByTimeframe,
    };
  } catch (error) {
    logger.error('Failed to calculate cart abandonment metrics / Səbət tərk etmə metrikalarını hesablamaq uğursuz oldu', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

