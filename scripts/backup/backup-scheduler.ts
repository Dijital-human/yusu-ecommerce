/**
 * Backup Scheduler / Backup Planlaşdırıcı
 * Schedules automated backups (daily, weekly, monthly)
 * Avtomatik backup-ları planlaşdırır (günlük, həftəlik, aylıq)
 */

import { logger } from '@/lib/utils/logger';
import { createFullBackup, cleanupOldBackups, type BackupOptions } from './database-backup';

// Note: For production, use Vercel Cron Jobs or external scheduler
// Qeyd: Production üçün Vercel Cron Jobs və ya xarici planlaşdırıcı istifadə edin
// This is a simplified scheduler that can be called by cron jobs
// Bu cron job-lar tərəfindən çağırıla bilən sadələşdirilmiş planlaşdırıcıdır

export interface BackupSchedule {
  type: 'daily' | 'weekly' | 'monthly';
  cronExpression: string;
  retentionDays: number;
}

const DEFAULT_SCHEDULES: BackupSchedule[] = [
  {
    type: 'daily',
    cronExpression: '0 2 * * *', // Every day at 2 AM / Hər gün saat 2-də
    retentionDays: 7,
  },
  {
    type: 'weekly',
    cronExpression: '0 3 * * 0', // Every Sunday at 3 AM / Hər bazar günü saat 3-də
    retentionDays: 30,
  },
  {
    type: 'monthly',
    cronExpression: '0 4 1 * *', // First day of month at 4 AM / Hər ayın 1-i saat 4-də
    retentionDays: 365,
  },
];

/**
 * Execute scheduled backup / Planlaşdırılmış backup-i yerinə yetir
 * This function should be called by external cron jobs (Vercel Cron, etc.)
 * Bu funksiya xarici cron job-lar (Vercel Cron və s.) tərəfindən çağırılmalıdır
 */
export async function executeScheduledBackup(
  scheduleType: 'daily' | 'weekly' | 'monthly',
  options: BackupOptions
): Promise<void> {
  const schedule = DEFAULT_SCHEDULES.find((s) => s.type === scheduleType);
  
  if (!schedule) {
    throw new Error(`Invalid schedule type: ${scheduleType}`);
  }

  logger.info(`Starting scheduled ${schedule.type} backup / Planlaşdırılmış ${schedule.type} backup başlayır`);

  try {
    const result = await createFullBackup({
      ...options,
      retentionDays: schedule.retentionDays,
    });

    if (result.success) {
      logger.info(`${schedule.type} backup completed successfully / ${schedule.type} backup uğurla tamamlandı`, {
        backupPath: result.backupPath,
        size: `${(result.size / 1024 / 1024).toFixed(2)} MB`,
      });

      // Cleanup old backups / Köhnə backup-ları təmizlə
      await cleanupOldBackups(options.outputDir, schedule.retentionDays);
    } else {
      logger.error(`${schedule.type} backup failed / ${schedule.type} backup uğursuz oldu`, {
        error: result.error,
      });
      throw new Error(result.error || 'Backup failed');
    }
  } catch (error) {
    logger.error(`Scheduled ${schedule.type} backup error / Planlaşdırılmış ${schedule.type} backup xətası`, error);
    throw error;
  }
}

/**
 * Get backup schedule configuration / Backup planlaşdırma konfiqurasiyasını al
 * Returns schedule info for external cron job setup
 * Xarici cron job quraşdırması üçün planlaşdırma məlumatını qaytarır
 */
export function getBackupSchedules(): BackupSchedule[] {
  return DEFAULT_SCHEDULES;
}

