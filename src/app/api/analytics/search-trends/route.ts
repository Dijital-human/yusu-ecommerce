/**
 * Search Trends Analytics API Route / Axtarış Trend Analitikası API Route
 * Provides search trends and analytics
 * Axtarış trendləri və analitika təmin edir
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import {
  getPopularSearches,
  getTrendingSearches,
  getSearchVolumeOverTime,
  getSearchToPurchaseConversion,
} from "@/lib/search/search-analytics";

/**
 * GET /api/analytics/search-trends - Get search trends / Axtarış trendlərini al
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
    const type = searchParams.get("type") || "all"; // 'popular', 'trending', 'volume', 'conversion', 'all'
    const days = parseInt(searchParams.get("days") || "7");
    const limit = parseInt(searchParams.get("limit") || "10");

    const results: Record<string, any> = {};

    if (type === 'popular' || type === 'all') {
      results.popular = await getPopularSearches(limit, days);
    }

    if (type === 'trending' || type === 'all') {
      results.trending = await getTrendingSearches(limit, days);
    }

    if (type === 'volume' || type === 'all') {
      results.volume = await getSearchVolumeOverTime(days);
    }

    if (type === 'conversion' || type === 'all') {
      results.conversion = await getSearchToPurchaseConversion(days);
    }

    return successResponse(results);
  } catch (error) {
    return handleApiError(error, "fetch search trends");
  }
}

