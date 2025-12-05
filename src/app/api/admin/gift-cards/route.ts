/**
 * Admin Gift Cards API Route / Admin Hədiyyə Kartları API Route
 * Admin gift card management / Admin hədiyyə kartı idarəetməsi
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import {
  bulkCreateGiftCards,
  getGiftCardAnalytics,
  getScheduledGiftCards,
  getExpiringGiftCards,
  markGiftCardDelivered,
} from "@/lib/gift-cards/gift-card-manager";
import { getReadClient } from "@/lib/db/query-client";
import { logger } from "@/lib/utils/logger";

/**
 * GET /api/admin/gift-cards
 * Get gift cards with filters (Admin only) / Filtrlərlə hədiyyə kartlarını al (Yalnız Admin)
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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status"); // active, expired, redeemed, scheduled
    const scheduledDate = searchParams.get("scheduledDate");
    const analytics = searchParams.get("analytics") === "true";

    // Return analytics if requested / Sorğu olunarsa analitika qaytar
    if (analytics) {
      const startDate = searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined;
      const endDate = searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined;
      const analyticsData = await getGiftCardAnalytics(startDate, endDate);
      return successResponse(analyticsData);
    }

    // Return scheduled gift cards if requested / Sorğu olunarsa planlaşdırılmış hədiyyə kartlarını qaytar
    if (status === "scheduled") {
      const scheduledGiftCards = await getScheduledGiftCards(
        scheduledDate ? new Date(scheduledDate) : undefined
      );
      return successResponse(scheduledGiftCards);
    }

    // Return expiring gift cards if requested / Sorğu olunarsa tezliklə bitəcək hədiyyə kartlarını qaytar
    if (status === "expiring") {
      const daysAhead = parseInt(searchParams.get("daysAhead") || "30");
      const expiringGiftCards = await getExpiringGiftCards(daysAhead);
      return successResponse(expiringGiftCards);
    }

    // Build where clause / Where şərtini qur
    const where: any = {};
    if (status === "active") {
      where.isActive = true;
      where.balance = { gt: 0 };
      where.OR = [
        { expiryDate: null },
        { expiryDate: { gte: new Date() } },
      ];
    } else if (status === "expired") {
      where.expiryDate = { lt: new Date() };
    } else if (status === "redeemed") {
      where.redeemedBy = { not: null };
    }

    const skip = (page - 1) * limit;

    const readClient = await getReadClient();
    const [giftCards, total] = await Promise.all([
      (readClient as any).giftCard.findMany({
        where,
        include: {
          purchaser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          redeemer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          template: true,
          transactions: {
            orderBy: { createdAt: "desc" },
            take: 5,
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      (readClient as any).giftCard.count({ where }),
    ]);

    return successResponse({
      giftCards,
      pagination: {
        totalItems: total,
        currentPage: page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error, "get admin gift cards");
  }
}

/**
 * POST /api/admin/gift-cards/bulk
 * Bulk create gift cards (Admin only) / Toplu hədiyyə kartı yarat (Yalnız Admin)
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { count, amount, expiryDate, templateId } = body;

    if (!count || count <= 0 || count > 1000) {
      return NextResponse.json(
        { success: false, error: "Count must be between 1 and 1000 / Sayı 1 ilə 1000 arasında olmalıdır" },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Amount is required and must be greater than 0 / Məbləğ tələb olunur və 0-dan böyük olmalıdır" },
        { status: 400 }
      );
    }

    const giftCards = await bulkCreateGiftCards({
      count,
      amount,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      templateId,
    });

    logger.info("Bulk gift cards created / Toplu hədiyyə kartları yaradıldı", {
      adminId: user.id,
      count: giftCards.length,
      amount,
    });

    return successResponse(giftCards, "Bulk gift cards created successfully / Toplu hədiyyə kartları uğurla yaradıldı");
  } catch (error) {
    return handleApiError(error, "bulk create gift cards");
  }
}

