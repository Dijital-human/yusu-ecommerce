/**
 * Categories API Route v1 / Kateqoriyalar API Route-u v1
 * This file handles category operations (v1)
 * Bu fayl kateqoriya əməliyyatlarını idarə edir (v1)
 */

import { NextRequest } from "next/server";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { getAllCategories } from "@/services/category.service";

/**
 * GET /api/v1/categories
 * Get all categories / Bütün kateqoriyaları al
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parentOnly = searchParams.get("parentOnly") === "true";
    const includeProducts = searchParams.get("includeProducts") === "true";

    const categories = await getAllCategories({
      parentOnly,
      includeProducts,
    });

    // Return empty array if no categories / Əgər kateqoriya yoxdursa boş array qaytar
    return successResponse(categories || []);
  } catch (error) {
    return handleApiError(error, "fetch categories");
  }
}

/**
 * POST /api/v1/categories
 * Create a new category / Yeni kateqoriya yarat
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // TODO: Implement category creation / Kateqoriya yaratma tətbiq et
    return successResponse({ message: "Category creation not yet implemented / Kateqoriya yaratma hələ tətbiq edilməyib" });
  } catch (error) {
    return handleApiError(error, "create category");
  }
}

