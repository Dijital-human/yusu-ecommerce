/**
 * Social Share Service / Sosial Paylaşım Xidməti
 * Enhanced social sharing functionality with analytics / Analitika ilə təkmilləşdirilmiş sosial paylaşım funksionallığı
 */

import { getReadClient, getWriteClient } from "@/lib/db/query-client";
import { logger } from "@/lib/utils/logger";

export interface ShareAnalytics {
  totalShares: number;
  platformStats: Array<{
    platform: string;
    totalShares: number;
    productCount: number;
  }>;
  topProducts: any[];
  recentShares: any[];
}

/**
 * Track social share / Sosial paylaşımı izlə
 */
export async function trackSocialShare(
  productId: string,
  platform: string,
  url: string,
  userId?: string
) {
  try {
    const writeClient = await getWriteClient();

    // Check if share record exists / Paylaşım qeydi mövcuddursa yoxla
    const existingShare = await writeClient.socialShare.findFirst({
      where: {
        productId,
        platform,
      },
    });

    if (existingShare) {
      // Update share count / Paylaşım sayını yenilə
      await writeClient.socialShare.update({
        where: { id: existingShare.id },
        data: {
          shareCount: { increment: 1 },
          lastSharedAt: new Date(),
        },
      });
    } else {
      // Create new share record / Yeni paylaşım qeydi yarat
      await writeClient.socialShare.create({
        data: {
          productId,
          platform,
          shareCount: 1,
          lastSharedAt: new Date(),
        },
      });
    }

    logger.info("Social share tracked / Sosial paylaşım izləndi", {
      productId,
      platform,
      userId,
    });
  } catch (error) {
    logger.error("Error tracking social share / Sosial paylaşımı izləmə xətası", {
      error,
      productId,
      platform,
    });
    throw error;
  }
}

/**
 * Get share statistics for a product / Məhsul üçün paylaşım statistikalarını al
 */
export async function getProductShareStats(productId: string) {
  try {
    const readClient = await getReadClient();

    const shares = await readClient.socialShare.findMany({
      where: { productId },
      orderBy: { shareCount: "desc" },
    });

    const totalShares = shares.reduce(
      (sum, share) => sum + share.shareCount,
      0
    );

    return {
      shares,
      totalShares,
      platformCounts: shares.map((share) => ({
        platform: share.platform,
        count: share.shareCount,
      })),
    };
  } catch (error) {
    logger.error(
      "Error getting product share stats / Məhsul paylaşım statistikalarını alma xətası",
      { error, productId }
    );
    throw error;
  }
}

/**
 * Get social share analytics / Sosial paylaşım analitikasını al
 */
export async function getSocialShareAnalytics(
  startDate?: Date,
  endDate?: Date,
  platform?: string
): Promise<ShareAnalytics> {
  try {
    const readClient = await getReadClient();

    const where: any = {};
    if (startDate || endDate) {
      where.lastSharedAt = {};
      if (startDate) {
        where.lastSharedAt.gte = startDate;
      }
      if (endDate) {
        where.lastSharedAt.lte = endDate;
      }
    }
    if (platform) {
      where.platform = platform;
    }

    const [totalSharesResult, platformStats, topProducts, recentShares] =
      await Promise.all([
        readClient.socialShare.aggregate({
          where,
          _sum: {
            shareCount: true,
          },
        }),
        readClient.socialShare.groupBy({
          by: ["platform"],
          where,
          _sum: {
            shareCount: true,
          },
          _count: {
            productId: true,
          },
        }),
        readClient.socialShare.findMany({
          where,
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
              },
            },
          },
          orderBy: {
            shareCount: "desc",
          },
          take: 10,
        }),
        readClient.socialShare.findMany({
          where,
          orderBy: {
            lastSharedAt: "desc",
          },
          take: 20,
        }),
      ]);

    return {
      totalShares: totalSharesResult._sum.shareCount || 0,
      platformStats: platformStats.map((stat) => ({
        platform: stat.platform,
        totalShares: stat._sum.shareCount || 0,
        productCount: stat._count.productId,
      })),
      topProducts,
      recentShares,
    };
  } catch (error) {
    logger.error(
      "Error getting social share analytics / Sosial paylaşım analitikasını alma xətası",
      { error }
    );
    throw error;
  }
}

