/**
 * Email Automation API Route / Email Avtomatlaşdırma API Route
 * Handles email automation operations / Email avtomatlaşdırma əməliyyatlarını idarə edir
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import {
  createEmailAutomation,
  getEmailAutomations,
  EmailAutomationInput,
} from "@/lib/email/automation";

/**
 * GET /api/email/automation
 * Get email automations / Email avtomatlaşdırmalarını al
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Only admins can view automations / Yalnız adminlər avtomatlaşdırmalara baxa bilər
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized / Yetkisiz" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const filters = {
      triggerType: searchParams.get("triggerType") || undefined,
      isActive: searchParams.get("isActive")
        ? searchParams.get("isActive") === "true"
        : undefined,
    };

    const automations = await getEmailAutomations(filters);
    return successResponse(automations);
  } catch (error) {
    return handleApiError(error, "get email automations");
  }
}

/**
 * POST /api/email/automation
 * Create email automation / Email avtomatlaşdırması yarat
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Only admins can create automations / Yalnız adminlər avtomatlaşdırma yarada bilər
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized / Yetkisiz" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, triggerType, triggerConditions, templateId } = body;

    if (!name || !triggerType || !triggerConditions) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields / Tələb olunan sahələr çatışmır",
        },
        { status: 400 }
      );
    }

    const automationData: EmailAutomationInput = {
      name,
      triggerType,
      triggerConditions,
      templateId,
      createdBy: user.id,
    };

    const automation = await createEmailAutomation(automationData);

    return successResponse(
      automation,
      "Email automation created successfully / Email avtomatlaşdırması uğurla yaradıldı"
    );
  } catch (error) {
    return handleApiError(error, "create email automation");
  }
}

