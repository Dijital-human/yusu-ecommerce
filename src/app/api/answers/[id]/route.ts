/**
 * Answer API Route / Cavab API Route
 * Update and delete answers / Cavabları yenilə və sil
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { db } from "@/lib/db";
import { logger } from "@/lib/utils/logger";

/**
 * PUT /api/answers/[id]
 * Update answer / Cavabı yenilə
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
    const { id: answerId } = await params;
    const body = await request.json();
    const { answer } = body;

    if (!answer || answer.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Answer is required / Cavab tələb olunur" },
        { status: 400 }
      );
    }

    // Check if user owns the answer / İstifadəçinin cavabın sahibi olub-olmadığını yoxla
    const existingAnswer = await (db as any).productAnswer.findFirst({
      where: {
        id: answerId,
        userId: user.id,
      },
    });

    if (!existingAnswer && user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: "Unauthorized / Yetkisiz" },
        { status: 403 }
      );
    }

    const updatedAnswer = await (db as any).productAnswer.update({
      where: { id: answerId },
      data: { answer },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    logger.info("Answer updated / Cavab yeniləndi", {
      answerId,
      userId: user.id,
    });

    return successResponse(updatedAnswer);
  } catch (error) {
    return handleApiError(error, "update answer");
  }
}

/**
 * DELETE /api/answers/[id]
 * Delete answer / Cavabı sil
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
    const { id: answerId } = await params;

    // Check if user owns the answer or is admin / İstifadəçinin cavabın sahibi və ya admin olub-olmadığını yoxla
    const existingAnswer = await (db as any).productAnswer.findFirst({
      where: {
        id: answerId,
        ...(user.role !== 'ADMIN' ? { userId: user.id } : {}),
      },
    });

    if (!existingAnswer) {
      return NextResponse.json(
        { success: false, error: "Unauthorized / Yetkisiz" },
        { status: 403 }
      );
    }

    await (db as any).productAnswer.delete({
      where: { id: answerId },
    });

    logger.info("Answer deleted / Cavab silindi", {
      answerId,
      userId: user.id,
    });

    return successResponse({ success: true });
  } catch (error) {
    return handleApiError(error, "delete answer");
  }
}

