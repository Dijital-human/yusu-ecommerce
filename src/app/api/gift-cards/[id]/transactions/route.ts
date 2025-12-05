/**
 * Gift Card Transactions API Route / Hədiyyə Kartı Əməliyyatları API Route
 * Get gift card transactions / Hədiyyə kartı əməliyyatlarını al
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { getGiftCardTransactions, getGiftCardByCode } from "@/lib/gift-cards/gift-card-manager";
import { db } from "@/lib/db";

/**
 * GET /api/gift-cards/[id]/transactions
 * Get gift card transactions / Hədiyyə kartı əməliyyatlarını al
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const { id } = await params;

    // Get gift card to verify ownership / Mülkiyyəti yoxlamaq üçün hədiyyə kartını al
    const giftCard = await getGiftCardByCode(id);
    if (!giftCard) {
      // Try by ID / ID ilə yoxla
      const giftCardById = await (db as any).giftCard.findUnique({
        where: { id },
      });
      if (!giftCardById) {
        return NextResponse.json(
          { success: false, error: "Gift card not found / Hədiyyə kartı tapılmadı" },
          { status: 404 }
        );
      }
      
      // Verify ownership / Mülkiyyəti yoxla
      if (giftCardById.purchasedBy !== user.id && giftCardById.redeemedBy !== user.id) {
        return NextResponse.json(
          { success: false, error: "Unauthorized / Yetkisiz" },
          { status: 403 }
        );
      }

      const transactions = await getGiftCardTransactions(giftCardById.id);
      return successResponse(transactions);
    }

    // Verify ownership / Mülkiyyəti yoxla
    if (giftCard.purchasedBy !== user.id && giftCard.redeemedBy !== user.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized / Yetkisiz" },
        { status: 403 }
      );
    }

    const transactions = await getGiftCardTransactions(giftCard.id);
    return successResponse(transactions);
  } catch (error) {
    return handleApiError(error, "get gift card transactions");
  }
}

