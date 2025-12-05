/**
 * Banners API Route (Customer-facing) / Banner-lər API Route-u (Customer-facing)
 * This endpoint provides active banners for customer-facing pages
 * Bu endpoint customer-facing səhifələr üçün aktiv banner-ləri təmin edir
 * 
 * Supports multilingual content through error messages
 * Xəta mesajları vasitəsilə çoxdilli məzmunu dəstəkləyir
 */

import { NextRequest } from "next/server";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { getActiveBannersByPosition, BannerPosition } from "@/services/banner.service";

// GET /api/banners - Get active banners by position / Position-a görə aktiv banner-ləri al
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get("position") as BannerPosition | null;

    if (!position) {
      return successResponse(
        [], 
        "Position parameter is required / Mövqe parametri tələb olunur"
      );
    }

    // Validate position / Mövqeyi yoxla
    const validPositions = Object.values(BannerPosition);
    if (!validPositions.includes(position)) {
      return successResponse(
        [], 
        `Invalid position. Valid positions are: ${validPositions.join(", ")} / Etibarsız mövqe. Etibarlı mövqelər: ${validPositions.join(", ")}`
      );
    }

    const banners = await getActiveBannersByPosition(position);

    return successResponse(banners);
  } catch (error) {
    return handleApiError(error, "fetch banners");
  }
}

