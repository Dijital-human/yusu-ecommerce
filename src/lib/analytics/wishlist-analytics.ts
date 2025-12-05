/**
 * Wishlist Analytics Service / İstək Siyahısı Analitika Xidməti
 * Provides wishlist conversion analytics
 * İstək siyahısı çevrilmə analitikası təmin edir
 */

import { prisma } from "@/lib/db";
import { parsePrice } from "@/lib/utils/price-helpers";
import { logger } from "@/lib/utils/logger";

export interface WishlistConversionMetrics {
  wishlistToCartRate: number;
  wishlistToOrderRate: number;
  averageTimeToPurchase: number; // in hours / saatlarla
  topWishlistedProducts: Array<{
    productId: string;
    productName: string;
    wishlistCount: number;
    cartConversionCount: number;
    orderConversionCount: number;
  }>;
  wishlistAbandonmentRate: number;
  totalWishlistItems: number;
  totalWishlistUsers: number;
}

export interface WishlistConversionFilters {
  startDate?: Date;
  endDate?: Date;
  productId?: string;
}

/**
 * Calculate wishlist conversion metrics / İstək siyahısı çevrilmə metrikalarını hesabla
 */
export async function calculateWishlistConversionMetrics(
  filters?: WishlistConversionFilters
): Promise<WishlistConversionMetrics> {
  try {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Build where clause for wishlist items / İstək siyahısı elementləri üçün where şərtini qur
    const wishlistWhere: any = {
      createdAt: {
        gte: filters?.startDate || last30Days,
        lte: filters?.endDate || now,
      },
    };

    if (filters?.productId) {
      wishlistWhere.productId = filters.productId;
    }

    // Get all wishlist items in the timeframe / Vaxt aralığındakı bütün istək siyahısı elementlərini al
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: wishlistWhere,
      include: {
        product: true,
        user: true,
      },
    });

    // Get all cart items / Bütün səbət elementlərini al
    const cartItems = await prisma.cartItem.findMany({
      where: {
        createdAt: {
          gte: filters?.startDate || last30Days,
          lte: filters?.endDate || now,
        },
      },
      include: {
        product: true,
      },
    });

    // Get all orders / Bütün sifarişləri al
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: filters?.startDate || last30Days,
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

    // Create sets for tracking conversions / Çevrilmələri izləmək üçün çoxluqlar yarat
    const wishlistToCartPairs = new Set<string>();
    const wishlistToOrderPairs = new Set<string>();
    const wishlistToOrderTimes: number[] = [];

    // Track wishlist to cart conversions / İstək siyahısından səbətə çevrilmələri izlə
    wishlistItems.forEach(wishlistItem => {
      const pair = `${wishlistItem.userId}-${wishlistItem.productId}`;
      
      // Check if added to cart / Səbətə əlavə olunub-olunmadığını yoxla
      const cartItem = cartItems.find(item => 
        item.userId === wishlistItem.userId && 
        item.productId === wishlistItem.productId &&
        item.createdAt >= wishlistItem.createdAt
      );
      
      if (cartItem) {
        wishlistToCartPairs.add(pair);
      }

      // Check if ordered / Sifariş verilib-verilmədiyini yoxla
      const order = orders.find(order => {
        if (order.customerId !== wishlistItem.userId) return false;
        return order.items.some(item => 
          item.productId === wishlistItem.productId &&
          order.createdAt >= wishlistItem.createdAt
        );
      });

      if (order) {
        wishlistToOrderPairs.add(pair);
        
        // Calculate time to purchase / Satın alma vaxtını hesabla
        const timeToPurchase = (order.createdAt.getTime() - wishlistItem.createdAt.getTime()) / (1000 * 60 * 60); // hours
        wishlistToOrderTimes.push(timeToPurchase);
      }
    });

    // Calculate metrics / Metrikaları hesabla
    const totalWishlistItems = wishlistItems.length;
    const wishlistToCartCount = wishlistToCartPairs.size;
    const wishlistToOrderCount = wishlistToOrderPairs.size;

    const wishlistToCartRate = totalWishlistItems > 0 
      ? (wishlistToCartCount / totalWishlistItems) * 100 
      : 0;

    const wishlistToOrderRate = totalWishlistItems > 0 
      ? (wishlistToOrderCount / totalWishlistItems) * 100 
      : 0;

    const averageTimeToPurchase = wishlistToOrderTimes.length > 0
      ? wishlistToOrderTimes.reduce((sum, time) => sum + time, 0) / wishlistToOrderTimes.length
      : 0;

    const wishlistAbandonmentRate = totalWishlistItems > 0
      ? ((totalWishlistItems - wishlistToOrderCount) / totalWishlistItems) * 100
      : 0;

    // Get unique users / Unikal istifadəçiləri al
    const uniqueUsers = new Set(wishlistItems.map(item => item.userId));
    const totalWishlistUsers = uniqueUsers.size;

    // Calculate top wishlisted products / Ən çox istək siyahısına əlavə edilən məhsulları hesabla
    const productStats = new Map<string, {
      productId: string;
      productName: string;
      wishlistCount: number;
      cartConversionCount: number;
      orderConversionCount: number;
    }>();

    wishlistItems.forEach(item => {
      const key = item.productId;
      if (!productStats.has(key)) {
        productStats.set(key, {
          productId: item.productId,
          productName: item.product.name,
          wishlistCount: 0,
          cartConversionCount: 0,
          orderConversionCount: 0,
        });
      }
      const stats = productStats.get(key)!;
      stats.wishlistCount += 1;

      const pair = `${item.userId}-${item.productId}`;
      if (wishlistToCartPairs.has(pair)) {
        stats.cartConversionCount += 1;
      }
      if (wishlistToOrderPairs.has(pair)) {
        stats.orderConversionCount += 1;
      }
    });

    const topWishlistedProducts = Array.from(productStats.values())
      .sort((a, b) => b.wishlistCount - a.wishlistCount)
      .slice(0, 10);

    return {
      wishlistToCartRate,
      wishlistToOrderRate,
      averageTimeToPurchase,
      topWishlistedProducts,
      wishlistAbandonmentRate,
      totalWishlistItems,
      totalWishlistUsers,
    };
  } catch (error) {
    logger.error('Failed to calculate wishlist conversion metrics / İstək siyahısı çevrilmə metrikalarını hesablamaq uğursuz oldu', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

