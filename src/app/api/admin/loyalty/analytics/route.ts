/**
 * Admin Loyalty Analytics API Route / Admin Sədaqət Analitikası API Route
 * Get loyalty program analytics (Admin only) / Sədaqət proqramı analitikasını al (Yalnız Admin)
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { getLoyaltyAnalytics } from "@/lib/loyalty/loyalty-analytics";

/**
 * GET /api/admin/loyalty/analytics
 * Get loyalty program analytics (Admin only) / Sədaqət proqramı analitikasını al (Yalnız Admin)
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Check if user is admin / İstifadəçinin admin olduğunu yoxla
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized / Yetkisiz" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined;
    const endDate = searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined;

    const analytics = await getLoyaltyAnalytics(startDate, endDate);

    return successResponse(analytics);
  } catch (error) {
    return handleApiError(error, "get loyalty analytics");
  }
}

