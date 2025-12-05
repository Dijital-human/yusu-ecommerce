/**
 * Email Subscriptions Database Service / Email Abunəlikləri Veritabanı Xidməti
 * Database operations for email subscriptions / Email abunəlikləri üçün veritabanı əməliyyatları
 */

import { getReadClient, getWriteClient } from '@/lib/db/query-client';
import { logger } from '@/lib/utils/logger';

/**
 * Get user email subscriptions / İstifadəçi email abunəliklərini al
 */
export async function getUserEmailSubscriptions(userId: string) {
  try {
    const readClient = await getReadClient();
    const subscriptions = await (readClient as any).emailSubscription.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return subscriptions;
  } catch (error) {
    logger.error('Failed to get user email subscriptions / İstifadəçi email abunəliklərini almaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Get email subscription by ID / ID ilə email abunəliyini al
 */
export async function getEmailSubscriptionById(subscriptionId: string) {
  try {
    const readClient = await getReadClient();
    const subscription = await (readClient as any).emailSubscription.findUnique({
      where: { id: subscriptionId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return subscription;
  } catch (error) {
    logger.error('Failed to get email subscription / Email abunəliyini almaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Create email subscription / Email abunəliyi yarat
 */
export async function createEmailSubscription(data: {
  userId: string;
  email: string;
  subscriptionType: string;
  preferences?: any;
  frequency?: string;
}) {
  try {
    const writeClient = await getWriteClient();
    
    // Check if subscription already exists / Abunəliyin artıq mövcud olub olmadığını yoxla
    const readClient = await getReadClient();
    const existing = await (readClient as any).emailSubscription.findUnique({
      where: {
        userId_subscriptionType: {
          userId: data.userId,
          subscriptionType: data.subscriptionType,
        },
      },
    });

    if (existing) {
      // Update existing subscription / Mövcud abunəliyi yenilə
      const updated = await (writeClient as any).emailSubscription.update({
        where: { id: existing.id },
        data: {
          isActive: true,
          preferences: data.preferences || existing.preferences,
          frequency: data.frequency || existing.frequency,
          unsubscribedAt: null,
        },
      });
      return updated;
    }

    const subscription = await (writeClient as any).emailSubscription.create({
      data: {
        userId: data.userId,
        email: data.email,
        subscriptionType: data.subscriptionType,
        preferences: data.preferences || {},
        frequency: data.frequency || 'weekly',
        isActive: true,
      },
    });

    logger.info('Email subscription created / Email abunəliyi yaradıldı', {
      subscriptionId: subscription.id,
      userId: data.userId,
      subscriptionType: data.subscriptionType,
    });

    return subscription;
  } catch (error) {
    logger.error('Failed to create email subscription / Email abunəliyi yaratmaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Update email subscription / Email abunəliyini yenilə
 */
export async function updateEmailSubscription(
  subscriptionId: string,
  data: {
    preferences?: any;
    frequency?: string;
    isActive?: boolean;
  }
) {
  try {
    const writeClient = await getWriteClient();
    const subscription = await (writeClient as any).emailSubscription.update({
      where: { id: subscriptionId },
      data: {
        ...data,
        unsubscribedAt: data.isActive === false ? new Date() : undefined,
      },
    });

    logger.info('Email subscription updated / Email abunəliyi yeniləndi', {
      subscriptionId,
    });

    return subscription;
  } catch (error) {
    logger.error('Failed to update email subscription / Email abunəliyini yeniləmək uğursuz oldu', error);
    throw error;
  }
}

/**
 * Delete email subscription / Email abunəliyini sil
 */
export async function deleteEmailSubscription(subscriptionId: string) {
  try {
    const writeClient = await getWriteClient();
    await (writeClient as any).emailSubscription.delete({
      where: { id: subscriptionId },
    });

    logger.info('Email subscription deleted / Email abunəliyi silindi', {
      subscriptionId,
    });
  } catch (error) {
    logger.error('Failed to delete email subscription / Email abunəliyini silmək uğursuz oldu', error);
    throw error;
  }
}

/**
 * Unsubscribe from email subscription / Email abunəliyindən çıx
 */
export async function unsubscribeEmailSubscription(
  userId: string,
  subscriptionType?: string
) {
  try {
    const writeClient = await getWriteClient();
    const where: any = { userId };

    if (subscriptionType) {
      where.subscriptionType = subscriptionType;
    }

    await (writeClient as any).emailSubscription.updateMany({
      where,
      data: {
        isActive: false,
        unsubscribedAt: new Date(),
      },
    });

    logger.info('Email subscription unsubscribed / Email abunəliyindən çıxıldı', {
      userId,
      subscriptionType,
    });
  } catch (error) {
    logger.error('Failed to unsubscribe email subscription / Email abunəliyindən çıxmaq uğursuz oldu', error);
    throw error;
  }
}

