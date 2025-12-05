/**
 * Conversion Funnel API Route / Konversiya Funnel API Route
 * Provides conversion funnel data
 * Konversiya funnel məlumatları təmin edir
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { calculateConversionFunnel } from "@/lib/analytics/funnel";

/**
 * GET /api/analytics/funnel - Get conversion funnel data / Konversiya funnel məlumatlarını al
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
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const now = new Date();
    const end = endDate ? new Date(endDate) : now;
    const start = startDate 
      ? new Date(startDate) 
      : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Default: last 7 days

    const funnel = await calculateConversionFunnel(start, end);

    return successResponse(funnel);
  } catch (error) {
    return handleApiError(error, "fetch conversion funnel");
  }
}

