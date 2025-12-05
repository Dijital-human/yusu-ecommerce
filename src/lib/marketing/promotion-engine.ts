/**
 * Promotion Engine / Promosiya Mühərriki
 * 
 * Handles promotion calculation, validation, and application logic.
 * Promosiya hesablaması, validasiyası və tətbiq məntiqini idarə edir.
 */

import { prisma } from '@/lib/db';

// Promotion types / Promosiya tipləri
export type PromotionType = 
  | 'percentage'      // Percentage discount / Faiz endirimi
  | 'fixed'          // Fixed amount discount / Sabit məbləğ endirimi
  | 'buy_x_get_y'    // Buy X Get Y / X Al Y Al
  | 'free_shipping'  // Free shipping / Pulsuz çatdırılma
  | 'bundle';        // Bundle deal / Paket təklifi

// Promotion applicability / Promosiya tətbiq olunması
export type ApplicableTo = 'all' | 'category' | 'product' | 'seller';

export interface Promotion {
  id: string;
  sellerId: string | null;
  name: string;
  description: string | null;
  type: PromotionType;
  discountValue: number | null;
  minPurchaseAmount: number | null;
  maxDiscountAmount: number | null;
  applicableTo: ApplicableTo;
  applicableIds: string[] | null;
  couponCode: string | null;
  usageLimit: number | null;
  usageCount: number;
  userLimit: number | null;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

export interface CartItem {
  productId: string;
  categoryId: string | null;
  sellerId: string;
  price: number;
  quantity: number;
}

export interface PromotionResult {
  promotionId: string;
  promotionName: string;
  discountAmount: number;
  type: PromotionType;
  applied: boolean;
  reason?: string; // If not applied, reason why / Tətbiq olunmadısa, səbəb
}

/**
 * Calculate discount for a promotion / Promosiya üçün endirim hesabla
 */
export function calculateDiscount(
  promotion: Promotion,
  subtotal: number,
  items?: CartItem[]
): number {
  if (!promotion.isActive) {
    return 0;
  }

  const now = new Date();
  if (now < promotion.startDate || now > promotion.endDate) {
    return 0;
  }

  // Check minimum purchase amount / Minimum alış məbləğini yoxla
  if (promotion.minPurchaseAmount && subtotal < Number(promotion.minPurchaseAmount)) {
    return 0;
  }

  let discount = 0;

  switch (promotion.type) {
    case 'percentage':
      if (promotion.discountValue) {
        discount = (subtotal * Number(promotion.discountValue)) / 100;
        // Apply max discount limit if set / Maksimum endirim limiti təyin edilibsə tətbiq et
        if (promotion.maxDiscountAmount) {
          discount = Math.min(discount, Number(promotion.maxDiscountAmount));
        }
      }
      break;

    case 'fixed':
      if (promotion.discountValue) {
        discount = Number(promotion.discountValue);
        // Don't exceed subtotal / Subtotal-dan artıq olmasın
        discount = Math.min(discount, subtotal);
      }
      break;

    case 'free_shipping':
      // Free shipping is handled separately / Pulsuz çatdırılma ayrıca idarə olunur
      discount = 0;
      break;

    case 'buy_x_get_y':
      // This requires specific item-based logic / Bu xüsusi məhsul əsaslı məntiq tələb edir
      discount = 0;
      break;

    case 'bundle':
      // Bundle deals require specific product combinations / Paket təklifləri xüsusi məhsul kombinasiyaları tələb edir
      discount = 0;
      break;

    default:
      discount = 0;
  }

  return Math.max(0, discount);
}

/**
 * Check if promotion is applicable to cart items / Promosiya səbət məhsullarına tətbiq olunurmu yoxla
 */
export function isPromotionApplicable(
  promotion: Promotion,
  items: CartItem[]
): boolean {
  if (!promotion.isActive) {
    return false;
  }

  const now = new Date();
  if (now < promotion.startDate || now > promotion.endDate) {
    return false;
  }

  // Check applicability / Tətbiq olunmasını yoxla
  if (promotion.applicableTo === 'all') {
    return true;
  }

  if (!promotion.applicableIds || promotion.applicableIds.length === 0) {
    return false;
  }

  switch (promotion.applicableTo) {
    case 'category':
      return items.some(item => 
        item.categoryId && promotion.applicableIds?.includes(item.categoryId)
      );

    case 'product':
      return items.some(item => 
        promotion.applicableIds?.includes(item.productId)
      );

    case 'seller':
      return items.some(item => 
        promotion.applicableIds?.includes(item.sellerId)
      );

    default:
      return false;
  }
}

/**
 * Find best applicable promotion / Ən yaxşı tətbiq olunan promosiyanı tap
 */
export async function findBestPromotion(
  subtotal: number,
  items: CartItem[],
  couponCode?: string,
  userId?: string
): Promise<PromotionResult | null> {
  try {
    const now = new Date();

    // Build query / Sorğu qur
    const where: any = {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
    };

    // If coupon code provided, search by code / Kupon kodu verilibsə, koda görə axtar
    if (couponCode) {
      where.couponCode = couponCode.toUpperCase();
    }

    // Fetch active promotions / Aktiv promosiyaları gətir
    const promotions = await (prisma as any).promotions.findMany({
      where,
      orderBy: { discountValue: 'desc' },
    });

    if (promotions.length === 0) {
      return null;
    }

    // Check user usage limits if userId provided / userId verilibsə istifadəçi istifadə limitlərini yoxla
    if (userId) {
      for (const promotion of promotions) {
        // Check total usage limit / Ümumi istifadə limitini yoxla
        if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
          continue;
        }

        // Check per-user limit / İstifadəçi başına limiti yoxla
        if (promotion.userLimit) {
          const userUsageCount = await (prisma as any).coupon_usage.count({
            where: {
              couponCode: promotion.couponCode || undefined,
              userId,
            },
          });

          if (userUsageCount >= promotion.userLimit) {
            continue;
          }
        }
      }
    }

    // Filter applicable promotions / Tətbiq olunan promosiyaları filtrlə
    const applicablePromotions = promotions.filter((p: any) => 
      isPromotionApplicable(p as Promotion, items)
    );

    if (applicablePromotions.length === 0) {
      return null;
    }

    // Calculate discounts for all applicable promotions / Bütün tətbiq olunan promosiyalar üçün endirimləri hesabla
    const promotionResults: PromotionResult[] = applicablePromotions.map((p: any) => {
      const discount = calculateDiscount(p as Promotion, subtotal, items);
      return {
        promotionId: p.id,
        promotionName: p.name,
        discountAmount: discount,
        type: p.type as PromotionType,
        applied: discount > 0,
      };
    });

    // Return the best promotion (highest discount) / Ən yaxşı promosiyanı qaytar (ən yüksək endirim)
    const bestPromotion = promotionResults.reduce((best, current) => 
      current.discountAmount > best.discountAmount ? current : best
    );

    return bestPromotion.applied ? bestPromotion : null;
  } catch (error) {
    console.error('❌ Error finding best promotion / Ən yaxşı promosiyanı tapmaqda xəta:', error);
    return null;
  }
}

/**
 * Apply promotion to order / Promosiyanı sifarişə tətbiq et
 */
export async function applyPromotionToOrder(
  orderId: string,
  promotionId: string,
  userId: string,
  couponCode?: string
): Promise<boolean> {
  try {
    // Record coupon usage / Kupon istifadəsini qeyd et
    if (couponCode) {
      await (prisma as any).coupon_usage.create({
        data: {
          couponCode: couponCode.toUpperCase(),
          userId,
          orderId,
          promotionId,
        },
      });

      // Increment usage count / İstifadə sayını artır
      await (prisma as any).promotions.update({
        where: { id: promotionId },
        data: {
          usageCount: { increment: 1 },
        },
      });
    }

    return true;
  } catch (error) {
    console.error('❌ Error applying promotion to order / Promosiyanı sifarişə tətbiq etməkdə xəta:', error);
    return false;
  }
}

/**
 * Validate coupon code / Kupon kodunu yoxla
 */
export async function validateCouponCode(
  couponCode: string,
  subtotal: number,
  items: CartItem[],
  userId?: string
): Promise<{ valid: boolean; promotion?: Promotion; discount?: number; reason?: string }> {
  try {
    const promotion = await (prisma as any).promotions.findUnique({
      where: { couponCode: couponCode.toUpperCase() },
    });

    if (!promotion) {
      return { valid: false, reason: 'Coupon code not found / Kupon kodu tapılmadı' };
    }

    if (!promotion.isActive) {
      return { valid: false, reason: 'Coupon is not active / Kupon aktiv deyil' };
    }

    const now = new Date();
    if (now < promotion.startDate || now > promotion.endDate) {
      return { valid: false, reason: 'Coupon has expired / Kuponun müddəti bitib' };
    }

    // Check usage limit / İstifadə limitini yoxla
    if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
      return { valid: false, reason: 'Coupon usage limit reached / Kupon istifadə limitinə çatıb' };
    }

    // Check per-user limit / İstifadəçi başına limiti yoxla
    if (userId && promotion.userLimit) {
      const userUsageCount = await (prisma as any).coupon_usage.count({
        where: {
          couponCode: couponCode.toUpperCase(),
          userId,
        },
      });

      if (userUsageCount >= promotion.userLimit) {
        return { valid: false, reason: 'You have reached your usage limit for this coupon / Bu kupon üçün istifadə limitinizə çatıbsınız' };
      }
    }

    // Check minimum purchase / Minimum alışı yoxla
    if (promotion.minPurchaseAmount && subtotal < Number(promotion.minPurchaseAmount)) {
      return { 
        valid: false, 
        reason: `Minimum purchase amount is ${promotion.minPurchaseAmount} / Minimum alış məbləği ${promotion.minPurchaseAmount}` 
      };
    }

    // Check applicability / Tətbiq olunmasını yoxla
    if (!isPromotionApplicable(promotion as Promotion, items)) {
      return { valid: false, reason: 'Coupon is not applicable to your cart items / Kupon səbət məhsullarınıza tətbiq olunmur' };
    }

    const discount = calculateDiscount(promotion as Promotion, subtotal, items);

    return {
      valid: true,
      promotion: promotion as Promotion,
      discount,
    };
  } catch (error) {
    console.error('❌ Error validating coupon code / Kupon kodunu yoxlamaqda xəta:', error);
    return { valid: false, reason: 'Error validating coupon / Kuponu yoxlamaqda xəta' };
  }
}

