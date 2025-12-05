/**
 * Backup Schedule API Route / Backup Planlaşdırma API Route-u
 * Handles scheduled backup execution (called by Vercel Cron Jobs)
 * Planlaşdırılmış backup icrasını idarə edir (Vercel Cron Jobs tərəfindən çağırılır)
 */

import { NextRequest, NextResponse } from "next/server";
import { executeScheduledBackup, getBackupSchedules } from "@/scripts/backup/backup-scheduler";
import { handleApiError } from "@/lib/api/error-handler";
import { successResponse, badRequestResponse } from "@/lib/api/response";
import { logger } from "@/lib/utils/logger";

/**
 * POST /api/backup/schedule - Execute scheduled backup / Planlaşdırılmış backup-i yerinə yetir
 * 
 * Query parameters:
 * - type: 'daily' | 'weekly' | 'monthly'
 * 
 * Headers:
 * - Authorization: Cron secret (for Vercel Cron Jobs)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret / Cron secret-i yoxla
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized / Yetkisiz' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'daily' | 'weekly' | 'monthly';

    if (!type || !['daily', 'weekly', 'monthly'].includes(type)) {
      return badRequestResponse('Invalid backup type. Valid types: daily, weekly, monthly');
    }

    const databaseUrl = process.env.DATABASE_URL;
    const backupDir = process.env.BACKUP_DIR || '/backups';
    const encryptionKey = process.env.BACKUP_ENCRYPTION_KEY;

    if (!databaseUrl) {
      return badRequestResponse('DATABASE_URL not configured / DATABASE_URL konfiqurasiya edilməyib');
    }

    await executeScheduledBackup(type, {
      outputDir: backupDir,
      databaseUrl,
      compress: true,
      encrypt: !!encryptionKey,
      encryptionKey,
    });

    return successResponse({
      message: `${type} backup completed successfully / ${type} backup uğurla tamamlandı`,
      type,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error, "execute scheduled backup");
  }
}

/**
 * GET /api/backup/schedule - Get backup schedules / Backup planlaşdırmalarını al
 */
export async function GET(request: NextRequest) {
  try {
    const schedules = getBackupSchedules();
    return successResponse(schedules);
  } catch (error) {
    return handleApiError(error, "get backup schedules");
  }
}

