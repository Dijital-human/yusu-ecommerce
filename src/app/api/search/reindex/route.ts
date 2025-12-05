/**
 * Search Reindex API Route / Axtarış Yenidən İndeksləmə API Route-u
 * Manually trigger product reindexing
 * Məhsul yenidən indeksləməsini manual olaraq başlat
 */

import { NextRequest } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/api/middleware";
import { successResponse, badRequestResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { reindexAllProducts } from "@/lib/search/search-engine";
import { batchIndexProducts, initializeSearchIndex } from "@/lib/search/search-indexer";
import { logger } from "@/lib/utils/logger";

// POST /api/search/reindex - Reindex all products / Bütün məhsulları yenidən indekslə
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;
    
    // Check if user is admin / İstifadəçinin admin olduğunu yoxla
    const roleCheck = requireAdmin(user);
    if (roleCheck) return roleCheck;

    const body = await request.json().catch(() => ({}));
    const { initialize = false, productIds } = body;

    // Initialize index if requested / Əgər tələb olunarsa indeksi başlat
    if (initialize) {
      logger.info('Initializing search index / Axtarış indeksini başlatmaq', { adminId: user.id });
      const initialized = await initializeSearchIndex();
      if (!initialized) {
        return badRequestResponse("Failed to initialize search index / Axtarış indeksini başlatmaq uğursuz oldu");
      }
    }

    // Reindex products / Məhsulları yenidən indekslə
    logger.info('Starting product reindexing / Məhsul yenidən indeksləməsi başladıldı', {
      adminId: user.id,
      productIds: productIds ? productIds.length : 'all',
    });

    let result;
    if (productIds && Array.isArray(productIds) && productIds.length > 0) {
      // Batch index specific products / Xüsusi məhsulları batch indekslə
      result = await batchIndexProducts(productIds);
    } else {
      // Reindex all products / Bütün məhsulları yenidən indekslə
      const success = await reindexAllProducts();
      result = {
        success: success ? 1 : 0,
        failed: success ? 0 : 1,
        total: 1,
      };
    }

    return successResponse({
      ...result,
      message: `Reindexing completed: ${result.success} succeeded, ${result.failed} failed / Yenidən indeksləmə tamamlandı: ${result.success} uğurlu, ${result.failed} uğursuz`,
    });
  } catch (error) {
    return handleApiError(error, "reindex products");
  }
}

