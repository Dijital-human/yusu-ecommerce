/**
 * Blog Categories API Route / Blog Kateqoriyaları API Route
 * Handles blog category operations / Blog kateqoriya əməliyyatlarını idarə edir
 */

import { NextRequest, NextResponse } from "next/server";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { getBlogCategories } from "@/lib/content/blog.service";

/**
 * GET /api/blog/categories
 * Get blog categories / Blog kateqoriyalarını al
 */
export async function GET(request: NextRequest) {
  try {
    const categories = await getBlogCategories();
    return successResponse(categories);
  } catch (error) {
    return handleApiError(error, "get blog categories");
  }
}

