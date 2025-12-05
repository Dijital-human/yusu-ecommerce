/**
 * Push Notifications Service / Push Bildirişlər Xidməti
 * Service functions for push notification management / Push bildiriş idarəetməsi üçün xidmət funksiyaları
 */

import { getReadClient, getWriteClient } from "@/lib/db/query-client";
import { logger } from "@/lib/utils/logger";

export interface PushNotificationInput {
  templateId?: string;
  title: string;
  body: string;
  icon?: string;
  image?: string;
  badge?: string;
  category: string;
  actionUrl?: string;
  scheduledAt?: Date;
  audienceSegment?: any;
  createdBy: string;
}

/**
 * Create push notification / Push bildirişi yarat
 */
export async function createPushNotification(data: PushNotificationInput) {
  try {
    const writeClient = await getWriteClient();

    const notification = await writeClient.pushNotification.create({
      data: {
        templateId: data.templateId,
        title: data.title,
        body: data.body,
        icon: data.icon,
        image: data.image,
        badge: data.badge,
        category: data.category,
        actionUrl: data.actionUrl,
        scheduledAt: data.scheduledAt,
        audienceSegment: data.audienceSegment,
        createdBy: data.createdBy,
        status: data.scheduledAt ? "pending" : "pending",
        analytics: {
          create: {
            totalSent: 0,
            totalDelivered: 0,
            totalOpened: 0,
            totalFailed: 0,
            deliveryRate: 0,
            openRate: 0,
          },
        },
      },
      include: {
        template: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    logger.info("Push notification created / Push bildirişi yaradıldı", {
      notificationId: notification.id,
      title: notification.title,
    });

    return notification;
  } catch (error) {
    logger.error("Error creating push notification / Push bildirişi yaratma xətası", {
      error,
      data,
    });
    throw error;
  }
}

/**
 * Get push notifications / Push bildirişlərini al
 */
export async function getPushNotifications(filters?: {
  status?: string;
  category?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const readClient = await getReadClient();
    const { status, category, page = 1, limit = 20 } = filters || {};

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (category) {
      where.category = category;
    }

    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      readClient.pushNotification.findMany({
        where,
        include: {
          template: true,
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          analytics: true,
          _count: {
            select: {
              deliveries: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      readClient.pushNotification.count({ where }),
    ]);

    return {
      notifications,
      pagination: {
        totalItems: total,
        currentPage: page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error("Error fetching push notifications / Push bildirişlərini alma xətası", {
      error,
    });
    throw error;
  }
}

/**
 * Subscribe to push notifications / Push bildirişlərinə abunə ol
 */
export async function subscribeToPushNotifications(
  userId: string | undefined,
  subscription: {
    endpoint: string;
    p256dh: string;
    auth: string;
    userAgent?: string;
    deviceType?: string;
  }
) {
  try {
    const writeClient = await getWriteClient();

    // Check if subscription already exists / Abunəlik artıq mövcuddursa yoxla
    const existing = await writeClient.pushNotificationSubscription.findUnique({
      where: { endpoint: subscription.endpoint },
    });

    if (existing) {
      // Update existing subscription / Mövcud abunəliyi yenilə
      const updated = await writeClient.pushNotificationSubscription.update({
        where: { id: existing.id },
        data: {
          userId,
          p256dh: subscription.p256dh,
          auth: subscription.auth,
          userAgent: subscription.userAgent,
          deviceType: subscription.deviceType,
        },
      });

      // Create preferences if not exist / Əgər parametrlər yoxdursa yarat
      if (!existing.preferences) {
        await writeClient.pushNotificationPreferences.create({
          data: {
            subscriptionId: updated.id,
          },
        });
      }

      return updated;
    }

    // Create new subscription / Yeni abunəlik yarat
    const newSubscription = await writeClient.pushNotificationSubscription.create({
      data: {
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.p256dh,
        auth: subscription.auth,
        userAgent: subscription.userAgent,
        deviceType: subscription.deviceType,
        preferences: {
          create: {},
        },
      },
    });

    logger.info("Push notification subscription created / Push bildiriş abunəliyi yaradıldı", {
      subscriptionId: newSubscription.id,
      userId,
    });

    return newSubscription;
  } catch (error) {
    logger.error(
      "Error subscribing to push notifications / Push bildirişlərinə abunə olma xətası",
      { error, userId }
    );
    throw error;
  }
}

/**
 * Get user push notification preferences / İstifadəçi push bildiriş parametrlərini al
 */
export async function getUserPushPreferences(userId: string) {
  try {
    const readClient = await getReadClient();

    const subscriptions = await readClient.pushNotificationSubscription.findMany({
      where: { userId },
      include: {
        preferences: true,
      },
    });

    return subscriptions;
  } catch (error) {
    logger.error(
      "Error getting user push preferences / İstifadəçi push parametrlərini alma xətası",
      { error, userId }
    );
    throw error;
  }
}

