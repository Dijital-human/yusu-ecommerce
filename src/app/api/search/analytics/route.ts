/**
 * Search Analytics API Route / Axtarış Analitika API Route-u
 * Provides search analytics and statistics
 * Axtarış analitikası və statistikaları təmin edir
 */

import { NextRequest } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { getSearchStatistics, getPopularSearches } from "@/lib/search/search-analytics";

// GET /api/search/analytics - Get search analytics / Axtarış analitikasını al
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;
    
    // Check if user is admin / İstifadəçinin admin olduğunu yoxla
    const roleCheck = requireAdmin(user);
    if (roleCheck) return roleCheck;

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "7");
    const limit = parseInt(searchParams.get("limit") || "10");

    const statistics = await getSearchStatistics(days);
    const popularSearches = await getPopularSearches(limit, days);

    return successResponse({
      ...statistics,
      popularSearches,
    });
  } catch (error) {
    return handleApiError(error, "get search analytics");
  }
}

