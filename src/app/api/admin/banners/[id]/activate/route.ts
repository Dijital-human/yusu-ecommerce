/**
 * Admin Banner Activate API Route / Admin Banner Aktivləşdirmə API Route-u
 * This endpoint activates a banner
 * Bu endpoint banner-i aktivləşdirir
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
import { activateBanner } from "@/services/banner.service";
import { logger } from "@/lib/utils/logger";

// PUT /api/admin/banners/[id]/activate - Activate banner / Banner aktivləşdir
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
      const banner = await activateBanner(bannerId, user.id);
      
      logger.info('Admin activated banner / Admin banner aktivləşdirdi', {
        adminId: user.id,
        bannerId,
      });

      return successResponse(
        banner, 
        "Banner activated successfully / Banner uğurla aktivləşdirildi"
      );
    } catch (error: any) {
      if (error.message?.includes("not found") || error.message?.includes("tapılmadı")) {
        return notFoundResponse("Banner");
      }
      throw error;
    }
  } catch (error) {
    return handleApiError(error, "activate banner");
  }
}

