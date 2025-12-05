/**
 * Analytics Metrics API Route / Analytics Metrikaları API Route-u
 * Provides analytics metrics and reports
 * Analytics metrikaları və hesabatlar təmin edir
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/api/middleware";
import { successResponse, badRequestResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { getProductMetrics, getSalesAnalytics, getUserBehaviorAnalytics } from "@/lib/analytics/analytics";

/**
 * GET /api/analytics/metrics - Get analytics metrics / Analytics metrikalarını al
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
    const type = searchParams.get("type"); // 'product', 'sales', 'user'
    const productId = searchParams.get("productId");
    const userId = searchParams.get("userId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    switch (type) {
      case 'product':
        if (!productId) {
          return badRequestResponse("Product ID is required for product metrics / Məhsul metrikaları üçün məhsul ID tələb olunur");
        }
        const productMetrics = await getProductMetrics(productId, start, end);
        if (!productMetrics) {
          return NextResponse.json(
            { success: false, error: "Failed to get product metrics / Məhsul metrikalarını almaq uğursuz oldu" },
            { status: 500 }
          );
        }
        return successResponse(productMetrics);

      case 'sales':
        const salesAnalytics = await getSalesAnalytics(start, end);
        if (!salesAnalytics) {
          return NextResponse.json(
            { success: false, error: "Failed to get sales analytics / Satış analitikasını almaq uğursuz oldu" },
            { status: 500 }
          );
        }
        return successResponse(salesAnalytics);

      case 'user':
        if (!userId) {
          return badRequestResponse("User ID is required for user behavior analytics / İstifadəçi davranış analitikası üçün istifadəçi ID tələb olunur");
        }
        const userAnalytics = await getUserBehaviorAnalytics(userId, start, end);
        if (!userAnalytics) {
          return NextResponse.json(
            { success: false, error: "Failed to get user behavior analytics / İstifadəçi davranış analitikasını almaq uğursuz oldu" },
            { status: 500 }
          );
        }
        return successResponse(userAnalytics);

      default:
        return badRequestResponse("Invalid type. Must be 'product', 'sales', or 'user' / Yanlış tip. 'product', 'sales' və ya 'user' olmalıdır");
    }
  } catch (error) {
    return handleApiError(error, "fetch analytics metrics");
  }
}

