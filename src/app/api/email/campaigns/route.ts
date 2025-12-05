/**
 * Email Campaigns API Route / Email Kampaniyaları API Route
 * Handles email campaign operations / Email kampaniya əməliyyatlarını idarə edir
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import {
  createEmailCampaign,
  getEmailCampaigns,
  EmailCampaignInput,
} from "@/lib/email/campaigns";
import { logger } from "@/lib/utils/logger";

/**
 * GET /api/email/campaigns
 * Get email campaigns / Email kampaniyalarını al
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Only admins can view campaigns / Yalnız adminlər kampaniyalara baxa bilər
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized / Yetkisiz" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const filters = {
      status: searchParams.get("status") || undefined,
      campaignType: searchParams.get("campaignType") || undefined,
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
    };

    const result = await getEmailCampaigns(filters);
    return successResponse(result);
  } catch (error) {
    return handleApiError(error, "get email campaigns");
  }
}

/**
 * POST /api/email/campaigns
 * Create email campaign / Email kampaniyası yarat
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Only admins can create campaigns / Yalnız adminlər kampaniya yarada bilər
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized / Yetkisiz" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      subject,
      templateId,
      content,
      campaignType,
      audienceSegment,
      scheduledAt,
    } = body;

    if (!name || !subject || !content || !campaignType) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields / Tələb olunan sahələr çatışmır",
        },
        { status: 400 }
      );
    }

    const campaignData: EmailCampaignInput = {
      name,
      subject,
      templateId,
      content,
      campaignType,
      audienceSegment,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      createdBy: user.id,
    };

    const campaign = await createEmailCampaign(campaignData);

    logger.info("Email campaign created via API / API vasitəsilə email kampaniyası yaradıldı", {
      campaignId: campaign.id,
      createdBy: user.id,
    });

    return successResponse(
      campaign,
      "Email campaign created successfully / Email kampaniyası uğurla yaradıldı"
    );
  } catch (error) {
    return handleApiError(error, "create email campaign");
  }
}

