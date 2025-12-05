/**
 * Admin Homepage Sections API Route / Admin Ana Səhifə Bölmələri API Route-u
 * This endpoint handles homepage section management for admin panel
 * Bu endpoint admin panel üçün ana səhifə bölməsi idarəetməsini idarə edir
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
import { 
  getHomepageSections, 
  createHomepageSection,
  SectionType,
  type CreateHomepageSectionData 
} from "@/services/homepage.service";
import { logger } from "@/lib/utils/logger";

// GET /api/admin/homepage/sections - Get all homepage sections / Bütün ana səhifə bölmələrini al
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;
    
    // Check if user is admin / İstifadəçinin admin olduğunu yoxla
    const roleCheck = requireAdmin(user);
    if (roleCheck) return roleCheck;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as SectionType | null;
    const isActive = searchParams.get("isActive");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const filters: {
      type?: SectionType;
      isActive?: boolean;
    } = {};

    if (type) {
      filters.type = type;
    }

    if (isActive !== null) {
      filters.isActive = isActive === "true";
    }

    const sections = await getHomepageSections(filters);

    // Pagination / Səhifələmə
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedSections = sections.slice(startIndex, endIndex);

    logger.info('Admin fetched homepage sections / Admin ana səhifə bölmələrini əldə etdi', {
      adminId: user.id,
      count: sections.length,
      filters,
    });

    return successResponseWithPagination(
      paginatedSections,
      {
        page,
        limit,
        total: sections.length,
        totalPages: Math.ceil(sections.length / limit),
      },
      "Homepage sections fetched successfully / Ana səhifə bölmələri uğurla əldə edildi"
    );
  } catch (error) {
    return handleApiError(error, "fetch homepage sections");
  }
}

// POST /api/admin/homepage/sections - Create new homepage section / Yeni ana səhifə bölməsi yarat
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
      type, 
      title, 
      subtitle, 
      content, 
      order, 
      config 
    } = body;

    // Validate required fields / Tələb olunan sahələri yoxla
    if (!type) {
      return badRequestResponse(
        "Type is required / Tip tələb olunur"
      );
    }

    // Validate type / Tipi yoxla
    const validTypes = Object.values(SectionType);
    if (!validTypes.includes(type)) {
      return badRequestResponse(
        `Invalid type. Valid types are: ${validTypes.join(", ")} / Etibarsız tip. Etibarlı tiplər: ${validTypes.join(", ")}`
      );
    }

    const sectionData: CreateHomepageSectionData = {
      type: type as SectionType,
      title,
      subtitle,
      content,
      order: order || 0,
      config,
    };

    const section = await createHomepageSection(sectionData, user.id);

    logger.info('Admin created homepage section / Admin ana səhifə bölməsi yaratdı', {
      adminId: user.id,
      sectionId: section.id,
      type: section.type,
    });

    return successResponse(
      section, 
      "Homepage section created successfully / Ana səhifə bölməsi uğurla yaradıldı"
    );
  } catch (error) {
    return handleApiError(error, "create homepage section");
  }
}

