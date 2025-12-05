/**
 * Admin Banner Deactivate API Route / Admin Banner Deaktivləşdirmə API Route-u
 * This endpoint deactivates a banner
 * Bu endpoint banner-i deaktivləşdirir
 * 
 * NOTE: This API is for yusu-admin project to consume
 * QEYD: Bu API yusu-admin proyekti tərəfindən istifadə olunur
 * 
 * Supports multilingual content through error messages
 * Xəta mesajları vasitəsilə çoxdilli məzmunu dəstəkləyir
 */

import { NextRequest } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/api/middleware";
import { successResponse, notFoundResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { deactivateBanner } from "@/services/banner.service";
import { logger } from "@/lib/utils/logger";

// PUT /api/admin/banners/[id]/deactivate - Deactivate banner / Banner deaktivləşdir
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;
    
    // Check if user is admin / İstifadəçinin admin olduğunu yoxla
    const roleCheck = requireAdmin(user);
    if (roleCheck) return roleCheck;

    const { id: bannerId } = await params;

    try {
      const banner = await deactivateBanner(bannerId, user.id);
      
      logger.info('Admin deactivated banner / Admin banner deaktivləşdirdi', {
        adminId: user.id,
        bannerId,
      });

      return successResponse(
        banner, 
        "Banner deactivated successfully / Banner uğurla deaktivləşdirildi"
      );
    } catch (error: any) {
      if (error.message?.includes("not found") || error.message?.includes("tapılmadı")) {
        return notFoundResponse("Banner");
      }
      throw error;
    }
  } catch (error) {
    return handleApiError(error, "deactivate banner");
  }
}

