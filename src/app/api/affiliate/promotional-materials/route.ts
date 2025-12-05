/**
 * Affiliate Promotional Materials API Route / Affiliate Təşviq Materialları API Route
 * Manage promotional materials / Təşviq materiallarını idarə et
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { getPromotionalMaterials, createPromotionalMaterial } from "@/lib/affiliate/affiliate-enhancements";
import { getAffiliateProgram } from "@/lib/affiliate/affiliate-manager";
import { logger } from "@/lib/utils/logger";

/**
 * GET /api/affiliate/promotional-materials
 * Get promotional materials / Təşviq materiallarını al
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const { searchParams } = new URL(request.url);
    const programId = searchParams.get("programId");
    const type = searchParams.get("type");

    // If programId not provided, get user's affiliate program / programId verilməyibsə, istifadəçinin affiliate proqramını al
    let finalProgramId = programId;
    if (!finalProgramId && user.role === "SELLER") {
      const program = await getAffiliateProgram(user.id);
      if (program) {
        finalProgramId = program.id;
      }
    }

    if (!finalProgramId) {
      return NextResponse.json(
        { success: false, error: "Program ID is required / Proqram ID tələb olunur" },
        { status: 400 }
      );
    }

    const materials = await getPromotionalMaterials(finalProgramId, type || undefined);
    return successResponse(materials);
  } catch (error) {
    return handleApiError(error, "get promotional materials");
  }
}

/**
 * POST /api/affiliate/promotional-materials
 * Create promotional material (Seller only) / Təşviq materialı yarat (Yalnız Satıcı)
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Check if user is seller / İstifadəçinin satıcı olduğunu yoxla
    if (user.role !== "SELLER") {
      return NextResponse.json(
        { success: false, error: "Unauthorized / Yetkisiz" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { programId, type, title, description, content, imageUrl, linkUrl } = body;

    if (!type || !title) {
      return NextResponse.json(
        { success: false, error: "Type and title are required / Tip və başlıq tələb olunur" },
        { status: 400 }
      );
    }

    // If programId not provided, get user's affiliate program / programId verilməyibsə, istifadəçinin affiliate proqramını al
    let finalProgramId = programId;
    if (!finalProgramId) {
      const program = await getAffiliateProgram(user.id);
      if (program) {
        finalProgramId = program.id;
      }
    }

    if (!finalProgramId) {
      return NextResponse.json(
        { success: false, error: "Program ID is required / Proqram ID tələb olunur" },
        { status: 400 }
      );
    }

    const material = await createPromotionalMaterial(finalProgramId, {
      type,
      title,
      description,
      content,
      imageUrl,
      linkUrl,
    });

    logger.info("Promotional material created / Təşviq materialı yaradıldı", {
      materialId: material.id,
      programId: finalProgramId,
      type,
    });

    return successResponse(material, "Promotional material created successfully / Təşviq materialı uğurla yaradıldı");
  } catch (error) {
    return handleApiError(error, "create promotional material");
  }
}

