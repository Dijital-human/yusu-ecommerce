/**
 * Admin Pages API Route (CMS) / Admin Səhifələr API Route-u (CMS)
 * This endpoint handles CMS page management for admin panel
 * Bu endpoint admin panel üçün CMS səhifə idarəetməsini idarə edir
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
  getPages, 
  createPage,
  type CreatePageData 
} from "@/services/page.service";
import { logger } from "@/lib/utils/logger";

// GET /api/admin/pages - Get all pages / Bütün səhifələri al
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;
    
    // Check if user is admin / İstifadəçinin admin olduğunu yoxla
    const roleCheck = requireAdmin(user);
    if (roleCheck) return roleCheck;

    const { searchParams } = new URL(request.url);
    const isPublished = searchParams.get("isPublished");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const filters: {
      isPublished?: boolean;
      search?: string;
    } = {};

    if (isPublished !== null) {
      filters.isPublished = isPublished === "true";
    }

    if (search) {
      filters.search = search;
    }

    const pages = await getPages(filters);

    // Pagination / Səhifələmə
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPages = pages.slice(startIndex, endIndex);

    logger.info('Admin fetched pages / Admin səhifələri əldə etdi', {
      adminId: user.id,
      count: pages.length,
      filters,
    });

    return successResponseWithPagination(
      paginatedPages,
      {
        page,
        limit,
        total: pages.length,
        totalPages: Math.ceil(pages.length / limit),
      },
      "Pages fetched successfully / Səhifələr uğurla əldə edildi"
    );
  } catch (error) {
    return handleApiError(error, "fetch pages");
  }
}

// POST /api/admin/pages - Create new page / Yeni səhifə yarat
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
      slug, 
      title, 
      content, 
      metaTitle, 
      metaDescription 
    } = body;

    // Validate required fields / Tələb olunan sahələri yoxla
    if (!title || !content) {
      return badRequestResponse(
        "Title and content are required / Başlıq və məzmun tələb olunur"
      );
    }

    const pageData: CreatePageData = {
      slug,
      title,
      content,
      metaTitle: metaTitle || title,
      metaDescription,
    };

    try {
      const page = await createPage(pageData, user.id);

      logger.info('Admin created page / Admin səhifə yaratdı', {
        adminId: user.id,
        pageId: page.id,
        slug: page.slug,
      });

      return successResponse(
        page, 
        "Page created successfully / Səhifə uğurla yaradıldı"
      );
    } catch (error: any) {
      if (error.message?.includes("already exists") || error.message?.includes("artıq mövcuddur")) {
        return badRequestResponse(error.message);
      }
      throw error;
    }
  } catch (error) {
    return handleApiError(error, "create page");
  }
}

