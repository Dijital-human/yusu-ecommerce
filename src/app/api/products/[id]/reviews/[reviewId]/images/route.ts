/**
 * Review Images API Route / Rəy Şəkilləri API Route
 * Manage review images / Rəy şəkillərini idarə et
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { addReviewImage } from "@/lib/reviews/review-enhancement";
import { db } from "@/lib/db";
import { logger } from "@/lib/utils/logger";

/**
 * POST /api/products/[id]/reviews/[reviewId]/images
 * Add review image / Rəy şəkli əlavə et
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; reviewId: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const { reviewId } = await params;

    // Verify review belongs to user / Rəyin istifadəçiyə aid olduğunu yoxla
    const review = await (db as any).review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json(
        { success: false, error: "Review not found / Rəy tapılmadı" },
        { status: 404 }
      );
    }

    if (review.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized / Yetkisiz" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const images = formData.getAll('images') as File[];

    if (!images || images.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one image is required / Ən azı bir şəkil tələb olunur" },
        { status: 400 }
      );
    }

    if (images.length > 5) {
      return NextResponse.json(
        { success: false, error: "Maximum 5 images allowed / Maksimum 5 şəkil icazə verilir" },
        { status: 400 }
      );
    }

    // Validate file types / Fayl tiplərini yoxla
    for (const file of images) {
      if (!file.type.startsWith('image/')) {
        return NextResponse.json(
          { success: false, error: "All files must be images / Bütün fayllar şəkil olmalıdır" },
          { status: 400 }
        );
      }
    }

    // Upload images / Şəkilləri yüklə
    const uploadedImages = [];
    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      // TODO: Upload file to CDN or cloud storage / Faylı CDN və ya cloud storage-a yüklə
      // For now, return placeholder / İndilik placeholder qaytar
      const imageUrl = `/uploads/reviews/${reviewId}/${file.name}`;
      const image = await addReviewImage(reviewId, imageUrl, i);
      uploadedImages.push(image);
    }

    logger.info("Review images added / Rəy şəkilləri əlavə edildi", {
      reviewId,
      imageCount: uploadedImages.length,
      userId: user.id,
    });

    return successResponse(uploadedImages, "Review images added successfully / Rəy şəkilləri uğurla əlavə edildi");
  } catch (error: any) {
    if (error.message.includes('Maximum')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    return handleApiError(error, "add review image");
  }
}

/**
 * DELETE /api/products/[id]/reviews/[reviewId]/images/[imageId]
 * Delete review image / Rəy şəkli sil
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; reviewId: string; imageId: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const { reviewId, imageId } = await params;

    // Verify review belongs to user / Rəyin istifadəçiyə aid olduğunu yoxla
    const review = await (db as any).review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json(
        { success: false, error: "Review not found / Rəy tapılmadı" },
        { status: 404 }
      );
    }

    if (review.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized / Yetkisiz" },
        { status: 403 }
      );
    }

    await (db as any).reviewImage.delete({
      where: { id: imageId },
    });

    logger.info("Review image deleted / Rəy şəkli silindi", {
      reviewId,
      imageId,
      userId: user.id,
    });

    return successResponse(null, "Review image deleted successfully / Rəy şəkli uğurla silindi");
  } catch (error) {
    return handleApiError(error, "delete review image");
  }
}

