/**
 * Affiliate Report API Route / Affiliate Hesabatı API Route
 * Generate affiliate report / Affiliate hesabatı yarat
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { generateAffiliateReport } from "@/lib/affiliate/affiliate-enhancements";

/**
 * GET /api/affiliate/report
 * Generate affiliate report / Affiliate hesabatı yarat
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined;
    const endDate = searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined;

    const report = await generateAffiliateReport(user.id, startDate, endDate);
    return successResponse(report);
  } catch (error) {
    return handleApiError(error, "generate affiliate report");
  }
}

