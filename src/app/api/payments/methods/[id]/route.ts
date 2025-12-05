/**
 * Payment Method API Route (by ID) / Ödəniş Metodu API Route (ID-yə görə)
 * Handle payment method update and delete operations / Ödəniş metodu yeniləmə və silmə əməliyyatlarını idarə et
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/middleware';
import { successResponse, notFoundResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/error-handler';
import {
  updatePaymentMethod,
  deletePaymentMethod,
  UpdatePaymentMethodData,
} from '@/lib/db/payment-methods';
import { detachStripePaymentMethod } from '@/lib/payments/saved-methods';

/**
 * PUT /api/payments/methods/[id]
 * Update payment method / Ödəniş metodunu yenilə
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const { id: paymentMethodId } = await params;
    const body = await request.json();

    const updateData: UpdatePaymentMethodData = {
      last4: body.last4,
      brand: body.brand,
      expiryMonth: body.expiryMonth,
      expiryYear: body.expiryYear,
      isDefault: body.isDefault,
    };

    const paymentMethod = await updatePaymentMethod(paymentMethodId, user.id, updateData);

    if (!paymentMethod) {
      return notFoundResponse('Payment method');
    }

    return successResponse(paymentMethod);
  } catch (error) {
    return handleApiError(error, 'update payment method');
  }
}

/**
 * DELETE /api/payments/methods/[id]
 * Delete payment method / Ödəniş metodunu sil
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const { id: paymentMethodId } = await params;

    // Get payment method to check if it has Stripe ID / Stripe ID-si olub-olmadığını yoxlamaq üçün ödəniş metodunu al
    const { getPaymentMethodById } = await import('@/lib/db/payment-methods');
    const paymentMethod = await getPaymentMethodById(paymentMethodId, user.id);

    if (!paymentMethod) {
      return notFoundResponse('Payment method');
    }

    // If it's a Stripe payment method, detach it first / Əgər Stripe ödəniş metodudursa, əvvəlcə onu ayır
    if (paymentMethod.stripePaymentMethodId) {
      await detachStripePaymentMethod(paymentMethod.stripePaymentMethodId, user.id);
    } else {
      // Otherwise, just delete from database / Əks halda, yalnız veritabanından sil
      await deletePaymentMethod(paymentMethodId, user.id);
    }

    return successResponse({ success: true });
  } catch (error) {
    return handleApiError(error, 'delete payment method');
  }
}

