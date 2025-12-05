/**
 * Admin Page Detail API Route (CMS) / Admin Səhifə Detal API Route-u (CMS)
 * This endpoint handles individual CMS page operations
 * Bu endpoint fərdi CMS səhifə əməliyyatlarını idarə edir
 * 
 * NOTE: This API is for yusu-admin project to consume
 * QEYD: Bu API yusu-admin proyekti tərəfindən istifadə olunur
 * 
 * Supports multilingual content through error messages
 * Xəta mesajları vasitəsilə çoxdilli məzmunu dəstəkləyir
 */

import { NextRequest } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/api/middleware";
import { successResponse, notFoundResponse, badRequestResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { 
  getPageById, 
  updatePage, 
  deletePage,
  type UpdatePageData 
} from "@/services/page.service";
import { logger } from "@/lib/utils/logger";

// GET /api/admin/pages/[id] - Get page details / Səhifə detallarını əldə et
export async function GET(
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
      const page = await getPageById(pageId);
      return successResponse(page);
    } catch (error: any) {
      if (error.message?.includes("not found") || error.message?.includes("tapılmadı")) {
        return notFoundResponse("Page");
      }
      throw error;
    }
  } catch (error) {
    return handleApiError(error, "fetch page");
  }
}

// PUT /api/admin/pages/[id] - Update page / Səhifə yenilə
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
    const body = await request.json();
    const { 
      slug, 
      title, 
      content, 
      metaTitle, 
      metaDescription, 
      isPublished 
    } = body;

    const updateData: UpdatePageData = {
      ...(slug !== undefined && { slug }),
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(metaTitle !== undefined && { metaTitle }),
      ...(metaDescription !== undefined && { metaDescription }),
      ...(isPublished !== undefined && { isPublished }),
    };

    try {
      const page = await updatePage(pageId, updateData, user.id);
      
      logger.info('Admin updated page / Admin səhifəni yenilədi', {
        adminId: user.id,
        pageId,
      });

      return successResponse(
        page, 
        "Page updated successfully / Səhifə uğurla yeniləndi"
      );
    } catch (error: any) {
      if (error.message?.includes("not found") || error.message?.includes("tapılmadı")) {
        return notFoundResponse("Page");
      }
      if (error.message?.includes("already exists") || error.message?.includes("artıq mövcuddur")) {
        return badRequestResponse(error.message);
      }
      throw error;
    }
  } catch (error) {
    return handleApiError(error, "update page");
  }
}

// DELETE /api/admin/pages/[id] - Delete page / Səhifə sil
export async function DELETE(
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
      await deletePage(pageId);
      
      logger.info('Admin deleted page / Admin səhifəni sildi', {
        adminId: user.id,
        pageId,
      });

      return successResponse(
        { id: pageId }, 
        "Page deleted successfully / Səhifə uğurla silindi"
      );
    } catch (error: any) {
      if (error.message?.includes("not found") || error.message?.includes("tapılmadı")) {
        return notFoundResponse("Page");
      }
      throw error;
    }
  } catch (error) {
    return handleApiError(error, "delete page");
  }
}

