/**
 * Real-Time Updates API Route / Real-Time Yeniləmələr API Route
 * Provides Server-Sent Events (SSE) for real-time updates
 * Real-time yeniləmələr üçün Server-Sent Events (SSE) təmin edir
 */

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { createSSEResponse } from "@/lib/realtime/sse";
import { logger } from "@/lib/utils/logger";
import { handleApiError } from "@/lib/api/error-handler";

export async function GET(request: NextRequest) {
  try {
    // Authenticate user / İstifadəçini autentifikasiya et
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) {
      return authResult;
    }

    const { user } = authResult;

    // Create SSE response / SSE cavabı yarat
    logger.info('SSE connection established / SSE bağlantısı quruldu', { userId: user.id });
    return createSSEResponse(user.id);
  } catch (error) {
    return handleApiError(error, "establish SSE connection");
  }
}

