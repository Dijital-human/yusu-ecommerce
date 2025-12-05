/**
 * Gift Cards API Route / Hədiyyə Kartları API Route
 * Manage gift cards / Hədiyyə kartlarını idarə et
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { createGiftCard, getUserGiftCards, getGiftCardByCode } from "@/lib/gift-cards/gift-card-manager";
import { logger } from "@/lib/utils/logger";

/**
 * GET /api/gift-cards
 * Get user's gift cards / İstifadəçinin hədiyyə kartlarını al
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (code) {
      // Get gift card by code / Kod ilə hədiyyə kartını al
      const giftCard = await getGiftCardByCode(code);
      if (!giftCard) {
        return NextResponse.json(
          { success: false, error: "Gift card not found / Hədiyyə kartı tapılmadı" },
          { status: 404 }
        );
      }
      return successResponse(giftCard);
    }

    // Get user's gift cards / İstifadəçinin hədiyyə kartlarını al
    const giftCards = await getUserGiftCards(user.id);
    return successResponse(giftCards);
  } catch (error) {
    return handleApiError(error, "get gift cards");
  }
}

/**
 * POST /api/gift-cards
 * Purchase/create gift card / Hədiyyə kartı al/yarat
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const body = await request.json();
    const {
      amount,
      expiryDate,
      templateId,
      recipientName,
      recipientEmail,
      customMessage,
      scheduledDeliveryDate,
    } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Amount is required and must be greater than 0 / Məbləğ tələb olunur və 0-dan böyük olmalıdır" },
        { status: 400 }
      );
    }

    // Validate amount / Məbləği yoxla
    const validAmounts = [10, 25, 50, 100];
    if (!validAmounts.includes(amount) && amount < 10) {
      return NextResponse.json(
        { success: false, error: "Invalid amount. Valid amounts: $10, $25, $50, $100, or custom (min $10) / Etibarsız məbləğ. Etibarlı məbləğlər: $10, $25, $50, $100, və ya xüsusi (min $10)" },
        { status: 400 }
      );
    }

    // Validate scheduled delivery date / Planlaşdırılmış çatdırılma tarixini yoxla
    if (scheduledDeliveryDate) {
      const scheduledDate = new Date(scheduledDeliveryDate);
      if (scheduledDate < new Date()) {
        return NextResponse.json(
          { success: false, error: "Scheduled delivery date must be in the future / Planlaşdırılmış çatdırılma tarixi gələcəkdə olmalıdır" },
          { status: 400 }
        );
      }
    }

    const giftCard = await createGiftCard({
      amount,
      purchasedBy: user.id,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      templateId,
      recipientName,
      recipientEmail,
      customMessage,
      scheduledDeliveryDate: scheduledDeliveryDate ? new Date(scheduledDeliveryDate) : undefined,
    });

    logger.info("Gift card purchased / Hədiyyə kartı alındı", {
      userId: user.id,
      giftCardId: giftCard.id,
      amount,
      scheduledDeliveryDate: giftCard.scheduledDeliveryDate,
    });

    return successResponse(giftCard, "Gift card created successfully / Hədiyyə kartı uğurla yaradıldı");
  } catch (error) {
    return handleApiError(error, "create gift card");
  }
}

