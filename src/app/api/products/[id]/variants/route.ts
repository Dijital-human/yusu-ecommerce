/**
 * Product Variants API Route / Məhsul Variantları API Route
 * Manage product variants / Məhsul variantlarını idarə et
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import {
  getProductVariants,
  getAvailableVariantCombinations,
  checkVariantAvailability,
} from "@/lib/db/product-variants";
import { logger } from "@/lib/utils/logger";

/**
 * GET /api/products/[id]/variants
 * Get product variants / Məhsul variantlarını al
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const { searchParams } = new URL(request.url);
    const includeCombinations = searchParams.get('combinations') === 'true';
    const variantId = searchParams.get('variantId');
    const quantity = searchParams.get('quantity') ? parseInt(searchParams.get('quantity')!) : 1;

    // Check availability for specific variant / Müəyyən variant üçün mövcudluğu yoxla
    if (variantId) {
      const availability = await checkVariantAvailability(variantId, quantity);
      return successResponse(availability);
    }

    // Get all variants / Bütün variantları al
    const variants = await getProductVariants(productId);

    // Include available combinations if requested / Əgər tələb olunarsa mövcud kombinasiyaları daxil et
    if (includeCombinations) {
      const combinations = await getAvailableVariantCombinations(productId);
      return successResponse({
        variants,
        combinations,
      });
    }

    return successResponse(variants);
  } catch (error) {
    return handleApiError(error, "get product variants");
  }
}

