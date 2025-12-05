/**
 * Collaborative Filtering Service / Collaborative Filtering Xidməti
 * Provides collaborative filtering-based recommendations
 * Collaborative filtering əsaslı tövsiyələr təmin edir
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/utils/logger';
import { cache, cacheKeys } from '@/lib/cache/cache-wrapper';
import { cosineSimilarity } from '@/lib/ml/vector-search';

/**
 * User similarity interface / İstifadəçi oxşarlığı interfeysi
 */
export interface UserSimilarity {
  userId: string;
  similarity: number;
  commonProducts: number;
}

/**
 * Item similarity interface / Element oxşarlığı interfeysi
 */
export interface ItemSimilarity {
  productId: string;
  similarity: number;
  commonUsers: number;
}

/**
 * Recommendation result interface / Tövsiyə nəticəsi interfeysi
 */
export interface CollaborativeRecommendation {
  productId: string;
  score: number;
  reason: string;
  basedOn: 'user_similarity' | 'item_similarity';
}

/**
 * Calculate user similarity / İstifadəçi oxşarlığını hesabla
 */
export async function calculateUserSimilarity(
  userId1: string,
  userId2: string
): Promise<number> {
  const cacheKey = `user_similarity:${userId1}:${userId2}`;
  
  // Check cache / Cache-i yoxla
  const cached = await cache.get<number>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  try {
    // Get purchase history for both users / Hər iki istifadəçi üçün alış tarixçəsini al
    const [user1Orders, user2Orders] = await Promise.all([
      prisma.orders.findMany({
        where: {
          customerId: userId1,
          status: {
            in: ['DELIVERED', 'CONFIRMED'],
          },
        },
        include: {
          items: {
            select: {
              productId: true,
              quantity: true,
            },
          },
        },
      }),
      prisma.orders.findMany({
        where: {
          customerId: userId2,
          status: {
            in: ['DELIVERED', 'CONFIRMED'],
          },
        },
        include: {
          items: {
            select: {
              productId: true,
              quantity: true,
            },
          },
        },
      }),
    ]);

    // Build product vectors / Məhsul vektorları yarat
    const user1Products = new Map<string, number>();
    const user2Products = new Map<string, number>();

    user1Orders.forEach((order: any) => {
      order.items.forEach((item: any) => {
        user1Products.set(
          item.productId,
          (user1Products.get(item.productId) || 0) + item.quantity
        );
      });
    });

    user2Orders.forEach((order: any) => {
      order.items.forEach((item: any) => {
        user2Products.set(
          item.productId,
          (user2Products.get(item.productId) || 0) + item.quantity
        );
      });
    });

    // Get all unique products / Bütün unikal məhsulları al
    const allProducts = new Set([
      ...user1Products.keys(),
      ...user2Products.keys(),
    ]);

    if (allProducts.size === 0) {
      return 0; // No common products / Ümumi məhsul yoxdur
    }

    // Build vectors for cosine similarity / Cosine oxşarlığı üçün vektorlar yarat
    const vector1: number[] = [];
    const vector2: number[] = [];

    allProducts.forEach((productId) => {
      vector1.push(user1Products.get(productId) || 0);
      vector2.push(user2Products.get(productId) || 0);
    });

    // Calculate cosine similarity / Cosine oxşarlığını hesabla
    const similarity = cosineSimilarity(vector1, vector2);

    // Cache for 1 hour / 1 saat cache et
    await cache.set(cacheKey, similarity, 3600);

    return similarity;
  } catch (error) {
    logger.error('Failed to calculate user similarity / İstifadəçi oxşarlığını hesablamaq uğursuz oldu', error, {
      userId1,
      userId2,
    });
    return 0;
  }
}

/**
 * Calculate item similarity / Element oxşarlığını hesabla
 */
export async function calculateItemSimilarity(
  productId1: string,
  productId2: string
): Promise<number> {
  const cacheKey = `item_similarity:${productId1}:${productId2}`;
  
  // Check cache / Cache-i yoxla
  const cached = await cache.get<number>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  try {
    // Get users who purchased each product / Hər məhsulu alan istifadəçiləri al
    const [product1Orders, product2Orders] = await Promise.all([
      prisma.order_items.findMany({
        where: {
          productId: productId1,
          order: {
            status: {
              in: ['DELIVERED', 'CONFIRMED'],
            },
          },
        },
        select: {
          orderId: true,
          quantity: true,
          order: {
            select: {
              customerId: true,
            },
          },
        },
      }),
      prisma.order_items.findMany({
        where: {
          productId: productId2,
          order: {
            status: {
              in: ['DELIVERED', 'CONFIRMED'],
            },
          },
        },
        select: {
          orderId: true,
          quantity: true,
          order: {
            select: {
              customerId: true,
            },
          },
        },
      }),
    ]);

    // Build user vectors / İstifadəçi vektorları yarat
    const product1Users = new Map<string, number>();
    const product2Users = new Map<string, number>();

    product1Orders.forEach((item: any) => {
      const userId = item.order.customerId;
      product1Users.set(userId, (product1Users.get(userId) || 0) + item.quantity);
    });

    product2Orders.forEach((item: any) => {
      const userId = item.order.customerId;
      product2Users.set(userId, (product2Users.get(userId) || 0) + item.quantity);
    });

    // Get all unique users / Bütün unikal istifadəçiləri al
    const allUsers = new Set([
      ...product1Users.keys(),
      ...product2Users.keys(),
    ]);

    if (allUsers.size === 0) {
      return 0; // No common users / Ümumi istifadəçi yoxdur
    }

    // Build vectors for cosine similarity / Cosine oxşarlığı üçün vektorlar yarat
    const vector1: number[] = [];
    const vector2: number[] = [];

    allUsers.forEach((userId) => {
      vector1.push(product1Users.get(userId) || 0);
      vector2.push(product2Users.get(userId) || 0);
    });

    // Calculate cosine similarity / Cosine oxşarlığını hesabla
    const similarity = cosineSimilarity(vector1, vector2);

    // Cache for 1 hour / 1 saat cache et
    await cache.set(cacheKey, similarity, 3600);

    return similarity;
  } catch (error) {
    logger.error('Failed to calculate item similarity / Element oxşarlığını hesablamaq uğursuz oldu', error, {
      productId1,
      productId2,
    });
    return 0;
  }
}

/**
 * Get recommendations based on user similarity / İstifadəçi oxşarlığına əsasən tövsiyələr al
 */
export async function getRecommendationsByUserSimilarity(
  userId: string,
  limit: number = 10
): Promise<CollaborativeRecommendation[]> {
  const cacheKey = `collab_recommendations_user:${userId}:${limit}`;
  
  // Check cache / Cache-i yoxla
  const cached = await cache.get<CollaborativeRecommendation[]>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    // Get similar users / Oxşar istifadəçiləri al
    const allUsers = await prisma.users.findMany({
      where: {
        id: { not: userId },
        role: 'CUSTOMER',
      },
      select: {
        id: true,
      },
      take: 100, // Limit for performance / Performans üçün limit
    });

    const userSimilarities: Array<{ userId: string; similarity: number }> = [];

    for (const user of allUsers) {
      const similarity = await calculateUserSimilarity(userId, user.id);
      if (similarity > 0.1) { // Threshold / Hədd
        userSimilarities.push({ userId: user.id, similarity });
      }
    }

    // Sort by similarity / Oxşarlığa görə sırala
    userSimilarities.sort((a, b) => b.similarity - a.similarity);

    // Get products purchased by similar users / Oxşar istifadəçilərin aldığı məhsulları al
    const similarUserIds = userSimilarities.slice(0, 10).map((u) => u.userId);
    
    const userOrders = await prisma.orders.findMany({
      where: {
        customerId: userId,
      },
      include: {
        items: {
          select: {
            productId: true,
          },
        },
      },
    });

    const purchasedProductIds = new Set<string>();
    userOrders.forEach((order: any) => {
      order.items.forEach((item: any) => {
        purchasedProductIds.add(item.productId);
      });
    });

    const recommendations = new Map<string, { score: number; reason: string }>();

    for (const similarUser of similarUserIds) {
      const orders = await prisma.orders.findMany({
        where: {
          customerId: similarUser,
          status: {
            in: ['DELIVERED', 'CONFIRMED'],
          },
        },
        include: {
          items: {
            select: {
              productId: true,
              quantity: true,
            },
          },
        },
      });

      orders.forEach((order: any) => {
        order.items.forEach((item: any) => {
          if (!purchasedProductIds.has(item.productId)) {
            const existing = recommendations.get(item.productId);
            const similarity = userSimilarities.find((u) => u.userId === similarUser)?.similarity || 0;
            const score = similarity * item.quantity;

            if (!existing || score > existing.score) {
              recommendations.set(item.productId, {
                score,
                reason: `Users similar to you also bought this / Sizə oxşar istifadəçilər də bunu aldı`,
              });
            }
          }
        });
      });
    }

    const result: CollaborativeRecommendation[] = Array.from(recommendations.entries())
      .map(([productId, data]) => ({
        productId,
        score: data.score,
        reason: data.reason,
        basedOn: 'user_similarity' as const,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Cache for 30 minutes / 30 dəqiqə cache et
    await cache.set(cacheKey, result, 1800);

    return result;
  } catch (error) {
    logger.error('Failed to get recommendations by user similarity / İstifadəçi oxşarlığına görə tövsiyələri almaq uğursuz oldu', error, { userId });
    return [];
  }
}

/**
 * Get recommendations based on item similarity / Element oxşarlığına əsasən tövsiyələr al
 */
export async function getRecommendationsByItemSimilarity(
  productId: string,
  limit: number = 10
): Promise<CollaborativeRecommendation[]> {
  const cacheKey = `collab_recommendations_item:${productId}:${limit}`;
  
  // Check cache / Cache-i yoxla
  const cached = await cache.get<CollaborativeRecommendation[]>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    // Get all active products / Bütün aktiv məhsulları al
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        isPublished: true,
        isApproved: true,
        id: { not: productId },
      },
      select: {
        id: true,
      },
      take: 500, // Limit for performance / Performans üçün limit
    });

    const similarities: Array<{ productId: string; similarity: number }> = [];

    for (const product of products) {
      const similarity = await calculateItemSimilarity(productId, product.id);
      if (similarity > 0.1) { // Threshold / Hədd
        similarities.push({ productId: product.id, similarity });
      }
    }

    // Sort by similarity / Oxşarlığa görə sırala
    similarities.sort((a, b) => b.similarity - a.similarity);

    const result: CollaborativeRecommendation[] = similarities.slice(0, limit).map((s) => ({
      productId: s.productId,
      score: s.similarity,
      reason: 'Similar to products you viewed / Baxdığınız məhsullara oxşar',
      basedOn: 'item_similarity' as const,
    }));

    // Cache for 30 minutes / 30 dəqiqə cache et
    await cache.set(cacheKey, result, 1800);

    return result;
  } catch (error) {
    logger.error('Failed to get recommendations by item similarity / Element oxşarlığına görə tövsiyələri almaq uğursuz oldu', error, { productId });
    return [];
  }
}

/**
 * Handle cold start problem / Cold start problemini həll et
 * Returns popular products for new users / Yeni istifadəçilər üçün populyar məhsulları qaytarır
 */
export async function handleColdStart(userId: string, limit: number = 10): Promise<CollaborativeRecommendation[]> {
  try {
    // Check if user has any orders / İstifadəçinin sifarişi olub olmadığını yoxla
    const orderCount = await prisma.orders.count({
      where: {
        customerId: userId,
      },
    });

    if (orderCount === 0) {
      // Return popular products / Populyar məhsulları qaytar
      const popularProducts = await prisma.product.findMany({
        where: {
          isActive: true,
          isPublished: true,
          isApproved: true,
        },
        include: {
          reviews: {
            select: {
              rating: true,
            },
          },
        },
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      });

      return popularProducts.map((product) => ({
        productId: product.id,
        score: 0.5, // Default score for cold start / Cold start üçün default score
        reason: 'Popular products for new users / Yeni istifadəçilər üçün populyar məhsullar',
        basedOn: 'user_similarity' as const,
      }));
    }

    return [];
  } catch (error) {
    logger.error('Failed to handle cold start / Cold start-i həll etmək uğursuz oldu', error, { userId });
    return [];
  }
}

