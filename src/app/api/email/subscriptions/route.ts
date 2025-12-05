/**
 * Email Subscriptions API / Email Abunəlikləri API
 * Handles email subscription preferences
 * Email abunəlik parametrlərini idarə edir
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { getUserEmailSubscriptions, createEmailSubscription } from "@/lib/db/email-subscriptions";
import { getReadClient } from "@/lib/db/query-client";
import { logger } from "@/lib/utils/logger";

/**
 * GET /api/email/subscriptions
 * Gets email subscription preferences for a user
 * İstifadəçi üçün email abunəlik parametrlərini alır
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const subscriptions = await getUserEmailSubscriptions(user.id);
    return successResponse(subscriptions);
  } catch (error) {
    return handleApiError(error, "get email subscriptions");
  }
}

/**
 * POST /api/email/subscriptions
 * Subscribe to email subscription / Email abunəliyinə abunə ol
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const body = await request.json();
    const { subscriptionType, preferences, frequency } = body;

    if (!subscriptionType) {
      return NextResponse.json(
        { success: false, error: "Subscription type is required / Abunəlik tipi tələb olunur" },
        { status: 400 }
      );
    }

    const subscription = await createEmailSubscription({
      userId: user.id,
      email: user.email || '',
      subscriptionType,
      preferences,
      frequency,
    });

    logger.info("Email subscription created / Email abunəliyi yaradıldı", {
      userId: user.id,
      subscriptionType,
    });

    return successResponse(subscription, "Subscribed successfully / Uğurla abunə olundu");
  } catch (error) {
    return handleApiError(error, "create email subscription");
  }
}

