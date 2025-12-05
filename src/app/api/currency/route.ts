/**
 * Currency API / Valyuta API
 * Get exchange rates and convert currencies
 * Məzənnələri al və valyutaları çevir
 */

import { NextRequest, NextResponse } from "next/server";
import { 
  currencyService, 
  CurrencyCode, 
  SUPPORTED_CURRENCIES 
} from "@/lib/currency/currency-service";
import { logger } from "@/lib/utils/logger";

/**
 * GET - Get exchange rates / Məzənnələri al
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "rates";

    switch (action) {
      case "rates": {
        const rates = await currencyService.getExchangeRates();
        return NextResponse.json(rates || { error: "Rates not available" });
      }

      case "currencies": {
        const currencies = currencyService.getSupportedCurrencies();
        return NextResponse.json({ currencies });
      }

      case "convert": {
        const from = searchParams.get("from") as CurrencyCode;
        const to = searchParams.get("to") as CurrencyCode;
        const amount = parseFloat(searchParams.get("amount") || "0");

        if (!from || !to || isNaN(amount)) {
          return NextResponse.json(
            { error: "Invalid parameters / Yanlış parametrlər" },
            { status: 400 }
          );
        }

        if (!SUPPORTED_CURRENCIES[from] || !SUPPORTED_CURRENCIES[to]) {
          return NextResponse.json(
            { error: "Unsupported currency / Dəstəklənməyən valyuta" },
            { status: 400 }
          );
        }

        const converted = await currencyService.convert(amount, from, to);
        const formatted = currencyService.formatPrice(converted, to);

        return NextResponse.json({
          from: { amount, currency: from },
          to: { amount: converted, currency: to },
          formatted: formatted.formatted,
          rate: converted / amount,
        });
      }

      case "detect": {
        const locale = searchParams.get("locale") || "az-AZ";
        const currency = currencyService.detectCurrencyFromLocale(locale);
        return NextResponse.json({ currency, locale });
      }

      default:
        return NextResponse.json(
          { error: "Unknown action / Naməlum hərəkət" },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error("Currency API error / Valyuta API xətası", error);
    return NextResponse.json(
      { error: "Failed to process request / Sorğunu emal etmək uğursuz oldu" },
      { status: 500 }
    );
  }
}

/**
 * POST - Convert currency / Valyutanı çevir
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { from, to, amount, prices } = body;

    // Single conversion / Tək çevrilmə
    if (from && to && amount !== undefined) {
      if (!SUPPORTED_CURRENCIES[from as CurrencyCode] || !SUPPORTED_CURRENCIES[to as CurrencyCode]) {
        return NextResponse.json(
          { error: "Unsupported currency / Dəstəklənməyən valyuta" },
          { status: 400 }
        );
      }

      const converted = await currencyService.convert(amount, from, to);
      const formatted = currencyService.formatPrice(converted, to);

      return NextResponse.json({
        from: { amount, currency: from },
        to: { amount: converted, currency: to },
        formatted: formatted.formatted,
      });
    }

    // Bulk conversion / Toplu çevrilmə
    if (prices && Array.isArray(prices) && to) {
      if (!SUPPORTED_CURRENCIES[to as CurrencyCode]) {
        return NextResponse.json(
          { error: "Unsupported target currency / Dəstəklənməyən hədəf valyuta" },
          { status: 400 }
        );
      }

      const results = await currencyService.convertPriceList(prices, to);
      return NextResponse.json({ results, targetCurrency: to });
    }

    return NextResponse.json(
      { error: "Invalid request body / Yanlış sorğu body-si" },
      { status: 400 }
    );
  } catch (error) {
    logger.error("Currency conversion error / Valyuta çevrilməsi xətası", error);
    return NextResponse.json(
      { error: "Failed to convert currency / Valyutanı çevirmək uğursuz oldu" },
      { status: 500 }
    );
  }
}

