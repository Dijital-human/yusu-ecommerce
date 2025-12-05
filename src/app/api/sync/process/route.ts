/**
 * Sync Process API Route / Sinxronizasiya Prosesi API Route-u
 * Processes sync queue items (called by background sync)
 * Sinxronizasiya növbəsi elementlərini işləyir (background sync tərəfindən çağırılır)
 */

import { NextRequest, NextResponse } from "next/server";
import { processSyncQueue } from "@/lib/pwa/background-sync";
import { handleApiError } from "@/lib/api/error-handler";
import { successResponse } from "@/lib/api/response";
import { logger } from "@/lib/utils/logger";

/**
 * POST /api/sync/process - Process sync queue / Sinxronizasiya növbəsini işlə
 */
export async function POST(request: NextRequest) {
  try {
    logger.info('Sync queue processing requested / Sinxronizasiya növbəsi işləməsi tələb olundu');
    
    await processSyncQueue();
    
    return successResponse({
      message: 'Sync queue processed / Sinxronizasiya növbəsi işləndi',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error, "process sync queue");
  }
}

