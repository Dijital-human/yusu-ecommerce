/**
 * Category Size Guide API Route / Kateqoriya Ölçü Bələdçisi API Route-u
 * Get size guide for a specific category / Müəyyən kateqoriya üçün ölçü bələdçisini al
 */

import { NextRequest, NextResponse } from "next/server";
import { getSizeGuideByCategory } from "@/lib/db/size-guides";
import { handleApiError } from "@/lib/api/error-handler";
import { successResponse } from "@/lib/api/response";

/**
 * GET /api/size-guides/category/[categoryId] - Get size guide for category / Kateqoriya üçün ölçü bələdçisini al
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    const sizeGuide = await getSizeGuideByCategory(params.categoryId);

    if (!sizeGuide) {
      return NextResponse.json(
        { error: "Size guide not found for this category / Bu kateqoriya üçün ölçü bələdçisi tapılmadı" },
        { status: 404 }
      );
    }

    return successResponse({ sizeGuide });
  } catch (error: any) {
    return handleApiError(error, "Failed to fetch category size guide / Kateqoriya ölçü bələdçisini gətirmək mümkün olmadı");
  }
}

