/**
 * Affiliate Stats API Route / Affiliate Statistika API Route
 * Get affiliate statistics / Affiliate statistikalarını al
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { getAffiliateStats } from "@/lib/affiliate/affiliate-manager";

/**
 * GET /api/affiliate/stats
 * Get affiliate statistics / Affiliate statistikalarını al
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    const stats = await getAffiliateStats(user.id);

    return successResponse(stats);
  } catch (error) {
    return handleApiError(error, "get affiliate stats");
  }
}

