/**
 * Coupon Validation API / Kupon Validasiya API
 * Validates coupon codes for checkout
 * Checkout üçün kupon kodlarını yoxlayır
 */

import { NextRequest, NextResponse } from "next/server";
import { validateCouponCode } from "@/lib/marketing/promotion-engine";
import { z } from "zod";

/**
 * Coupon validation request schema / Kupon validasiya sorğusu sxemi
 */
const validateCouponSchema = z.object({
  couponCode: z.string().min(1, "Coupon code is required / Kupon kodu tələb olunur"),
  subtotal: z.number().min(0, "Subtotal must be positive / Subtotal müsbət olmalıdır"),
  items: z.array(z.object({
    productId: z.string(),
    categoryId: z.string().nullable(),
    sellerId: z.string(),
    price: z.number(),
    quantity: z.number().int().positive(),
  })),
  userId: z.string().optional(),
});

/**
 * POST /api/promotions/validate
 * Validates a coupon code.
 * Kupon kodunu yoxlayır.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = validateCouponSchema.parse(body);

    const result = await validateCouponCode(
      validatedData.couponCode,
      validatedData.subtotal,
      validatedData.items,
      validatedData.userId
    );

    if (!result.valid) {
      return NextResponse.json(
        {
          valid: false,
          reason: result.reason,
        },
        { status: 200 } // Return 200 even if invalid, with reason / Etibarsız olsa belə 200 qaytar, səbəb ilə
      );
    }

    return NextResponse.json({
      valid: true,
      promotion: {
        id: result.promotion?.id,
        name: result.promotion?.name,
        type: result.promotion?.type,
        discountValue: result.promotion?.discountValue,
        maxDiscountAmount: result.promotion?.maxDiscountAmount,
      },
      discount: result.discount,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error / Validasiya xətası", details: error.errors },
        { status: 400 }
      );
    }
    console.error("❌ Error validating coupon / Kuponu yoxlamaqda xəta:", error);
    return NextResponse.json(
      { error: "Failed to validate coupon / Kuponu yoxlamaq uğursuz oldu" },
      { status: 500 }
    );
  }
}

