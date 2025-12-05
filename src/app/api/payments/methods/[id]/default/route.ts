/**
 * Set Default Payment Method API Route / Default Ödəniş Metodu Təyin Et API Route
 * Set payment method as default / Ödəniş metodunu default olaraq təyin et
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/middleware';
import { successResponse, notFoundResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/error-handler';
import { setDefaultPaymentMethod } from '@/lib/db/payment-methods';

/**
 * PUT /api/payments/methods/[id]/default
 * Set payment method as default / Ödəniş metodunu default olaraq təyin et
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

    const paymentMethod = await setDefaultPaymentMethod(paymentMethodId, user.id);

    if (!paymentMethod) {
      return notFoundResponse('Payment method');
    }

    return successResponse(paymentMethod);
  } catch (error) {
    return handleApiError(error, 'set default payment method');
  }
}

