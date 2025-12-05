/**
 * Payment Methods Service / Ödəniş Metodları Xidməti
 * Database operations for saved payment methods / Saxlanılmış ödəniş metodları üçün veritabanı əməliyyatları
 */

import { getReadClient, getWriteClient } from '@/lib/db/query-client';
import { logger } from '@/lib/utils/logger';

export interface CreatePaymentMethodData {
  userId: string;
  type: string;
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault?: boolean;
  stripePaymentMethodId?: string;
}

export interface UpdatePaymentMethodData {
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault?: boolean;
}

/**
 * Get user payment methods / İstifadəçi ödəniş metodlarını al
 */
export async function getUserPaymentMethods(userId: string) {
  try {
    const readClient = await getReadClient();
    return await (readClient as any).savedPaymentMethod.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  } catch (error) {
    logger.error('Failed to get user payment methods / İstifadəçi ödəniş metodlarını almaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Get default payment method / Default ödəniş metodunu al
 */
export async function getDefaultPaymentMethod(userId: string) {
  try {
    const readClient = await getReadClient();
    return await (readClient as any).savedPaymentMethod.findFirst({
      where: {
        userId,
        isDefault: true,
      },
    });
  } catch (error) {
    logger.error('Failed to get default payment method / Default ödəniş metodunu almaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Get payment method by ID / ID-yə görə ödəniş metodunu al
 */
export async function getPaymentMethodById(paymentMethodId: string, userId: string) {
  try {
    const readClient = await getReadClient();
    return await (readClient as any).savedPaymentMethod.findFirst({
      where: {
        id: paymentMethodId,
        userId,
      },
    });
  } catch (error) {
    logger.error('Failed to get payment method / Ödəniş metodunu almaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Create payment method / Ödəniş metodu yarat
 */
export async function createPaymentMethod(data: CreatePaymentMethodData) {
  try {
    const writeClient = await getWriteClient();
    
    // If this is set as default, unset other default payment methods / Əgər bu default olaraq təyin edilibsə, digər default ödəniş metodlarını sıfırla
    if (data.isDefault) {
      await (writeClient as any).savedPaymentMethod.updateMany({
        where: {
          userId: data.userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    return await (writeClient as any).savedPaymentMethod.create({
      data,
    });
  } catch (error) {
    logger.error('Failed to create payment method / Ödəniş metodu yaratmaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Update payment method / Ödəniş metodunu yenilə
 */
export async function updatePaymentMethod(
  paymentMethodId: string,
  userId: string,
  data: UpdatePaymentMethodData
) {
  try {
    const writeClient = await getWriteClient();
    
    // Verify ownership / Mülkiyyəti yoxla
    const paymentMethod = await getPaymentMethodById(paymentMethodId, userId);
    if (!paymentMethod) {
      throw new Error('Payment method not found / Ödəniş metodu tapılmadı');
    }

    // If this is set as default, unset other default payment methods / Əgər bu default olaraq təyin edilibsə, digər default ödəniş metodlarını sıfırla
    if (data.isDefault) {
      await (writeClient as any).savedPaymentMethod.updateMany({
        where: {
          userId,
          isDefault: true,
          id: { not: paymentMethodId },
        },
        data: {
          isDefault: false,
        },
      });
    }

    return await (writeClient as any).savedPaymentMethod.update({
      where: { id: paymentMethodId },
      data,
    });
  } catch (error) {
    logger.error('Failed to update payment method / Ödəniş metodunu yeniləmək uğursuz oldu', error);
    throw error;
  }
}

/**
 * Delete payment method / Ödəniş metodunu sil
 */
export async function deletePaymentMethod(paymentMethodId: string, userId: string) {
  try {
    const writeClient = await getWriteClient();
    
    // Verify ownership / Mülkiyyəti yoxla
    const paymentMethod = await getPaymentMethodById(paymentMethodId, userId);
    if (!paymentMethod) {
      throw new Error('Payment method not found / Ödəniş metodu tapılmadı');
    }

    // If deleting from Stripe, remove it there too / Əgər Stripe-dan silirsə, orada da sil
    if (paymentMethod.stripePaymentMethodId) {
      // TODO: Call Stripe API to detach payment method / Stripe API-ni çağıraraq ödəniş metodunu ayır
    }

    return await (writeClient as any).savedPaymentMethod.delete({
      where: { id: paymentMethodId },
    });
  } catch (error) {
    logger.error('Failed to delete payment method / Ödəniş metodunu silmək uğursuz oldu', error);
    throw error;
  }
}

/**
 * Set default payment method / Default ödəniş metodunu təyin et
 */
export async function setDefaultPaymentMethod(paymentMethodId: string, userId: string) {
  try {
    const writeClient = await getWriteClient();
    
    // Verify ownership / Mülkiyyəti yoxla
    const paymentMethod = await getPaymentMethodById(paymentMethodId, userId);
    if (!paymentMethod) {
      throw new Error('Payment method not found / Ödəniş metodu tapılmadı');
    }

    // Unset other default payment methods / Digər default ödəniş metodlarını sıfırla
    await (writeClient as any).savedPaymentMethod.updateMany({
      where: {
        userId,
        isDefault: true,
        id: { not: paymentMethodId },
      },
      data: {
        isDefault: false,
      },
    });

    // Set this as default / Bunu default olaraq təyin et
    return await (writeClient as any).savedPaymentMethod.update({
      where: { id: paymentMethodId },
      data: { isDefault: true },
    });
  } catch (error) {
    logger.error('Failed to set default payment method / Default ödəniş metodunu təyin etmək uğursuz oldu', error);
    throw error;
  }
}

