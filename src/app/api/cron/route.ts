/**
 * Cron Job Endpoint / Cron İş Nöqtəsi
 * Daily scheduled tasks / Gündəlik planlaşdırılmış tapşırıqlar
 * 
 * This endpoint is called by Vercel Cron at 10:00 UTC daily
 * Bu endpoint hər gün saat 10:00 UTC-da Vercel Cron tərəfindən çağırılır
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Verify authorization / Avtorizasiyanı yoxla
  const authHeader = request.headers.get('Authorization');
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.error('[Cron] Unauthorized access attempt');
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    console.log('[Cron] Starting daily tasks at', new Date().toISOString());

    // Task 1: Clean up expired sessions / Müddəti bitmiş sessiyaları təmizlə
    // await cleanupExpiredSessions();

    // Task 2: Update product statistics / Məhsul statistikasını yenilə
    // await updateProductStats();

    // Task 3: Send reminder emails / Xatırlatma emailləri göndər
    // await sendReminderEmails();

    // Task 4: Generate daily reports / Gündəlik hesabatlar yarat
    // await generateDailyReports();

    // Task 5: Cleanup old cart data / Köhnə səbət məlumatlarını təmizlə
    // await cleanupOldCarts();

    console.log('[Cron] Daily tasks completed successfully');

    return NextResponse.json({
      ok: true,
      message: 'Daily cron job executed successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Cron] Error executing daily tasks:', error);
    
    return NextResponse.json(
      {
        ok: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

