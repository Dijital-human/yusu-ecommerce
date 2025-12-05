/**
 * Recently Viewed Products Service / Son Baxılan Məhsullar Xidməti
 * Database operations for recently viewed products / Son baxılan məhsullar üçün veritabanı əməliyyatları
 */

import { getReadClient, getWriteClient } from "@/lib/db/query-client";

export interface RecentlyViewedProduct {
  id: string;
  userId: string;
  productId: string;
  viewedAt: Date;
  product: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    images: string;
    stock: number;
    category?: {
      name: string;
    };
  };
}

/**
 * Add product to recently viewed / Məhsulu son baxılanlara əlavə et
 */
export async function addRecentlyViewed(
  userId: string,
  productId: string
): Promise<void> {
  try {
    const writeClient = await getWriteClient();
    
    // Check if already exists / Artıq mövcud olub-olmadığını yoxla
    const existing = await writeClient.recentlyViewed.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existing) {
      // Update viewedAt timestamp / viewedAt timestamp-i yenilə
      await writeClient.recentlyViewed.update({
        where: {
          id: existing.id,
        },
        data: {
          viewedAt: new Date(),
        },
      });
    } else {
      // Create new entry / Yeni qeyd yarat
      await writeClient.recentlyViewed.create({
        data: {
          userId,
          productId,
          viewedAt: new Date(),
        },
      });
    }
  } catch (error) {
    console.error("Error adding recently viewed product:", error);
    throw error;
  }
}

/**
 * Get recently viewed products for user / İstifadəçi üçün son baxılan məhsulları gətir
 */
export async function getRecentlyViewed(
  userId: string,
  limit: number = 20
): Promise<RecentlyViewedProduct[]> {
  try {
    const readClient = await getReadClient();
    const recentlyViewed = await readClient.recentlyViewed.findMany({
      where: {
        userId,
      },
      include: {
        product: {
          include: {
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        viewedAt: "desc",
      },
      take: limit,
    });

    return recentlyViewed.map((item) => ({
      id: item.id,
      userId: item.userId,
      productId: item.productId,
      viewedAt: item.viewedAt,
      product: {
        id: item.product.id,
        name: item.product.name,
        price: Number(item.product.price),
        originalPrice: item.product.originalPrice
          ? Number(item.product.originalPrice)
          : undefined,
        images: item.product.images,
        stock: item.product.stock,
        category: item.product.category
          ? {
              name: item.product.category.name,
            }
          : undefined,
      },
    }));
  } catch (error) {
    console.error("Error fetching recently viewed products:", error);
    throw error;
  }
}

/**
 * Remove product from recently viewed / Məhsulu son baxılanlardan çıxar
 */
export async function removeRecentlyViewed(
  userId: string,
  productId: string
): Promise<void> {
  try {
    const writeClient = await getWriteClient();
    await writeClient.recentlyViewed.deleteMany({
      where: {
        userId,
        productId,
      },
    });
  } catch (error) {
    console.error("Error removing recently viewed product:", error);
    throw error;
  }
}

/**
 * Clear all recently viewed products for user / İstifadəçi üçün bütün son baxılan məhsulları təmizlə
 */
export async function clearRecentlyViewed(userId: string): Promise<void> {
  try {
    const writeClient = await getWriteClient();
    await writeClient.recentlyViewed.deleteMany({
      where: {
        userId,
      },
    });
  } catch (error) {
    console.error("Error clearing recently viewed products:", error);
    throw error;
  }
}

