/**
 * Admin Wishlist Conversion Analytics API Route / Admin İstək Siyahısı Çevrilmə Analitika API Route-u
 * Provides wishlist conversion analytics for admin panel
 * Admin panel üçün istək siyahısı çevrilmə analitikası təmin edir
 */

import { NextRequest } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { calculateWishlistConversionMetrics, WishlistConversionFilters } from "@/lib/analytics/wishlist-analytics";

/**
 * GET /api/admin/analytics/wishlist-conversion - Get wishlist conversion analytics / İstək siyahısı çevrilmə analitikasını al
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;
    
    // Check if user is admin / İstifadəçinin admin olduğunu yoxla
    const roleCheck = requireAdmin(user);
    if (roleCheck) return roleCheck;

    const { searchParams } = new URL(request.url);
    
    // Date range filtering / Tarix aralığı filtrləməsi
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const productId = searchParams.get("productId");

    // Build filters / Filtrləri qur
    const filters: WishlistConversionFilters = {};
    
    if (startDate) {
      filters.startDate = new Date(startDate);
    }
    if (endDate) {
      filters.endDate = new Date(endDate);
    }
    if (productId) {
      filters.productId = productId;
    }

    // Calculate metrics / Metrikaları hesabla
    const metrics = await calculateWishlistConversionMetrics(filters);

    return successResponse(metrics);
  } catch (error) {
    return handleApiError(error, "get wishlist conversion analytics");
  }
}

