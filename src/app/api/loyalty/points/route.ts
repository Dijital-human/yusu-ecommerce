/**
 * Loyalty Points API Route / Sədaqət Xalları API Route
 * Get points balance and transactions / Xal balansı və əməliyyatları al
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { getUserPoints, getPointsTransactions } from "@/lib/loyalty/points-manager";

/**
 * GET /api/loyalty/points
 * Get user points balance / İstifadəçi xal balansını al
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type') || undefined;

    const [points, transactions] = await Promise.all([
      getUserPoints(user.id),
      getPointsTransactions(user.id, { page, limit, type }),
    ]);

    return successResponse({
      points,
      transactions,
    });
  } catch (error) {
    return handleApiError(error, "get loyalty points");
  }
}

