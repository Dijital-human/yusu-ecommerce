/**
 * Gift Card Redeem API Route / Hədiyyə Kartı İstifadə API Route
 * Redeem gift card / Hədiyyə kartını istifadə et
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { redeemGiftCard, validateGiftCard } from "@/lib/gift-cards/gift-card-manager";
import { logger } from "@/lib/utils/logger";

/**
 * POST /api/gift-cards/redeem
 * Redeem gift card / Hədiyyə kartını istifadə et
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const body = await request.json();
    const { code, amount, orderId } = body;

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Gift card code is required / Hədiyyə kartı kodu tələb olunur" },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Amount is required and must be greater than 0 / Məbləğ tələb olunur və 0-dan böyük olmalıdır" },
        { status: 400 }
      );
    }

    const result = await redeemGiftCard(code, user.id, amount, orderId);

    logger.info("Gift card redeemed / Hədiyyə kartı istifadə edildi", {
      userId: user.id,
      code,
      amount,
      orderId,
    });

    return successResponse(result);
  } catch (error: any) {
    if (error.message.includes('Invalid') || error.message.includes('Etibarsız')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    if (error.message.includes('Insufficient') || error.message.includes('Kifayət qədər')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    return handleApiError(error, "redeem gift card");
  }
}

/**
 * GET /api/gift-cards/redeem?code=XXX
 * Validate gift card / Hədiyyə kartını yoxla
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Gift card code is required / Hədiyyə kartı kodu tələb olunur" },
        { status: 400 }
      );
    }

    const validation = await validateGiftCard(code);

    return successResponse(validation);
  } catch (error) {
    return handleApiError(error, "validate gift card");
  }
}

