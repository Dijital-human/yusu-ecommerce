/**
 * Homepage API Route (Customer-facing) / Ana Səhifə API Route-u (Customer-facing)
 * This endpoint provides homepage data for customer-facing pages
 * Bu endpoint customer-facing səhifələr üçün ana səhifə məlumatlarını təmin edir
 * 
 * Supports multilingual content through error messages
 * Xəta mesajları vasitəsilə çoxdilli məzmunu dəstəkləyir
 */

import { NextRequest } from "next/server";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { getActiveHomepageSections } from "@/services/homepage.service";
import { getActiveBannersByPosition, BannerPosition } from "@/services/banner.service";

// GET /api/homepage - Get homepage data / Ana səhifə məlumatlarını al
export async function GET(request: NextRequest) {
  try {
    // Get active sections and banners / Aktiv bölmələri və banner-ləri al
    // Return empty arrays if no data exists / Əgər məlumat yoxdursa boş array-lər qaytar
    const [sections, heroBanners, topBanners] = await Promise.all([
      getActiveHomepageSections().catch(() => []),
      getActiveBannersByPosition(BannerPosition.HERO).catch(() => []),
      getActiveBannersByPosition(BannerPosition.TOP).catch(() => []),
    ]);

    return successResponse({
      sections: sections || [],
      banners: {
        hero: heroBanners || [],
        top: topBanners || [],
      },
    });
  } catch (error) {
    return handleApiError(error, "fetch homepage data");
  }
}

