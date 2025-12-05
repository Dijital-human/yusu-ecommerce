/**
 * Newsletter Subscription API Route / Newsletter Abunəliyi API Route-u
 * Handles newsletter subscriptions
 * Newsletter abunəliklərini idarə edir
 */

import { NextRequest, NextResponse } from "next/server";
import { subscribeToNewsletter } from "@/lib/marketing/email-marketing";
import { successResponse, badRequestResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";

/**
 * POST /api/marketing/newsletter/subscribe - Subscribe to newsletter / Newsletter-ə abunə ol
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, preferences } = body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return badRequestResponse("Valid email is required / Etibarlı email tələb olunur");
    }

    const result = await subscribeToNewsletter(email, preferences);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to subscribe / Abunə olmaq uğursuz oldu",
        },
        { status: 500 }
      );
    }

    return successResponse({ success: true }, "Subscribed successfully / Uğurla abunə olundu");
  } catch (error) {
    return handleApiError(error, "subscribe to newsletter");
  }
}

