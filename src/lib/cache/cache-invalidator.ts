/**
 * Cache Invalidator Utility / Cache Ləğv Edici Utility-si
 * Smart cache invalidation for maintaining cache consistency
 * Cache uyğunluğunu saxlamaq üçün ağıllı cache invalidation
 */

import { cache, cacheKeys } from './cache-wrapper';
import { logger } from '@/lib/utils/logger';
import { prisma } from '@/lib/db';

/**
 * Invalidate product-related caches / Məhsulla əlaqəli cache-ləri ləğv et
 * Invalidates product cache, product lists cache, category cache, and related caches
 * Məhsul cache-ini, məhsul siyahıları cache-ini, kateqoriya cache-ini və əlaqəli cache-ləri ləğv edir
 */
export async function invalidateProductCache(productId: string): Promise<void> {
  try {
    logger.info('Invalidating product cache / Məhsul cache-i ləğv edilir', { productId });

    // Get product to find related caches / Əlaqəli cache-ləri tapmaq üçün məhsulu al
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, categoryId: true, sellerId: true },
    });

    const keysToInvalidate: string[] = [
      // Product-specific caches / Məhsula xas cache-lər
      cacheKeys.product(productId),
      cacheKeys.productDetails(productId),
      
      // Product list caches (all variations) / Məhsul siyahıları cache-ləri (bütün variantlar)
      `${cacheKeys.products('')}*`,
      
      // Popular products cache / Populyar məhsullar cache-i
      cacheKeys.product('popular:*'),
      
      // Recommendations cache / Tövsiyələr cache-i
      `${cacheKeys.recommendations('*')}*`,
    ];

    // Add category-related caches if product has category / Əgər məhsulun kateqoriyası varsa kateqoriya ilə əlaqəli cache-ləri əlavə et
    if (product?.categoryId) {
      keysToInvalidate.push(cacheKeys.category(product.categoryId));
    }

    // Invalidate all related caches / Bütün əlaqəli cache-ləri ləğv et
    await cache.deleteMany(keysToInvalidate);

    logger.info('Product cache invalidated successfully / Məhsul cache-i uğurla ləğv edildi', { productId, keysCount: keysToInvalidate.length });
  } catch (error) {
    logger.error('Failed to invalidate product cache / Məhsul cache-ini ləğv etmək uğursuz oldu', error, { productId });
    throw error;
  }
}

/**
 * Invalidate category-related caches / Kateqoriya ilə əlaqəli cache-ləri ləğv et
 * Invalidates category cache, category products cache, and all product list caches
 * Kateqoriya cache-ini, kateqoriya məhsulları cache-ini və bütün məhsul siyahıları cache-lərini ləğv edir
 */
export async function invalidateCategoryCache(categoryId: string): Promise<void> {
  try {
    logger.info('Invalidating category cache / Kateqoriya cache-i ləğv edilir', { categoryId });

    // Get category to find child categories / Uşaq kateqoriyaları tapmaq üçün kateqoriyanı al
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        children: {
          select: { id: true },
        },
      },
    });

    const keysToInvalidate: string[] = [
      // Category-specific caches / Kateqoriyaya xas cache-lər
      cacheKeys.category(categoryId),
      cacheKeys.categories(),
      cacheKeys.products('parent-categories'),
      
      // Category products cache / Kateqoriya məhsulları cache-i
      `${cacheKeys.products('')}*category:${categoryId}*`,
      
      // All product list caches (category filter affects all lists) / Bütün məhsul siyahıları cache-ləri (kateqoriya filter bütün siyahılara təsir edir)
      `${cacheKeys.products('')}*`,
    ];

    // Invalidate child categories cache if exists / Əgər uşaq kateqoriyalar varsa onların cache-ini də ləğv et
    if (category?.children && category.children.length > 0) {
      category.children.forEach((child: { id: string }) => {
        keysToInvalidate.push(cacheKeys.category(child.id));
      });
    }

    // Invalidate parent category cache if exists / Əgər ana kateqoriya varsa onun cache-ini də ləğv et
    if (category?.parentId) {
      keysToInvalidate.push(cacheKeys.category(category.parentId));
    }

    // Invalidate all related caches / Bütün əlaqəli cache-ləri ləğv et
    await cache.deleteMany(keysToInvalidate);

    logger.info('Category cache invalidated successfully / Kateqoriya cache-i uğurla ləğv edildi', { categoryId, keysCount: keysToInvalidate.length });
  } catch (error) {
    logger.error('Failed to invalidate category cache / Kateqoriya cache-ini ləğv etmək uğursuz oldu', error, { categoryId });
    throw error;
  }
}

/**
 * Invalidate order-related caches / Sifariş ilə əlaqəli cache-ləri ləğv et
 * Invalidates order cache and user orders cache
 * Sifariş cache-ini və istifadəçi sifarişləri cache-ini ləğv edir
 */
export async function invalidateOrderCache(orderId: string, userId?: string): Promise<void> {
  try {
    logger.info('Invalidating order cache / Sifariş cache-i ləğv edilir', { orderId, userId });

    const keysToInvalidate: string[] = [
      // Order-specific cache / Sifarişə xas cache
      cacheKeys.order(orderId),
    ];

    // Invalidate user orders cache if userId provided / Əgər userId verilibsə istifadəçi sifarişləri cache-ini ləğv et
    if (userId) {
      keysToInvalidate.push(`${cacheKeys.orders(userId, '')}*`);
    }

    // Invalidate all related caches / Bütün əlaqəli cache-ləri ləğv et
    await cache.deleteMany(keysToInvalidate);

    logger.info('Order cache invalidated successfully / Sifariş cache-i uğurla ləğv edildi', { orderId, userId, keysCount: keysToInvalidate.length });
  } catch (error) {
    logger.error('Failed to invalidate order cache / Sifariş cache-ini ləğv etmək uğursuz oldu', error, { orderId, userId });
    throw error;
  }
}

/**
 * Invalidate user-related caches / İstifadəçi ilə əlaqəli cache-ləri ləğv et
 * Invalidates user cache, user orders cache, and user-specific recommendations
 * İstifadəçi cache-ini, istifadəçi sifarişləri cache-ini və istifadəçiyə xas tövsiyələri ləğv edir
 */
export async function invalidateUserCache(userId: string): Promise<void> {
  try {
    logger.info('Invalidating user cache / İstifadəçi cache-i ləğv edilir', { userId });

    const keysToInvalidate: string[] = [
      // User-specific cache / İstifadəçiyə xas cache
      cacheKeys.user(userId),
      
      // User orders cache / İstifadəçi sifarişləri cache-i
      `${cacheKeys.orders(userId, '')}*`,
      
      // User-specific recommendations / İstifadəçiyə xas tövsiyələr
      `${cacheKeys.recommendations('*', userId)}*`,
    ];

    // Invalidate all related caches / Bütün əlaqəli cache-ləri ləğv et
    await cache.deleteMany(keysToInvalidate);

    logger.info('User cache invalidated successfully / İstifadəçi cache-i uğurla ləğv edildi', { userId, keysCount: keysToInvalidate.length });
  } catch (error) {
    logger.error('Failed to invalidate user cache / İstifadəçi cache-ini ləğv etmək uğursuz oldu', error, { userId });
    throw error;
  }
}

/**
 * Invalidate related caches based on resource type and ID / Resurs tipi və ID-yə əsasən əlaqəli cache-ləri ləğv et
 * Smart invalidation that handles relationships between resources
 * Resurslar arasındakı əlaqələri idarə edən ağıllı invalidation
 */
export async function invalidateRelatedCaches(
  resourceType: 'product' | 'category' | 'order' | 'user',
  resourceId: string,
  additionalContext?: {
    userId?: string;
    categoryId?: string;
    oldCategoryId?: string;
  }
): Promise<void> {
  try {
    logger.info('Invalidating related caches / Əlaqəli cache-lər ləğv edilir', { resourceType, resourceId, additionalContext });

    switch (resourceType) {
      case 'product':
        await invalidateProductCache(resourceId);
        
        // If category changed, invalidate both old and new category caches / Əgər kateqoriya dəyişibsə, həm köhnə həm də yeni kateqoriya cache-lərini ləğv et
        if (additionalContext?.oldCategoryId && additionalContext?.categoryId) {
          if (additionalContext.oldCategoryId !== additionalContext.categoryId) {
            await invalidateCategoryCache(additionalContext.oldCategoryId);
            await invalidateCategoryCache(additionalContext.categoryId);
          }
        } else if (additionalContext?.categoryId) {
          await invalidateCategoryCache(additionalContext.categoryId);
        }
        break;

      case 'category':
        await invalidateCategoryCache(resourceId);
        // Also invalidate all product lists since category affects product filtering / Həmçinin bütün məhsul siyahılarını ləğv et, çünki kateqoriya məhsul filtrləməsinə təsir edir
        await cache.deleteMany([`${cacheKeys.products('')}*`]);
        break;

      case 'order':
        await invalidateOrderCache(resourceId, additionalContext?.userId);
        break;

      case 'user':
        await invalidateUserCache(resourceId);
        break;

      default:
        logger.warn('Unknown resource type for cache invalidation / Cache invalidation üçün naməlum resurs tipi', new Error(`Unknown resource type: ${resourceType}`));
    }

    logger.info('Related caches invalidated successfully / Əlaqəli cache-lər uğurla ləğv edildi', { resourceType, resourceId });
  } catch (error) {
    logger.error('Failed to invalidate related caches / Əlaqəli cache-ləri ləğv etmək uğursuz oldu', error, { resourceType, resourceId });
    throw error;
  }
}

/**
 * Invalidate all caches / Bütün cache-ləri ləğv et
 * Use with caution - this clears all cached data
 * Ehtiyatla istifadə et - bu bütün cache edilmiş məlumatları təmizləyir
 */
export async function invalidateAllCaches(): Promise<void> {
  try {
    logger.warn('Invalidating all caches / Bütün cache-lər ləğv edilir');

    await cache.clear();

    logger.info('All caches invalidated successfully / Bütün cache-lər uğurla ləğv edildi');
  } catch (error) {
    logger.error('Failed to invalidate all caches / Bütün cache-ləri ləğv etmək uğursuz oldu', error);
    throw error;
  }
}

