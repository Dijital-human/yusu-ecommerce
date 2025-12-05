/**
 * Admin Page Unpublish API Route (CMS) / Admin Səhifə Unpublish API Route-u (CMS)
 * This endpoint unpublishes a page
 * Bu endpoint səhifəni unpublish edir
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
import { unpublishPage } from "@/services/page.service";
import { logger } from "@/lib/utils/logger";

// PUT /api/admin/pages/[id]/unpublish - Unpublish page / Səhifəni unpublish et
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
      const page = await unpublishPage(pageId, user.id);
      
      logger.info('Admin unpublished page / Admin səhifəni unpublish etdi', {
        adminId: user.id,
        pageId,
      });

      return successResponse(
        page, 
        "Page unpublished successfully / Səhifə uğurla unpublish edildi"
      );
    } catch (error: any) {
      if (error.message?.includes("not found") || error.message?.includes("tapılmadı")) {
        return notFoundResponse("Page");
      }
      throw error;
    }
  } catch (error) {
    return handleApiError(error, "unpublish page");
  }
}

