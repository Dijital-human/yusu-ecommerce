/**
 * Loyalty Program Analytics / Sədaqət Proqramı Analitikası
 * Analytics functions for loyalty program / Sədaqət proqramı üçün analitika funksiyaları
 */

import { getReadClient } from '@/lib/db/query-client';
import { logger } from '@/lib/utils/logger';

/**
 * Get points earning trends / Xal qazanma trendlərini al
 */
export async function getPointsEarningTrends(startDate?: Date, endDate?: Date) {
  try {
    const readClient = await getReadClient();
    const where: any = {
      points: { gt: 0 }, // Only earning transactions / Yalnız qazanma əməliyyatları
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    // Group by type and date / Tip və tarixə görə qruplaşdır
    const transactions = await (readClient as any).pointsTransaction.findMany({
      where,
      select: {
        type: true,
        points: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Aggregate by type / Tipə görə yığ
    const byType: Record<string, { total: number; count: number }> = {};
    const byDate: Record<string, { total: number; count: number }> = {};

    for (const transaction of transactions) {
      // By type / Tipə görə
      if (!byType[transaction.type]) {
        byType[transaction.type] = { total: 0, count: 0 };
      }
      byType[transaction.type].total += transaction.points;
      byType[transaction.type].count++;

      // By date / Tarixə görə
      const dateKey = transaction.createdAt.toISOString().split('T')[0];
      if (!byDate[dateKey]) {
        byDate[dateKey] = { total: 0, count: 0 };
      }
      byDate[dateKey].total += transaction.points;
      byDate[dateKey].count++;
    }

    return {
      byType,
      byDate: Object.entries(byDate).map(([date, data]) => ({
        date,
        ...data,
      })),
    };
  } catch (error) {
    logger.error('Failed to get points earning trends / Xal qazanma trendlərini almaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Get redemption trends / İstifadə trendlərini al
 */
export async function getRedemptionTrends(startDate?: Date, endDate?: Date) {
  try {
    const readClient = await getReadClient();
    const where: any = {
      type: 'redemption',
      points: { lt: 0 }, // Only redemption transactions / Yalnız istifadə əməliyyatları
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const transactions = await (readClient as any).pointsTransaction.findMany({
      where,
      select: {
        points: true,
        createdAt: true,
        description: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Aggregate by date / Tarixə görə yığ
    const byDate: Record<string, { total: number; count: number }> = {};

    for (const transaction of transactions) {
      const dateKey = transaction.createdAt.toISOString().split('T')[0];
      if (!byDate[dateKey]) {
        byDate[dateKey] = { total: 0, count: 0 };
      }
      byDate[dateKey].total += Math.abs(transaction.points);
      byDate[dateKey].count++;
    }

    return {
      byDate: Object.entries(byDate).map(([date, data]) => ({
        date,
        ...data,
      })),
      totalRedemptions: transactions.length,
      totalPointsRedeemed: transactions.reduce((sum, t) => sum + Math.abs(t.points), 0),
    };
  } catch (error) {
    logger.error('Failed to get redemption trends / İstifadə trendlərini almaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Get tier distribution / Səviyyə paylanmasını al
 */
export async function getTierDistribution() {
  try {
    const readClient = await getReadClient();
    
    // Get all user points / Bütün istifadəçi xallarını al
    const userPoints = await (readClient as any).userPoints.findMany({
      select: {
        points: true,
      },
    });

    // Define tiers (can be configured) / Səviyyələri təyin et (konfiqurasiya edilə bilər)
    const tiers = [
      { name: 'Bronze', min: 0, max: 1000 },
      { name: 'Silver', min: 1001, max: 5000 },
      { name: 'Gold', min: 5001, max: 10000 },
      { name: 'Platinum', min: 10001, max: Infinity },
    ];

    const distribution: Record<string, number> = {};
    for (const tier of tiers) {
      distribution[tier.name] = 0;
    }

    for (const userPoint of userPoints) {
      const points = userPoint.points;
      for (const tier of tiers) {
        if (points >= tier.min && points <= tier.max) {
          distribution[tier.name]++;
          break;
        }
      }
    }

    return {
      distribution,
      totalUsers: userPoints.length,
    };
  } catch (error) {
    logger.error('Failed to get tier distribution / Səviyyə paylanmasını almaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Get engagement metrics / Əlaqə metrikalarını al
 */
export async function getEngagementMetrics(startDate?: Date, endDate?: Date) {
  try {
    const readClient = await getReadClient();
    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [
      totalUsers,
      activeUsers,
      totalTransactions,
      totalPointsEarned,
      totalPointsRedeemed,
      averagePointsPerUser,
    ] = await Promise.all([
      (readClient as any).userPoints.count(),
      (readClient as any).pointsTransaction.count({
        where: {
          ...where,
          points: { gt: 0 },
        },
        distinct: ['userId'],
      }),
      (readClient as any).pointsTransaction.count({ where }),
      (readClient as any).pointsTransaction.aggregate({
        where: {
          ...where,
          points: { gt: 0 },
        },
        _sum: { points: true },
      }),
      (readClient as any).pointsTransaction.aggregate({
        where: {
          ...where,
          type: 'redemption',
          points: { lt: 0 },
        },
        _sum: { points: true },
      }),
      (readClient as any).userPoints.aggregate({
        _avg: { points: true },
      }),
    ]);

    return {
      totalUsers,
      activeUsers,
      totalTransactions,
      totalPointsEarned: Number(totalPointsEarned._sum.points || 0),
      totalPointsRedeemed: Math.abs(Number(totalPointsRedeemed._sum.points || 0)),
      averagePointsPerUser: Number(averagePointsPerUser._avg.points || 0),
      redemptionRate: totalPointsEarned._sum.points
        ? (Math.abs(totalPointsRedeemed._sum.points || 0) / Number(totalPointsEarned._sum.points)) * 100
        : 0,
    };
  } catch (error) {
    logger.error('Failed to get engagement metrics / Əlaqə metrikalarını almaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Get comprehensive loyalty analytics / Hərtərəfli sədaqət analitikasını al
 */
export async function getLoyaltyAnalytics(startDate?: Date, endDate?: Date) {
  try {
    const [earningTrends, redemptionTrends, tierDistribution, engagementMetrics] = await Promise.all([
      getPointsEarningTrends(startDate, endDate),
      getRedemptionTrends(startDate, endDate),
      getTierDistribution(),
      getEngagementMetrics(startDate, endDate),
    ]);

    return {
      earningTrends,
      redemptionTrends,
      tierDistribution,
      engagementMetrics,
    };
  } catch (error) {
    logger.error('Failed to get loyalty analytics / Sədaqət analitikasını almaq uğursuz oldu', error);
    throw error;
  }
}

