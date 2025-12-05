/**
 * Product Videos API Route / Məhsul Videoları API Route
 * Manage product videos / Məhsul videolarını idarə et
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { getProductVideos } from "@/lib/db/product-videos";
import { logger } from "@/lib/utils/logger";
import { getWriteClient } from "@/lib/db/query-client";

/**
 * GET /api/products/[id]/videos
 * Get product videos / Məhsul videolarını al
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    const videos = await getProductVideos(productId);

    return successResponse(videos);
  } catch (error) {
    return handleApiError(error, "get product videos");
  }
}

/**
 * POST /api/products/[id]/videos
 * Upload product video / Məhsul videosu yüklə
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

    // Check if user is seller of this product / İstifadəçinin bu məhsulun satıcısı olub-olmadığını yoxla
    const writeClient = await getWriteClient();
    const product = await writeClient.products.findFirst({
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

    // Support both JSON body (for external URLs) and FormData (for file uploads) / Həm JSON body (xarici URL-lər üçün), həm də FormData (fayl yükləmələri üçün) dəstəyi
    const contentType = request.headers.get('content-type') || '';
    let finalVideoUrl: string;
    let finalThumbnailUrl: string | null = null;
    let finalDuration: number | null = null;
    let title: string | null = null;
    let description: string | null = null;
    let order = 0;

    if (contentType.includes('application/json')) {
      // JSON body - external URL or self-hosted URL / JSON body - xarici URL və ya öz host edilən URL
      const body = await request.json();
      finalVideoUrl = body.videoUrl;
      finalThumbnailUrl = body.thumbnailUrl || null;
      finalDuration = body.duration || null;
      title = body.title || null;
      description = body.description || null;
      order = body.order || 0;

      if (!finalVideoUrl) {
        return NextResponse.json(
          { success: false, error: "Video URL is required / Video URL tələb olunur" },
          { status: 400 }
        );
      }

      // Validate URL format / URL formatını yoxla
      try {
        new URL(finalVideoUrl);
      } catch {
        return NextResponse.json(
          { success: false, error: "Invalid video URL / Etibarsız video URL" },
          { status: 400 }
        );
      }
    } else {
      // FormData - file upload / FormData - fayl yükləmə
      const formData = await request.formData();
      const videoFile = formData.get('video') as File;
      const thumbnailFile = formData.get('thumbnail') as File | null;
      order = parseInt(formData.get('order') as string || '0');
      finalDuration = formData.get('duration') ? parseInt(formData.get('duration') as string) : null;
      title = formData.get('title') as string | null;
      description = formData.get('description') as string | null;

      if (!videoFile) {
        return NextResponse.json(
          { success: false, error: "Video file is required / Video faylı tələb olunur" },
          { status: 400 }
        );
      }

      // Validate video file / Video faylını yoxla
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (videoFile.size > maxSize) {
        return NextResponse.json(
          { success: false, error: "Video file size must be less than 100MB / Video fayl ölçüsü 100MB-dan kiçik olmalıdır" },
          { status: 400 }
        );
      }

      const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
      if (!allowedTypes.includes(videoFile.type)) {
        return NextResponse.json(
          { success: false, error: "Video format must be MP4, WebM, or QuickTime / Video formatı MP4, WebM və ya QuickTime olmalıdır" },
          { status: 400 }
        );
      }

      // TODO: Upload video to CDN / Video-nu CDN-ə yüklə
      // For now, return placeholder / İndilik placeholder qaytar
      finalVideoUrl = `/uploads/videos/${productId}/${Date.now()}-${videoFile.name}`;
      finalThumbnailUrl = thumbnailFile 
        ? `/uploads/thumbnails/${productId}/${Date.now()}-${thumbnailFile.name}`
        : null;
    }

    // Create video record / Video qeydi yarat
    const video = await (writeClient as any).productVideo.create({
      data: {
        productId,
        videoUrl: finalVideoUrl,
        thumbnailUrl: finalThumbnailUrl,
        title,
        description,
        duration: finalDuration,
        order,
        isActive: true,
      },
    });

    logger.info("Product video uploaded / Məhsul videosu yükləndi", {
      videoId: video.id,
      productId,
      userId: user.id,
    });

    return successResponse(video);
  } catch (error) {
    return handleApiError(error, "upload product video");
  }
}

/**
 * DELETE /api/products/[id]/videos
 * Delete product video / Məhsul videosunu sil
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
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');

    if (!videoId) {
      return NextResponse.json(
        { success: false, error: "Video ID is required / Video ID-si tələb olunur" },
        { status: 400 }
      );
    }

    // Check if user is seller of this product / İstifadəçinin bu məhsulun satıcısı olub-olmadığını yoxla
    const writeClient = await getWriteClient();
    const video = await (writeClient as any).productVideo.findFirst({
      where: {
        id: videoId,
        product: {
          id: productId,
          sellerId: user.id,
        },
      },
    });

    if (!video && user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: "Unauthorized / Yetkisiz" },
        { status: 403 }
      );
    }

    // Delete video record / Video qeydini sil
    await (writeClient as any).productVideo.delete({
      where: { id: videoId },
    });

    // TODO: Delete video file from CDN / Video faylını CDN-dən sil

    logger.info("Product video deleted / Məhsul videosu silindi", {
      videoId,
      productId,
      userId: user.id,
    });

    return successResponse({ success: true });
  } catch (error) {
    return handleApiError(error, "delete product video");
  }
}

