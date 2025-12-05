/**
 * Wishlist Notes API Route / İstək Siyahısı Qeydləri API Route
 * Manage wishlist item notes / İstək siyahısı element qeydlərini idarə et
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { db } from "@/lib/db";
import { logger } from "@/lib/utils/logger";

/**
 * GET /api/wishlist/notes?wishlistItemId=xxx
 * Get note for a wishlist item / İstək siyahısı elementi üçün qeydi al
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const { searchParams } = new URL(request.url);
    const wishlistItemId = searchParams.get("wishlistItemId");

    if (!wishlistItemId) {
      return NextResponse.json(
        { success: false, error: "Wishlist item ID is required / İstək siyahısı elementi ID-si tələb olunur" },
        { status: 400 }
      );
    }

    // Verify wishlist item belongs to user / İstək siyahısı elementinin istifadəçiyə aid olduğunu yoxla
    const wishlistItem = await (db as any).wishlistItem.findUnique({
      where: { id: wishlistItemId },
    });

    if (!wishlistItem || wishlistItem.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: "Wishlist item not found / İstək siyahısı elementi tapılmadı" },
        { status: 404 }
      );
    }

    const note = await (db as any).wishlistNote.findUnique({
      where: { wishlistItemId },
    });

    return successResponse(note || null);
  } catch (error) {
    return handleApiError(error, "get wishlist note");
  }
}

/**
 * POST /api/wishlist/notes
 * Create or update note for a wishlist item / İstək siyahısı elementi üçün qeyd yarat və ya yenilə
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const body = await request.json();
    const { wishlistItemId, note } = body;

    if (!wishlistItemId || !note) {
      return NextResponse.json(
        { success: false, error: "Wishlist item ID and note are required / İstək siyahısı elementi ID-si və qeyd tələb olunur" },
        { status: 400 }
      );
    }

    if (note.length > 500) {
      return NextResponse.json(
        { success: false, error: "Note must be 500 characters or less / Qeyd 500 simvoldan az olmalıdır" },
        { status: 400 }
      );
    }

    // Verify wishlist item belongs to user / İstək siyahısı elementinin istifadəçiyə aid olduğunu yoxla
    const wishlistItem = await (db as any).wishlistItem.findUnique({
      where: { id: wishlistItemId },
    });

    if (!wishlistItem || wishlistItem.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: "Wishlist item not found / İstək siyahısı elementi tapılmadı" },
        { status: 404 }
      );
    }

    // Create or update note / Qeyd yarat və ya yenilə
    const existingNote = await (db as any).wishlistNote.findUnique({
      where: { wishlistItemId },
    });

    let result;
    if (existingNote) {
      result = await (db as any).wishlistNote.update({
        where: { id: existingNote.id },
        data: { note },
      });
    } else {
      result = await (db as any).wishlistNote.create({
        data: {
          wishlistItemId,
          note,
        },
      });
    }

    logger.info("Wishlist note saved / İstək siyahısı qeydi saxlanıldı", {
      userId: user.id,
      wishlistItemId,
    });

    return successResponse(result);
  } catch (error) {
    return handleApiError(error, "save wishlist note");
  }
}

/**
 * DELETE /api/wishlist/notes?wishlistItemId=xxx
 * Delete note for a wishlist item / İstək siyahısı elementi üçün qeydi sil
 */
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const { searchParams } = new URL(request.url);
    const wishlistItemId = searchParams.get("wishlistItemId");

    if (!wishlistItemId) {
      return NextResponse.json(
        { success: false, error: "Wishlist item ID is required / İstək siyahısı elementi ID-si tələb olunur" },
        { status: 400 }
      );
    }

    // Verify wishlist item belongs to user / İstək siyahısı elementinin istifadəçiyə aid olduğunu yoxla
    const wishlistItem = await (db as any).wishlistItem.findUnique({
      where: { id: wishlistItemId },
    });

    if (!wishlistItem || wishlistItem.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: "Wishlist item not found / İstək siyahısı elementi tapılmadı" },
        { status: 404 }
      );
    }

    await (db as any).wishlistNote.deleteMany({
      where: { wishlistItemId },
    });

    logger.info("Wishlist note deleted / İstək siyahısı qeydi silindi", {
      userId: user.id,
      wishlistItemId,
    });

    return successResponse({ success: true });
  } catch (error) {
    return handleApiError(error, "delete wishlist note");
  }
}

