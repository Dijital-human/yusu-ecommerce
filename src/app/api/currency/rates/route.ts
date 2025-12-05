/**
 * Currency Rates API Route / Valyuta Məzənnələri API Route-u
 * Returns current currency exchange rates
 * Cari valyuta məzənnələrini qaytarır
 */

import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { Currency } from "@/lib/currency/currency-converter";

/**
 * GET /api/currency/rates
 * Get current currency exchange rates / Cari valyuta məzənnələrini al
 */
export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.EXCHANGERATE_API_KEY || process.env.FIXER_API_KEY;
    const apiProvider = process.env.CURRENCY_API_PROVIDER || 'exchangerate'; // 'exchangerate' or 'fixer'

    // Base currency / Əsas valyuta
    const baseCurrency = 'USD';
    const targetCurrencies = ['EUR', 'GBP', 'AZN', 'TRY', 'RUB', 'CNY'];

    let rates: Record<Currency, number> = {
      USD: 1.0, // Base currency / Əsas valyuta
      EUR: 0.92,
      GBP: 0.79,
      AZN: 1.70,
      TRY: 32.50,
      RUB: 92.00,
      CNY: 7.25,
    };

    // Try to fetch from external API if configured / Əgər konfiqurasiya edilibsə xarici API-dən al
    if (apiKey) {
      try {
        if (apiProvider === 'exchangerate') {
          // ExchangeRate API / ExchangeRate API
          const symbols = targetCurrencies.join(',');
          const response = await fetch(
            `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${baseCurrency}`,
            {
              headers: {
                'Accept': 'application/json',
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data.conversion_rates) {
              rates = {
                USD: 1.0,
                EUR: data.conversion_rates.EUR || rates.EUR,
                GBP: data.conversion_rates.GBP || rates.GBP,
                AZN: data.conversion_rates.AZN || rates.AZN,
                TRY: data.conversion_rates.TRY || rates.TRY,
                RUB: data.conversion_rates.RUB || rates.RUB,
                CNY: data.conversion_rates.CNY || rates.CNY,
              };
            }
          }
        } else if (apiProvider === 'fixer') {
          // Fixer.io API / Fixer.io API
          const symbols = targetCurrencies.join(',');
          const response = await fetch(
            `https://api.fixer.io/latest?access_key=${apiKey}&base=${baseCurrency}&symbols=${symbols}`,
            {
              headers: {
                'Accept': 'application/json',
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data.rates) {
              rates = {
                USD: 1.0,
                EUR: data.rates.EUR || rates.EUR,
                GBP: data.rates.GBP || rates.GBP,
                AZN: data.rates.AZN || rates.AZN,
                TRY: data.rates.TRY || rates.TRY,
                RUB: data.rates.RUB || rates.RUB,
                CNY: data.rates.CNY || rates.CNY,
              };
            }
          }
        }
      } catch (apiError) {
        // If API fails, use fallback rates / Əgər API uğursuz olarsa, fallback məzənnələri istifadə et
        console.warn('Currency API fetch failed, using fallback rates / Valyuta API almaq uğursuz oldu, fallback məzənnələri istifadə olunur', apiError);
      }
    }

    return successResponse({ rates, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error fetching currency rates / Valyuta məzənnələrini almaq xətası:', error);
    return errorResponse('Failed to fetch currency rates / Valyuta məzənnələrini almaq uğursuz oldu', 500);
  }
}

