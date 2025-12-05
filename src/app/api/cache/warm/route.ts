/**
 * Cache Warming API Route / Cache İstiləşdirmə API Route-u
 * Endpoint for warming cache on demand or scheduled basis
 * Tələb əsasında və ya cədvələ əsasən cache istiləşdirməsi üçün endpoint
 */

import { NextRequest, NextResponse } from "next/server";
import { warmAllCaches, warmProductCache, warmCategoryCache, warmPopularProductsCache } from "@/lib/cache/cache-warmer";
import { handleApiError } from "@/lib/api/error-handler";
import { successResponse, badRequestResponse } from "@/lib/api/response";
import { logger } from "@/lib/utils/logger";

/**
 * POST /api/cache/warm - Warm cache / Cache-i istiləşdir
 * 
 * Query parameters:
 * - type: 'all' | 'products' | 'categories' | 'popular' (default: 'all')
 * - productLimit: number (default: 50)
 * - popularLimit: number (default: 20)
 * 
 * Headers:
 * - Authorization: Bearer token (optional, for admin access)
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const productLimit = parseInt(searchParams.get('productLimit') || '50', 10);
    const popularLimit = parseInt(searchParams.get('popularLimit') || '20', 10);

    logger.info('Cache warming requested / Cache istiləşdirməsi tələb olundu', { type, productLimit, popularLimit });

    switch (type) {
      case 'all':
        await warmAllCaches({
          products: true,
          categories: true,
          popularProducts: true,
          productLimit,
          popularLimit,
        });
        break;

      case 'products':
        await warmProductCache({ limit: productLimit, popularLimit });
        break;

      case 'categories':
        await warmCategoryCache();
        break;

      case 'popular':
        await warmPopularProductsCache(popularLimit);
        break;

      default:
        return badRequestResponse(`Invalid cache type: ${type}. Valid types: all, products, categories, popular`);
    }

    return successResponse({
      message: 'Cache warming completed successfully / Cache istiləşdirməsi uğurla tamamlandı',
      type,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error, "warm cache");
  }
}

/**
 * GET /api/cache/warm - Get cache warming status / Cache istiləşdirmə statusunu al
 */
export async function GET(request: NextRequest) {
  try {
    // Check if cache is warm by checking for key indicators / Cache-in istiləşib-istiləşmədiyini əsas göstəriciləri yoxlayaraq yoxla
    const { cache } = await import('@/lib/cache/cache-wrapper');
    
    const [categoriesCache, popularCache] = await Promise.all([
      cache.get('categories:all'),
      cache.get('product:popular:20'),
    ]);

    return successResponse({
      status: 'ready',
      cacheStatus: {
        categories: categoriesCache ? 'warm' : 'cold',
        popularProducts: popularCache ? 'warm' : 'cold',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error, "get cache warming status");
  }
}

