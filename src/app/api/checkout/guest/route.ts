/**
 * Guest Checkout API Route / Qonaq Ödəniş API Route-u
 * Handles guest checkout operations
 * Qonaq ödəniş əməliyyatlarını idarə edir
 */

import { NextRequest, NextResponse } from "next/server";
import { createGuestOrder, trackGuestOrder, getGuestOrdersByEmail } from "@/services/checkout.service";
import { successResponse, badRequestResponse, handleApiError } from "@/lib/api/response";
import { logger } from "@/lib/utils/logger";

/**
 * POST /api/checkout/guest - Create guest order / Qonaq sifarişi yarat
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, shippingAddress, items, paymentMethod, notes } = body;

    // Validate required fields / Tələb olunan sahələri yoxla
    if (!email || !shippingAddress || !items || !paymentMethod) {
      return badRequestResponse("Missing required fields / Tələb olunan sahələr çatışmır");
    }

    if (!Array.isArray(items) || items.length === 0) {
      return badRequestResponse("Items must be a non-empty array / Elementlər boş olmayan array olmalıdır");
    }

    const result = await createGuestOrder({
      email,
      shippingAddress,
      items,
      paymentMethod,
      notes,
    });

    return successResponse(result, "Guest order created successfully / Qonaq sifarişi uğurla yaradıldı");
  } catch (error) {
    return handleApiError(error, "create guest order");
  }
}

/**
 * GET /api/checkout/guest/track - Track guest order / Qonaq sifarişini izlə
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const trackingToken = searchParams.get("token");

    if (!email) {
      return badRequestResponse("Email is required / Email tələb olunur");
    }

    if (trackingToken) {
      // Track by token / Token ilə izlə
      const orders = await trackGuestOrder(email, trackingToken);
      return successResponse(orders);
    } else {
      // Get orders by email / Email ilə sifarişləri al
      const orders = await getGuestOrdersByEmail(email);
      return successResponse(orders);
    }
  } catch (error) {
    return handleApiError(error, "track guest order");
  }
}

