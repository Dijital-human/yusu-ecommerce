/**
 * Admin Banner Detail API Route / Admin Banner Detal API Route-u
 * This endpoint handles individual banner operations
 * Bu endpoint fərdi banner əməliyyatlarını idarə edir
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
  getBannerById, 
  updateBanner, 
  deleteBanner,
  activateBanner,
  deactivateBanner,
  BannerPosition,
  type UpdateBannerData 
} from "@/services/banner.service";
import { logger } from "@/lib/utils/logger";

// GET /api/admin/banners/[id] - Get banner details / Banner detallarını əldə et
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

    const { id: bannerId } = await params;

    try {
      const banner = await getBannerById(bannerId);
      return successResponse(banner);
    } catch (error: any) {
      if (error.message?.includes("not found") || error.message?.includes("tapılmadı")) {
        return notFoundResponse("Banner");
      }
      throw error;
    }
  } catch (error) {
    return handleApiError(error, "fetch banner");
  }
}

// PUT /api/admin/banners/[id] - Update banner / Banner yenilə
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
    const body = await request.json();
    const { 
      title, 
      subtitle, 
      image, 
      link, 
      position, 
      isActive, 
      priority, 
      startDate, 
      endDate, 
      targetAudience 
    } = body;

    // Validate position if provided / Əgər verilibsə mövqeyi yoxla
    if (position) {
      const validPositions = Object.values(BannerPosition);
      if (!validPositions.includes(position as BannerPosition)) {
        return badRequestResponse(
          `Invalid position. Valid positions are: ${validPositions.join(", ")} / Etibarsız mövqe. Etibarlı mövqelər: ${validPositions.join(", ")}`
        );
      }
    }

    const updateData: UpdateBannerData = {
      ...(title !== undefined && { title }),
      ...(subtitle !== undefined && { subtitle }),
      ...(image !== undefined && { image }),
      ...(link !== undefined && { link }),
      ...(position !== undefined && { position: position as BannerPosition }),
      ...(isActive !== undefined && { isActive }),
      ...(priority !== undefined && { priority }),
      ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
      ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
      ...(targetAudience !== undefined && { targetAudience }),
    };

    try {
      const banner = await updateBanner(bannerId, updateData, user.id);
      
      logger.info('Admin updated banner / Admin banner yenilədi', {
        adminId: user.id,
        bannerId,
      });

      return successResponse(
        banner, 
        "Banner updated successfully / Banner uğurla yeniləndi"
      );
    } catch (error: any) {
      if (error.message?.includes("not found") || error.message?.includes("tapılmadı")) {
        return notFoundResponse("Banner");
      }
      throw error;
    }
  } catch (error) {
    return handleApiError(error, "update banner");
  }
}

// DELETE /api/admin/banners/[id] - Delete banner / Banner sil
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

    const { id: bannerId } = await params;

    try {
      await deleteBanner(bannerId);
      
      logger.info('Admin deleted banner / Admin banner sildi', {
        adminId: user.id,
        bannerId,
      });

      return successResponse(
        { id: bannerId }, 
        "Banner deleted successfully / Banner uğurla silindi"
      );
    } catch (error: any) {
      if (error.message?.includes("not found") || error.message?.includes("tapılmadı")) {
        return notFoundResponse("Banner");
      }
      throw error;
    }
  } catch (error) {
    return handleApiError(error, "delete banner");
  }
}

