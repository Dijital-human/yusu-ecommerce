/**
 * Question Vote API Route / Sual Səs API Route
 * Vote on question / Suala səs ver
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { voteOnQuestion } from "@/lib/qa/qa-service";
import { logger } from "@/lib/utils/logger";

/**
 * PUT /api/questions/[id]/vote
 * Vote on question / Suala səs ver
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
    const { voteType } = body;

    if (!voteType || (voteType !== 'helpful' && voteType !== 'not_helpful')) {
      return NextResponse.json(
        { success: false, error: "Invalid vote type / Yanlış səs tipi" },
        { status: 400 }
      );
    }

    const vote = await voteOnQuestion(questionId, user.id, voteType);

    logger.info("Question voted / Suala səs verildi", {
      questionId,
      userId: user.id,
      voteType,
    });

    return successResponse(vote);
  } catch (error) {
    return handleApiError(error, "vote on question");
  }
}

