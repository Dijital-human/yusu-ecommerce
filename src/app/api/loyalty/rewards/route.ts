/**
 * Loyalty Rewards API Route / Sədaqət Mükafatları API Route
 * Get available rewards / Mövcud mükafatları al
 */

import { NextRequest, NextResponse } from "next/server";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { getAvailableRewards, getLoyaltyProgram } from "@/lib/loyalty/points-manager";

/**
 * GET /api/loyalty/rewards
 * Get available rewards / Mövcud mükafatları al
 */
export async function GET(request: NextRequest) {
  try {
    const [rewards, program] = await Promise.all([
      getAvailableRewards(),
      getLoyaltyProgram(),
    ]);

    return successResponse({
      rewards,
      program: program ? {
        name: program.name,
        pointsPerDollar: program.pointsPerDollar,
      } : null,
    });
  } catch (error) {
    return handleApiError(error, "get loyalty rewards");
  }
}

