/**
 * Cache Warmer Utility / Cache İstiləşdirici Utility-si
 * Proactively caches frequently accessed data to improve performance
 * Performansı yaxşılaşdırmaq üçün tez-tez istifadə olunan məlumatları proaktiv cache edir
 */

import { cache, cacheKeys } from './cache-wrapper';
import { logger } from '@/lib/utils/logger';
import { getProductsWithFilters } from '@/lib/db/queries/product-queries';
import { getCategories } from '@/lib/db/queries/category-queries';
import { getPopularProducts } from '@/lib/recommendations/recommendation-engine';
import { prisma } from '@/lib/db';

/**
 * Warm product cache / Məhsul cache-ini istiləşdir
 * Caches popular products and frequently accessed product data
 * Populyar məhsulları və tez-tez istifadə olunan məhsul məlumatlarını cache edir
 */
export async function warmProductCache(options: {
  limit?: number;
  popularLimit?: number;
} = {}): Promise<void> {
  const { limit = 50, popularLimit = 20 } = options;
  
  try {
    logger.info('Starting product cache warming / Məhsul cache istiləşdirməsi başlayır', { limit, popularLimit });

    // Warm popular products cache / Populyar məhsullar cache-ini istiləşdir
    try {
      const popularProducts = await getPopularProducts(popularLimit);
      await cache.set(
        cacheKeys.product(`popular:${popularLimit}`),
        popularProducts,
        3600 // 1 hour TTL
      );
      logger.info(`Warmed popular products cache (${popularProducts.length} products) / Populyar məhsullar cache-i istiləşdirildi (${popularProducts.length} məhsul)`);
    } catch (error) {
      logger.error('Failed to warm popular products cache / Populyar məhsullar cache-ini istiləşdirmək uğursuz oldu', error);
    }

    // Warm recent products cache / Yeni məhsullar cache-ini istiləşdir
    try {
      const recentProducts = await getProductsWithFilters(
        { sortBy: 'createdAt', sortOrder: 'desc' },
        1,
        limit
      );
      await cache.set(
        cacheKeys.products('recent'),
        recentProducts,
        1800 // 30 minutes TTL
      );
      logger.info(`Warmed recent products cache (${recentProducts.products.length} products) / Yeni məhsullar cache-i istiləşdirildi (${recentProducts.products.length} məhsul)`);
    } catch (error) {
      logger.error('Failed to warm recent products cache / Yeni məhsullar cache-ini istiləşdirmək uğursuz oldu', error);
    }

    // Warm top-rated products cache / Ən yüksək reytinqli məhsullar cache-ini istiləşdir
    try {
      const topRatedProducts = await prisma.product.findMany({
        where: { isActive: true },
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
          reviews: {
            _count: 'desc',
          },
        },
      });

      // Transform and cache / Transform et və cache et
      const transformedProducts = topRatedProducts.map((product: { reviews: Array<{ rating: number }>; [key: string]: any }) => {
        const avgRating = product.reviews.length > 0
          ? product.reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / product.reviews.length
          : 0;
        
        return {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          images: product.images,
          category: product.category,
          rating: avgRating,
          reviewCount: product.reviews.length,
        };
      });

      await cache.set(
        cacheKeys.products('top-rated'),
        transformedProducts,
        3600 // 1 hour TTL
      );
      logger.info(`Warmed top-rated products cache (${transformedProducts.length} products) / Ən yüksək reytinqli məhsullar cache-i istiləşdirildi (${transformedProducts.length} məhsul)`);
    } catch (error) {
      logger.error('Failed to warm top-rated products cache / Ən yüksək reytinqli məhsullar cache-ini istiləşdirmək uğursuz oldu', error);
    }

    logger.info('Product cache warming completed / Məhsul cache istiləşdirməsi tamamlandı');
  } catch (error) {
    logger.error('Product cache warming failed / Məhsul cache istiləşdirməsi uğursuz oldu', error);
    throw error;
  }
}

/**
 * Warm category cache / Kateqoriya cache-ini istiləşdir
 * Caches all categories and category hierarchies
 * Bütün kateqoriyaları və kateqoriya iyerarxiyalarını cache edir
 */
export async function warmCategoryCache(): Promise<void> {
  try {
    logger.info('Starting category cache warming / Kateqoriya cache istiləşdirməsi başlayır');

    // Warm all categories cache / Bütün kateqoriyalar cache-ini istiləşdir
    try {
      const categories = await getCategories({ parentOnly: false, includeProducts: false });
      await cache.set(
        cacheKeys.categories(),
        categories,
        86400 // 24 hours TTL (categories don't change often)
      );
      logger.info(`Warmed categories cache (${categories.length} categories) / Kateqoriyalar cache-i istiləşdirildi (${categories.length} kateqoriya)`);
    } catch (error) {
      logger.error('Failed to warm categories cache / Kateqoriyalar cache-ini istiləşdirmək uğursuz oldu', error);
    }

    // Warm parent categories cache / Ana kateqoriyalar cache-ini istiləşdir
    try {
      const parentCategories = await getCategories({ parentOnly: true, includeProducts: false });
      await cache.set(
        cacheKeys.products('parent-categories'),
        parentCategories,
        86400 // 24 hours TTL
      );
      logger.info(`Warmed parent categories cache (${parentCategories.length} categories) / Ana kateqoriyalar cache-i istiləşdirildi (${parentCategories.length} kateqoriya)`);
    } catch (error) {
      logger.error('Failed to warm parent categories cache / Ana kateqoriyalar cache-ini istiləşdirmək uğursuz oldu', error);
    }

    logger.info('Category cache warming completed / Kateqoriya cache istiləşdirməsi tamamlandı');
  } catch (error) {
    logger.error('Category cache warming failed / Kateqoriya cache istiləşdirməsi uğursuz oldu', error);
    throw error;
  }
}

/**
 * Warm popular products cache / Populyar məhsullar cache-ini istiləşdir
 * Caches popular products using recommendation engine
 * Recommendation engine istifadə edərək populyar məhsulları cache edir
 */
export async function warmPopularProductsCache(limit: number = 20): Promise<void> {
  try {
    logger.info('Starting popular products cache warming / Populyar məhsullar cache istiləşdirməsi başlayır', { limit });

    const popularProducts = await getPopularProducts(limit);
    await cache.set(
      cacheKeys.product(`popular:${limit}`),
      popularProducts,
      3600 // 1 hour TTL
    );

    logger.info(`Warmed popular products cache (${popularProducts.length} products) / Populyar məhsullar cache-i istiləşdirildi (${popularProducts.length} məhsul)`);
  } catch (error) {
    logger.error('Failed to warm popular products cache / Populyar məhsullar cache-ini istiləşdirmək uğursuz oldu', error);
    throw error;
  }
}

/**
 * Warm all caches / Bütün cache-ləri istiləşdir
 * Comprehensive cache warming for all frequently accessed data
 * Tez-tez istifadə olunan bütün məlumatlar üçün hərtərəfli cache istiləşdirməsi
 */
export async function warmAllCaches(options: {
  products?: boolean;
  categories?: boolean;
  popularProducts?: boolean;
  productLimit?: number;
  popularLimit?: number;
} = {}): Promise<void> {
  const {
    products = true,
    categories = true,
    popularProducts = true,
    productLimit = 50,
    popularLimit = 20,
  } = options;

  try {
    logger.info('Starting comprehensive cache warming / Hərtərəfli cache istiləşdirməsi başlayır', {
      products,
      categories,
      popularProducts,
    });

    const promises: Promise<void>[] = [];

    if (products) {
      promises.push(warmProductCache({ limit: productLimit, popularLimit }));
    }

    if (categories) {
      promises.push(warmCategoryCache());
    }

    if (popularProducts) {
      promises.push(warmPopularProductsCache(popularLimit));
    }

    await Promise.allSettled(promises);

    logger.info('Comprehensive cache warming completed / Hərtərəfli cache istiləşdirməsi tamamlandı');
  } catch (error) {
    logger.error('Comprehensive cache warming failed / Hərtərəfli cache istiləşdirməsi uğursuz oldu', error);
    throw error;
  }
}

