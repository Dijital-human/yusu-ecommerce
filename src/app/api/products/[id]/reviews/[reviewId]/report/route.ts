/**
 * Review Report API Route / Rəy Şikayəti API Route
 * Report review as spam / Rəyi spam kimi bildir
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { reportReview } from "@/lib/db/product-reviews";

/**
 * POST /api/products/[id]/reviews/[reviewId]/report
 * Report review as spam / Rəyi spam kimi bildir
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

    await reportReview(reviewId, user.id);

    return successResponse({ success: true }, "Review reported successfully / Rəy uğurla bildirildi");
  } catch (error) {
    return handleApiError(error, "report review");
  }
}

