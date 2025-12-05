/**
 * Affiliate Manager / Affiliate Meneceri
 * Service functions for affiliate program management / Affiliate proqram idarəetməsi üçün xidmət funksiyaları
 */

import { getReadClient, getWriteClient } from '@/lib/db/query-client';
import { logger } from '@/lib/utils/logger';
import crypto from 'crypto';

/**
 * Generate unique affiliate link code / Unikal affiliate link kodu yarat
 */
export function generateAffiliateCode(userId: string): string {
  const hash = crypto.createHash('sha256').update(`${userId}-${Date.now()}`).digest('hex');
  return hash.substring(0, 16).toUpperCase();
}

/**
 * Get affiliate program for seller / Satıcı üçün affiliate proqramı al
 */
export async function getAffiliateProgram(sellerId: string) {
  try {
    const readClient = await getReadClient();
    const program = await (readClient as any).affiliateProgram.findFirst({
      where: { sellerId },
      include: {
        links: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            links: true,
            commissions: true,
            payouts: true,
          },
        },
      },
    });

    return program;
  } catch (error) {
    logger.error('Failed to get affiliate program / Affiliate proqramı almaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Create or update affiliate program / Affiliate proqramı yarat və ya yenilə
 */
export async function createOrUpdateAffiliateProgram(
  sellerId: string,
  data: {
    commissionRate?: number;
    isActive?: boolean;
    minPayout?: number;
  }
) {
  try {
    const readClient = await getReadClient();
    const existing = await (readClient as any).affiliateProgram.findFirst({
      where: { sellerId },
    });

    const writeClient = await getWriteClient();
    if (existing) {
      const updated = await (writeClient as any).affiliateProgram.update({
        where: { id: existing.id },
        data,
      });
      return updated;
    } else {
      const created = await (writeClient as any).affiliateProgram.create({
        data: {
          sellerId,
          commissionRate: data.commissionRate || 0.1,
          isActive: data.isActive !== undefined ? data.isActive : true,
          minPayout: data.minPayout || 50,
        },
      });
      return created;
    }
  } catch (error) {
    logger.error('Failed to create/update affiliate program / Affiliate proqramı yaratmaq/yeniləmək uğursuz oldu', error);
    throw error;
  }
}

/**
 * Create affiliate link / Affiliate link yarat
 */
export async function createAffiliateLink(
  affiliateId: string,
  productId?: string
) {
  try {
    const linkCode = generateAffiliateCode(affiliateId);
    const writeClient = await getWriteClient();
    const link = await (writeClient as any).affiliateLink.create({
      data: {
        affiliateId,
        productId,
        linkCode,
      },
    });

    logger.info('Affiliate link created / Affiliate link yaradıldı', {
      linkId: link.id,
      affiliateId,
      productId,
    });

    return link;
  } catch (error) {
    logger.error('Failed to create affiliate link / Affiliate link yaratmaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Get affiliate links / Affiliate linkləri al
 */
export async function getAffiliateLinks(
  affiliateId: string,
  options: {
    page?: number;
    limit?: number;
    productId?: string;
  } = {}
) {
  try {
    const { page = 1, limit = 20, productId } = options;
    const skip = (page - 1) * limit;

    const where: any = { affiliateId };
    if (productId) {
      where.productId = productId;
    }

    const readClient = await getReadClient();
    const [links, total] = await Promise.all([
      (readClient as any).affiliateLink.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              images: true,
            },
          },
          _count: {
            select: {
              commissions: true,
            },
          },
        },
      }),
      (readClient as any).affiliateLink.count({ where }),
    ]);

    return {
      links,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Failed to get affiliate links / Affiliate linkləri almaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Track affiliate click / Affiliate klikini izlə
 */
export async function trackAffiliateClick(linkCode: string) {
  try {
    const readClient = await getReadClient();
    const link = await (readClient as any).affiliateLink.findUnique({
      where: { linkCode },
    });

    if (link) {
      const writeClient = await getWriteClient();
      await (writeClient as any).affiliateLink.update({
        where: { id: link.id },
        data: {
          clicks: {
            increment: 1,
          },
        },
      });
    }

    return link;
  } catch (error) {
    logger.error('Failed to track affiliate click / Affiliate klikini izləmək uğursuz oldu', error);
    throw error;
  }
}

/**
 * Create affiliate commission / Affiliate komissiyası yarat
 */
export async function createAffiliateCommission(
  affiliateId: string,
  orderId: string,
  orderAmount: number,
  linkId?: string
) {
  try {
    // Get affiliate program for this order's seller / Bu sifarişin satıcısı üçün affiliate proqramı al
    const readClient = await getReadClient();
    const order = await (readClient as any).order.findUnique({
      where: { id: orderId },
      include: {
        seller: {
          include: {
            affiliatePrograms: true,
          },
        },
      },
    });

    if (!order || !order.seller.affiliatePrograms || order.seller.affiliatePrograms.length === 0) {
      throw new Error('No affiliate program found for this seller / Bu satıcı üçün affiliate proqram tapılmadı');
    }

    const program = order.seller.affiliatePrograms[0];
    if (!program.isActive) {
      throw new Error('Affiliate program is not active / Affiliate proqram aktiv deyil');
    }

    const commissionAmount = Number(orderAmount) * Number(program.commissionRate);

    const writeClient = await getWriteClient();
    const commission = await (writeClient as any).affiliateCommission.create({
      data: {
        affiliateId,
        linkId,
        orderId,
        commissionAmount,
        status: 'pending',
        tier: 1,
      },
    });

    // Update link conversions if linkId provided / linkId verilərsə link conversions yenilə
    if (linkId) {
      await (writeClient as any).affiliateLink.update({
        where: { id: linkId },
        data: {
          conversions: {
            increment: 1,
          },
        },
      });
    }

    logger.info('Affiliate commission created / Affiliate komissiyası yaradıldı', {
      commissionId: commission.id,
      affiliateId,
      orderId,
      commissionAmount,
    });

    return commission;
  } catch (error) {
    logger.error('Failed to create affiliate commission / Affiliate komissiyası yaratmaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Get affiliate commissions / Affiliate komissiyalarını al
 */
export async function getAffiliateCommissions(
  affiliateId: string,
  options: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}
) {
  try {
    const { page = 1, limit = 20, status } = options;
    const skip = (page - 1) * limit;

    const where: any = { affiliateId };
    if (status) {
      where.status = status;
    }

    const readClient = await getReadClient();
    const [commissions, total] = await Promise.all([
      (readClient as any).affiliateCommission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          order: {
            select: {
              id: true,
              totalAmount: true,
              status: true,
              createdAt: true,
            },
          },
          link: {
            select: {
              id: true,
              linkCode: true,
              product: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
      (readClient as any).affiliateCommission.count({ where }),
    ]);

    const totalEarned = await (readClient as any).affiliateCommission.aggregate({
      where: { affiliateId, status: 'paid' },
      _sum: {
        commissionAmount: true,
      },
    });

    const pendingAmount = await (readClient as any).affiliateCommission.aggregate({
      where: { affiliateId, status: 'pending' },
      _sum: {
        commissionAmount: true,
      },
    });

    return {
      commissions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalEarned: totalEarned._sum.commissionAmount || 0,
        pendingAmount: pendingAmount._sum.commissionAmount || 0,
      },
    };
  } catch (error) {
    logger.error('Failed to get affiliate commissions / Affiliate komissiyalarını almaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Get affiliate stats / Affiliate statistikalarını al
 */
export async function getAffiliateStats(affiliateId: string) {
  try {
    const readClient = await getReadClient();
    const [links, commissions, payouts] = await Promise.all([
      (readClient as any).affiliateLink.findMany({
        where: { affiliateId },
      }),
      (readClient as any).affiliateCommission.findMany({
        where: { affiliateId },
      }),
      (readClient as any).affiliatePayout.findMany({
        where: { affiliateId },
      }),
    ]);

    const totalClicks = links.reduce((sum: number, link: any) => sum + link.clicks, 0);
    const totalConversions = links.reduce((sum: number, link: any) => sum + link.conversions, 0);
    const totalEarned = commissions
      .filter((c: any) => c.status === 'paid')
      .reduce((sum: number, c: any) => sum + Number(c.commissionAmount), 0);
    const pendingAmount = commissions
      .filter((c: any) => c.status === 'pending')
      .reduce((sum: number, c: any) => sum + Number(c.commissionAmount), 0);
    const totalPaid = payouts
      .filter((p: any) => p.status === 'paid')
      .reduce((sum: number, p: any) => sum + Number(p.amount), 0);

    return {
      totalLinks: links.length,
      totalClicks,
      totalConversions,
      conversionRate: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0,
      totalEarned,
      pendingAmount,
      totalPaid,
      availableBalance: totalEarned - totalPaid,
    };
  } catch (error) {
    logger.error('Failed to get affiliate stats / Affiliate statistikalarını almaq uğursuz oldu', error);
    throw error;
  }
}

