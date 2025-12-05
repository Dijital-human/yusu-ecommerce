/**
 * Admin Homepage Section Detail API Route / Admin Ana Səhifə Bölməsi Detal API Route-u
 * This endpoint handles individual homepage section operations
 * Bu endpoint fərdi ana səhifə bölməsi əməliyyatlarını idarə edir
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
  getHomepageSectionById, 
  updateHomepageSection, 
  deleteHomepageSection,
  SectionType,
  type UpdateHomepageSectionData 
} from "@/services/homepage.service";
import { logger } from "@/lib/utils/logger";

// GET /api/admin/homepage/sections/[id] - Get section details / Bölmə detallarını əldə et
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

    const { id: sectionId } = await params;

    try {
      const section = await getHomepageSectionById(sectionId);
      return successResponse(section);
    } catch (error: any) {
      if (error.message?.includes("not found") || error.message?.includes("tapılmadı")) {
        return notFoundResponse("Homepage section");
      }
      throw error;
    }
  } catch (error) {
    return handleApiError(error, "fetch homepage section");
  }
}

// PUT /api/admin/homepage/sections/[id] - Update section / Bölmə yenilə
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

    const { id: sectionId } = await params;
    const body = await request.json();
    const { 
      type, 
      title, 
      subtitle, 
      content, 
      order, 
      isActive, 
      config 
    } = body;

    // Validate type if provided / Əgər verilibsə tipi yoxla
    if (type) {
      const validTypes = Object.values(SectionType);
      if (!validTypes.includes(type as SectionType)) {
        return badRequestResponse(
          `Invalid type. Valid types are: ${validTypes.join(", ")} / Etibarsız tip. Etibarlı tiplər: ${validTypes.join(", ")}`
        );
      }
    }

    const updateData: UpdateHomepageSectionData = {
      ...(type !== undefined && { type: type as SectionType }),
      ...(title !== undefined && { title }),
      ...(subtitle !== undefined && { subtitle }),
      ...(content !== undefined && { content }),
      ...(order !== undefined && { order }),
      ...(isActive !== undefined && { isActive }),
      ...(config !== undefined && { config }),
    };

    try {
      const section = await updateHomepageSection(sectionId, updateData, user.id);
      
      logger.info('Admin updated homepage section / Admin ana səhifə bölməsini yenilədi', {
        adminId: user.id,
        sectionId,
      });

      return successResponse(
        section, 
        "Homepage section updated successfully / Ana səhifə bölməsi uğurla yeniləndi"
      );
    } catch (error: any) {
      if (error.message?.includes("not found") || error.message?.includes("tapılmadı")) {
        return notFoundResponse("Homepage section");
      }
      throw error;
    }
  } catch (error) {
    return handleApiError(error, "update homepage section");
  }
}

// DELETE /api/admin/homepage/sections/[id] - Delete section / Bölmə sil
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

    const { id: sectionId } = await params;

    try {
      await deleteHomepageSection(sectionId);
      
      logger.info('Admin deleted homepage section / Admin ana səhifə bölməsini sildi', {
        adminId: user.id,
        sectionId,
      });

      return successResponse(
        { id: sectionId }, 
        "Homepage section deleted successfully / Ana səhifə bölməsi uğurla silindi"
      );
    } catch (error: any) {
      if (error.message?.includes("not found") || error.message?.includes("tapılmadı")) {
        return notFoundResponse("Homepage section");
      }
      throw error;
    }
  } catch (error) {
    return handleApiError(error, "delete homepage section");
  }
}

