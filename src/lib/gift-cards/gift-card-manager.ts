/**
 * Gift Card Manager / Hədiyyə Kartı Meneceri
 * Service functions for gift card management / Hədiyyə kartı idarəetməsi üçün xidmət funksiyaları
 */

import { prisma } from '@/lib/db';
import { getReadClient, getWriteClient } from '@/lib/db/query-client';
import { logger } from '@/lib/utils/logger';

/**
 * Generate unique gift card code / Unikal hədiyyə kartı kodu yarat
 */
export function generateGiftCardCode(): string {
  const prefix = 'YUSU';
  const randomPart1 = Math.random().toString(36).substring(2, 6).toUpperCase();
  const randomPart2 = Math.random().toString(36).substring(2, 6).toUpperCase();
  const randomPart3 = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${randomPart1}-${randomPart2}-${randomPart3}`;
}

/**
 * Get gift card by code / Kod ilə hədiyyə kartını al
 */
export async function getGiftCardByCode(code: string) {
  try {
    const readClient = await getReadClient();
    const giftCard = await (readClient as any).giftCard.findUnique({
      where: { code },
      include: {
        purchaser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    return giftCard;
  } catch (error) {
    logger.error('Failed to get gift card by code / Kod ilə hədiyyə kartını almaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Create gift card / Hədiyyə kartı yarat
 */
export async function createGiftCard(data: {
  amount: number;
  purchasedBy?: string;
  expiryDate?: Date;
  templateId?: string;
  recipientName?: string;
  recipientEmail?: string;
  customMessage?: string;
  scheduledDeliveryDate?: Date;
}) {
  try {
    // Generate unique code / Unikal kod yarat
    let code = generateGiftCardCode();
    let exists = true;
    let attempts = 0;

    // Ensure code is unique / Kodun unikal olduğunu təmin et
    const readClient = await getReadClient();
    while (exists && attempts < 10) {
      const existing = await (readClient as any).giftCard.findUnique({
        where: { code },
      });
      if (!existing) {
        exists = false;
      } else {
        code = generateGiftCardCode();
        attempts++;
      }
    }

    if (exists) {
      throw new Error('Failed to generate unique gift card code / Unikal hədiyyə kartı kodu yaratmaq uğursuz oldu');
    }

    // Calculate expiry date (1 year from now if not provided) / Bitmə tarixini hesabla (təmin edilməyibsə indidən 1 il)
    const expiryDate = data.expiryDate || new Date();
    if (!data.expiryDate) {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    }

    const writeClient = await getWriteClient();
    const giftCard = await (writeClient as any).giftCard.create({
      data: {
        code,
        amount: data.amount,
        balance: data.amount,
        purchasedBy: data.purchasedBy || null,
        expiryDate,
        isActive: true,
        templateId: data.templateId || null,
        recipientName: data.recipientName || null,
        recipientEmail: data.recipientEmail || null,
        customMessage: data.customMessage || null,
        scheduledDeliveryDate: data.scheduledDeliveryDate || null,
      },
      include: {
        purchaser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        template: true,
      },
    });

    logger.info('Gift card created / Hədiyyə kartı yaradıldı', {
      code: giftCard.code,
      amount: giftCard.amount,
      scheduledDeliveryDate: giftCard.scheduledDeliveryDate,
    });

    return giftCard;
  } catch (error) {
    logger.error('Failed to create gift card / Hədiyyə kartı yaratmaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Validate gift card / Hədiyyə kartını yoxla
 */
export async function validateGiftCard(code: string): Promise<{
  isValid: boolean;
  giftCard?: any;
  error?: string;
}> {
  try {
    const giftCard = await getGiftCardByCode(code);

    if (!giftCard) {
      return {
        isValid: false,
        error: 'Gift card not found / Hədiyyə kartı tapılmadı',
      };
    }

    if (!giftCard.isActive) {
      return {
        isValid: false,
        giftCard,
        error: 'Gift card is not active / Hədiyyə kartı aktiv deyil',
      };
    }

    if (giftCard.balance <= 0) {
      return {
        isValid: false,
        giftCard,
        error: 'Gift card has no balance / Hədiyyə kartında balans yoxdur',
      };
    }

    if (giftCard.expiryDate && new Date(giftCard.expiryDate) < new Date()) {
      return {
        isValid: false,
        giftCard,
        error: 'Gift card has expired / Hədiyyə kartı bitmişdir',
      };
    }

    if (giftCard.redeemedBy) {
      return {
        isValid: false,
        giftCard,
        error: 'Gift card has already been redeemed / Hədiyyə kartı artıq istifadə edilib',
      };
    }

    return {
      isValid: true,
      giftCard,
    };
  } catch (error) {
    logger.error('Failed to validate gift card / Hədiyyə kartını yoxlamaq uğursuz oldu', error);
    return {
      isValid: false,
      error: 'Validation failed / Yoxlama uğursuz oldu',
    };
  }
}

/**
 * Redeem gift card / Hədiyyə kartını istifadə et
 */
export async function redeemGiftCard(
  code: string,
  userId: string,
  amount: number,
  orderId?: string
) {
  try {
    const validation = await validateGiftCard(code);
    if (!validation.isValid || !validation.giftCard) {
      throw new Error(validation.error || 'Invalid gift card / Etibarsız hədiyyə kartı');
    }

    const giftCard = validation.giftCard;

    if (Number(giftCard.balance) < amount) {
      throw new Error('Insufficient balance / Kifayət qədər balans yoxdur');
    }

    // Update gift card balance / Hədiyyə kartı balansını yenilə
    const newBalance = Number(giftCard.balance) - amount;
    const isFullyRedeemed = newBalance === 0;

    const writeClient = await getWriteClient();
    await (writeClient as any).giftCard.update({
      where: { id: giftCard.id },
      data: {
        balance: newBalance,
        redeemedBy: isFullyRedeemed ? userId : giftCard.redeemedBy,
        redeemedAt: isFullyRedeemed ? new Date() : giftCard.redeemedAt,
        isActive: newBalance > 0,
      },
    });

    // Create transaction / Əməliyyat yarat
    await (writeClient as any).giftCardTransaction.create({
      data: {
        giftCardId: giftCard.id,
        orderId: orderId || null,
        amount: -amount, // Negative for redemption / İstifadə üçün mənfi
        type: 'redemption',
      },
    });

    logger.info('Gift card redeemed / Hədiyyə kartı istifadə edildi', {
      code,
      userId,
      amount,
      orderId,
    });

    return {
      success: true,
      remainingBalance: newBalance,
    };
  } catch (error) {
    logger.error('Failed to redeem gift card / Hədiyyə kartını istifadə etmək uğursuz oldu', error);
    throw error;
  }
}

/**
 * Get gift card transactions / Hədiyyə kartı əməliyyatlarını al
 */
export async function getGiftCardTransactions(giftCardId: string) {
  try {
    const readClient = await getReadClient();
    const transactions = await (readClient as any).giftCardTransaction.findMany({
      where: { giftCardId },
      include: {
        order: {
          select: {
            id: true,
            totalAmount: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return transactions;
  } catch (error) {
    logger.error('Failed to get gift card transactions / Hədiyyə kartı əməliyyatlarını almaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Get user's gift cards / İstifadəçinin hədiyyə kartlarını al
 */
export async function getUserGiftCards(userId: string) {
  try {
    const readClient = await getReadClient();
    const user = await (readClient as any).user.findUnique({ where: { id: userId }, select: { email: true } });
    const giftCards = await (readClient as any).giftCard.findMany({
      where: {
        OR: [
          { purchasedBy: userId },
          { redeemedBy: userId },
          { recipientEmail: user?.email },
        ],
      },
      include: {
        purchaser: {
          select: {
            id: true,
            name: true,
          },
        },
        template: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return giftCards;
  } catch (error) {
    logger.error('Failed to get user gift cards / İstifadəçi hədiyyə kartlarını almaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Get gift card templates / Hədiyyə kartı şablonlarını al
 */
export async function getGiftCardTemplates() {
  try {
    const readClient = await getReadClient();
    const templates = await (readClient as any).giftCardTemplate.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return templates;
  } catch (error) {
    logger.error('Failed to get gift card templates / Hədiyyə kartı şablonlarını almaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Get gift cards scheduled for delivery / Çatdırılma üçün planlaşdırılmış hədiyyə kartlarını al
 */
export async function getScheduledGiftCards(deliveryDate?: Date) {
  try {
    const where: any = {
      scheduledDeliveryDate: { not: null },
      deliveredAt: null,
    };

    if (deliveryDate) {
      const startOfDay = new Date(deliveryDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(deliveryDate);
      endOfDay.setHours(23, 59, 59, 999);
      where.scheduledDeliveryDate = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const readClient = await getReadClient();
    const giftCards = await (readClient as any).giftCard.findMany({
      where,
      include: {
        purchaser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        template: true,
      },
      orderBy: { scheduledDeliveryDate: 'asc' },
    });

    return giftCards;
  } catch (error) {
    logger.error('Failed to get scheduled gift cards / Planlaşdırılmış hədiyyə kartlarını almaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Mark gift card as delivered / Hədiyyə kartını çatdırılmış kimi qeyd et
 */
export async function markGiftCardDelivered(giftCardId: string) {
  try {
    const writeClient = await getWriteClient();
    const giftCard = await (writeClient as any).giftCard.update({
      where: { id: giftCardId },
      data: {
        deliveredAt: new Date(),
      },
      include: {
        purchaser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        template: true,
      },
    });

    logger.info('Gift card marked as delivered / Hədiyyə kartı çatdırılmış kimi qeyd edildi', {
      giftCardId,
      code: giftCard.code,
    });

    return giftCard;
  } catch (error) {
    logger.error('Failed to mark gift card as delivered / Hədiyyə kartını çatdırılmış kimi qeyd etmək uğursuz oldu', error);
    throw error;
  }
}

/**
 * Get gift cards expiring soon / Tezliklə bitəcək hədiyyə kartlarını al
 */
export async function getExpiringGiftCards(daysAhead: number = 30) {
  try {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + daysAhead);

    const readClient = await getReadClient();
    const giftCards = await (readClient as any).giftCard.findMany({
      where: {
        expiryDate: {
          lte: expiryDate,
          gte: new Date(),
        },
        isActive: true,
        balance: { gt: 0 },
        reminderSentAt: null,
      },
      include: {
        purchaser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        redeemer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        template: true,
      },
      orderBy: { expiryDate: 'asc' },
    });

    return giftCards;
  } catch (error) {
    logger.error('Failed to get expiring gift cards / Tezliklə bitəcək hədiyyə kartlarını almaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Mark expiration reminder as sent / Bitmə xatırlatmasını göndərilmiş kimi qeyd et
 */
export async function markReminderSent(giftCardId: string) {
  try {
    const writeClient = await getWriteClient();
    await (writeClient as any).giftCard.update({
      where: { id: giftCardId },
      data: {
        reminderSentAt: new Date(),
      },
    });

    logger.info('Expiration reminder marked as sent / Bitmə xatırlatması göndərilmiş kimi qeyd edildi', {
      giftCardId,
    });
  } catch (error) {
    logger.error('Failed to mark reminder as sent / Xatırlatmanı göndərilmiş kimi qeyd etmək uğursuz oldu', error);
    throw error;
  }
}

/**
 * Bulk create gift cards / Toplu hədiyyə kartı yarat
 */
export async function bulkCreateGiftCards(data: {
  count: number;
  amount: number;
  expiryDate?: Date;
  templateId?: string;
}) {
  try {
    const giftCards = [];
    const codes = new Set<string>();

    // Generate unique codes / Unikal kodlar yarat
    for (let i = 0; i < data.count; i++) {
      let code = generateGiftCardCode();
      let attempts = 0;
      while (codes.has(code) && attempts < 10) {
        code = generateGiftCardCode();
        attempts++;
      }
      if (codes.has(code)) {
        throw new Error(`Failed to generate unique code for gift card ${i + 1} / ${i + 1} nömrəli hədiyyə kartı üçün unikal kod yaratmaq uğursuz oldu`);
      }
      codes.add(code);
    }

    // Calculate expiry date / Bitmə tarixini hesabla
    const expiryDate = data.expiryDate || new Date();
    if (!data.expiryDate) {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    }

    // Create gift cards / Hədiyyə kartları yarat
    const writeClient = await getWriteClient();
    for (const code of codes) {
      const giftCard = await (writeClient as any).giftCard.create({
        data: {
          code,
          amount: data.amount,
          balance: data.amount,
          expiryDate,
          isActive: true,
          templateId: data.templateId || null,
        },
      });
      giftCards.push(giftCard);
    }

    logger.info('Bulk gift cards created / Toplu hədiyyə kartları yaradıldı', {
      count: giftCards.length,
      amount: data.amount,
    });

    return giftCards;
  } catch (error) {
    logger.error('Failed to bulk create gift cards / Toplu hədiyyə kartları yaratmaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Get gift card analytics / Hədiyyə kartı analitikasını al
 */
export async function getGiftCardAnalytics(startDate?: Date, endDate?: Date) {
  try {
    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const readClient = await getReadClient();
    const [
      totalGiftCards,
      totalValue,
      redeemedValue,
      activeGiftCards,
      expiredGiftCards,
      scheduledGiftCards,
    ] = await Promise.all([
      (readClient as any).giftCard.count({ where }),
      (readClient as any).giftCard.aggregate({
        where,
        _sum: { amount: true },
      }),
      (readClient as any).giftCard.aggregate({
        where: {
          ...where,
          redeemedBy: { not: null },
        },
        _sum: { amount: true },
      }),
      (readClient as any).giftCard.count({
        where: {
          ...where,
          isActive: true,
          balance: { gt: 0 },
          OR: [
            { expiryDate: null },
            { expiryDate: { gte: new Date() } },
          ],
        },
      }),
      (readClient as any).giftCard.count({
        where: {
          ...where,
          expiryDate: { lt: new Date() },
        },
      }),
      (readClient as any).giftCard.count({
        where: {
          ...where,
          scheduledDeliveryDate: { not: null },
          deliveredAt: null,
        },
      }),
    ]);

    return {
      totalGiftCards,
      totalValue: Number(totalValue._sum.amount || 0),
      redeemedValue: Number(redeemedValue._sum.amount || 0),
      activeGiftCards,
      expiredGiftCards,
      scheduledGiftCards,
      redemptionRate: totalGiftCards > 0
        ? ((redeemedValue._sum.amount || 0) / totalValue._sum.amount) * 100
        : 0,
    };
  } catch (error) {
    logger.error('Failed to get gift card analytics / Hədiyyə kartı analitikasını almaq uğursuz oldu', error);
    throw error;
  }
}

