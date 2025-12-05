/**
 * Affiliate Registration API Route / Affiliate Qeydiyyatı API Route
 * Register as affiliate / Affiliate kimi qeydiyyatdan keç
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { createOrUpdateAffiliateProgram } from "@/lib/affiliate/affiliate-manager";
import { logger } from "@/lib/utils/logger";

/**
 * POST /api/affiliate/register
 * Register as affiliate / Affiliate kimi qeydiyyatdan keç
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Check if user is seller / İstifadəçinin satıcı olub-olmadığını yoxla
    if (user.role !== 'SELLER' && user.role !== 'SUPER_SELLER' && user.role !== 'USER_SELLER') {
      return NextResponse.json(
        { success: false, error: "Only sellers can create affiliate programs / Yalnız satıcılar affiliate proqram yarada bilər" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { commissionRate, isActive, minPayout } = body;

    const program = await createOrUpdateAffiliateProgram(user.id, {
      commissionRate: commissionRate ? parseFloat(commissionRate) : undefined,
      isActive: isActive !== undefined ? isActive : undefined,
      minPayout: minPayout ? parseFloat(minPayout) : undefined,
    });

    logger.info("Affiliate program registered / Affiliate proqram qeydiyyatdan keçdi", {
      programId: program.id,
      sellerId: user.id,
    });

    return successResponse(program);
  } catch (error) {
    return handleApiError(error, "register affiliate program");
  }
}

/**
 * GET /api/affiliate/register
 * Get affiliate program / Affiliate proqramı al
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    const { getAffiliateProgram } = await import("@/lib/affiliate/affiliate-manager");
    const program = await getAffiliateProgram(user.id);

    return successResponse(program || null);
  } catch (error) {
    return handleApiError(error, "get affiliate program");
  }
}

