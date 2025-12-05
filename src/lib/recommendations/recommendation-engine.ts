/**
 * Recommendation Engine / Tövsiyə Mühərriki
 * Provides product recommendations using collaborative and content-based filtering
 * Collaborative və content-based filtering istifadə edərək məhsul tövsiyələri təmin edir
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/utils/logger';
import { cache, cacheKeys } from '@/lib/cache/cache-wrapper';
import { batchGetProducts } from '@/lib/db/queries/batch-queries';

/**
 * Recommendation types / Tövsiyə tipləri
 */
export type RecommendationType = 
  | 'popular'
  | 'recently_viewed'
  | 'similar'
  | 'frequently_bought_together'
  | 'personalized'
  | 'trending';

/**
 * Get popular products / Populyar məhsulları al
 */
export async function getPopularProducts(limit: number = 10): Promise<any[]> {
  const cacheKey = cacheKeys.product(`popular:${limit}`);

  return await cache.get(cacheKey) || (async () => {
    try {
      const products = await prisma.product.findMany({
        where: {
          isActive: true,
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
          orderItems: {
            select: {
              quantity: true,
            },
          },
        },
        take: limit * 2, // Get more to filter / Filtrləmək üçün daha çox al
      });

      // Calculate popularity score / Populyarlıq balı hesabla
      const productsWithScore = products.map((product: any) => {
        const avgRating = product.reviews.length > 0
          ? product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / product.reviews.length
          : 0;

        const totalSales = product.orderItems.reduce((sum: number, item: any) => sum + item.quantity, 0);

        // Popularity score = (rating * 0.4) + (sales * 0.6) / Populyarlıq balı = (reytinq * 0.4) + (satış * 0.6)
        const popularityScore = (avgRating * 0.4) + (totalSales * 0.6);

        return {
          ...product,
          popularityScore,
          avgRating,
          totalSales,
        };
      });

      // Sort by popularity score and take top N / Populyarlıq balına görə sırala və ilk N-i al
      const popularProducts = productsWithScore
        .sort((a: any, b: any) => b.popularityScore - a.popularityScore)
        .slice(0, limit)
        .map((item: any) => {
          const { popularityScore, avgRating, totalSales, ...product } = item;
          return product;
        });

      // Cache for 1 hour / 1 saat cache et
      await cache.set(cacheKey, popularProducts, 3600);

      return popularProducts;
    } catch (error) {
      logger.error('Failed to get popular products / Populyar məhsulları almaq uğursuz oldu', error);
      return [];
    }
  })();
}

/**
 * Get similar products / Oxşar məhsulları al
 */
export async function getSimilarProducts(productId: string, limit: number = 10): Promise<any[]> {
  const cacheKey = cacheKeys.product(`similar:${productId}:${limit}`);

  return await cache.get(cacheKey) || (async () => {
    try {
      // Get product details / Məhsul detallarını al
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          category: true,
        },
      });

      if (!product) {
        return [];
      }

      // Find products in same category / Eyni kateqoriyada məhsulları tap
      const similarProducts = await prisma.product.findMany({
        where: {
          categoryId: product.categoryId,
          id: { not: productId },
          isActive: true,
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
        },
        take: limit,
      });

      // Cache for 1 hour / 1 saat cache et
      await cache.set(cacheKey, similarProducts, 3600);

      return similarProducts;
    } catch (error) {
      logger.error('Failed to get similar products / Oxşar məhsulları almaq uğursuz oldu', error, { productId });
      return [];
    }
  })();
}

/**
 * Get frequently bought together products / Tez-tez birlikdə alınan məhsulları al
 */
export async function getFrequentlyBoughtTogether(productId: string, limit: number = 5): Promise<any[]> {
  const cacheKey = cacheKeys.product(`frequently_bought_together:${productId}:${limit}`);

  return await cache.get(cacheKey) || (async () => {
    try {
      // Get orders that contain this product / Bu məhsulu ehtiva edən sifarişləri al
      const ordersWithProduct = await prisma.orderItem.findMany({
        where: {
          productId,
        },
        select: {
          orderId: true,
        },
        distinct: ['orderId'],
        take: 100, // Limit to recent orders / Yaxın sifarişlərlə məhdudlaşdır
      });

      const orderIds = ordersWithProduct.map((item: { orderId: string }) => item.orderId);

      if (orderIds.length === 0) {
        return [];
      }

      // Get other products in those orders / Bu sifarişlərdəki digər məhsulları al
      const otherProducts = await prisma.orderItem.groupBy({
        by: ['productId'],
        where: {
          orderId: { in: orderIds },
          productId: { not: productId },
        },
        _count: {
          productId: true,
        },
        orderBy: {
          _count: {
            productId: 'desc',
          },
        },
        take: limit,
      });

      const productIds = otherProducts.map((p: { productId: string }) => p.productId);

      if (productIds.length === 0) {
        return [];
      }

      // Get product details using batch query helper / Batch query helper istifadə edərək məhsul detallarını al
      const products = await batchGetProducts(productIds, false);

      // Sort by frequency / Tezliyə görə sırala
      const frequencyMap = new Map<string, number>(otherProducts.map((p: { productId: string; _count: { productId: number } }) => [p.productId, p._count.productId]));
      products.sort((a: any, b: any) => {
        const freqB = frequencyMap.get(b.id) || 0;
        const freqA = frequencyMap.get(a.id) || 0;
        return freqB - freqA;
      });

      // Cache for 1 hour / 1 saat cache et
      await cache.set(cacheKey, products, 3600);

      return products;
    } catch (error) {
      logger.error('Failed to get frequently bought together products / Tez-tez birlikdə alınan məhsulları almaq uğursuz oldu', error, { productId });
      return [];
    }
  })();
}

/**
 * Get personalized recommendations for user / İstifadəçi üçün fərdiləşdirilmiş tövsiyələr al
 */
export async function getPersonalizedRecommendations(userId: string, limit: number = 10): Promise<any[]> {
  const cacheKey = `recommendations:personalized:${userId}:${limit}`;

  return await cache.get(cacheKey) || (async () => {
    try {
      // Get user's order history / İstifadəçinin sifariş tarixçəsini al
      const userOrders = await prisma.order.findMany({
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
        take: 20, // Recent orders / Yaxın sifarişlər
      });

      if (userOrders.length === 0) {
        // If no orders, return popular products / Əgər sifariş yoxdursa, populyar məhsulları qaytar
        return await getPopularProducts(limit);
      }

      // Extract categories and products user has bought / İstifadəçinin aldığı kateqoriyaları və məhsulları çıxar
      const userCategories = new Set<string>();
      const userProductIds = new Set<string>();

      userOrders.forEach((order: any) => {
        order.items.forEach((item: any) => {
          userCategories.add(item.product.categoryId);
          userProductIds.add(item.productId);
        });
      });

      // Find products in user's preferred categories / İstifadəçinin üstünlük verdiyi kateqoriyalarda məhsulları tap
      const recommendations = await prisma.product.findMany({
        where: {
          categoryId: { in: Array.from(userCategories) },
          id: { notIn: Array.from(userProductIds) },
          isActive: true,
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
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

      // Cache for 30 minutes / 30 dəqiqə cache et
      await cache.set(cacheKey, recommendations, 1800);

      return recommendations;
    } catch (error) {
      logger.error('Failed to get personalized recommendations / Fərdiləşdirilmiş tövsiyələri almaq uğursuz oldu', error, { userId });
      // Fallback to popular products / Populyar məhsullara fallback
      return await getPopularProducts(limit);
    }
  })();
}

/**
 * Get trending products / Trend olan məhsulları al
 */
export async function getTrendingProducts(limit: number = 10): Promise<any[]> {
  const cacheKey = cacheKeys.product(`trending:${limit}`);

  return await cache.get(cacheKey) || (async () => {
    try {
      // Get products with recent sales / Yaxın satışları olan məhsulları al
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 7); // Last 7 days / Son 7 gün

      const trendingProducts = await prisma.product.findMany({
        where: {
          isActive: true,
          orderItems: {
            some: {
              order: {
                createdAt: {
                  gte: recentDate,
                },
              },
            },
          },
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
          orderItems: {
            where: {
              order: {
                createdAt: {
                  gte: recentDate,
                },
              },
            },
            select: {
              quantity: true,
            },
          },
        },
        take: limit * 2,
      });

      // Calculate trending score / Trend balı hesabla
      const productsWithScore = trendingProducts.map((product: any) => {
        const recentSales = product.orderItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
        const avgRating = product.reviews.length > 0
          ? product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / product.reviews.length
          : 0;

        // Trending score = (recent sales * 0.7) + (rating * 0.3) / Trend balı = (yaxın satışlar * 0.7) + (reytinq * 0.3)
        const trendingScore = (recentSales * 0.7) + (avgRating * 0.3);

        return {
          ...product,
          trendingScore,
          recentSales,
          avgRating,
        };
      });

      // Sort by trending score and take top N / Trend balına görə sırala və ilk N-i al
      const trending = productsWithScore
        .sort((a: any, b: any) => b.trendingScore - a.trendingScore)
        .slice(0, limit)
        .map((item: any) => {
          const { trendingScore, recentSales, avgRating, ...product } = item;
          return product;
        });

      // Cache for 1 hour / 1 saat cache et
      await cache.set(cacheKey, trending, 3600);

      return trending;
    } catch (error) {
      logger.error('Failed to get trending products / Trend olan məhsulları almaq uğursuz oldu', error);
      return [];
    }
  })();
}

