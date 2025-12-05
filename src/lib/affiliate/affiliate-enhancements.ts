/**
 * Affiliate Program Enhancements / Affiliate Proqramı Təkmilləşdirmələri
 * Enhanced features for affiliate program / Affiliate proqramı üçün təkmilləşdirilmiş funksiyalar
 */

import { getReadClient, getWriteClient } from '@/lib/db/query-client';
import { logger } from '@/lib/utils/logger';
import { createAffiliateCommission } from './affiliate-manager';

/**
 * Calculate multi-tier commission / Çox səviyyəli komissiya hesabla
 */
export async function calculateMultiTierCommission(
  orderId: string,
  directAffiliateId: string,
  orderAmount: number
) {
  try {
    const readClient = await getReadClient();
    
    // Get order and program / Sifariş və proqramı al
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
      throw new Error('No affiliate program found / Affiliate proqram tapılmadı');
    }

    const program = order.seller.affiliatePrograms[0];
    if (!program.multiTierEnabled) {
      // Use standard single-tier commission / Standart tək səviyyəli komissiya istifadə et
      return await createAffiliateCommission(directAffiliateId, orderId, orderAmount);
    }

    const commissions = [];
    const writeClient = await getWriteClient();

    // Tier 1: Direct affiliate / Səviyyə 1: Birbaşa affiliate
    const tier1Rate = Number(program.commissionRate);
    const tier1Amount = Number(orderAmount) * tier1Rate;
    
    const tier1Commission = await (writeClient as any).affiliateCommission.create({
      data: {
        affiliateId: directAffiliateId,
        orderId,
        commissionAmount: tier1Amount,
        tier: 1,
        programId: program.id,
        status: 'pending',
      },
    });
    commissions.push(tier1Commission);

    // Tier 2: Referrer of direct affiliate / Səviyyə 2: Birbaşa affiliate-in tövsiyəçisi
    if (program.tier2CommissionRate) {
      const directAffiliate = await (readClient as any).user.findUnique({
        where: { id: directAffiliateId },
        select: { referredBy: true },
      });

      if (directAffiliate?.referredBy) {
        const tier2Rate = Number(program.tier2CommissionRate);
        const tier2Amount = Number(orderAmount) * tier2Rate;
        
        const tier2Commission = await (writeClient as any).affiliateCommission.create({
          data: {
            affiliateId: directAffiliate.referredBy,
            orderId,
            commissionAmount: tier2Amount,
            tier: 2,
            programId: program.id,
            status: 'pending',
          },
        });
        commissions.push(tier2Commission);

        // Tier 3: Referrer of tier 2 affiliate / Səviyyə 3: Səviyyə 2 affiliate-in tövsiyəçisi
        if (program.tier3CommissionRate) {
          const tier2Affiliate = await (readClient as any).user.findUnique({
            where: { id: directAffiliate.referredBy },
            select: { referredBy: true },
          });

          if (tier2Affiliate?.referredBy) {
            const tier3Rate = Number(program.tier3CommissionRate);
            const tier3Amount = Number(orderAmount) * tier3Rate;
            
            const tier3Commission = await (writeClient as any).affiliateCommission.create({
              data: {
                affiliateId: tier2Affiliate.referredBy,
                orderId,
                commissionAmount: tier3Amount,
                tier: 3,
                programId: program.id,
                status: 'pending',
              },
            });
            commissions.push(tier3Commission);
          }
        }
      }
    }

    logger.info('Multi-tier commission calculated / Çox səviyyəli komissiya hesablandı', {
      orderId,
      directAffiliateId,
      commissionsCount: commissions.length,
    });

    return commissions;
  } catch (error) {
    logger.error('Failed to calculate multi-tier commission / Çox səviyyəli komissiya hesablamaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Track affiliate referral / Affiliate tövsiyəsini izlə
 */
export async function trackAffiliateReferral(
  newAffiliateId: string,
  referrerAffiliateId: string
) {
  try {
    const writeClient = await getWriteClient();
    
    // Update user's referredBy field / İstifadəçinin referredBy sahəsini yenilə
    await (writeClient as any).user.update({
      where: { id: newAffiliateId },
      data: {
        referredBy: referrerAffiliateId,
      },
    });

    logger.info('Affiliate referral tracked / Affiliate tövsiyəsi izləndi', {
      newAffiliateId,
      referrerAffiliateId,
    });

    return { success: true };
  } catch (error) {
    logger.error('Failed to track affiliate referral / Affiliate tövsiyəsini izləmək uğursuz oldu', error);
    throw error;
  }
}

/**
 * Get promotional materials / Təşviq materiallarını al
 */
export async function getPromotionalMaterials(programId: string, type?: string) {
  try {
    const readClient = await getReadClient();
    const where: any = {
      programId,
      isActive: true,
    };

    if (type) {
      where.type = type;
    }

    const materials = await (readClient as any).affiliatePromotionalMaterial.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return materials;
  } catch (error) {
    logger.error('Failed to get promotional materials / Təşviq materiallarını almaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Create promotional material / Təşviq materialı yarat
 */
export async function createPromotionalMaterial(
  programId: string,
  data: {
    type: string;
    title: string;
    description?: string;
    content?: string;
    imageUrl?: string;
    linkUrl?: string;
  }
) {
  try {
    const writeClient = await getWriteClient();
    const material = await (writeClient as any).affiliatePromotionalMaterial.create({
      data: {
        programId,
        ...data,
        isActive: true,
      },
    });

    logger.info('Promotional material created / Təşviq materialı yaradıldı', {
      materialId: material.id,
      programId,
      type: material.type,
    });

    return material;
  } catch (error) {
    logger.error('Failed to create promotional material / Təşviq materialı yaratmaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Generate affiliate report / Affiliate hesabatı yarat
 */
export async function generateAffiliateReport(
  affiliateId: string,
  startDate?: Date,
  endDate?: Date
) {
  try {
    const readClient = await getReadClient();
    const where: any = { affiliateId };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [
      commissions,
      payouts,
      links,
      referredAffiliates,
    ] = await Promise.all([
      (readClient as any).affiliateCommission.findMany({
        where,
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
      }),
      (readClient as any).affiliatePayout.findMany({
        where: { affiliateId },
        orderBy: { createdAt: 'desc' },
      }),
      (readClient as any).affiliateLink.findMany({
        where: { affiliateId },
        select: {
          id: true,
          linkCode: true,
          clicks: true,
          conversions: true,
        },
      }),
      (readClient as any).user.findMany({
        where: { referredBy: affiliateId },
        select: {
          id: true,
          email: true,
          createdAt: true,
        },
      }),
    ]);

    // Calculate statistics / Statistika hesabla
    const totalCommissions = commissions.reduce((sum: number, c: any) => 
      sum + Number(c.commissionAmount), 0
    );
    const paidCommissions = commissions
      .filter((c: any) => c.status === 'paid')
      .reduce((sum: number, c: any) => sum + Number(c.commissionAmount), 0);
    const pendingCommissions = commissions
      .filter((c: any) => c.status === 'pending')
      .reduce((sum: number, c: any) => sum + Number(c.commissionAmount), 0);
    const totalPayouts = payouts
      .filter((p: any) => p.status === 'paid')
      .reduce((sum: number, p: any) => sum + Number(p.amount), 0);
    const totalClicks = links.reduce((sum: number, l: any) => sum + l.clicks, 0);
    const totalConversions = links.reduce((sum: number, l: any) => sum + l.conversions, 0);

    return {
      period: {
        startDate: startDate || null,
        endDate: endDate || null,
      },
      statistics: {
        totalCommissions,
        paidCommissions,
        pendingCommissions,
        totalPayouts,
        availableBalance: paidCommissions - totalPayouts,
        totalClicks,
        totalConversions,
        conversionRate: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0,
        referredAffiliatesCount: referredAffiliates.length,
      },
      commissions,
      payouts,
      links,
      referredAffiliates,
    };
  } catch (error) {
    logger.error('Failed to generate affiliate report / Affiliate hesabatı yaratmaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Get scheduled payouts / Planlaşdırılmış ödənişləri al
 */
export async function getScheduledPayouts(programId?: string, scheduledDate?: Date) {
  try {
    const readClient = await getReadClient();
    const where: any = {
      status: 'pending',
      scheduledFor: { not: null },
    };

    if (programId) {
      where.programId = programId;
    }

    if (scheduledDate) {
      const startOfDay = new Date(scheduledDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(scheduledDate);
      endOfDay.setHours(23, 59, 59, 999);
      where.scheduledFor = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const payouts = await (readClient as any).affiliatePayout.findMany({
      where,
      include: {
        affiliate: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        program: {
          select: {
            id: true,
            sellerId: true,
          },
        },
      },
      orderBy: { scheduledFor: 'asc' },
    });

    return payouts;
  } catch (error) {
    logger.error('Failed to get scheduled payouts / Planlaşdırılmış ödənişləri almaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Schedule payout based on payment schedule / Ödəniş cədvəlinə əsasən ödəniş planlaşdır
 */
export async function schedulePayoutsForProgram(programId: string) {
  try {
    const readClient = await getReadClient();
    const program = await (readClient as any).affiliateProgram.findUnique({
      where: { id: programId },
    });

    if (!program || !program.paymentSchedule) {
      return { scheduled: 0 };
    }

    // Get pending commissions / Gözləyən komissiyaları al
    const pendingCommissions = await (readClient as any).affiliateCommission.findMany({
      where: {
        programId,
        status: 'approved',
      },
      include: {
        affiliate: {
          select: {
            id: true,
          },
        },
      },
    });

    // Group by affiliate / Affiliate-ə görə qruplaşdır
    const affiliateCommissions: Record<string, any[]> = {};
    for (const commission of pendingCommissions) {
      const affiliateId = commission.affiliateId;
      if (!affiliateCommissions[affiliateId]) {
        affiliateCommissions[affiliateId] = [];
      }
      affiliateCommissions[affiliateId].push(commission);
    }

    // Calculate next payment date / Növbəti ödəniş tarixini hesabla
    const today = new Date();
    let nextPaymentDate = new Date();

    if (program.paymentSchedule === 'weekly') {
      const daysUntilNext = (7 - today.getDay() + (program.paymentDay || 0)) % 7 || 7;
      nextPaymentDate.setDate(today.getDate() + daysUntilNext);
    } else if (program.paymentSchedule === 'biweekly') {
      nextPaymentDate.setDate(today.getDate() + 14);
    } else if (program.paymentSchedule === 'monthly') {
      nextPaymentDate.setMonth(today.getMonth() + 1);
      nextPaymentDate.setDate(program.paymentDay || 1);
    }

    const writeClient = await getWriteClient();
    let scheduledCount = 0;

    // Create scheduled payouts / Planlaşdırılmış ödənişlər yarat
    for (const [affiliateId, commissions] of Object.entries(affiliateCommissions)) {
      const totalAmount = commissions.reduce((sum, c) => sum + Number(c.commissionAmount), 0);
      
      if (totalAmount >= Number(program.minPayout)) {
        await (writeClient as any).affiliatePayout.create({
          data: {
            affiliateId,
            programId,
            amount: totalAmount,
            status: 'pending',
            scheduledFor: nextPaymentDate,
          },
        });
        scheduledCount++;
      }
    }

    logger.info('Payouts scheduled / Ödənişlər planlaşdırıldı', {
      programId,
      scheduledCount,
      nextPaymentDate,
    });

    return { scheduled: scheduledCount, nextPaymentDate };
  } catch (error) {
    logger.error('Failed to schedule payouts / Ödənişləri planlaşdırmaq uğursuz oldu', error);
    throw error;
  }
}

