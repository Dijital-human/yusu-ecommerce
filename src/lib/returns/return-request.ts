/**
 * Return Request Service / Qaytarma Sorğusu Xidməti
 * Database operations for return requests / Qaytarma sorğuları üçün veritabanı əməliyyatları
 */

import { getReadClient, getWriteClient } from '@/lib/db/query-client';
import { logger } from '@/lib/utils/logger';

export interface CreateReturnRequestData {
  orderId: string;
  orderItemId?: string;
  userId: string;
  reason: string;
  description?: string;
  quantity: number;
  refundMethod: string;
  damagePhotos?: string[];
}

export interface UpdateReturnRequestData {
  status?: string;
  returnLabelUrl?: string;
  trackingNumber?: string;
  refundAmount?: number;
  refundId?: string;
  approvedBy?: string;
  approvedAt?: Date;
  rejectedReason?: string;
  receivedAt?: Date;
  refundedAt?: Date;
}

/**
 * Get return requests for user / İstifadəçi üçün qaytarma sorğularını al
 */
export async function getUserReturnRequests(userId: string) {
  try {
    const readClient = await getReadClient();
    return await (readClient as any).returnRequest.findMany({
      where: { userId },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
        orderItem: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    logger.error('Failed to get user return requests / İstifadəçi qaytarma sorğularını almaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Get return request by ID / ID-yə görə qaytarma sorğusunu al
 */
export async function getReturnRequestById(returnRequestId: string, userId?: string) {
  try {
    const readClient = await getReadClient();
    const where: any = { id: returnRequestId };
    if (userId) {
      where.userId = userId;
    }

    return await (readClient as any).returnRequest.findFirst({
      where,
      include: {
        order: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
        orderItem: {
          include: {
            product: true,
          },
        },
      },
    });
  } catch (error) {
    logger.error('Failed to get return request / Qaytarma sorğusunu almaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Create return request / Qaytarma sorğusu yarat
 */
export async function createReturnRequest(data: CreateReturnRequestData) {
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

    return await (writeClient as any).returnRequest.create({
      data: {
        ...data,
        status: 'PENDING',
      },
      include: {
        order: true,
        orderItem: true,
      },
    });
  } catch (error) {
    logger.error('Failed to create return request / Qaytarma sorğusu yaratmaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Update return request / Qaytarma sorğusunu yenilə
 */
export async function updateReturnRequest(
  returnRequestId: string,
  data: UpdateReturnRequestData,
  userId?: string
) {
  try {
    const writeClient = await getWriteClient();
    
    // Verify ownership or admin access / Mülkiyyəti və ya admin girişini yoxla
    const returnRequest = await getReturnRequestById(returnRequestId, userId);
    if (!returnRequest) {
      throw new Error('Return request not found / Qaytarma sorğusu tapılmadı');
    }

    return await (writeClient as any).returnRequest.update({
      where: { id: returnRequestId },
      data,
      include: {
        order: true,
        orderItem: true,
      },
    });
  } catch (error) {
    logger.error('Failed to update return request / Qaytarma sorğusunu yeniləmək uğursuz oldu', error);
    throw error;
  }
}

/**
 * Approve return request / Qaytarma sorğusunu təsdiqlə
 */
export async function approveReturnRequest(returnRequestId: string, approvedBy: string) {
  try {
    const writeClient = await getWriteClient();
    
    const returnRequest = await (writeClient as any).returnRequest.findUnique({
      where: { id: returnRequestId },
      include: { order: true },
    });

    if (!returnRequest) {
      throw new Error('Return request not found / Qaytarma sorğusu tapılmadı');
    }

    // Calculate refund amount / Geri qaytarma məbləğini hesabla
    const refundAmount = returnRequest.orderItemId
      ? returnRequest.orderItem.price * returnRequest.quantity
      : returnRequest.order.totalAmount;

    return await (writeClient as any).returnRequest.update({
      where: { id: returnRequestId },
      data: {
        status: 'APPROVED',
        approvedBy,
        approvedAt: new Date(),
        refundAmount,
      },
    });
  } catch (error) {
    logger.error('Failed to approve return request / Qaytarma sorğusunu təsdiqləmək uğursuz oldu', error);
    throw error;
  }
}

/**
 * Reject return request / Qaytarma sorğusunu rədd et
 */
export async function rejectReturnRequest(returnRequestId: string, rejectedReason: string, approvedBy: string) {
  try {
    const writeClient = await getWriteClient();
    
    return await (writeClient as any).returnRequest.update({
      where: { id: returnRequestId },
      data: {
        status: 'REJECTED',
        rejectedReason,
        approvedBy,
        approvedAt: new Date(),
      },
    });
  } catch (error) {
    logger.error('Failed to reject return request / Qaytarma sorğusunu rədd etmək uğursuz oldu', error);
    throw error;
  }
}

/**
 * Mark return as received / Qaytarmanı alındı kimi işarələ
 */
export async function markReturnAsReceived(returnRequestId: string) {
  try {
    const writeClient = await getWriteClient();
    
    return await (writeClient as any).returnRequest.update({
      where: { id: returnRequestId },
      data: {
        status: 'RECEIVED',
        receivedAt: new Date(),
      },
    });
  } catch (error) {
    logger.error('Failed to mark return as received / Qaytarmanı alındı kimi işarələmək uğursuz oldu', error);
    throw error;
  }
}

