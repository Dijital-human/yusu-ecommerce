/**
 * Refund Service / Geri Qaytarma Xidməti
 * Refund processing with Stripe integration / Stripe inteqrasiyası ilə geri qaytarma emalı
 */

import { getReadClient, getWriteClient } from '@/lib/db/query-client';
import { logger } from '@/lib/utils/logger';
import { refundPayment } from '@/lib/payments/payment-provider';

export interface CreateRefundData {
  orderId: string;
  returnRequestId?: string;
  userId: string;
  amount: number;
  refundMethod: string; // original_payment, store_credit
  paymentMethod?: string;
  paymentIntentId?: string;
}

/**
 * Create refund / Geri qaytarma yarat
 */
export async function createRefund(data: CreateRefundData) {
  try {
    const writeClient = await getWriteClient();
    
    // Verify order belongs to user / Sifarişin istifadəçiyə aid olduğunu yoxla
    const order = await (writeClient as any).order.findFirst({
      where: {
        id: data.orderId,
        customerId: data.userId,
      },
    });

    if (!order) {
      throw new Error('Order not found or unauthorized / Sifariş tapılmadı və ya yetkisiz');
    }

    // Process refund based on method / Metoda əsasən geri qaytarmanı emal et
    let refundTransactionId: string | undefined;
    let status = 'PENDING';

    if (data.refundMethod === 'original_payment' && data.paymentIntentId) {
      // Process refund through payment provider / Ödəniş provayderi vasitəsilə geri qaytarmanı emal et
      const paymentMethod = data.paymentMethod || 'stripe';
      const result = await refundPayment(data.paymentIntentId, paymentMethod as any, data.amount);

      if (result.success) {
        refundTransactionId = result.paymentId;
        status = 'COMPLETED';
      } else {
        status = 'FAILED';
        throw new Error(result.error || 'Refund failed / Geri qaytarma uğursuz oldu');
      }
    } else if (data.refundMethod === 'store_credit') {
      // TODO: Add store credit to user account / İstifadəçi hesabına mağaza krediti əlavə et
      status = 'COMPLETED';
    }

    // Create refund record / Geri qaytarma qeydi yarat
    const refund = await (writeClient as any).refund.create({
      data: {
        ...data,
        status,
        refundTransactionId,
        processedAt: status === 'COMPLETED' ? new Date() : undefined,
      },
      include: {
        order: true,
        returnRequest: true,
      },
    });

    // Update return request if exists / Əgər varsa qaytarma sorğusunu yenilə
    if (data.returnRequestId) {
      await (writeClient as any).returnRequest.update({
        where: { id: data.returnRequestId },
        data: {
          status: 'REFUNDED',
          refundId: refund.id,
          refundedAt: new Date(),
        },
      });
    }

    return refund;
  } catch (error) {
    logger.error('Failed to create refund / Geri qaytarma yaratmaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Get refunds for user / İstifadəçi üçün geri qaytarmaları al
 */
export async function getUserRefunds(userId: string) {
  try {
    const readClient = await getReadClient();
    return await (readClient as any).refund.findMany({
      where: { userId },
      include: {
        order: true,
        returnRequest: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    logger.error('Failed to get user refunds / İstifadəçi geri qaytarmalarını almaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Get refund by ID / ID-yə görə geri qaytarmanı al
 */
export async function getRefundById(refundId: string, userId?: string) {
  try {
    const readClient = await getReadClient();
    const where: any = { id: refundId };
    if (userId) {
      where.userId = userId;
    }

    return await (readClient as any).refund.findFirst({
      where,
      include: {
        order: true,
        returnRequest: true,
      },
    });
  } catch (error) {
    logger.error('Failed to get refund / Geri qaytarmanı almaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Process partial refund / Qismən geri qaytarmanı emal et
 */
export async function processPartialRefund(
  orderId: string,
  amount: number,
  userId: string,
  paymentIntentId?: string
) {
  try {
    if (!paymentIntentId) {
      throw new Error('Payment intent ID is required for partial refund / Qismən geri qaytarma üçün ödəniş niyyəti ID tələb olunur');
    }

    return await createRefund({
      orderId,
      userId,
      amount,
      refundMethod: 'original_payment',
      paymentIntentId,
    });
  } catch (error) {
    logger.error('Failed to process partial refund / Qismən geri qaytarmanı emal etmək uğursuz oldu', error);
    throw error;
  }
}

