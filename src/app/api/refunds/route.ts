/**
 * Refunds API Route / Geri Qaytarmalar API Route
 * Handle refund operations / Geri qaytarma əməliyyatlarını idarə et
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/middleware';
import { successResponse, badRequestResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/error-handler';
import {
  getUserRefunds,
  createRefund,
  processPartialRefund,
  CreateRefundData,
} from '@/lib/payments/refunds';

/**
 * GET /api/refunds
 * Get user refunds / İstifadəçi geri qaytarmalarını al
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const refunds = await getUserRefunds(user.id);

    return successResponse(refunds);
  } catch (error) {
    return handleApiError(error, 'get refunds');
  }
}

/**
 * POST /api/refunds
 * Create refund / Geri qaytarma yarat
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const body = await request.json();

    // Validate required fields / Tələb olunan sahələri yoxla
    if (!body.orderId || !body.amount || !body.refundMethod) {
      return badRequestResponse('Missing required fields / Tələb olunan sahələr çatışmır');
    }

    // Check if partial refund / Qismən geri qaytarma olub-olmadığını yoxla
    if (body.isPartial && body.paymentIntentId) {
      const refund = await processPartialRefund(
        body.orderId,
        body.amount,
        user.id,
        body.paymentIntentId
      );
      return successResponse(refund);
    }

    const refundData: CreateRefundData = {
      orderId: body.orderId,
      returnRequestId: body.returnRequestId,
      userId: user.id,
      amount: body.amount,
      refundMethod: body.refundMethod,
      paymentMethod: body.paymentMethod,
      paymentIntentId: body.paymentIntentId,
    };

    const refund = await createRefund(refundData);

    return successResponse(refund);
  } catch (error) {
    return handleApiError(error, 'create refund');
  }
}

