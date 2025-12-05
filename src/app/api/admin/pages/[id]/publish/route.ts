/**
 * Admin Page Publish API Route (CMS) / Admin Səhifə Publish API Route-u (CMS)
 * This endpoint publishes a page
 * Bu endpoint səhifəni publish edir
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
import { publishPage } from "@/services/page.service";
import { logger } from "@/lib/utils/logger";

// PUT /api/admin/pages/[id]/publish - Publish page / Səhifəni publish et
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

    const { id: pageId } = await params;

    try {
      const page = await publishPage(pageId, user.id);
      
      logger.info('Admin published page / Admin səhifəni publish etdi', {
        adminId: user.id,
        pageId,
      });

      return successResponse(
        page, 
        "Page published successfully / Səhifə uğurla publish edildi"
      );
    } catch (error: any) {
      if (error.message?.includes("not found") || error.message?.includes("tapılmadı")) {
        return notFoundResponse("Page");
      }
      throw error;
    }
  } catch (error) {
    return handleApiError(error, "publish page");
  }
}

