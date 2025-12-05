/**
 * Admin Banners API Route / Admin Banner-lər API Route-u
 * This endpoint handles banner management for admin panel
 * Bu endpoint admin panel üçün banner idarəetməsini idarə edir
 * 
 * NOTE: This API is for yusu-admin project to consume
 * QEYD: Bu API yusu-admin proyekti tərəfindən istifadə olunur
 * 
 * Supports multilingual content through error messages
 * Xəta mesajları vasitəsilə çoxdilli məzmunu dəstəkləyir
 */

import { NextRequest } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/api/middleware";
import { successResponse, badRequestResponse, successResponseWithPagination } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { logger } from "@/lib/utils/logger";
import { 
  getBanners, 
  createBanner, 
  BannerPosition,
  type CreateBannerData 
} from "@/services/banner.service";

// GET /api/admin/banners - Get all banners / Bütün banner-ləri al
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;
    
    // Check if user is admin / İstifadəçinin admin olduğunu yoxla
    const roleCheck = requireAdmin(user);
    if (roleCheck) return roleCheck;

    const { searchParams } = new URL(request.url);
    const position = searchParams.get("position") as BannerPosition | null;
    const isActive = searchParams.get("isActive");
    const includeExpired = searchParams.get("includeExpired") === "true";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const filters: {
      position?: BannerPosition;
      isActive?: boolean;
      includeExpired?: boolean;
    } = {};

    if (position) {
      filters.position = position;
    }

    if (isActive !== null) {
      filters.isActive = isActive === "true";
    }

    if (includeExpired) {
      filters.includeExpired = true;
    }

    const banners = await getBanners(filters);

    // Pagination / Səhifələmə
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBanners = banners.slice(startIndex, endIndex);

    logger.info('Admin fetched banners / Admin banner-ləri əldə etdi', {
      adminId: user.id,
      count: banners.length,
      filters,
    });

    return successResponseWithPagination(
      paginatedBanners,
      {
        page,
        limit,
        total: banners.length,
        totalPages: Math.ceil(banners.length / limit),
      },
      "Banners fetched successfully / Banner-lər uğurla əldə edildi"
    );
  } catch (error) {
    return handleApiError(error, "fetch banners");
  }
}

// POST /api/admin/banners - Create new banner / Yeni banner yarat
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;
    
    // Check if user is admin / İstifadəçinin admin olduğunu yoxla
    const roleCheck = requireAdmin(user);
    if (roleCheck) return roleCheck;

    const body = await request.json();
    const { 
      title, 
      subtitle, 
      image, 
      link, 
      position, 
      priority, 
      startDate, 
      endDate, 
      targetAudience 
    } = body;

    // Validate required fields / Tələb olunan sahələri yoxla
    if (!title || !image || !position) {
      return badRequestResponse(
        "Title, image, and position are required / Başlıq, şəkil və mövqe tələb olunur"
      );
    }

    // Validate position / Mövqeyi yoxla
    const validPositions = Object.values(BannerPosition);
    if (!validPositions.includes(position as BannerPosition)) {
      return badRequestResponse(
        `Invalid position. Valid positions are: ${validPositions.join(", ")} / Etibarsız mövqe. Etibarlı mövqelər: ${validPositions.join(", ")}`
      );
    }

    const bannerData: CreateBannerData = {
      title,
      subtitle,
      image,
      link,
      position: position as BannerPosition,
      priority: priority || 0,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      targetAudience,
    };

    const banner = await createBanner(bannerData, user.id);

    logger.info('Admin created banner / Admin banner yaratdı', {
      adminId: user.id,
      bannerId: banner.id,
      position: banner.position,
    });

    return successResponse(
      banner, 
      "Banner created successfully / Banner uğurla yaradıldı"
    );
  } catch (error) {
    return handleApiError(error, "create banner");
  }
}

