/**
 * Analytics Events API Route / Analytics Hadisələri API Route-u
 * Handles analytics event tracking
 * Analytics hadisə izləməsini idarə edir
 */

import { NextRequest, NextResponse } from "next/server";
import { trackEvent, trackPageView, trackProductView, trackAddToCart, trackPurchase, trackSearch } from "@/lib/analytics/analytics";
import { successResponse, badRequestResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";

/**
 * POST /api/analytics/events - Track analytics event / Analytics hadisəsini izlə
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    const body = await request.json();
    const { type, properties, sessionId } = body;

    if (!type) {
      return badRequestResponse("Event type is required / Hadisə tipi tələb olunur");
    }

    // Track event based on type / Tipə görə hadisəni izlə
    switch (type) {
      case 'page_view':
        if (properties?.path) {
          trackPageView(properties.path, userId, sessionId);
        }
        break;
      
      case 'product_view':
        if (properties?.productId) {
          trackProductView(properties.productId, userId, sessionId);
        }
        break;
      
      case 'add_to_cart':
        if (properties?.productId && properties?.quantity && properties?.price) {
          trackAddToCart(
            properties.productId,
            properties.quantity,
            properties.price,
            userId,
            sessionId
          );
        }
        break;
      
      case 'purchase':
        if (properties?.orderId && properties?.totalAmount && properties?.items) {
          trackPurchase(
            properties.orderId,
            properties.totalAmount,
            properties.items,
            userId,
            sessionId
          );
        }
        break;
      
      case 'search':
        if (properties?.query !== undefined) {
          trackSearch(
            properties.query,
            properties.resultCount || 0,
            userId,
            sessionId
          );
        }
        break;
      
      default:
        // Generic event tracking / Ümumi hadisə izləmə
        trackEvent({
          type: type as any,
          userId,
          sessionId,
          properties,
        });
    }

    return successResponse({ success: true }, "Event tracked successfully / Hadisə uğurla izləndi");
  } catch (error) {
    return handleApiError(error, "track analytics event");
  }
}

