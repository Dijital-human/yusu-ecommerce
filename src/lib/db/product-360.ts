/**
 * Product 360° View Service / Məhsul 360° Görünüşü Xidməti
 * Database operations for product 360° views / Məhsul 360° görünüşləri üçün veritabanı əməliyyatları
 */

import { getReadClient, getWriteClient } from "@/lib/db/query-client";

export interface Product360View {
  id: string;
  productId: string;
  imageUrls: string[];
  thumbnailUrl?: string;
  frameCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get 360° view for a product / Məhsul üçün 360° görünüşü al
 */
export async function getProduct360View(productId: string): Promise<Product360View | null> {
  try {
    const readClient = await getReadClient();
    const view360 = await readClient.product360View.findUnique({
      where: {
        productId,
        isActive: true,
      },
    });

    if (!view360) {
      return null;
    }

    return {
      id: view360.id,
      productId: view360.productId,
      imageUrls: view360.imageUrls,
      thumbnailUrl: view360.thumbnailUrl || undefined,
      frameCount: view360.frameCount,
      isActive: view360.isActive,
      createdAt: view360.createdAt,
      updatedAt: view360.updatedAt,
    };
  } catch (error) {
    console.error("Error fetching product 360° view:", error);
    throw error;
  }
}

/**
 * Create or update 360° view for a product / Məhsul üçün 360° görünüşü yarat və ya yenilə
 */
export async function upsertProduct360View(
  productId: string,
  data: {
    imageUrls: string[];
    thumbnailUrl?: string;
  }
): Promise<Product360View> {
  try {
    const writeClient = await getWriteClient();
    const view360 = await writeClient.product360View.upsert({
      where: {
        productId,
      },
      create: {
        productId,
        imageUrls: data.imageUrls,
        thumbnailUrl: data.thumbnailUrl || null,
        frameCount: data.imageUrls.length,
        isActive: true,
      },
      update: {
        imageUrls: data.imageUrls,
        thumbnailUrl: data.thumbnailUrl || null,
        frameCount: data.imageUrls.length,
      },
    });

    return {
      id: view360.id,
      productId: view360.productId,
      imageUrls: view360.imageUrls,
      thumbnailUrl: view360.thumbnailUrl || undefined,
      frameCount: view360.frameCount,
      isActive: view360.isActive,
      createdAt: view360.createdAt,
      updatedAt: view360.updatedAt,
    };
  } catch (error) {
    console.error("Error upserting product 360° view:", error);
    throw error;
  }
}

/**
 * Delete 360° view for a product / Məhsul üçün 360° görünüşü sil
 */
export async function deleteProduct360View(productId: string): Promise<void> {
  try {
    const writeClient = await getWriteClient();
    await writeClient.product360View.delete({
      where: {
        productId,
      },
    });
  } catch (error) {
    console.error("Error deleting product 360° view:", error);
    throw error;
  }
}

