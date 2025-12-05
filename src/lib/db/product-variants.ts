/**
 * Product Variants Service / Məhsul Variantları Xidməti
 * Database operations for product variants / Məhsul variantları üçün veritabanı əməliyyatları
 */

import { getReadClient, getWriteClient } from "@/lib/db/query-client";

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku?: string;
  barcode?: string;
  price?: number;
  stock: number;
  attributes: Record<string, any>;
  image?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface VariantAttributes {
  color?: string;
  size?: string;
  material?: string;
  [key: string]: any;
}

/**
 * Get all variants for a product / Məhsul üçün bütün variantları al
 */
export async function getProductVariants(productId: string): Promise<ProductVariant[]> {
  try {
    const readClient = await getReadClient();
    const variants = await (readClient as any).productVariant.findMany({
      where: {
        productId,
        isActive: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return variants.map((variant: any) => ({
      id: variant.id,
      productId: variant.productId,
      name: variant.name,
      sku: variant.sku || undefined,
      barcode: variant.barcode || undefined,
      price: variant.price ? Number(variant.price) : undefined,
      stock: variant.stock,
      attributes: typeof variant.attributes === 'string' 
        ? JSON.parse(variant.attributes) 
        : variant.attributes,
      image: variant.image || undefined,
      isActive: variant.isActive,
      createdAt: variant.createdAt,
      updatedAt: variant.updatedAt,
    }));
  } catch (error) {
    console.error("Error fetching product variants:", error);
    throw error;
  }
}

/**
 * Get variant by ID / ID ilə variantı al
 */
export async function getVariantById(variantId: string): Promise<ProductVariant | null> {
  try {
    const readClient = await getReadClient();
    const variant = await (readClient as any).productVariant.findUnique({
      where: {
        id: variantId,
      },
    });

    if (!variant) {
      return null;
    }

    return {
      id: variant.id,
      productId: variant.productId,
      name: variant.name,
      sku: variant.sku || undefined,
      barcode: variant.barcode || undefined,
      price: variant.price ? Number(variant.price) : undefined,
      stock: variant.stock,
      attributes: typeof variant.attributes === 'string' 
        ? JSON.parse(variant.attributes) 
        : variant.attributes,
      image: variant.image || undefined,
      isActive: variant.isActive,
      createdAt: variant.createdAt,
      updatedAt: variant.updatedAt,
    };
  } catch (error) {
    console.error("Error fetching variant:", error);
    throw error;
  }
}

/**
 * Check variant availability / Variant mövcudluğunu yoxla
 */
export async function checkVariantAvailability(
  variantId: string,
  quantity: number = 1
): Promise<{ available: boolean; stock: number }> {
  try {
    const variant = await getVariantById(variantId);
    
    if (!variant || !variant.isActive) {
      return { available: false, stock: 0 };
    }

    return {
      available: variant.stock >= quantity,
      stock: variant.stock,
    };
  } catch (error) {
    console.error("Error checking variant availability:", error);
    throw error;
  }
}

/**
 * Get variants by attributes / Atributlara görə variantları al
 */
export async function getVariantsByAttributes(
  productId: string,
  attributes: VariantAttributes
): Promise<ProductVariant[]> {
  try {
    const allVariants = await getProductVariants(productId);
    
    return allVariants.filter((variant) => {
      const variantAttrs = variant.attributes;
      return Object.keys(attributes).every((key) => {
        return variantAttrs[key] === attributes[key];
      });
    });
  } catch (error) {
    console.error("Error fetching variants by attributes:", error);
    throw error;
  }
}

/**
 * Get available variant combinations / Mövcud variant kombinasiyalarını al
 */
export async function getAvailableVariantCombinations(
  productId: string
): Promise<{
  colors: string[];
  sizes: string[];
  materials: string[];
  combinations: Array<{
    attributes: VariantAttributes;
    variantId: string;
    price?: number;
    stock: number;
    image?: string;
  }>;
}> {
  try {
    const variants = await getProductVariants(productId);
    
    const colors = new Set<string>();
    const sizes = new Set<string>();
    const materials = new Set<string>();
    const combinations: Array<{
      attributes: VariantAttributes;
      variantId: string;
      price?: number;
      stock: number;
      image?: string;
    }> = [];

    variants.forEach((variant) => {
      const attrs = variant.attributes;
      
      if (attrs.color) colors.add(attrs.color);
      if (attrs.size) sizes.add(attrs.size);
      if (attrs.material) materials.add(attrs.material);

      combinations.push({
        attributes: attrs,
        variantId: variant.id,
        price: variant.price,
        stock: variant.stock,
        image: variant.image,
      });
    });

    return {
      colors: Array.from(colors),
      sizes: Array.from(sizes),
      materials: Array.from(materials),
      combinations,
    };
  } catch (error) {
    console.error("Error fetching available variant combinations:", error);
    throw error;
  }
}

