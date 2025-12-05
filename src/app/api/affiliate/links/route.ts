/**
 * Affiliate Links API Route / Affiliate Linkləri API Route
 * Manage affiliate links / Affiliate linkləri idarə et
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { createAffiliateLink, getAffiliateLinks, trackAffiliateClick } from "@/lib/affiliate/affiliate-manager";
import { logger } from "@/lib/utils/logger";

/**
 * GET /api/affiliate/links
 * Get affiliate links / Affiliate linkləri al
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
    const productId = searchParams.get('productId') || undefined;

    const result = await getAffiliateLinks(user.id, {
      page,
      limit,
      productId,
    });

    return successResponse(result);
  } catch (error) {
    return handleApiError(error, "get affiliate links");
  }
}

/**
 * POST /api/affiliate/links
 * Create affiliate link / Affiliate link yarat
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const body = await request.json();
    const { productId } = body;

    const link = await createAffiliateLink(user.id, productId);

    logger.info("Affiliate link created / Affiliate link yaradıldı", {
      linkId: link.id,
      affiliateId: user.id,
      productId,
    });

    return successResponse(link);
  } catch (error) {
    return handleApiError(error, "create affiliate link");
  }
}

/**
 * PUT /api/affiliate/links?linkCode=[code]
 * Track affiliate click / Affiliate klikini izlə
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const linkCode = searchParams.get('linkCode');

    if (!linkCode) {
      return NextResponse.json(
        { success: false, error: "Link code is required / Link kodu tələb olunur" },
        { status: 400 }
      );
    }

    const link = await trackAffiliateClick(linkCode);

    return successResponse(link);
  } catch (error) {
    return handleApiError(error, "track affiliate click");
  }
}

