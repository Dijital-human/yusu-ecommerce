/**
 * Gift Card Templates API Route / Hədiyyə Kartı Şablonları API Route
 * Manage gift card templates / Hədiyyə kartı şablonlarını idarə et
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { getGiftCardTemplates } from "@/lib/gift-cards/gift-card-manager";
import { getWriteClient } from "@/lib/db/query-client";
import { logger } from "@/lib/utils/logger";

/**
 * GET /api/gift-cards/templates
 * Get active gift card templates / Aktiv hədiyyə kartı şablonlarını al
 */
export async function GET(request: NextRequest) {
  try {
    // Templates are public, but we can optionally require auth
    const templates = await getGiftCardTemplates();
    return successResponse(templates);
  } catch (error) {
    return handleApiError(error, "get gift card templates");
  }
}

/**
 * POST /api/gift-cards/templates
 * Create gift card template (Admin only) / Hədiyyə kartı şablonu yarat (Yalnız Admin)
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Check if user is admin / İstifadəçinin admin olduğunu yoxla
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized / Yetkisiz" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, imageUrl, design, isActive = true } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Name is required / Ad tələb olunur" },
        { status: 400 }
      );
    }

    const writeClient = await getWriteClient();
    const template = await (writeClient as any).giftCardTemplate.create({
      data: {
        name,
        description,
        imageUrl,
        design,
        isActive,
      },
    });

    logger.info("Gift card template created / Hədiyyə kartı şablonu yaradıldı", {
      templateId: template.id,
      name: template.name,
    });

    return successResponse(template, "Gift card template created successfully / Hədiyyə kartı şablonu uğurla yaradıldı");
  } catch (error) {
    return handleApiError(error, "create gift card template");
  }
}

