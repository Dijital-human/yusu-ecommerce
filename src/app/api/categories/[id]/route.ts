/**
 * Category Details API Route / Kateqoriya Detalları API Route
 * This route handles fetching detailed information about a specific category
 * Bu route müəyyən kateqoriya haqqında ətraflı məlumat almağı idarə edir
 */

import { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api/error-handler";
import { successResponse } from "@/lib/api/response";
import { getCategory } from "@/services/category.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const categoryId = resolvedParams.id;

    // Get category with stats using service layer / Service layer istifadə edərək statistikalar ilə kateqoriyanı al
    const result = await getCategory(categoryId, true);
    const { category, stats } = result as { category: any; stats: { productCount: number; minPrice: number; maxPrice: number } };

    // Format response / Cavabı formatla
    const response = {
      id: category.id,
      name: category.name,
      description: category.description,
      image: category.image,
      productCount: stats.productCount,
      isActive: category.isActive,
      parentId: category.parentId,
      minPrice: stats.minPrice,
      maxPrice: stats.maxPrice,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    };

    return successResponse(response);
  } catch (error: any) {
    if (error.message?.includes("not found") || error.message?.includes("tapılmadı")) {
      return successResponse(null, error.message);
    }
    return handleApiError(error, "fetch category");
  }
}
