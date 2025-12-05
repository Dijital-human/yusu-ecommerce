/**
 * Customer Behavior Analytics Service / Müştəri Davranışı Analitika Xidməti
 * Provides customer behavior analytics
 * Müştəri davranışı analitikası təmin edir
 */

import { prisma } from "@/lib/db";
import { parsePrice } from "@/lib/utils/price-helpers";
import { logger } from "@/lib/utils/logger";

export interface CustomerBehaviorMetrics {
  cartAbandonment: {
    productsAddedToCartButNotPurchased: number;
    totalValue: number;
    topProducts: Array<{
      productId: string;
      productName: string;
      abandonmentCount: number;
      totalValue: number;
    }>;
  };
  wishlistAbandonment: {
    productsAddedToWishlistButNotPurchased: number;
    totalValue: number;
    topProducts: Array<{
      productId: string;
      productName: string;
      abandonmentCount: number;
      totalValue: number;
    }>;
  };
  viewAbandonment: {
    productsViewedButNotAddedToCart: number;
    topProducts: Array<{
      productId: string;
      productName: string;
      viewCount: number;
    }>;
  };
  sessionMetrics: {
    averageSessionDuration: number; // in seconds / saniyələrlə
    bounceRate: number; // percentage / faiz
    returnCustomerRate: number; // percentage / faiz
  };
}

export interface CustomerBehaviorFilters {
  startDate?: Date;
  endDate?: Date;
  customerSegment?: string; // 'new', 'returning', 'vip'
}

/**
 * Calculate customer behavior metrics / Müştəri davranışı metrikalarını hesabla
 */
export async function calculateCustomerBehaviorMetrics(
  filters?: CustomerBehaviorFilters
): Promise<CustomerBehaviorMetrics> {
  try {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const startDate = filters?.startDate || last30Days;
    const endDate = filters?.endDate || now;

    // Get all cart items / Bütün səbət elementlərini al
    const cartItems = await prisma.cartItem.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        product: true,
        user: true,
      },
    });

    // Get all wishlist items / Bütün istək siyahısı elementlərini al
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        product: true,
        user: true,
      },
    });

    // Get all orders / Bütün sifarişləri al
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
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

    // Create sets of purchased products by user / İstifadəçiyə görə satın alınmış məhsulların çoxluğunu yarat
    const purchasedPairs = new Set<string>();
    orders.forEach(order => {
      order.items.forEach(item => {
        purchasedPairs.add(`${order.customerId}-${item.productId}`);
      });
    });

    // Calculate cart abandonment / Səbət tərk etməsini hesabla
    const cartAbandonmentProducts = new Map<string, {
      productId: string;
      productName: string;
      abandonmentCount: number;
      totalValue: number;
    }>();

    let cartAbandonmentTotalValue = 0;
    let cartAbandonmentCount = 0;

    cartItems.forEach(item => {
      const pair = `${item.userId}-${item.productId}`;
      if (!purchasedPairs.has(pair)) {
        cartAbandonmentCount++;
        const value = parsePrice(item.product.price) * item.quantity;
        cartAbandonmentTotalValue += value;

        const key = item.productId;
        if (!cartAbandonmentProducts.has(key)) {
          cartAbandonmentProducts.set(key, {
            productId: item.productId,
            productName: item.product.name,
            abandonmentCount: 0,
            totalValue: 0,
          });
        }
        const product = cartAbandonmentProducts.get(key)!;
        product.abandonmentCount += 1;
        product.totalValue += value;
      }
    });

    // Calculate wishlist abandonment / İstək siyahısı tərk etməsini hesabla
    const wishlistAbandonmentProducts = new Map<string, {
      productId: string;
      productName: string;
      abandonmentCount: number;
      totalValue: number;
    }>();

    let wishlistAbandonmentTotalValue = 0;
    let wishlistAbandonmentCount = 0;

    wishlistItems.forEach(item => {
      const pair = `${item.userId}-${item.productId}`;
      if (!purchasedPairs.has(pair)) {
        wishlistAbandonmentCount++;
        const value = parsePrice(item.product.price);
        wishlistAbandonmentTotalValue += value;

        const key = item.productId;
        if (!wishlistAbandonmentProducts.has(key)) {
          wishlistAbandonmentProducts.set(key, {
            productId: item.productId,
            productName: item.product.name,
            abandonmentCount: 0,
            totalValue: 0,
          });
        }
        const product = wishlistAbandonmentProducts.get(key)!;
        product.abandonmentCount += 1;
        product.totalValue += value;
      }
    });

    // Get product views (from search_history or analytics) / Məhsul baxışları (search_history və ya analytics-dən)
    // Note: This is a simplified version. In production, you'd track product views separately
    // Qeyd: Bu sadələşdirilmiş versiyadır. Production-da məhsul baxışlarını ayrıca izləməlisiniz
    const productViews = await prisma.search_history.findMany({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        query: true,
        userId: true,
      },
    });

    // For view abandonment, we'll use a simplified approach
    // View abandonment üçün sadələşdirilmiş yanaşma istifadə edəcəyik
    const viewAbandonmentProducts = new Map<string, {
      productId: string;
      productName: string;
      viewCount: number;
    }>();

    // This is a placeholder - in production, track actual product views
    // Bu placeholder-dır - production-da faktiki məhsul baxışlarını izləyin

    // Calculate session metrics (simplified) / Sessiya metrikalarını hesabla (sadələşdirilmiş)
    // Note: In production, you'd track sessions separately
    // Qeyd: Production-da sessiyaları ayrıca izləməlisiniz
    const uniqueUsers = new Set([
      ...cartItems.map(item => item.userId),
      ...wishlistItems.map(item => item.userId),
      ...orders.map(order => order.customerId),
    ]);

    const totalUsers = uniqueUsers.size;
    const returningUsers = new Set<string>();
    
    // Check for returning users (users with multiple orders) / Qayıdan istifadəçiləri yoxla (çoxlu sifarişi olan istifadəçilər)
    const userOrderCounts = new Map<string, number>();
    orders.forEach(order => {
      const count = userOrderCounts.get(order.customerId) || 0;
      userOrderCounts.set(order.customerId, count + 1);
      if (count > 0) {
        returningUsers.add(order.customerId);
      }
    });

    const returnCustomerRate = totalUsers > 0
      ? (returningUsers.size / totalUsers) * 100
      : 0;

    // Simplified metrics - in production, track actual session data
    // Sadələşdirilmiş metrikalar - production-da faktiki sessiya məlumatlarını izləyin
    const averageSessionDuration = 180; // Placeholder: 3 minutes / Placeholder: 3 dəqiqə
    const bounceRate = 35; // Placeholder: 35% / Placeholder: 35%

    return {
      cartAbandonment: {
        productsAddedToCartButNotPurchased: cartAbandonmentCount,
        totalValue: cartAbandonmentTotalValue,
        topProducts: Array.from(cartAbandonmentProducts.values())
          .sort((a, b) => b.abandonmentCount - a.abandonmentCount)
          .slice(0, 10),
      },
      wishlistAbandonment: {
        productsAddedToWishlistButNotPurchased: wishlistAbandonmentCount,
        totalValue: wishlistAbandonmentTotalValue,
        topProducts: Array.from(wishlistAbandonmentProducts.values())
          .sort((a, b) => b.abandonmentCount - a.abandonmentCount)
          .slice(0, 10),
      },
      viewAbandonment: {
        productsViewedButNotAddedToCart: 0, // Placeholder / Placeholder
        topProducts: [], // Placeholder / Placeholder
      },
      sessionMetrics: {
        averageSessionDuration,
        bounceRate,
        returnCustomerRate,
      },
    };
  } catch (error) {
    logger.error('Failed to calculate customer behavior metrics / Müştəri davranışı metrikalarını hesablamaq uğursuz oldu', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

