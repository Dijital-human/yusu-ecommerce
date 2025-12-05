/**
 * Size Guides API Route / Ölçü Bələdçiləri API Route-u
 * Handles size guide operations / Ölçü bələdçiləri əməliyyatlarını idarə edir
 */

import { NextRequest, NextResponse } from "next/server";
import { getAllSizeGuides } from "@/lib/db/size-guides";
import { handleApiError } from "@/lib/api/error-handler";
import { successResponse } from "@/lib/api/response";

/**
 * GET /api/size-guides - Get all active size guides / Bütün aktiv ölçü bələdçilərini al
 */
export async function GET(request: NextRequest) {
  try {
    const sizeGuides = await getAllSizeGuides();

    return successResponse({
      sizeGuides,
      count: sizeGuides.length,
    });
  } catch (error: any) {
    return handleApiError(error, "Failed to fetch size guides / Ölçü bələdçilərini gətirmək mümkün olmadı");
  }
}

