/**
 * Product 3D Models API Route / Məhsul 3D Modelləri API Route
 * Manage product 3D models / Məhsul 3D modellərini idarə et
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { db } from "@/lib/db";
import { validate3DModelFile } from "@/lib/ar/3d-model-loader";
import { logger } from "@/lib/utils/logger";

/**
 * GET /api/products/[id]/3d-models
 * Get product 3D model / Məhsul 3D modelini al
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const model3D = await (db as any).product3DModel.findUnique({
      where: { productId: id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!model3D) {
      return NextResponse.json(
        { success: false, error: "3D model not found / 3D model tapılmadı" },
        { status: 404 }
      );
    }

    return successResponse(model3D);
  } catch (error) {
    return handleApiError(error, "get product 3D model");
  }
}

/**
 * POST /api/products/[id]/3d-models
 * Upload product 3D model / Məhsul 3D modelini yüklə
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
    const { id } = await params;

    // Verify user is seller or admin / İstifadəçinin satıcı və ya admin olduğunu yoxla
    const product = await (db as any).product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found / Məhsul tapılmadı" },
        { status: 404 }
      );
    }

    if (product.sellerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: "Unauthorized / Yetkisiz" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "File is required / Fayl tələb olunur" },
        { status: 400 }
      );
    }

    // Validate file / Faylı yoxla
    const validation = validate3DModelFile(file);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // TODO: Upload file to CDN or cloud storage / Faylı CDN və ya cloud storage-a yüklə
    // For now, return placeholder / İndilik placeholder qaytar
    const modelUrl = `/uploads/3d-models/${id}/${file.name}`;
    const format = file.name.split('.').pop()?.toLowerCase() || 'gltf';

    // Create or update 3D model record / 3D model qeydini yarat və ya yenilə
    const model3D = await (db as any).product3DModel.upsert({
      where: { productId: id },
      update: {
        modelUrl,
        format,
        fileSize: file.size,
        isActive: true,
      },
      create: {
        productId: id,
        modelUrl,
        format,
        fileSize: file.size,
        isActive: true,
      },
    });

    logger.info("Product 3D model uploaded / Məhsul 3D modeli yükləndi", {
      productId: id,
      modelId: model3D.id,
      format,
      fileSize: file.size,
    });

    return successResponse(model3D, "3D model uploaded successfully / 3D model uğurla yükləndi");
  } catch (error) {
    return handleApiError(error, "upload product 3D model");
  }
}

/**
 * DELETE /api/products/[id]/3d-models
 * Delete product 3D model / Məhsul 3D modelini sil
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
    const { id } = await params;

    // Verify user is seller or admin / İstifadəçinin satıcı və ya admin olduğunu yoxla
    const product = await (db as any).product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found / Məhsul tapılmadı" },
        { status: 404 }
      );
    }

    if (product.sellerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: "Unauthorized / Yetkisiz" },
        { status: 403 }
      );
    }

    await (db as any).product3DModel.delete({
      where: { productId: id },
    });

    logger.info("Product 3D model deleted / Məhsul 3D modeli silindi", {
      productId: id,
    });

    return successResponse(null, "3D model deleted successfully / 3D model uğurla silindi");
  } catch (error) {
    return handleApiError(error, "delete product 3D model");
  }
}

