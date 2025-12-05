/**
 * One-Click Checkout API Route / Bir Klik Ödəniş API Route-u
 * Handles one-click checkout operations
 * Bir klik ödəniş əməliyyatlarını idarə edir
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse, badRequestResponse, handleApiError } from "@/lib/api/response";
import {
  createOneClickCheckout,
  checkOneClickEligibility,
} from "@/services/one-click-checkout.service";

/**
 * POST /api/checkout/one-click - Create one-click checkout order / Bir klik ödəniş sifarişi yarat
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;
    const body = await request.json();
    const { productId, quantity, addressId, paymentMethodId } = body;

    // Validate required fields / Tələb olunan sahələri yoxla
    if (!productId || !quantity) {
      return badRequestResponse("Product ID and quantity are required / Məhsul ID-si və miqdar tələb olunur");
    }

    if (quantity <= 0) {
      return badRequestResponse("Quantity must be greater than 0 / Miqdar 0-dan böyük olmalıdır");
    }

    // Check eligibility / Uyğunluğu yoxla
    const eligibility = await checkOneClickEligibility(user.id);
    if (!eligibility.eligible) {
      return NextResponse.json(
        {
          success: false,
          error: "Not eligible for one-click checkout / Bir klik ödəniş üçün uyğun deyil",
          reasons: eligibility.reasons,
        },
        { status: 400 }
      );
    }

    const order = await createOneClickCheckout({
      userId: user.id,
      productId,
      quantity,
      addressId,
      paymentMethodId,
    });

    return successResponse(order, "One-click checkout order created successfully / Bir klik ödəniş sifarişi uğurla yaradıldı");
  } catch (error) {
    return handleApiError(error, "create one-click checkout order");
  }
}

/**
 * GET /api/checkout/one-click/eligibility - Check one-click checkout eligibility / Bir klik ödəniş uyğunluğunu yoxla
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;

    const eligibility = await checkOneClickEligibility(user.id);
    return successResponse(eligibility);
  } catch (error) {
    return handleApiError(error, "check one-click checkout eligibility");
  }
}

