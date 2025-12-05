/**
 * Coupon Validation API Route / Kupon Doğrulama API Route-u
 * Validates coupon codes
 * Kupon kodlarını doğrulayır
 */

import { NextRequest, NextResponse } from "next/server";
import { validateCouponCode } from "@/lib/marketing/promotions";
import { successResponse, badRequestResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";

/**
 * POST /api/marketing/coupons/validate - Validate coupon code / Kupon kodunu doğrula
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, userId, subtotal } = body;

    if (!code) {
      return badRequestResponse("Coupon code is required / Kupon kodu tələb olunur");
    }

    const validation = await validateCouponCode(
      code,
      userId,
      subtotal ? parseFloat(subtotal) : undefined
    );

    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error || "Invalid coupon code / Yanlış kupon kodu",
        },
        { status: 400 }
      );
    }

    return successResponse({
      promotion: validation.promotion,
      discount: validation.promotion ? validation.promotion.discountValue : 0,
    });
  } catch (error) {
    return handleApiError(error, "validate coupon code");
  }
}

