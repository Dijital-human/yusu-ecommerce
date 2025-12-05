/**
 * Banner Impression Tracking API Route / Banner Görüntüləmə İzləmə API Route-u
 * Tracks banner impressions for analytics
 * Analitika üçün banner görüntüləmələrini izləyir
 */

import { NextRequest } from "next/server";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { trackBannerImpression } from "@/services/banner.service";

// POST /api/banners/[id]/impression - Track banner impression / Banner görüntüləməsini izlə
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bannerId } = await params;
    await trackBannerImpression(bannerId);
    return successResponse({ tracked: true });
  } catch (error) {
    return handleApiError(error, "track banner impression");
  }
}

