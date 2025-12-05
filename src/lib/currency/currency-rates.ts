/**
 * Currency Rates Manager / Valyuta Məzənnələri Meneceri
 * Handles fetching and caching currency exchange rates
 * Valyuta məzənnələrinin alınmasını və cache-lənməsini idarə edir
 */

import { Currency } from './currency-converter';

/**
 * Currency rates cache / Valyuta məzənnələri cache-i
 */
let ratesCache: Record<Currency, number> | null = null;
let cacheTimestamp: number | null = null;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour / 1 saat

/**
 * Get currency rates from cache or API / Cache-dən və ya API-dən valyuta məzənnələrini al
 * @returns Currency rates object / Valyuta məzənnələri obyekti
 */
export async function getCurrencyRates(): Promise<Record<Currency, number>> {
  // Check cache validity / Cache etibarlılığını yoxla
  if (ratesCache && cacheTimestamp && Date.now() - cacheTimestamp < CACHE_TTL) {
    return ratesCache;
  }

  try {
    // Fetch rates from API / API-dən məzənnələri al
    const response = await fetch('/api/currency/rates');
    if (!response.ok) {
      throw new Error('Failed to fetch currency rates / Valyuta məzənnələrini almaq uğursuz oldu');
    }

    const data = await response.json();
    if (data.rates && typeof data.rates === 'object') {
      ratesCache = data.rates as Record<Currency, number>;
      cacheTimestamp = Date.now();
      return ratesCache;
    }
    
    throw new Error('Invalid rates data / Yanlış məzənnə məlumatları');
  } catch (error) {
    console.error('Error fetching currency rates / Valyuta məzənnələrini almaq xətası:', error);
    
    // Fallback: return default rates (1:1 for all currencies) / Fallback: default məzənnələri qaytar (bütün valyutalar üçün 1:1)
    if (!ratesCache) {
      ratesCache = {
        USD: 1,
        EUR: 1,
        GBP: 1,
        AZN: 1,
        TRY: 1,
        RUB: 1,
        CNY: 1,
      };
    }
    
    return ratesCache;
  }
}

/**
 * Clear currency rates cache / Valyuta məzənnələri cache-ini təmizlə
 */
export function clearCurrencyRatesCache(): void {
  ratesCache = null;
  cacheTimestamp = null;
}

