/**
 * Newsletter Unsubscription API Route / Newsletter Abunəni Ləğv Etmə API Route-u
 * Handles newsletter unsubscriptions
 * Newsletter abunəliklərinin ləğv edilməsini idarə edir
 */

import { NextRequest, NextResponse } from "next/server";
import { unsubscribeFromNewsletter } from "@/lib/marketing/email-marketing";
import { successResponse, badRequestResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";

/**
 * POST /api/marketing/newsletter/unsubscribe - Unsubscribe from newsletter / Newsletter-dən abunəni ləğv et
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return badRequestResponse("Valid email is required / Etibarlı email tələb olunur");
    }

    const result = await unsubscribeFromNewsletter(email);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to unsubscribe / Abunəni ləğv etmək uğursuz oldu",
        },
        { status: 500 }
      );
    }

    return successResponse({ success: true }, "Unsubscribed successfully / Uğurla abunə ləğv edildi");
  } catch (error) {
    return handleApiError(error, "unsubscribe from newsletter");
  }
}

