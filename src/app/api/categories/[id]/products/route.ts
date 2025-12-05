/**
 * Category Products API Route / Kateqoriya Məhsulları API Route
 * This route handles fetching products within a specific category
 * Bu route müəyyən kateqoriya daxilindəki məhsulları almağı idarə edir
 */

import { NextRequest } from "next/server";
import { parsePagination, createPaginationInfo } from "@/lib/api/pagination";
import { successResponseWithPagination } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { getProductsWithFilters } from "@/lib/db/queries/product-queries";
import { getCategory } from "@/services/category.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const categoryId = resolvedParams.id;
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters / Sorğu parametrlərini parse et
    const { page, limit, skip } = parsePagination(searchParams, 12);
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const minPrice = parseFloat(searchParams.get("minPrice") || "0");
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "1000000");
    const search = searchParams.get("search") || "";

    // Check if category exists using service layer / Service layer istifadə edərək kateqoriyanın mövcudluğunu yoxla
    const { category } = await getCategory(categoryId);

    // Use query helper to get products / Məhsulları almaq üçün query helper istifadə et
    const result = await getProductsWithFilters(
      {
        categoryId: categoryId,
        search: search || undefined,
        minPrice: minPrice > 0 ? minPrice : undefined,
        maxPrice: maxPrice < 1000000 ? maxPrice : undefined,
        sortBy: sortBy,
        sortOrder: sortOrder as "asc" | "desc",
      },
      page,
      limit
    );

    // Sort by rating if requested / Reytinqə görə sırala
    let sortedProducts = result.products;
    if (sortBy === "rating") {
      sortedProducts = [...result.products].sort((a, b) => {
        return sortOrder === "asc" ? a.rating - b.rating : b.rating - a.rating;
      });
    }

    const pagination = createPaginationInfo(page, limit, result.total);
    return successResponseWithPagination(sortedProducts, pagination);
  } catch (error) {
    return handleApiError(error, "fetch category products");
  }
}
