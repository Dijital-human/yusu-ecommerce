/**
 * Payment Methods API Route / Ödəniş Metodları API Route
 * Handle saved payment methods CRUD operations / Saxlanılmış ödəniş metodları CRUD əməliyyatlarını idarə et
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/middleware';
import { successResponse, badRequestResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/error-handler';
import {
  getUserPaymentMethods,
  createPaymentMethod,
  CreatePaymentMethodData,
} from '@/lib/db/payment-methods';
import { createStripePaymentMethod } from '@/lib/payments/saved-methods';

/**
 * GET /api/payments/methods
 * Get user payment methods / İstifadəçi ödəniş metodlarını al
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const paymentMethods = await getUserPaymentMethods(user.id);

    return successResponse(paymentMethods);
  } catch (error) {
    return handleApiError(error, 'get payment methods');
  }
}

/**
 * POST /api/payments/methods
 * Create new payment method / Yeni ödəniş metodu yarat
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
    if (!body.type) {
      return badRequestResponse('Payment method type is required / Ödəniş metodu tipi tələb olunur');
    }

    // If Stripe payment method ID is provided, use Stripe integration
    // Əgər Stripe ödəniş metodu ID-si verilibsə, Stripe inteqrasiyasından istifadə et
    if (body.stripePaymentMethodId) {
      const result = await createStripePaymentMethod(user.id, body.stripePaymentMethodId, true);
      
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 400 }
        );
      }

      return successResponse(result.paymentMethod);
    }

    // Otherwise, create payment method directly / Əks halda, ödəniş metodunu birbaşa yarat
    const paymentMethodData: CreatePaymentMethodData = {
      userId: user.id,
      type: body.type,
      last4: body.last4,
      brand: body.brand,
      expiryMonth: body.expiryMonth,
      expiryYear: body.expiryYear,
      isDefault: body.isDefault || false,
      stripePaymentMethodId: body.stripePaymentMethodId,
    };

    const paymentMethod = await createPaymentMethod(paymentMethodData);

    return successResponse(paymentMethod);
  } catch (error) {
    return handleApiError(error, 'create payment method');
  }
}

