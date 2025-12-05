/**
 * Currency Rates Update Cron Job / Valyuta Məzənnələri Yeniləmə Cron İşi
 * Updates currency exchange rates daily
 * Valyuta məzənnələrini gündəlik yeniləyir
 */

import { NextRequest } from "next/server";
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/api/response";
import { clearCurrencyRatesCache } from "@/lib/currency/currency-rates";

/**
 * POST /api/cron/currency-rates
 * Update currency exchange rates / Valyuta məzənnələrini yenilə
 * This endpoint should be called by a cron job / Bu endpoint cron job tərəfindən çağırılmalıdır
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret / Cron secret-i yoxla
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return unauthorizedResponse('Unauthorized / Yetkisiz');
    }

    // Fetch latest rates from external API / Xarici API-dən son məzənnələri al
    // This will trigger a fresh fetch from the API / Bu API-dən təzə sorğu tetikləyəcək
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/currency/rates`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch currency rates: ${response.status} / Valyuta məzənnələrini almaq uğursuz oldu: ${response.status}`);
    }

    // Clear currency rates cache to force refresh / Valyuta məzənnələri cache-ini təmizlə ki, yenilənmə məcburi olsun
    clearCurrencyRatesCache();

    return successResponse({ 
      message: 'Currency rates updated / Valyuta məzənnələri yeniləndi',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating currency rates / Valyuta məzənnələrini yeniləmək xətası:', error);
    return errorResponse('Failed to update currency rates / Valyuta məzənnələrini yeniləmək uğursuz oldu', 500);
  }
}

