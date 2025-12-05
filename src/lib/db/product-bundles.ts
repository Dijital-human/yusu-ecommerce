/**
 * Product Bundles Service / Məhsul Paketləri Xidməti
 * Database operations for product bundles / Məhsul paketləri üçün veritabanı əməliyyatları
 */

import { getReadClient, getWriteClient } from "@/lib/db/query-client";

export interface ProductBundle {
  id: string;
  name: string;
  description?: string;
  bundlePrice: number;
  discount?: number;
  isActive: boolean;
  items: {
    id: string;
    productId: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      price: number;
      images: string;
    };
  }[];
}

/**
 * Get all active bundles / Bütün aktiv paketləri al
 */
export async function getActiveBundles(limit: number = 20): Promise<ProductBundle[]> {
  try {
    const readClient = await getReadClient();
    const bundles = await readClient.productBundle.findMany({
      where: {
        isActive: true,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
              },
            },
          },
        },
      },
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    return bundles.map((bundle) => ({
      id: bundle.id,
      name: bundle.name,
      description: bundle.description || undefined,
      bundlePrice: Number(bundle.bundlePrice),
      discount: bundle.discount ? Number(bundle.discount) : undefined,
      isActive: bundle.isActive,
      items: bundle.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        product: {
          id: item.product.id,
          name: item.product.name,
          price: Number(item.product.price),
          images: item.product.images,
        },
      })),
    }));
  } catch (error) {
    console.error("Error fetching active bundles:", error);
    throw error;
  }
}

/**
 * Get bundle by ID / ID ilə paketi al
 */
export async function getBundleById(bundleId: string): Promise<ProductBundle | null> {
  try {
    const readClient = await getReadClient();
    const bundle = await readClient.productBundle.findUnique({
      where: {
        id: bundleId,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
              },
            },
          },
        },
      },
    });

    if (!bundle) {
      return null;
    }

    return {
      id: bundle.id,
      name: bundle.name,
      description: bundle.description || undefined,
      bundlePrice: Number(bundle.bundlePrice),
      discount: bundle.discount ? Number(bundle.discount) : undefined,
      isActive: bundle.isActive,
      items: bundle.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        product: {
          id: item.product.id,
          name: item.product.name,
          price: Number(item.product.price),
          images: item.product.images,
        },
      })),
    };
  } catch (error) {
    console.error("Error fetching bundle:", error);
    throw error;
  }
}

/**
 * Calculate bundle savings / Paket qənaətini hesabla
 */
export function calculateBundleSavings(bundle: ProductBundle): {
  originalPrice: number;
  bundlePrice: number;
  savings: number;
  savingsPercent: number;
} {
  const originalPrice = bundle.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const bundlePrice = bundle.bundlePrice;
  const savings = originalPrice - bundlePrice;
  const savingsPercent = originalPrice > 0 ? (savings / originalPrice) * 100 : 0;

  return {
    originalPrice,
    bundlePrice,
    savings,
    savingsPercent,
  };
}

