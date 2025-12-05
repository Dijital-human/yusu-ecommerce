/**
 * Bundle Manager / Paket Meneceri
 * Service functions for product bundle management / Məhsul paketi idarəetməsi üçün xidmət funksiyaları
 */

import { db } from '@/lib/db';
import { logger } from '@/lib/utils/logger';

/**
 * Get bundle by ID / ID ilə paketi al
 */
export async function getBundleById(bundleId: string) {
  try {
    const bundle = await (db as any).productBundle.findUnique({
      where: { id: bundleId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                originalPrice: true,
                images: true,
                stock: true,
                isActive: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
        seller: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return bundle;
  } catch (error) {
    logger.error('Failed to get bundle / Paketi almaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Get active bundles / Aktiv paketləri al
 */
export async function getActiveBundles(options: {
  sellerId?: string;
  limit?: number;
  skip?: number;
} = {}) {
  try {
    const { sellerId, limit = 20, skip = 0 } = options;

    const where: any = { isActive: true };
    if (sellerId) {
      where.sellerId = sellerId;
    }

    const [bundles, total] = await Promise.all([
      (db as any).productBundle.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  originalPrice: true,
                  images: true,
                  stock: true,
                },
              },
            },
            orderBy: { order: 'asc' },
          },
          seller: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      (db as any).productBundle.count({ where }),
    ]);

    return {
      bundles,
      total,
      pagination: {
        page: Math.floor(skip / limit) + 1,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Failed to get active bundles / Aktiv paketləri almaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Calculate bundle price / Paket qiymətini hesabla
 */
export async function calculateBundlePrice(bundleId: string): Promise<{
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  savings: number;
}> {
  try {
    const bundle = await getBundleById(bundleId);
    if (!bundle) {
      throw new Error('Bundle not found / Paket tapılmadı');
    }

    // Calculate total original price / Ümumi orijinal qiyməti hesabla
    let originalPrice = 0;
    for (const item of bundle.items) {
      if (item.isRequired) {
        const productPrice = Number(item.product.price);
        originalPrice += productPrice * item.quantity;
      }
    }

    // Calculate discount / Endirimi hesabla
    let discountAmount = 0;
    if (bundle.discountType === 'percentage') {
      discountAmount = originalPrice * (Number(bundle.discountValue) / 100);
    } else {
      discountAmount = Number(bundle.discountValue);
    }

    const finalPrice = Math.max(0, originalPrice - discountAmount);
    const savings = discountAmount;

    return {
      originalPrice,
      discountAmount,
      finalPrice,
      savings,
    };
  } catch (error) {
    logger.error('Failed to calculate bundle price / Paket qiymətini hesablamaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Validate bundle / Paketi yoxla
 */
export async function validateBundle(bundleId: string): Promise<{
  isValid: boolean;
  errors: string[];
}> {
  try {
    const bundle = await getBundleById(bundleId);
    if (!bundle) {
      return {
        isValid: false,
        errors: ['Bundle not found / Paket tapılmadı'],
      };
    }

    const errors: string[] = [];

    // Check if bundle is active / Paketin aktiv olub-olmadığını yoxla
    if (!bundle.isActive) {
      errors.push('Bundle is not active / Paket aktiv deyil');
    }

    // Check if bundle has items / Paketdə elementlərin olub-olmadığını yoxla
    if (bundle.items.length === 0) {
      errors.push('Bundle has no items / Paketdə element yoxdur');
    }

    // Check required items stock / Tələb olunan elementlərin stokunu yoxla
    for (const item of bundle.items) {
      if (item.isRequired) {
        if (item.product.stock < item.quantity) {
          errors.push(
            `Product ${item.product.name} has insufficient stock / Məhsul ${item.product.name} kifayət qədər stoka malik deyil`
          );
        }
        if (!item.product.isActive) {
          errors.push(
            `Product ${item.product.name} is not active / Məhsul ${item.product.name} aktiv deyil`
          );
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  } catch (error) {
    logger.error('Failed to validate bundle / Paketi yoxlamaq uğursuz oldu', error);
    return {
      isValid: false,
      errors: ['Validation failed / Yoxlama uğursuz oldu'],
    };
  }
}

/**
 * Get bundles for a product / Məhsul üçün paketləri al
 */
export async function getBundlesForProduct(productId: string) {
  try {
    const bundles = await (db as any).productBundle.findMany({
      where: {
        isActive: true,
        items: {
          some: {
            productId,
          },
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
                stock: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
        seller: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return bundles;
  } catch (error) {
    logger.error('Failed to get bundles for product / Məhsul üçün paketləri almaq uğursuz oldu', error);
    throw error;
  }
}

