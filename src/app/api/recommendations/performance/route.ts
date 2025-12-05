/**
 * Recommendation Performance API Route / Tövsiyə Performansı API Route
 * Get recommendation performance metrics / Tövsiyə performans metrikalarını al
 */

import { NextRequest, NextResponse } from "next/server";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { getRecommendationPerformance } from "@/lib/recommendations/performance";

/**
 * GET /api/recommendations/performance
 * Get recommendation performance metrics / Tövsiyə performans metrikalarını al
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const recommendationType = searchParams.get('type') || undefined;
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;

    const performance = await getRecommendationPerformance(recommendationType, startDate, endDate);

    return successResponse(performance);
  } catch (error) {
    return handleApiError(error, "get recommendation performance");
  }
}

