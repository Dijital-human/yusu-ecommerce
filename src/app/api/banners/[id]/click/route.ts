/**
 * Banner Click Tracking API Route / Banner Klik İzləmə API Route-u
 * Tracks banner clicks for analytics
 * Analitika üçün banner kliklərini izləyir
 */

import { NextRequest } from "next/server";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { trackBannerClick } from "@/services/banner.service";

// POST /api/banners/[id]/click - Track banner click / Banner klikini izlə
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bannerId } = await params;
    await trackBannerClick(bannerId);
    return successResponse({ tracked: true });
  } catch (error) {
    return handleApiError(error, "track banner click");
  }
}

