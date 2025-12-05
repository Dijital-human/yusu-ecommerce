/**
 * Product Bundle Detail API Route / Məhsul Paketi Detal API Route
 * Get bundle details and pricing / Paket detalları və qiymətləndirməni al
 */

import { NextRequest, NextResponse } from "next/server";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { getBundleById, calculateBundlePrice, validateBundle } from "@/lib/products/bundle-manager";

/**
 * GET /api/products/bundles/[id]
 * Get bundle details / Paket detallarını al
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const includePricing = searchParams.get("includePricing") === "true";
    const includeValidation = searchParams.get("includeValidation") === "true";

    const bundle = await getBundleById(id);

    if (!bundle) {
      return NextResponse.json(
        { success: false, error: "Bundle not found / Paket tapılmadı" },
        { status: 404 }
      );
    }

    const result: any = { bundle };

    if (includePricing) {
      const pricing = await calculateBundlePrice(id);
      result.pricing = pricing;
    }

    if (includeValidation) {
      const validation = await validateBundle(id);
      result.validation = validation;
    }

    return successResponse(result);
  } catch (error) {
    return handleApiError(error, "get bundle details");
  }
}

