/**
 * Affiliate Commissions API Route / Affiliate Komissiyaları API Route
 * Get affiliate commissions / Affiliate komissiyalarını al
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { getAffiliateCommissions } from "@/lib/affiliate/affiliate-manager";

/**
 * GET /api/affiliate/commissions
 * Get affiliate commissions / Affiliate komissiyalarını al
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
    const status = searchParams.get('status') || undefined;

    const result = await getAffiliateCommissions(user.id, {
      page,
      limit,
      status,
    });

    return successResponse(result);
  } catch (error) {
    return handleApiError(error, "get affiliate commissions");
  }
}

