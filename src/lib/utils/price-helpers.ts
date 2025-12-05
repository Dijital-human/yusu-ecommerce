/**
 * Price Conversion Helpers / Qiymət Çevirmə Köməkçiləri
 * Reusable price conversion functions
 * Təkrar istifadə olunan qiymət çevirmə funksiyaları
 */

/**
 * Parse price from various formats / Müxtəlif formatlardan qiyməti parse et
 * Handles: string, number, Decimal (Prisma), null, undefined
 */
export function parsePrice(price: unknown): number {
  if (price === null || price === undefined) {
    return 0;
  }

  if (typeof price === 'number') {
    return price;
  }

  if (typeof price === 'string') {
    const parsed = parseFloat(price);
    return isNaN(parsed) ? 0 : parsed;
  }

  // Handle Prisma Decimal type / Prisma Decimal tipini idarə et
  if (typeof price === 'object' && price !== null) {
    // Check if it's a Prisma Decimal / Prisma Decimal olub-olmadığını yoxla
    if ('toNumber' in price && typeof (price as any).toNumber === 'function') {
      return (price as any).toNumber();
    }
    // Try to convert to number / Rəqəmə çevirməyə cəhd et
    const num = Number(price);
    return isNaN(num) ? 0 : num;
  }

  return 0;
}

/**
 * Format price for display / Göstərmə üçün qiyməti formatla
 */
export function formatPrice(price: number, currency: string = "AZN"): string {
  return new Intl.NumberFormat('az-AZ', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

