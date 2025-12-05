/**
 * Push Notifications API Route / Push Bildirişlər API Route
 * Handles push notification operations / Push bildiriş əməliyyatlarını idarə edir
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import {
  createPushNotification,
  getPushNotifications,
  subscribeToPushNotifications,
  getUserPushPreferences,
  PushNotificationInput,
} from "@/lib/notifications/push-notifications";

/**
 * GET /api/notifications/push
 * Get push notifications or user preferences / Push bildirişləri və ya istifadəçi parametrlərini al
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const preferences = searchParams.get("preferences") === "true";

    if (preferences) {
      // Get user preferences / İstifadəçi parametrlərini al
      const authResult = await requireAuth(request);
      if (authResult instanceof NextResponse) {
        return authResult;
      }

      const { user } = authResult;
      const preferences = await getUserPushPreferences(user.id);
      return successResponse(preferences);
    }

    // Get notifications (admin only) / Bildirişləri al (yalnız admin)
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized / Yetkisiz" },
        { status: 403 }
      );
    }

    const filters = {
      status: searchParams.get("status") || undefined,
      category: searchParams.get("category") || undefined,
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
    };

    const result = await getPushNotifications(filters);
    return successResponse(result);
  } catch (error) {
    return handleApiError(error, "get push notifications");
  }
}

/**
 * POST /api/notifications/push
 * Create push notification or subscribe / Push bildirişi yarat və ya abunə ol
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if it's a subscription request / Abunəlik sorğusu olub olmadığını yoxla
    if (body.endpoint && body.p256dh && body.auth) {
      const authResult = await requireAuth(request);
      const userId = authResult instanceof NextResponse ? undefined : authResult.user.id;

      const subscription = await subscribeToPushNotifications(userId, {
        endpoint: body.endpoint,
        p256dh: body.p256dh,
        auth: body.auth,
        userAgent: body.userAgent,
        deviceType: body.deviceType,
      });

      return successResponse(
        subscription,
        "Subscribed to push notifications / Push bildirişlərinə abunə olundu"
      );
    }

    // Create notification (admin only) / Bildiriş yarat (yalnız admin)
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized / Yetkisiz" },
        { status: 403 }
      );
    }

    const {
      templateId,
      title,
      body,
      icon,
      image,
      badge,
      category,
      actionUrl,
      scheduledAt,
      audienceSegment,
    } = body;

    if (!title || !body || !category) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields / Tələb olunan sahələr çatışmır",
        },
        { status: 400 }
      );
    }

    const notificationData: PushNotificationInput = {
      templateId,
      title,
      body,
      icon,
      image,
      badge,
      category,
      actionUrl,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      audienceSegment,
      createdBy: user.id,
    };

    const notification = await createPushNotification(notificationData);

    return successResponse(
      notification,
      "Push notification created successfully / Push bildirişi uğurla yaradıldı"
    );
  } catch (error) {
    return handleApiError(error, "create push notification");
  }
}

