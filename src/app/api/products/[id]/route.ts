/**
 * Product Details API Route / Məhsul Detalları API Route
 * This route handles fetching detailed information about a specific product
 * Bu route müəyyən məhsul haqqında ətraflı məlumat almağı idarə edir
 */

import { NextRequest } from "next/server";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { validateProductId } from "@/lib/api/validators";
import { getProductById } from "@/lib/db/queries/product-queries";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const productId = resolvedParams.id;

    // Validate product ID using helper / Helper ilə məhsul ID-ni yoxla
    const validatedProductId = validateProductId(productId);
    if (validatedProductId instanceof Response) {
      return validatedProductId;
    }

    // Fetch product using query helper / Query helper ilə məhsulu al
    const result = await getProductById(validatedProductId, true);
    if (result instanceof Response) {
      return result;
    }

    const { product } = result;

    // Product is already transformed by query helper / Məhsul artıq query helper tərəfindən transform edilib
    // Return transformed product directly / Transform edilmiş məhsulu birbaşa qaytar
    return successResponse(product);
  } catch (error) {
    return handleApiError(error, "fetch product");
  }
}