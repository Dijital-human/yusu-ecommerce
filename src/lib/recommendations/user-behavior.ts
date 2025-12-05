/**
 * User Behavior Tracking Service / İstifadəçi Davranışı İzləmə Xidməti
 * Tracks user behavior for ML-based recommendations / ML-based tövsiyələr üçün istifadəçi davranışını izləyir
 */

import { getWriteClient, getReadClient } from "@/lib/db/query-client";

export interface UserBehaviorEvent {
  userId: string;
  productId?: string;
  eventType: "view" | "purchase" | "cart_add" | "cart_remove" | "wishlist_add" | "wishlist_remove" | "search";
  metadata?: {
    query?: string;
    categoryId?: string;
    price?: number;
    rating?: number;
  };
  timestamp: Date;
}

/**
 * Track user behavior event / İstifadəçi davranış hadisəsini izlə
 */
export async function trackUserBehavior(event: UserBehaviorEvent): Promise<void> {
  try {
    const writeClient = await getWriteClient();
    
    // Store in RecommendationEvent table for ML recommendations
    // ML tövsiyələri üçün RecommendationEvent cədvəlində saxla
    if (event.productId) {
      await (writeClient as any).recommendationEvent.create({
        data: {
          productId: event.productId,
          recommendationType: `user_behavior_${event.eventType}`,
          userId: event.userId,
          eventType: event.eventType === 'view' ? 'impression' : 
                     event.eventType === 'purchase' ? 'purchase' : 
                     event.eventType === 'cart_add' ? 'add_to_cart' : 'click',
          timestamp: event.timestamp || new Date(),
        },
      });
    }
    
    // Also track in RecentlyViewed for view events
    // Həmçinin view hadisələri üçün RecentlyViewed-də izlə
    if (event.eventType === 'view' && event.productId && event.userId) {
      try {
        await (writeClient as any).recentlyViewed.upsert({
          where: {
            userId_productId: {
              userId: event.userId,
              productId: event.productId,
            },
          },
          update: {
            viewedAt: event.timestamp || new Date(),
          },
          create: {
            userId: event.userId,
            productId: event.productId,
            viewedAt: event.timestamp || new Date(),
          },
        });
      } catch (err) {
        // Ignore errors for recently viewed tracking
        // Recently viewed izləməsi üçün xətaları nəzərə alma
      }
    }
  } catch (error) {
    console.error("Error tracking user behavior:", error);
    // Don't throw - tracking should not break the main flow
    // Atma - izləmə əsas axını pozmamalıdır
  }
}

/**
 * Get user behavior history / İstifadəçi davranış tarixçəsini al
 */
export async function getUserBehaviorHistory(
  userId: string,
  eventTypes?: string[],
  limit: number = 100
): Promise<UserBehaviorEvent[]> {
  try {
    const readClient = await getReadClient();
    
    // Query user behavior from RecommendationEvent table
    // RecommendationEvent cədvəlindən istifadəçi davranışını sorğula
    const where: any = {
      userId,
    };
    
    if (eventTypes && eventTypes.length > 0) {
      where.eventType = {
        in: eventTypes.map(type => 
          type === 'view' ? 'impression' : 
          type === 'purchase' ? 'purchase' : 
          type === 'cart_add' ? 'add_to_cart' : 'click'
        ),
      };
    }
    
    const events = await (readClient as any).recommendationEvent.findMany({
      where,
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            categoryId: true,
          },
        },
      },
    });
    
    return events.map((event: any) => ({
      userId: event.userId || userId,
      productId: event.productId,
      eventType: event.eventType === 'impression' ? 'view' :
                 event.eventType === 'purchase' ? 'purchase' :
                 event.eventType === 'add_to_cart' ? 'cart_add' : 'view',
      metadata: {
        categoryId: event.product?.categoryId,
        price: event.product?.price ? Number(event.product.price) : undefined,
      },
      timestamp: event.timestamp,
    }));
  } catch (error) {
    console.error("Error fetching user behavior history:", error);
    return [];
  }
}

/**
 * Get user preferences based on behavior / Davranışa əsasən istifadəçi üstünlüklərini al
 */
export async function getUserPreferences(userId: string): Promise<{
  preferredCategories: string[];
  priceRange: { min: number; max: number };
  preferredBrands: string[];
}> {
  try {
    const readClient = await getReadClient();
    
    // Analyze user behavior to extract preferences
    // İstifadəçi davranışını təhlil edərək üstünlükləri çıxar
    
    // Get user's order history / İstifadəçinin sifariş tarixçəsini al
    const orders = await (readClient as any).order.findMany({
      where: {
        customerId: userId,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      take: 50,
    });

    // Extract preferences / Üstünlükləri çıxar
    const categoryCounts = new Map<string, number>();
    const prices: number[] = [];
    const brands = new Set<string>();

    orders.forEach((order: any) => {
      order.items.forEach((item: any) => {
        const product = item.product;
        if (product.category) {
          categoryCounts.set(
            product.category.name,
            (categoryCounts.get(product.category.name) || 0) + 1
          );
        }
        prices.push(Number(product.price));
      });
    });

    const preferredCategories = Array.from(categoryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category]) => category);

    const priceRange = {
      min: prices.length > 0 ? Math.min(...prices) : 0,
      max: prices.length > 0 ? Math.max(...prices) : 10000,
    };

    return {
      preferredCategories,
      priceRange,
      preferredBrands: Array.from(brands),
    };
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return {
      preferredCategories: [],
      priceRange: { min: 0, max: 10000 },
      preferredBrands: [],
    };
  }
}

