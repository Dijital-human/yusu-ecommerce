/**
 * Review Vote API Route / Rəy Səsi API Route
 * Vote on review / Rəyə səs ver
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { voteOnReview, removeReviewVote } from "@/lib/reviews/review-enhancement";

/**
 * POST /api/products/[id]/reviews/[reviewId]/vote
 * Vote on review / Rəyə səs ver
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
    const body = await request.json();
    const { voteType } = body;

    if (!voteType || !['helpful', 'not_helpful'].includes(voteType)) {
      return NextResponse.json(
        { success: false, error: "Invalid vote type. Must be 'helpful' or 'not_helpful' / Etibarsız səs tipi. 'helpful' və ya 'not_helpful' olmalıdır" },
        { status: 400 }
      );
    }

    const vote = await voteOnReview(reviewId, user.id, voteType as 'helpful' | 'not_helpful');

    return successResponse(vote);
  } catch (error) {
    return handleApiError(error, "vote on review");
  }
}

/**
 * DELETE /api/products/[id]/reviews/[reviewId]/vote
 * Remove review vote / Rəy səsini sil
 */
export async function DELETE(
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

    await removeReviewVote(reviewId, user.id);

    return successResponse(null, "Vote removed successfully / Səs uğurla silindi");
  } catch (error) {
    return handleApiError(error, "remove review vote");
  }
}

