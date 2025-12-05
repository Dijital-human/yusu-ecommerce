/**
 * Admin Cart Abandonment Analytics API Route / Admin Səbət Tərk Etmə Analitika API Route-u
 * Provides cart abandonment analytics for admin panel
 * Admin panel üçün səbət tərk etmə analitikası təmin edir
 */

import { NextRequest } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { calculateCartAbandonmentMetrics, CartAbandonmentFilters } from "@/lib/analytics/cart-analytics";

/**
 * GET /api/admin/analytics/cart-abandonment - Get cart abandonment analytics / Səbət tərk etmə analitikasını al
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
    const sellerId = searchParams.get("sellerId");
    const categoryId = searchParams.get("categoryId");

    // Build filters / Filtrləri qur
    const filters: CartAbandonmentFilters = {};
    
    if (startDate) {
      filters.startDate = new Date(startDate);
    }
    if (endDate) {
      filters.endDate = new Date(endDate);
    }
    if (sellerId) {
      filters.sellerId = sellerId;
    }
    if (categoryId) {
      filters.categoryId = categoryId;
    }

    // Calculate metrics / Metrikaları hesabla
    const metrics = await calculateCartAbandonmentMetrics(filters);

    return successResponse(metrics);
  } catch (error) {
    return handleApiError(error, "get cart abandonment analytics");
  }
}

