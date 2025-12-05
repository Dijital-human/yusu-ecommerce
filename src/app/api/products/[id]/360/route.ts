/**
 * Product 360° View API Route / Məhsul 360° Görünüşü API Route
 * Manage product 360° views / Məhsul 360° görünüşlərini idarə et
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { getProduct360View, upsertProduct360View, deleteProduct360View } from "@/lib/db/product-360";
import { logger } from "@/lib/utils/logger";
import { validate360ViewData } from "@/lib/utils/360-viewer";

/**
 * GET /api/products/[id]/360
 * Get product 360° view / Məhsul 360° görünüşünü al
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    const view360 = await getProduct360View(productId);

    if (!view360) {
      return NextResponse.json(
        { success: false, error: "360° view not found / 360° görünüş tapılmadı" },
        { status: 404 }
      );
    }

    return successResponse(view360);
  } catch (error) {
    return handleApiError(error, "get product 360° view");
  }
}

/**
 * POST /api/products/[id]/360
 * Create or update product 360° view / Məhsul 360° görünüşünü yarat və ya yenilə
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const { id: productId } = await params;

    // Check if user is seller of this product or admin / İstifadəçinin bu məhsulun satıcısı və ya admin olub-olmadığını yoxla
    const { getWriteClient } = await import("@/lib/db/query-client");
    const writeClient = await getWriteClient();
    const product = await (writeClient as any).products.findFirst({
      where: {
        id: productId,
        sellerId: user.id,
      },
    });

    if (!product && user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: "Unauthorized / Yetkisiz" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { imageUrls, thumbnailUrl } = body;

    // Validate data / Məlumatları yoxla
    const validation = validate360ViewData(imageUrls);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const view360 = await upsertProduct360View(productId, {
      imageUrls,
      thumbnailUrl,
    });

    logger.info("Product 360° view created/updated / Məhsul 360° görünüşü yaradıldı/yeniləndi", {
      view360Id: view360.id,
      productId,
      userId: user.id,
      frameCount: view360.frameCount,
    });

    return successResponse(view360);
  } catch (error) {
    return handleApiError(error, "create/update product 360° view");
  }
}

/**
 * DELETE /api/products/[id]/360
 * Delete product 360° view / Məhsul 360° görünüşünü sil
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const { id: productId } = await params;

    // Check if user is seller of this product or admin / İstifadəçinin bu məhsulun satıcısı və ya admin olub-olmadığını yoxla
    const { getWriteClient } = await import("@/lib/db/query-client");
    const writeClient = await getWriteClient();
    const product = await (writeClient as any).products.findFirst({
      where: {
        id: productId,
        sellerId: user.id,
      },
    });

    if (!product && user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: "Unauthorized / Yetkisiz" },
        { status: 403 }
      );
    }

    await deleteProduct360View(productId);

    logger.info("Product 360° view deleted / Məhsul 360° görünüşü silindi", {
      productId,
      userId: user.id,
    });

    return successResponse({ success: true });
  } catch (error) {
    return handleApiError(error, "delete product 360° view");
  }
}

