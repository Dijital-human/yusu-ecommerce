/**
 * Currency Converter / Valyuta Konvertoru
 * Handles currency conversion and formatting
 * Valyuta konvertasiyası və formatlaşdırmasını idarə edir
 */

import { getCurrencyRates } from './currency-rates';

/**
 * Supported currencies / Dəstəklənən valyutalar
 */
export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'AZN', 'TRY', 'RUB', 'CNY'] as const;
export type Currency = typeof SUPPORTED_CURRENCIES[number];

/**
 * Currency symbols / Valyuta simvolları
 */
export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  AZN: '₼',
  TRY: '₺',
  RUB: '₽',
  CNY: '¥',
};

/**
 * Currency names / Valyuta adları
 */
export const CURRENCY_NAMES: Record<Currency, string> = {
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  AZN: 'Azerbaijani Manat',
  TRY: 'Turkish Lira',
  RUB: 'Russian Ruble',
  CNY: 'Chinese Yuan',
};

/**
 * Convert amount from one currency to another / Bir valyutadan digərinə məbləği konvertasiya et
 * @param amount - Amount to convert / Konvertasiya ediləcək məbləğ
 * @param fromCurrency - Source currency / Mənbə valyuta
 * @param toCurrency - Target currency / Hədəf valyuta
 * @returns Converted amount / Konvertasiya edilmiş məbləğ
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): Promise<number> {
  // If same currency, return as is / Əgər eyni valyutadırsa, olduğu kimi qaytar
  if (fromCurrency === toCurrency) {
    return amount;
  }

  try {
    // Get currency rates / Valyuta məzənnələrini al
    const rates = await getCurrencyRates();
    
    // Convert to USD first (base currency) / Əvvəlcə USD-yə konvertasiya et (əsas valyuta)
    let amountInUSD = amount;
    if (fromCurrency !== 'USD') {
      const fromRate = rates[fromCurrency];
      if (!fromRate) {
        throw new Error(`Currency rate not found for ${fromCurrency} / ${fromCurrency} üçün valyuta məzənnəsi tapılmadı`);
      }
      amountInUSD = amount / fromRate;
    }

    // Convert from USD to target currency / USD-dən hədəf valyutaya konvertasiya et
    if (toCurrency === 'USD') {
      return amountInUSD;
    }

    const toRate = rates[toCurrency];
    if (!toRate) {
      throw new Error(`Currency rate not found for ${toCurrency} / ${toCurrency} üçün valyuta məzənnəsi tapılmadı`);
    }

    return amountInUSD * toRate;
  } catch (error) {
    console.error('Currency conversion error / Valyuta konvertasiyası xətası:', error);
    // Fallback: return original amount / Fallback: orijinal məbləği qaytar
    return amount;
  }
}

/**
 * Format currency amount / Valyuta məbləğini formatlaşdır
 * @param amount - Amount to format / Formatlaşdırılacaq məbləğ
 * @param currency - Currency code / Valyuta kodu
 * @param locale - Locale for formatting (default: 'en-US') / Formatlaşdırma üçün locale (default: 'en-US')
 * @returns Formatted currency string / Formatlaşdırılmış valyuta string-i
 */
export function formatCurrency(
  amount: number,
  currency: Currency,
  locale: string = 'en-US'
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback: simple format / Fallback: sadə format
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    return `${symbol}${amount.toFixed(2)}`;
  }
}

/**
 * Get currency symbol / Valyuta simvolunu al
 * @param currency - Currency code / Valyuta kodu
 * @returns Currency symbol / Valyuta simvolu
 */
export function getCurrencySymbol(currency: Currency): string {
  return CURRENCY_SYMBOLS[currency] || currency;
}

/**
 * Get currency name / Valyuta adını al
 * @param currency - Currency code / Valyuta kodu
 * @returns Currency name / Valyuta adı
 */
export function getCurrencyName(currency: Currency): string {
  return CURRENCY_NAMES[currency] || currency;
}

