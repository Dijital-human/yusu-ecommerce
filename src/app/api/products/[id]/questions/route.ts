/**
 * Product Questions API Route / Məhsul Sualları API Route
 * Get and create product questions / Məhsul suallarını al və yarat
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { getProductQuestions, createProductQuestion } from "@/lib/qa/qa-service";
import { logger } from "@/lib/utils/logger";

/**
 * GET /api/products/[id]/questions
 * Get product questions / Məhsul suallarını al
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = (searchParams.get('sortBy') || 'newest') as 'newest' | 'oldest' | 'most_helpful';
    const status = (searchParams.get('status') || 'all') as 'all' | 'answered' | 'unanswered';

    const result = await getProductQuestions(productId, {
      page,
      limit,
      sortBy,
      status,
    });

    return successResponse(result);
  } catch (error) {
    return handleApiError(error, "get product questions");
  }
}

/**
 * POST /api/products/[id]/questions
 * Ask question / Sual ver
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
    const body = await request.json();
    const { question } = body;

    if (!question || question.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Question is required / Sual tələb olunur" },
        { status: 400 }
      );
    }

    if (question.length > 1000) {
      return NextResponse.json(
        { success: false, error: "Question is too long (max 1000 characters) / Sual çox uzundur (maksimum 1000 simvol)" },
        { status: 400 }
      );
    }

    const newQuestion = await createProductQuestion(productId, user.id, question);

    logger.info("Product question created / Məhsul sualı yaradıldı", {
      questionId: newQuestion.id,
      productId,
      userId: user.id,
    });

    return successResponse(newQuestion);
  } catch (error) {
    return handleApiError(error, "create product question");
  }
}

