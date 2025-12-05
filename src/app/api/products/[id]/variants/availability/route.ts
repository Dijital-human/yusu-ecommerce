/**
 * Product Variant Availability API Route / Məhsul Variantı Mövcudluğu API Route
 * Check variant availability / Variant mövcudluğunu yoxla
 */

import { NextRequest, NextResponse } from "next/server";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { checkVariantAvailability, getVariantsByAttributes } from "@/lib/db/product-variants";

/**
 * GET /api/products/[id]/variants/availability
 * Check variant availability / Variant mövcudluğunu yoxla
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const { searchParams } = new URL(request.url);
    const variantId = searchParams.get('variantId');
    const quantity = searchParams.get('quantity') ? parseInt(searchParams.get('quantity')!) : 1;
    const attributes = searchParams.get('attributes');

    // Check by variant ID / Variant ID ilə yoxla
    if (variantId) {
      const availability = await checkVariantAvailability(variantId, quantity);
      return successResponse(availability);
    }

    // Check by attributes / Atributlarla yoxla
    if (attributes) {
      try {
        const attrs = JSON.parse(attributes);
        const variants = await getVariantsByAttributes(productId, attrs);
        
        if (variants.length === 0) {
          return successResponse({
            available: false,
            stock: 0,
            message: "No variant found with these attributes / Bu atributlarla variant tapılmadı",
          });
        }

        const variant = variants[0];
        const availability = await checkVariantAvailability(variant.id, quantity);
        
        return successResponse({
          ...availability,
          variantId: variant.id,
          variantName: variant.name,
        });
      } catch (parseError) {
        return NextResponse.json(
          { success: false, error: "Invalid attributes format / Etibarsız atribut formatı" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: "variantId or attributes parameter is required / variantId və ya attributes parametri tələb olunur" },
      { status: 400 }
    );
  } catch (error) {
    return handleApiError(error, "check variant availability");
  }
}

