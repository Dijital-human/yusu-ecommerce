/**
 * Admin Gift Card Delivery API Route / Admin Hədiyyə Kartı Çatdırılması API Route
 * Mark gift card as delivered / Hədiyyə kartını çatdırılmış kimi qeyd et
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { markGiftCardDelivered } from "@/lib/gift-cards/gift-card-manager";
import { logger } from "@/lib/utils/logger";

/**
 * PUT /api/admin/gift-cards/[id]/deliver
 * Mark gift card as delivered (Admin only) / Hədiyyə kartını çatdırılmış kimi qeyd et (Yalnız Admin)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const resolvedParams = await params;
    const giftCardId = resolvedParams.id;

    const giftCard = await markGiftCardDelivered(giftCardId);

    logger.info("Gift card marked as delivered / Hədiyyə kartı çatdırılmış kimi qeyd edildi", {
      adminId: user.id,
      giftCardId,
    });

    return successResponse(giftCard, "Gift card marked as delivered / Hədiyyə kartı çatdırılmış kimi qeyd edildi");
  } catch (error) {
    return handleApiError(error, "mark gift card as delivered");
  }
}

