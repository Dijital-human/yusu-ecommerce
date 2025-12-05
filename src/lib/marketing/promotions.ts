/**
 * Promotions & Discounts Service / Promosiyalar və Endirimlər Xidməti
 * Provides promotion and discount management
 * Promosiya və endirim idarəetməsi təmin edir
 */

import { logger } from '@/lib/utils/logger';
import { prisma } from '@/lib/db';

/**
 * Discount types / Endirim tipləri
 */
export type DiscountType = 'percentage' | 'fixed' | 'buy_x_get_y' | 'free_shipping';

/**
 * Promotion status / Promosiya statusu
 */
export type PromotionStatus = 'draft' | 'active' | 'scheduled' | 'expired' | 'cancelled';

/**
 * Promotion interface / Promosiya interfeysi
 */
export interface Promotion {
  id: string;
  name: string;
  description?: string;
  type: DiscountType;
  status: PromotionStatus;
  startDate: Date;
  endDate: Date;
  discountValue: number; // Percentage or fixed amount / Faiz və ya sabit məbləğ
  minPurchaseAmount?: number;
  maxDiscountAmount?: number; // For percentage discounts / Faiz endirimlər üçün
  applicableTo?: 'all' | 'category' | 'product' | 'seller';
  applicableIds?: string[]; // Category IDs, Product IDs, or Seller IDs
  couponCode?: string;
  usageLimit?: number; // Total usage limit / Ümumi istifadə limiti
  usageCount?: number; // Current usage count / Cari istifadə sayı
  userLimit?: number; // Per user usage limit / İstifadəçi başına istifadə limiti
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Calculate discount amount / Endirim məbləğini hesabla
 */
export function calculateDiscount(
  promotion: Promotion,
  subtotal: number,
  items?: Array<{ productId: string; categoryId: string; sellerId: string; price: number; quantity: number }>
): number {
  // Check if promotion is active / Promosiyanın aktiv olub-olmadığını yoxla
  const now = new Date();
  if (promotion.status !== 'active' || now < promotion.startDate || now > promotion.endDate) {
    return 0;
  }

  // Check minimum purchase amount / Minimum alış məbləğini yoxla
  if (promotion.minPurchaseAmount && subtotal < promotion.minPurchaseAmount) {
    return 0;
  }

  // Check if applicable to items / Elementlərə tətbiq olunub-olunmadığını yoxla
  if (promotion.applicableTo !== 'all' && items) {
    const applicableItems = items.filter(item => {
      switch (promotion.applicableTo) {
        case 'category':
          return promotion.applicableIds?.includes(item.categoryId);
        case 'product':
          return promotion.applicableIds?.includes(item.productId);
        case 'seller':
          return promotion.applicableIds?.includes(item.sellerId);
        default:
          return false;
      }
    });

    if (applicableItems.length === 0) {
      return 0;
    }

    // Calculate discount only on applicable items / Yalnız tətbiq olunan elementlər üçün endirim hesabla
    const applicableSubtotal = applicableItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return calculateDiscountForAmount(promotion, applicableSubtotal);
  }

  return calculateDiscountForAmount(promotion, subtotal);
}

/**
 * Calculate discount for amount / Məbləğ üçün endirim hesabla
 */
function calculateDiscountForAmount(promotion: Promotion, amount: number): number {
  let discount = 0;

  switch (promotion.type) {
    case 'percentage':
      discount = (amount * promotion.discountValue) / 100;
      if (promotion.maxDiscountAmount) {
        discount = Math.min(discount, promotion.maxDiscountAmount);
      }
      break;

    case 'fixed':
      discount = promotion.discountValue;
      break;

    case 'free_shipping':
      // Free shipping is handled separately / Pulsuz çatdırılma ayrıca idarə edilir
      discount = 0;
      break;

    case 'buy_x_get_y':
      // Buy X Get Y is handled separately / Buy X Get Y ayrıca idarə edilir
      discount = 0;
      break;
  }

  // Ensure discount doesn't exceed amount / Endirimin məbləği aşmadığından əmin ol
  return Math.min(discount, amount);
}

/**
 * Validate coupon code / Kupon kodunu yoxla
 */
export async function validateCouponCode(
  code: string,
  userId?: string,
  subtotal?: number
): Promise<{ valid: boolean; promotion?: Promotion; error?: string }> {
  try {
    // Find promotion by coupon code / Kupon kodu ilə promosiyanı tap
    // Note: This assumes a Promotion model exists in Prisma schema
    // Qeyd: Bu Prisma schema-da Promotion modelinin mövcud olduğunu fərz edir
    const promotionData = await (prisma as any).promotion.findFirst({
      where: {
        couponCode: code,
        status: 'active',
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
    });

    if (!promotionData) {
      return {
        valid: false,
        error: 'Coupon code not found or expired / Kupon kodu tapılmadı və ya müddəti bitib',
      };
    }

    // Check usage limit / İstifadə limitini yoxla
    if (promotionData.usageLimit && promotionData.usageCount >= promotionData.usageLimit) {
      return {
        valid: false,
        error: 'Coupon code usage limit reached / Kupon kodu istifadə limiti çatıb',
      };
    }

    // Check minimum purchase amount / Minimum alış məbləğini yoxla
    if (subtotal && promotionData.minPurchaseAmount && subtotal < Number(promotionData.minPurchaseAmount)) {
      return {
        valid: false,
        error: `Minimum purchase amount is ${promotionData.minPurchaseAmount} / Minimum alış məbləği ${promotionData.minPurchaseAmount}`,
      };
    }

    // Check per-user limit if userId provided / Əgər userId verilibsə, istifadəçi başına limiti yoxla
    if (userId && promotionData.userLimit) {
      const userUsage = await (prisma as any).promotionUsage.count({
        where: {
          promotionId: promotionData.id,
          userId,
        },
      });

      if (userUsage >= promotionData.userLimit) {
        return {
          valid: false,
          error: 'You have reached the usage limit for this coupon / Bu kupon üçün istifadə limitinə çatdınız',
        };
      }
    }

    const promotion: Promotion = {
      id: promotionData.id,
      name: promotionData.name,
      description: promotionData.description,
      type: promotionData.type,
      status: promotionData.status,
      startDate: promotionData.startDate,
      endDate: promotionData.endDate,
      discountValue: Number(promotionData.discountValue),
      minPurchaseAmount: promotionData.minPurchaseAmount ? Number(promotionData.minPurchaseAmount) : undefined,
      maxDiscountAmount: promotionData.maxDiscountAmount ? Number(promotionData.maxDiscountAmount) : undefined,
      applicableTo: promotionData.applicableTo,
      applicableIds: promotionData.applicableIds,
      couponCode: promotionData.couponCode,
      usageLimit: promotionData.usageLimit,
      usageCount: promotionData.usageCount || 0,
      userLimit: promotionData.userLimit,
      createdAt: promotionData.createdAt,
      updatedAt: promotionData.updatedAt,
    };

    return {
      valid: true,
      promotion,
    };
  } catch (error: any) {
    // If Promotion model doesn't exist, return graceful error / Əgər Promotion modeli mövcud deyilsə, graceful xəta qaytar
    if (error.code === 'P2001' || error.message?.includes('model') || error.message?.includes('does not exist')) {
      logger.warn('Promotion model not found in database. Please add Promotion model to Prisma schema / Promotion modeli veritabanında tapılmadı. Zəhmət olmasa Promotion modelini Prisma schema-ya əlavə edin', { code });
      return {
        valid: false,
        error: 'Coupon code validation temporarily unavailable / Kupon kodu doğrulaması müvəqqəti olaraq mövcud deyil',
      };
    }

    logger.error('Failed to validate coupon code / Kupon kodunu doğrulamaq uğursuz oldu', error, { code });
    return {
      valid: false,
      error: 'Failed to validate coupon code / Kupon kodunu doğrulamaq uğursuz oldu',
    };
  }
}

/**
 * Apply promotion to order / Sifarişə promosiya tətbiq et
 */
export function applyPromotion(
  promotion: Promotion,
  subtotal: number,
  items?: Array<{ productId: string; categoryId: string; sellerId: string; price: number; quantity: number }>
): {
  discount: number;
  finalAmount: number;
  freeShipping: boolean;
} {
  const discount = calculateDiscount(promotion, subtotal, items);
  const freeShipping = promotion.type === 'free_shipping';
  const finalAmount = Math.max(0, subtotal - discount);

  return {
    discount,
    finalAmount,
    freeShipping,
  };
}

/**
 * Get active promotions / Aktiv promosiyaları al
 */
export async function getActivePromotions(
  applicableTo?: 'all' | 'category' | 'product' | 'seller',
  applicableId?: string
): Promise<Promotion[]> {
  try {
    const now = new Date();
    const where: any = {
      status: 'active',
      startDate: { lte: now },
      endDate: { gte: now },
    };

    // Filter by applicable type and ID / Tətbiq olunan tip və ID-yə görə filtrlə
    if (applicableTo && applicableTo !== 'all') {
      where.applicableTo = applicableTo;
      if (applicableId) {
        where.applicableIds = { has: applicableId };
      }
    }

    // Note: This assumes a Promotion model exists in Prisma schema
    // Qeyd: Bu Prisma schema-da Promotion modelinin mövcud olduğunu fərz edir
    const promotions = await (prisma as any).promotion.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return promotions.map((p: any): Promotion => ({
      id: p.id,
      name: p.name,
      description: p.description,
      type: p.type,
      status: p.status,
      startDate: p.startDate,
      endDate: p.endDate,
      discountValue: Number(p.discountValue),
      minPurchaseAmount: p.minPurchaseAmount ? Number(p.minPurchaseAmount) : undefined,
      maxDiscountAmount: p.maxDiscountAmount ? Number(p.maxDiscountAmount) : undefined,
      applicableTo: p.applicableTo,
      applicableIds: p.applicableIds,
      couponCode: p.couponCode,
      usageLimit: p.usageLimit,
      usageCount: p.usageCount || 0,
      userLimit: p.userLimit,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  } catch (error: any) {
    // If Promotion model doesn't exist, return empty array / Əgər Promotion modeli mövcud deyilsə, boş array qaytar
    if (error.code === 'P2001' || error.message?.includes('model') || error.message?.includes('does not exist')) {
      logger.warn('Promotion model not found in database. Please add Promotion model to Prisma schema / Promotion modeli veritabanında tapılmadı. Zəhmət olmasa Promotion modelini Prisma schema-ya əlavə edin');
      return [];
    }

    logger.error('Failed to get active promotions / Aktiv promosiyaları almaq uğursuz oldu', error);
    return [];
  }
}

