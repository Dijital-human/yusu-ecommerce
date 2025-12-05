/**
 * Product Variants Utilities / Məhsul Variantları Yardımçı Funksiyaları
 * Helper functions for product variants / Məhsul variantları üçün yardımçı funksiyalar
 */

import { VariantAttributes } from "@/lib/db/product-variants";

/**
 * Calculate variant price / Variant qiymətini hesabla
 */
export function calculateVariantPrice(
  basePrice: number,
  variantPrice?: number
): number {
  return variantPrice !== undefined ? variantPrice : basePrice;
}

/**
 * Format variant name / Variant adını formatla
 */
export function formatVariantName(attributes: VariantAttributes): string {
  const parts: string[] = [];
  
  if (attributes.color) parts.push(attributes.color);
  if (attributes.size) parts.push(attributes.size);
  if (attributes.material) parts.push(attributes.material);
  
  return parts.join(' - ') || 'Default';
}

/**
 * Check if variant combination is valid / Variant kombinasiyasının etibarlı olub-olmadığını yoxla
 */
export function isValidVariantCombination(
  selectedAttributes: VariantAttributes,
  availableCombinations: Array<{ attributes: VariantAttributes }>
): boolean {
  return availableCombinations.some((combination) => {
    return Object.keys(selectedAttributes).every((key) => {
      return combination.attributes[key] === selectedAttributes[key];
    });
  });
}

/**
 * Get variant image or fallback to product image / Variant şəklini al və ya məhsul şəklini istifadə et
 */
export function getVariantImage(
  variantImage?: string,
  productImages?: string[]
): string {
  if (variantImage) {
    return variantImage;
  }
  
  if (productImages && productImages.length > 0) {
    return Array.isArray(productImages) ? productImages[0] : productImages;
  }
  
  return '/placeholder-product.jpg';
}

/**
 * Get stock status text / Anbar statusu mətnini al
 */
export function getStockStatusText(stock: number): {
  text: string;
  color: string;
} {
  if (stock === 0) {
    return { text: 'Out of Stock', color: 'text-red-600' };
  } else if (stock < 10) {
    return { text: 'Low Stock', color: 'text-orange-600' };
  } else {
    return { text: 'In Stock', color: 'text-green-600' };
  }
}

