/**
 * Currency Service / Valyuta Xidməti
 * Multi-currency support with real-time exchange rates
 * Real-time məzənnələri ilə çoxvalyutalı dəstək
 */

import { logger } from '@/lib/utils/logger';
import { cache } from '@/lib/cache/cache-wrapper';

/**
 * Supported currencies / Dəstəklənən valyutalar
 */
export const SUPPORTED_CURRENCIES = {
  AZN: { code: 'AZN', symbol: '₼', name: 'Azerbaijani Manat', decimals: 2 },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', decimals: 2 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', decimals: 2 },
  TRY: { code: 'TRY', symbol: '₺', name: 'Turkish Lira', decimals: 2 },
  RUB: { code: 'RUB', symbol: '₽', name: 'Russian Ruble', decimals: 2 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', decimals: 2 },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', decimals: 2 },
  AED: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', decimals: 2 },
  SAR: { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', decimals: 2 },
  GEL: { code: 'GEL', symbol: '₾', name: 'Georgian Lari', decimals: 2 },
} as const;

export type CurrencyCode = keyof typeof SUPPORTED_CURRENCIES;

/**
 * Exchange rates interface / Məzənnə interfeysi
 */
interface ExchangeRates {
  base: CurrencyCode;
  rates: Record<CurrencyCode, number>;
  timestamp: number;
}

/**
 * Formatted price interface / Formatlanmış qiymət interfeysi
 */
interface FormattedPrice {
  amount: number;
  formatted: string;
  currency: CurrencyCode;
  symbol: string;
}

/**
 * Currency service class / Valyuta xidməti sinifi
 */
class CurrencyService {
  private exchangeRates: ExchangeRates | null = null;
  private baseCurrency: CurrencyCode = 'AZN';
  private readonly cacheKey = 'exchange_rates';
  private readonly cacheDuration = 3600; // 1 hour / 1 saat

  /**
   * Fetch exchange rates from provider / Provider-dən məzənnələri al
   */
  async fetchExchangeRates(): Promise<ExchangeRates | null> {
    try {
      // Check cache first / Əvvəlcə cache-i yoxla
      const cached = await cache.get<ExchangeRates>(this.cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheDuration * 1000) {
        this.exchangeRates = cached;
        return cached;
      }

      // Try multiple providers / Müxtəlif provider-ləri sına
      let rates: Record<CurrencyCode, number> | null = null;

      // Provider 1: Exchange Rate API
      if (process.env.EXCHANGE_RATE_API_KEY) {
        rates = await this.fetchFromExchangeRateAPI();
      }

      // Provider 2: Open Exchange Rates
      if (!rates && process.env.OPEN_EXCHANGE_RATES_APP_ID) {
        rates = await this.fetchFromOpenExchangeRates();
      }

      // Provider 3: Fixer.io
      if (!rates && process.env.FIXER_API_KEY) {
        rates = await this.fetchFromFixer();
      }

      // Fallback to static rates / Statik məzənnələrə keçid
      if (!rates) {
        rates = this.getStaticRates();
        logger.warn('Using static exchange rates / Statik məzənnələr istifadə olunur');
      }

      const exchangeRates: ExchangeRates = {
        base: this.baseCurrency,
        rates,
        timestamp: Date.now(),
      };

      // Cache the rates / Məzənnələri cache-lə
      await cache.set(this.cacheKey, exchangeRates, this.cacheDuration);
      this.exchangeRates = exchangeRates;

      logger.info('Exchange rates updated / Məzənnələr yeniləndi', { base: this.baseCurrency });
      return exchangeRates;
    } catch (error) {
      logger.error('Failed to fetch exchange rates / Məzənnələri almaq uğursuz oldu', error);
      return this.exchangeRates || { base: this.baseCurrency, rates: this.getStaticRates(), timestamp: Date.now() };
    }
  }

  /**
   * Fetch from Exchange Rate API / Exchange Rate API-dən al
   */
  private async fetchFromExchangeRateAPI(): Promise<Record<CurrencyCode, number> | null> {
    try {
      const apiKey = process.env.EXCHANGE_RATE_API_KEY;
      const response = await fetch(
        `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${this.baseCurrency}`
      );

      if (!response.ok) return null;

      const data = await response.json();
      const rates: Partial<Record<CurrencyCode, number>> = {};

      for (const code of Object.keys(SUPPORTED_CURRENCIES) as CurrencyCode[]) {
        if (data.conversion_rates[code]) {
          rates[code] = data.conversion_rates[code];
        }
      }

      return rates as Record<CurrencyCode, number>;
    } catch {
      return null;
    }
  }

  /**
   * Fetch from Open Exchange Rates / Open Exchange Rates-dən al
   */
  private async fetchFromOpenExchangeRates(): Promise<Record<CurrencyCode, number> | null> {
    try {
      const appId = process.env.OPEN_EXCHANGE_RATES_APP_ID;
      const response = await fetch(
        `https://openexchangerates.org/api/latest.json?app_id=${appId}&base=USD`
      );

      if (!response.ok) return null;

      const data = await response.json();
      const usdRates = data.rates;
      const aznRate = usdRates.AZN || 1.7;

      // Convert to AZN base / AZN əsasına çevir
      const rates: Partial<Record<CurrencyCode, number>> = {};
      for (const code of Object.keys(SUPPORTED_CURRENCIES) as CurrencyCode[]) {
        if (usdRates[code]) {
          rates[code] = usdRates[code] / aznRate;
        }
      }
      rates.AZN = 1;

      return rates as Record<CurrencyCode, number>;
    } catch {
      return null;
    }
  }

  /**
   * Fetch from Fixer.io / Fixer.io-dan al
   */
  private async fetchFromFixer(): Promise<Record<CurrencyCode, number> | null> {
    try {
      const apiKey = process.env.FIXER_API_KEY;
      const symbols = Object.keys(SUPPORTED_CURRENCIES).join(',');
      const response = await fetch(
        `http://data.fixer.io/api/latest?access_key=${apiKey}&symbols=${symbols}`
      );

      if (!response.ok) return null;

      const data = await response.json();
      if (!data.success) return null;

      // Fixer uses EUR as base, convert to AZN / Fixer EUR əsas istifadə edir, AZN-ə çevir
      const eurRates = data.rates;
      const aznRate = eurRates.AZN || 1.87;

      const rates: Partial<Record<CurrencyCode, number>> = {};
      for (const code of Object.keys(SUPPORTED_CURRENCIES) as CurrencyCode[]) {
        if (eurRates[code]) {
          rates[code] = eurRates[code] / aznRate;
        }
      }
      rates.AZN = 1;

      return rates as Record<CurrencyCode, number>;
    } catch {
      return null;
    }
  }

  /**
   * Get static fallback rates (approximate) / Statik fallback məzənnələri (təxmini)
   */
  private getStaticRates(): Record<CurrencyCode, number> {
    // Approximate rates based on AZN / AZN əsasında təxmini məzənnələr
    return {
      AZN: 1,
      USD: 0.59, // 1 AZN = 0.59 USD
      EUR: 0.54, // 1 AZN = 0.54 EUR
      TRY: 19.5, // 1 AZN = 19.5 TRY
      RUB: 54, // 1 AZN = 54 RUB
      GBP: 0.47, // 1 AZN = 0.47 GBP
      CNY: 4.25, // 1 AZN = 4.25 CNY
      AED: 2.16, // 1 AZN = 2.16 AED
      SAR: 2.21, // 1 AZN = 2.21 SAR
      GEL: 1.59, // 1 AZN = 1.59 GEL
    };
  }

  /**
   * Convert amount between currencies / Məbləği valyutalar arasında çevir
   */
  async convert(
    amount: number,
    from: CurrencyCode,
    to: CurrencyCode
  ): Promise<number> {
    if (from === to) return amount;

    const rates = this.exchangeRates?.rates || await this.fetchExchangeRates().then(r => r?.rates);
    if (!rates) {
      logger.warn('Using fallback rates / Fallback məzənnələr istifadə olunur');
      const fallbackRates = this.getStaticRates();
      return this.calculateConversion(amount, from, to, fallbackRates);
    }

    return this.calculateConversion(amount, from, to, rates);
  }

  /**
   * Calculate conversion / Çevrilməni hesabla
   */
  private calculateConversion(
    amount: number,
    from: CurrencyCode,
    to: CurrencyCode,
    rates: Record<CurrencyCode, number>
  ): number {
    // Convert to base currency first, then to target / Əvvəlcə əsas valyutaya, sonra hədəfə çevir
    const amountInBase = from === this.baseCurrency ? amount : amount / rates[from];
    const result = to === this.baseCurrency ? amountInBase : amountInBase * rates[to];

    return Math.round(result * 100) / 100;
  }

  /**
   * Format price with currency / Qiyməti valyuta ilə formatla
   */
  formatPrice(
    amount: number,
    currency: CurrencyCode,
    locale: string = 'az-AZ'
  ): FormattedPrice {
    const currencyInfo = SUPPORTED_CURRENCIES[currency];
    
    const formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currencyInfo.decimals,
      maximumFractionDigits: currencyInfo.decimals,
    }).format(amount);

    return {
      amount,
      formatted,
      currency,
      symbol: currencyInfo.symbol,
    };
  }

  /**
   * Format price with custom symbol position / Xüsusi simvol mövqeyi ilə qiyməti formatla
   */
  formatPriceCustom(
    amount: number,
    currency: CurrencyCode,
    symbolPosition: 'before' | 'after' = 'after'
  ): string {
    const currencyInfo = SUPPORTED_CURRENCIES[currency];
    const formattedAmount = amount.toFixed(currencyInfo.decimals);

    return symbolPosition === 'before'
      ? `${currencyInfo.symbol}${formattedAmount}`
      : `${formattedAmount} ${currencyInfo.symbol}`;
  }

  /**
   * Get all supported currencies / Bütün dəstəklənən valyutaları al
   */
  getSupportedCurrencies() {
    return Object.values(SUPPORTED_CURRENCIES);
  }

  /**
   * Get current exchange rates / Cari məzənnələri al
   */
  async getExchangeRates(): Promise<ExchangeRates | null> {
    if (!this.exchangeRates) {
      await this.fetchExchangeRates();
    }
    return this.exchangeRates;
  }

  /**
   * Detect user currency based on locale / Locale əsasında istifadəçi valyutasını təyin et
   */
  detectCurrencyFromLocale(locale: string): CurrencyCode {
    const localeCurrencyMap: Record<string, CurrencyCode> = {
      'az': 'AZN',
      'az-AZ': 'AZN',
      'en': 'USD',
      'en-US': 'USD',
      'en-GB': 'GBP',
      'tr': 'TRY',
      'tr-TR': 'TRY',
      'ru': 'RUB',
      'ru-RU': 'RUB',
      'de': 'EUR',
      'de-DE': 'EUR',
      'fr': 'EUR',
      'fr-FR': 'EUR',
      'zh': 'CNY',
      'zh-CN': 'CNY',
      'ar': 'AED',
      'ar-AE': 'AED',
      'ar-SA': 'SAR',
      'ka': 'GEL',
      'ka-GE': 'GEL',
    };

    return localeCurrencyMap[locale] || 'AZN';
  }

  /**
   * Convert price list to target currency / Qiymət siyahısını hədəf valyutaya çevir
   */
  async convertPriceList(
    prices: Array<{ amount: number; currency: CurrencyCode }>,
    targetCurrency: CurrencyCode
  ): Promise<Array<{ original: { amount: number; currency: CurrencyCode }; converted: number }>> {
    const results = [];

    for (const price of prices) {
      const converted = await this.convert(price.amount, price.currency, targetCurrency);
      results.push({
        original: price,
        converted,
      });
    }

    return results;
  }
}

// Singleton instance / Singleton instance
export const currencyService = new CurrencyService();

/**
 * Hook-friendly functions / Hook-uyğun funksiyalar
 */
export async function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode
): Promise<number> {
  return currencyService.convert(amount, from, to);
}

export function formatPrice(
  amount: number,
  currency: CurrencyCode,
  locale?: string
): FormattedPrice {
  return currencyService.formatPrice(amount, currency, locale);
}

export async function getExchangeRates(): Promise<ExchangeRates | null> {
  return currencyService.getExchangeRates();
}

