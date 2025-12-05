/**
 * Shipping Tracking API Route / Çatdırılma İzləmə API Route-u
 * Handles shipping tracking requests
 * Çatdırılma izləmə sorğularını idarə edir
 */

import { NextRequest, NextResponse } from "next/server";
import { trackShipment } from "@/lib/shipping/shipping-provider";
import { successResponse, badRequestResponse, notFoundResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import type { ShippingCarrier } from "@/lib/shipping/shipping-provider";

/**
 * GET /api/shipping/track - Track shipment / Göndərməni izlə
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingNumber = searchParams.get("trackingNumber");
    const carrier = searchParams.get("carrier") as ShippingCarrier | null;

    if (!trackingNumber) {
      return badRequestResponse("Tracking number is required / İzləmə nömrəsi tələb olunur");
    }

    // Default to local carrier if not specified / Əgər göstərilməyibsə default olaraq lokal daşıyıcı
    const shippingCarrier: ShippingCarrier = carrier || "local";

    try {
      const trackingInfo = await trackShipment(shippingCarrier, trackingNumber);
      return successResponse(trackingInfo);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return notFoundResponse("Tracking information");
      }
      throw error;
    }
  } catch (error) {
    return handleApiError(error, "track shipment");
  }
}

