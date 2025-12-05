/**
 * Product Review Analytics API Route / Məhsul Rəy Analitikası API Route
 * Get review analytics for a product / Məhsul üçün rəy analitikasını al
 */

import { NextRequest, NextResponse } from "next/server";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { getReviewAnalytics } from "@/lib/db/product-reviews";

/**
 * GET /api/products/[id]/reviews/analytics
 * Get review analytics / Rəy analitikasını al
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    const analytics = await getReviewAnalytics(productId);

    return successResponse(analytics);
  } catch (error) {
    return handleApiError(error, "get review analytics");
  }
}

