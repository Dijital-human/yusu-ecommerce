/**
 * Points Manager / Xal Meneceri
 * Service functions for loyalty points management / Sədaqət xalları idarəetməsi üçün xidmət funksiyaları
 */

import { getReadClient, getWriteClient } from '@/lib/db/query-client';
import { logger } from '@/lib/utils/logger';

/**
 * Get or create user points / İstifadəçi xallarını al və ya yarat
 */
export async function getUserPoints(userId: string) {
  try {
    const readClient = await getReadClient();
    let userPoints = await (readClient as any).userPoints.findUnique({
      where: { userId },
    });

    if (!userPoints) {
      const writeClient = await getWriteClient();
      userPoints = await (writeClient as any).userPoints.create({
        data: {
          userId,
          points: 0,
          totalEarned: 0,
          totalSpent: 0,
        },
      });
    }

    return userPoints;
  } catch (error) {
    logger.error('Failed to get user points / İstifadəçi xallarını almaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Earn points / Xal qazan
 */
export async function earnPoints(
  userId: string,
  points: number,
  type: 'purchase' | 'review' | 'referral' | 'signup',
  description?: string,
  orderId?: string
) {
  try {
    const userPoints = await getUserPoints(userId);

    // Calculate expiry date (1 year from now) / Bitmə tarixini hesabla (indidən 1 il)
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    // Create transaction / Əməliyyat yarat
    const writeClient = await getWriteClient();
    await (writeClient as any).pointsTransaction.create({
      data: {
        userId,
        points,
        type,
        description,
        orderId,
        expiryDate,
      },
    });

    // Update user points / İstifadəçi xallarını yenilə
    await (writeClient as any).userPoints.update({
      where: { id: userPoints.id },
      data: {
        points: {
          increment: points,
        },
        totalEarned: {
          increment: points,
        },
      },
    });

    logger.info('Points earned / Xal qazanıldı', {
      userId,
      points,
      type,
      orderId,
    });

    return { success: true };
  } catch (error) {
    logger.error('Failed to earn points / Xal qazanmaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Spend points / Xal xərclə
 */
export async function spendPoints(
  userId: string,
  points: number,
  type: 'redemption' | 'expiry',
  description?: string
) {
  try {
    const userPoints = await getUserPoints(userId);

    if (userPoints.points < points) {
      throw new Error('Insufficient points / Kifayət qədər xal yoxdur');
    }

    // Create transaction / Əməliyyat yarat
    const writeClient = await getWriteClient();
    await (writeClient as any).pointsTransaction.create({
      data: {
        userId,
        points: -points,
        type,
        description,
      },
    });

    // Update user points / İstifadəçi xallarını yenilə
    await (writeClient as any).userPoints.update({
      where: { id: userPoints.id },
      data: {
        points: {
          decrement: points,
        },
        totalSpent: {
          increment: points,
        },
      },
    });

    logger.info('Points spent / Xal xərcləndi', {
      userId,
      points,
      type,
    });

    return { success: true };
  } catch (error) {
    logger.error('Failed to spend points / Xal xərcləmək uğursuz oldu', error);
    throw error;
  }
}

/**
 * Get points transactions / Xal əməliyyatlarını al
 */
export async function getPointsTransactions(
  userId: string,
  options: {
    page?: number;
    limit?: number;
    type?: string;
  } = {}
) {
  try {
    const { page = 1, limit = 20, type } = options;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (type) {
      where.type = type;
    }

    const readClient = await getReadClient();
    const [transactions, total] = await Promise.all([
      (readClient as any).pointsTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          order: {
            select: {
              id: true,
              totalAmount: true,
              createdAt: true,
            },
          },
        },
      }),
      (readClient as any).pointsTransaction.count({ where }),
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Failed to get points transactions / Xal əməliyyatlarını almaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Get loyalty program / Sədaqət proqramını al
 */
export async function getLoyaltyProgram() {
  try {
    const readClient = await getReadClient();
    const program = await (readClient as any).loyaltyProgram.findFirst({
      where: { isActive: true },
      include: {
        rewards: {
          where: { isActive: true },
          orderBy: { pointsRequired: 'asc' },
        },
      },
    });

    return program;
  } catch (error) {
    logger.error('Failed to get loyalty program / Sədaqət proqramını almaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Get available rewards / Mövcud mükafatları al
 */
export async function getAvailableRewards() {
  try {
    const program = await getLoyaltyProgram();
    if (!program) {
      return [];
    }

    return program.rewards;
  } catch (error) {
    logger.error('Failed to get available rewards / Mövcud mükafatları almaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Redeem reward / Mükafat istifadə et
 */
export async function redeemReward(userId: string, rewardId: string) {
  try {
    const readClient = await getReadClient();
    const reward = await (readClient as any).pointsReward.findUnique({
      where: { id: rewardId },
    });

    if (!reward || !reward.isActive) {
      throw new Error('Reward not found or inactive / Mükafat tapılmadı və ya aktiv deyil');
    }

    const userPoints = await getUserPoints(userId);

    if (userPoints.points < reward.pointsRequired) {
      throw new Error('Insufficient points / Kifayət qədər xal yoxdur');
    }

    // Spend points / Xal xərclə
    await spendPoints(
      userId,
      reward.pointsRequired,
      'redemption',
      `Redeemed ${reward.rewardType} reward / ${reward.rewardType} mükafatı istifadə edildi`
    );

    logger.info('Reward redeemed / Mükafat istifadə edildi', {
      userId,
      rewardId,
      rewardType: reward.rewardType,
    });

    return {
      success: true,
      reward: {
        type: reward.rewardType,
        value: reward.rewardValue,
      },
    };
  } catch (error) {
    logger.error('Failed to redeem reward / Mükafat istifadə etmək uğursuz oldu', error);
    throw error;
  }
}

/**
 * Calculate points from order / Sifarişdən xal hesabla
 */
export async function calculatePointsFromOrder(orderAmount: number): Promise<number> {
  try {
    const program = await getLoyaltyProgram();
    if (!program) {
      return 0;
    }

    const points = Math.floor(Number(orderAmount) * Number(program.pointsPerDollar));
    return points;
  } catch (error) {
    logger.error('Failed to calculate points from order / Sifarişdən xal hesablamaq uğursuz oldu', error);
    return 0;
  }
}

/**
 * Process expired points / Bitmiş xalları emal et
 */
export async function processExpiredPoints() {
  try {
    const now = new Date();
    
    // Find expired transactions / Bitmiş əməliyyatları tap
    const readClient = await getReadClient();
    const expiredTransactions = await (readClient as any).pointsTransaction.findMany({
      where: {
        expiryDate: {
          lte: now,
        },
        points: {
          gt: 0, // Only positive points / Yalnız müsbət xallar
        },
      },
    });

    for (const transaction of expiredTransactions) {
      const userPoints = await getUserPoints(transaction.userId);
      
      // Only expire if user still has these points / Yalnız istifadəçinin hələ bu xalları varsa bitir
      if (userPoints.points >= transaction.points) {
        await spendPoints(
          transaction.userId,
          transaction.points,
          'expiry',
          'Points expired / Xallar bitdi'
        );
      }
    }

    logger.info('Expired points processed / Bitmiş xallar emal olundu', {
      count: expiredTransactions.length,
    });
  } catch (error) {
    logger.error('Failed to process expired points / Bitmiş xalları emal etmək uğursuz oldu', error);
    throw error;
  }
}

