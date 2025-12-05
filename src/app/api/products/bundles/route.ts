/**
 * Product Bundles API Route / Məhsul Paketləri API Route
 * Get product bundles / Məhsul paketlərini al
 */

import { NextRequest, NextResponse } from "next/server";
import { successResponse, successResponseWithPagination } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { getActiveBundles, getBundlesForProduct } from "@/lib/products/bundle-manager";
import { parsePagination } from "@/lib/api/pagination";

/**
 * GET /api/products/bundles
 * Get active bundles / Aktiv paketləri al
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get("sellerId") || undefined;
    const productId = searchParams.get("productId") || undefined;
    const { page, limit, skip } = parsePagination(searchParams, 20);

    if (productId) {
      // Get bundles for a specific product / Müəyyən məhsul üçün paketləri al
      const bundles = await getBundlesForProduct(productId);
      return successResponse(bundles);
    }

    // Get all active bundles / Bütün aktiv paketləri al
    const result = await getActiveBundles({
      sellerId,
      limit,
      skip,
    });

    return successResponseWithPagination(result.bundles, result.pagination);
  } catch (error) {
    return handleApiError(error, "get product bundles");
  }
}

