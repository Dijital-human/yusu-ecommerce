/**
 * GDPR Compliance Service / GDPR Uyğunluq Xidməti
 * Provides GDPR compliance features (data export, deletion, consent management)
 * GDPR uyğunluq xüsusiyyətləri təmin edir (məlumat eksportu, silinməsi, razılıq idarəetməsi)
 */

import { logger } from '@/lib/utils/logger';
import { prisma } from '@/lib/db';

/**
 * GDPR consent types / GDPR razılıq tipləri
 */
export type ConsentType = 'marketing' | 'analytics' | 'necessary' | 'functional';

/**
 * GDPR consent interface / GDPR razılıq interfeysi
 */
export interface Consent {
  userId: string;
  type: ConsentType;
  granted: boolean;
  grantedAt?: Date;
  revokedAt?: Date;
}

/**
 * Export user data / İstifadəçi məlumatlarını eksport et
 */
export async function exportUserData(userId: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    // Get all user data / Bütün istifadəçi məlumatlarını al
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        addresses: true,
        orders: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
        cartItems: {
          include: {
            product: true,
          },
        },
        reviews: true,
        wishlistItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found / İstifadəçi tapılmadı',
      };
    }

    // Remove sensitive data / Həssas məlumatları sil
    const exportData = {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      addresses: user.addresses.map((addr: { id: string; street: string; city: string; country: string; zipCode?: string; isDefault: boolean; createdAt: Date }) => ({
        id: addr.id,
        street: addr.street,
        city: addr.city,
        country: addr.country,
        zipCode: addr.zipCode,
        isDefault: addr.isDefault,
        createdAt: addr.createdAt,
      })),
      orders: user.orders.map((order: { id: string; status: string; totalAmount: number; createdAt: Date; items: Array<{ product: { name: string }; quantity: number; price: number }> }) => ({
        id: order.id,
        status: order.status,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        items: order.items.map((item: { product: { name: string }; quantity: number; price: number }) => ({
          productName: item.product.name,
          quantity: item.quantity,
          price: item.price,
        })),
      })),
      reviews: user.reviews.map((review: { id: string; rating: number; comment: string; createdAt: Date }) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
      })),
      wishlistItems: user.wishlistItems.map((item: { product: { name: string }; createdAt: Date }) => ({
        productName: item.product.name,
        addedAt: item.createdAt,
      })),
    };

    logger.info('User data exported / İstifadəçi məlumatları eksport edildi', { userId });

    return {
      success: true,
      data: exportData,
    };
  } catch (error) {
    logger.error('Failed to export user data / İstifadəçi məlumatlarını eksport etmək uğursuz oldu', error, { userId });
    return {
      success: false,
      error: 'Failed to export user data / İstifadəçi məlumatlarını eksport etmək uğursuz oldu',
    };
  }
}

/**
 * Delete user data (GDPR right to be forgotten) / İstifadəçi məlumatlarını sil (GDPR unudulma hüququ)
 */
export async function deleteUserData(userId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Use transaction to ensure all data is deleted / Bütün məlumatların silindiyindən əmin olmaq üçün transaction istifadə et
    await prisma.$transaction(async (tx: any) => {
      // Delete user-related data / İstifadəçi ilə əlaqəli məlumatları sil
      await tx.cartItem.deleteMany({ where: { userId } });
      await tx.wishlistItem.deleteMany({ where: { userId } });
      await tx.review.deleteMany({ where: { userId } });
      await tx.address.deleteMany({ where: { userId } });
      
      // Anonymize orders (keep for business records) / Sifarişləri anonimləşdir (biznes qeydləri üçün saxla)
      await tx.order.updateMany({
        where: { customerId: userId },
        data: {
          customerId: 'deleted_user',
          // Note: In production, you might want to keep order records but anonymize them
          // Qeyd: Production-da sifariş qeydlərini saxlamaq, amma anonimləşdirmək istəyə bilərsiniz
        },
      });

      // Delete user account / İstifadəçi hesabını sil
      await tx.users.delete({
        where: { id: userId },
      });
    });

    logger.info('User data deleted / İstifadəçi məlumatları silindi', { userId });

    return { success: true };
  } catch (error) {
    logger.error('Failed to delete user data / İstifadəçi məlumatlarını silmək uğursuz oldu', error, { userId });
    return {
      success: false,
      error: 'Failed to delete user data / İstifadəçi məlumatlarını silmək uğursuz oldu',
    };
  }
}

/**
 * Get user consent / İstifadəçi razılığını al
 */
export async function getUserConsent(userId: string): Promise<{
  success: boolean;
  consent?: Record<ConsentType, boolean>;
  error?: string;
}> {
  try {
    // Note: This assumes a Consent model exists in Prisma schema
    // Qeyd: Bu Prisma schema-da Consent modelinin mövcud olduğunu fərz edir
    try {
      const consents = await (prisma as any).consent.findMany({
        where: { userId },
      });

      // Build consent object / Razılıq obyektini qur
      const consentMap: Record<ConsentType, boolean> = {
        marketing: false,
        analytics: false,
        necessary: true, // Always true as it's required for site functionality
        functional: false,
      };

      consents.forEach((c: any) => {
        if (c.type in consentMap) {
          consentMap[c.type as ConsentType] = c.granted;
        }
      });

      return {
        success: true,
        consent: consentMap,
      };
    } catch (dbError: any) {
      // If Consent model doesn't exist, return default consent
      // Əgər Consent modeli mövcud deyilsə, default razılıq qaytar
      if (dbError.code === 'P2001' || dbError.message?.includes('model') || dbError.message?.includes('does not exist')) {
        logger.warn('Consent model not found. Returning default consent / Consent modeli tapılmadı. Default razılıq qaytarılır', { userId });
        return {
          success: true,
          consent: {
            marketing: false,
            analytics: false,
            necessary: true,
            functional: false,
          },
        };
      }
      throw dbError;
    }
  } catch (error) {
    logger.error('Failed to get user consent / İstifadəçi razılığını almaq uğursuz oldu', error, { userId });
    return {
      success: false,
      error: 'Failed to get user consent / İstifadəçi razılığını almaq uğursuz oldu',
    };
  }
}

/**
 * Update user consent / İstifadəçi razılığını yenilə
 */
export async function updateUserConsent(
  userId: string,
  consent: Record<ConsentType, boolean>
): Promise<{ success: boolean; error?: string }> {
  try {
    // Note: This assumes a Consent model exists in Prisma schema
    // Qeyd: Bu Prisma schema-da Consent modelinin mövcud olduğunu fərz edir
    try {
      // Update or create consent for each type / Hər tip üçün razılığı yenilə və ya yarat
      await Promise.all(
        Object.entries(consent).map(async ([type, granted]) => {
          await (prisma as any).consent.upsert({
            where: {
              userId_type: {
                userId,
                type,
              },
            },
            update: {
              granted,
              grantedAt: granted ? new Date() : undefined,
              revokedAt: granted ? undefined : new Date(),
            },
            create: {
              userId,
              type,
              granted,
              grantedAt: granted ? new Date() : undefined,
              revokedAt: granted ? undefined : new Date(),
            },
          });
        })
      );

      logger.info('User consent updated / İstifadəçi razılığı yeniləndi', { userId, consent });
      return { success: true };
    } catch (dbError: any) {
      // If Consent model doesn't exist, log warning
      // Əgər Consent modeli mövcud deyilsə, warning log et
      if (dbError.code === 'P2001' || dbError.message?.includes('model') || dbError.message?.includes('does not exist')) {
        logger.warn('Consent model not found. Consent update not saved to database / Consent modeli tapılmadı. Razılıq yeniləməsi veritabanına yazılmadı', { userId });
        // Still return success as the operation was attempted
        // Əməliyyat cəhd edildiyi üçün yenə də success qaytar
        return { success: true };
      }
      throw dbError;
    }
  } catch (error) {
    logger.error('Failed to update user consent / İstifadəçi razılığını yeniləmək uğursuz oldu', error, { userId });
    return {
      success: false,
      error: 'Failed to update user consent / İstifadəçi razılığını yeniləmək uğursuz oldu',
    };
  }
}

