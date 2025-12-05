/**
 * Question API Route / Sual API Route
 * Update and delete questions / Sualları yenilə və sil
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { db } from "@/lib/db";
import { logger } from "@/lib/utils/logger";

/**
 * PUT /api/questions/[id]
 * Update question / Sualı yenilə
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
    const { id: questionId } = await params;
    const body = await request.json();
    const { question } = body;

    if (!question || question.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Question is required / Sual tələb olunur" },
        { status: 400 }
      );
    }

    // Check if user owns the question / İstifadəçinin sualın sahibi olub-olmadığını yoxla
    const existingQuestion = await (db as any).productQuestion.findFirst({
      where: {
        id: questionId,
        userId: user.id,
      },
    });

    if (!existingQuestion && user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: "Unauthorized / Yetkisiz" },
        { status: 403 }
      );
    }

    const updatedQuestion = await (db as any).productQuestion.update({
      where: { id: questionId },
      data: { question },
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

    logger.info("Question updated / Sual yeniləndi", {
      questionId,
      userId: user.id,
    });

    return successResponse(updatedQuestion);
  } catch (error) {
    return handleApiError(error, "update question");
  }
}

/**
 * DELETE /api/questions/[id]
 * Delete question / Sualı sil
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
    const { id: questionId } = await params;

    // Check if user owns the question or is admin / İstifadəçinin sualın sahibi və ya admin olub-olmadığını yoxla
    const existingQuestion = await (db as any).productQuestion.findFirst({
      where: {
        id: questionId,
        ...(user.role !== 'ADMIN' ? { userId: user.id } : {}),
      },
    });

    if (!existingQuestion) {
      return NextResponse.json(
        { success: false, error: "Unauthorized / Yetkisiz" },
        { status: 403 }
      );
    }

    await (db as any).productQuestion.delete({
      where: { id: questionId },
    });

    logger.info("Question deleted / Sual silindi", {
      questionId,
      userId: user.id,
    });

    return successResponse({ success: true });
  } catch (error) {
    return handleApiError(error, "delete question");
  }
}

