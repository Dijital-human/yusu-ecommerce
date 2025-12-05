/**
 * Question Answers API Route / Sual Cavabları API Route
 * Create answer to question / Suala cavab yarat
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { createProductAnswer } from "@/lib/qa/qa-service";
import { logger } from "@/lib/utils/logger";

/**
 * POST /api/questions/[id]/answers
 * Answer question / Suala cavab ver
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
    const { id: questionId } = await params;
    const body = await request.json();
    const { answer } = body;

    if (!answer || answer.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Answer is required / Cavab tələb olunur" },
        { status: 400 }
      );
    }

    if (answer.length > 2000) {
      return NextResponse.json(
        { success: false, error: "Answer is too long (max 2000 characters) / Cavab çox uzundur (maksimum 2000 simvol)" },
        { status: 400 }
      );
    }

    // Check if user is seller / İstifadəçinin satıcı olub-olmadığını yoxla
    const isSeller = user.role === 'SELLER' || user.role === 'SUPER_SELLER' || user.role === 'USER_SELLER';

    const newAnswer = await createProductAnswer(questionId, user.id, answer, isSeller);

    logger.info("Answer created / Cavab yaradıldı", {
      answerId: newAnswer.id,
      questionId,
      userId: user.id,
    });

    return successResponse(newAnswer);
  } catch (error) {
    return handleApiError(error, "create answer");
  }
}

