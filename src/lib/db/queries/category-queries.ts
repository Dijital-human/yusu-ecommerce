/**
 * Category Query Helpers / Kateqoriya Sorğu Köməkçiləri
 * Centralized Prisma queries for categories
 * Kateqoriyalar üçün mərkəzləşdirilmiş Prisma sorğuları
 */

import { getReadClient } from "@/lib/db/query-client";
import { NextResponse } from "next/server";
import { notFoundResponse } from "@/lib/api/response";

export interface CategoryQueryOptions {
  parentOnly?: boolean;
  includeProducts?: boolean;
}

/**
 * Get all categories / Bütün kateqoriyaları al
 */
export async function getCategories(options: CategoryQueryOptions = {}) {
  const { parentOnly = false, includeProducts = false } = options;

  try {
    // Build where clause / Where şərtini qur
    const where: any = {
      isActive: true,
    };

    if (parentOnly) {
      where.parentId = null;
    }

    // Get categories / Kateqoriyaları əldə et
    const readClient = await getReadClient();
    const categories = await readClient.category.findMany({
      where,
      include: {
        children: {
          where: { isActive: true },
          ...(includeProducts && {
            include: {
              products: {
                where: { isActive: true },
                take: 4, // Limit products per category / Kateqoriya başına məhsul məhdudiyyəti
                select: {
                  id: true,
                  name: true,
                  price: true,
                  images: true,
                },
              },
            },
          }),
        },
        parent: true,
        _count: {
          select: {
            products: {
              where: { isActive: true },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return categories;
  } catch (error) {
    // Log error but don't throw / Xətanı log et amma throw etmə
    console.error('Error fetching categories from database / Veritabanından kateqoriyaları almaq xətası:', error);
    
    // Return empty array on database error / Database xətası olduqda boş array qaytar
    // This allows the app to continue working even if database is unavailable
    // Bu, veritabanı əlçatan olmasa belə tətbiqin işləməsinə imkan verir
    return [];
  }
}

/**
 * Get category by ID / ID ilə kateqoriyanı al
 */
export async function getCategoryById(categoryId: string, includeStats: boolean = false) {
  const readClient = await getReadClient();
  const category = await readClient.category.findUnique({
    where: {
      id: categoryId,
      isActive: true,
    },
  });

  if (!category) {
    return notFoundResponse("Category");
  }

  if (!includeStats) {
    return { category };
  }

  // Get stats if requested / Tələb olunarsa statistikaları al
  const [productCount, priceStats] = await Promise.all([
    readClient.product.count({
      where: {
        categoryId: categoryId,
        isActive: true,
      },
    }),
    readClient.product.aggregate({
      where: {
        categoryId: categoryId,
        isActive: true,
      },
      _min: {
        price: true,
      },
      _max: {
        price: true,
      },
    }),
  ]);

  return {
    category,
    stats: {
      productCount,
      minPrice: priceStats._min.price ? Number(priceStats._min.price) : 0,
      maxPrice: priceStats._max.price ? Number(priceStats._max.price) : 1000,
    },
  };
}

/**
 * Get category with stats / Statistikalar ilə kateqoriyanı al
 */
export async function getCategoryWithStats(categoryId: string) {
  return getCategoryById(categoryId, true);
}

