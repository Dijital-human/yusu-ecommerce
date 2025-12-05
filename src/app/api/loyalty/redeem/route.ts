/**
 * Loyalty Redeem API Route / Sədaqət İstifadə API Route
 * Redeem reward / Mükafat istifadə et
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { redeemReward } from "@/lib/loyalty/points-manager";
import { logger } from "@/lib/utils/logger";

/**
 * POST /api/loyalty/redeem
 * Redeem reward / Mükafat istifadə et
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const body = await request.json();
    const { rewardId } = body;

    if (!rewardId) {
      return NextResponse.json(
        { success: false, error: "Reward ID is required / Mükafat ID-si tələb olunur" },
        { status: 400 }
      );
    }

    const result = await redeemReward(user.id, rewardId);

    logger.info("Reward redeemed / Mükafat istifadə edildi", {
      userId: user.id,
      rewardId,
    });

    return successResponse(result);
  } catch (error: any) {
    if (error.message.includes('Insufficient points') || error.message.includes('Kifayət qədər xal yoxdur')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    return handleApiError(error, "redeem reward");
  }
}

