/**
 * Page API Route (Customer-facing) / Səhifə API Route-u (Customer-facing)
 * This endpoint provides CMS pages for customer-facing pages
 * Bu endpoint customer-facing səhifələr üçün CMS səhifələrini təmin edir
 * 
 * Supports multilingual content through error messages
 * Xəta mesajları vasitəsilə çoxdilli məzmunu dəstəkləyir
 */

import { NextRequest } from "next/server";
import { successResponse, notFoundResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { getPageBySlug } from "@/services/page.service";

// GET /api/pages/[slug] - Get page by slug / Slug-a görə səhifə al
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    try {
      const page = await getPageBySlug(slug);
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

