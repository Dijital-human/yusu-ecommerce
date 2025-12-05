/**
 * Cookie Preferences API Route / Cookie Tərcihləri API Route
 * Save and load cookie preferences / Cookie tərcihlərini yadda saxla və yüklə
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { getReadClient, getWriteClient } from "@/lib/db/query-client";
import { logger } from "@/lib/utils/logger";

/**
 * GET /api/cookies/preferences
 * Get user cookie preferences / İstifadəçi cookie tərcihlərini al
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const readClient = await getReadClient();

    // Get or create cookie consent record / Cookie razılıq qeydini al və ya yarat
    let consent = await (readClient as any).cookieConsent.findUnique({
      where: { userId: user.id },
    });

    if (!consent) {
      // Return default preferences / Default tərcihləri qaytar
      return successResponse({
        preferences: {
          essential: true,
          analytics: false,
          marketing: false,
          functional: false,
        },
        consentedAt: null,
      });
    }

    return successResponse({
      preferences: consent.preferences || {
        essential: true,
        analytics: false,
        marketing: false,
        functional: false,
      },
      consentedAt: consent.consentedAt,
    });
  } catch (error) {
    return handleApiError(error, "get cookie preferences");
  }
}

/**
 * POST /api/cookies/preferences
 * Save user cookie preferences / İstifadəçi cookie tərcihlərini yadda saxla
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const body = await request.json();
    const { preferences } = body;

    if (!preferences) {
      return NextResponse.json(
        { success: false, error: "Preferences are required / Tərcihlər tələb olunur" },
        { status: 400 }
      );
    }

    const writeClient = await getWriteClient();

    // Upsert cookie consent / Cookie razılığını upsert et
    const consent = await (writeClient as any).cookieConsent.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        preferences,
        consentedAt: new Date(),
      },
      update: {
        preferences,
        consentedAt: new Date(),
      },
    });

    logger.info("Cookie preferences saved / Cookie tərcihləri yadda saxlanıldı", {
      userId: user.id,
      preferences,
    });

    return successResponse(consent, "Preferences saved successfully / Tərcihlər uğurla yadda saxlanıldı");
  } catch (error) {
    return handleApiError(error, "save cookie preferences");
  }
}

