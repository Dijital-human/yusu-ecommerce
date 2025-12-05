/**
 * Email Subscription API Route / Email Abunəliyi API Route
 * Manage individual email subscription / Fərdi email abunəliyini idarə et
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import {
  getEmailSubscriptionById,
  updateEmailSubscription,
  deleteEmailSubscription,
} from "@/lib/db/email-subscriptions";
import { logger } from "@/lib/utils/logger";

/**
 * GET /api/email/subscriptions/[id]
 * Get email subscription by ID / ID ilə email abunəliyini al
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const resolvedParams = await params;
    const subscriptionId = resolvedParams.id;

    const subscription = await getEmailSubscriptionById(subscriptionId);

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: "Subscription not found / Abunəlik tapılmadı" },
        { status: 404 }
      );
    }

    // Verify user owns this subscription / İstifadəçinin bu abunəliyə sahib olduğunu yoxla
    if (subscription.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized / Yetkisiz" },
        { status: 403 }
      );
    }

    return successResponse(subscription);
  } catch (error) {
    return handleApiError(error, "get email subscription");
  }
}

/**
 * PUT /api/email/subscriptions/[id]
 * Update email subscription / Email abunəliyini yenilə
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const resolvedParams = await params;
    const subscriptionId = resolvedParams.id;

    // Verify user owns this subscription / İstifadəçinin bu abunəliyə sahib olduğunu yoxla
    const existingSubscription = await getEmailSubscriptionById(subscriptionId);
    if (!existingSubscription) {
      return NextResponse.json(
        { success: false, error: "Subscription not found / Abunəlik tapılmadı" },
        { status: 404 }
      );
    }

    if (existingSubscription.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized / Yetkisiz" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { preferences, frequency, isActive } = body;

    const subscription = await updateEmailSubscription(subscriptionId, {
      preferences,
      frequency,
      isActive,
    });

    logger.info("Email subscription updated / Email abunəliyi yeniləndi", {
      subscriptionId,
      userId: user.id,
    });

    return successResponse(subscription, "Subscription updated successfully / Abunəlik uğurla yeniləndi");
  } catch (error) {
    return handleApiError(error, "update email subscription");
  }
}

/**
 * DELETE /api/email/subscriptions/[id]
 * Delete email subscription / Email abunəliyini sil
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const resolvedParams = await params;
    const subscriptionId = resolvedParams.id;

    // Verify user owns this subscription / İstifadəçinin bu abunəliyə sahib olduğunu yoxla
    const existingSubscription = await getEmailSubscriptionById(subscriptionId);
    if (!existingSubscription) {
      return NextResponse.json(
        { success: false, error: "Subscription not found / Abunəlik tapılmadı" },
        { status: 404 }
      );
    }

    if (existingSubscription.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized / Yetkisiz" },
        { status: 403 }
      );
    }

    await deleteEmailSubscription(subscriptionId);

    logger.info("Email subscription deleted / Email abunəliyi silindi", {
      subscriptionId,
      userId: user.id,
    });

    return successResponse(null, "Subscription deleted successfully / Abunəlik uğurla silindi");
  } catch (error) {
    return handleApiError(error, "delete email subscription");
  }
}

