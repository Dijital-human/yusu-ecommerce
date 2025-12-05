/**
 * Price Alerts API Route / Qiymət Bildirişləri API Route
 * Manage price alerts for wishlist items / İstək siyahısı elementləri üçün qiymət bildirişlərini idarə et
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { parsePrice } from "@/lib/utils/price-helpers";
import { db } from "@/lib/db";
import { logger } from "@/lib/utils/logger";

/**
 * GET /api/wishlist/alerts
 * Get user's price alerts / İstifadəçinin qiymət bildirişlərini al
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    const alerts = await (db as any).priceAlert.findMany({
      where: { userId: user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(alerts);
  } catch (error) {
    return handleApiError(error, "get price alerts");
  }
}

/**
 * POST /api/wishlist/alerts
 * Create price alert / Qiymət bildirişi yarat
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const body = await request.json();
    const { productId, targetPrice, wishlistItemId } = body;

    if (!productId || !targetPrice) {
      return NextResponse.json(
        { success: false, error: "Product ID and target price are required / Məhsul ID-si və hədəf qiymət tələb olunur" },
        { status: 400 }
      );
    }

    // Get current product price / Cari məhsul qiymətini al
    const product = await (db as any).product.findUnique({
      where: { id: productId },
      select: { price: true },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found / Məhsul tapılmadı" },
        { status: 404 }
      );
    }

    const currentPrice = parsePrice(product.price);

    // Check if alert already exists / Bildirişin artıq mövcud olub-olmadığını yoxla
    const existingAlert = await (db as any).priceAlert.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
    });

    let result;
    if (existingAlert) {
      result = await (db as any).priceAlert.update({
        where: { id: existingAlert.id },
        data: {
          targetPrice,
          currentPrice,
          isActive: true,
        },
      });
    } else {
      result = await (db as any).priceAlert.create({
        data: {
          userId: user.id,
          productId,
          wishlistItemId: wishlistItemId || null,
          targetPrice,
          currentPrice,
          isActive: true,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              images: true,
            },
          },
        },
      });
    }

    logger.info("Price alert created / Qiymət bildirişi yaradıldı", {
      userId: user.id,
      productId,
      targetPrice,
    });

    return successResponse(result);
  } catch (error) {
    return handleApiError(error, "create price alert");
  }
}

/**
 * DELETE /api/wishlist/alerts?productId=xxx
 * Delete price alert / Qiymət bildirişini sil
 */
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required / Məhsul ID-si tələb olunur" },
        { status: 400 }
      );
    }

    await (db as any).priceAlert.deleteMany({
      where: {
        userId: user.id,
        productId,
      },
    });

    logger.info("Price alert deleted / Qiymət bildirişi silindi", {
      userId: user.id,
      productId,
    });

    return successResponse({ success: true });
  } catch (error) {
    return handleApiError(error, "delete price alert");
  }
}

