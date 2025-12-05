/**
 * Size Guide Details API Route / Ölçü Bələdçisi Detalları API Route-u
 * Handles individual size guide operations / Fərdi ölçü bələdçisi əməliyyatlarını idarə edir
 */

import { NextRequest, NextResponse } from "next/server";
import { getSizeGuideById } from "@/lib/db/size-guides";
import { handleApiError } from "@/lib/api/error-handler";
import { successResponse } from "@/lib/api/response";

/**
 * GET /api/size-guides/[id] - Get size guide details / Ölçü bələdçisi detallarını al
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sizeGuide = await getSizeGuideById(params.id);

    if (!sizeGuide) {
      return NextResponse.json(
        { error: "Size guide not found / Ölçü bələdçisi tapılmadı" },
        { status: 404 }
      );
    }

    return successResponse({ sizeGuide });
  } catch (error: any) {
    return handleApiError(error, "Failed to fetch size guide / Ölçü bələdçisini gətirmək mümkün olmadı");
  }
}

