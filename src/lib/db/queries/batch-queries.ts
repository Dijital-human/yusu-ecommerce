/**
 * Batch Query Helpers / Batch Sorğu Köməkçiləri
 * Reusable batch queries for fetching multiple records efficiently
 * Çoxlu qeydləri səmərəli şəkildə almaq üçün təkrar istifadə olunan batch sorğuları
 */

import { getReadClient } from "@/lib/db/query-client";
import { productIncludeBasic, orderIncludeBasic, orderIncludeDetailed } from "@/lib/db/selectors";
import { parseProductImages, calculateAverageRating } from "@/lib/utils/product-helpers";
import { parsePrice } from "@/lib/utils/price-helpers";

/**
 * Transform product helper (reused from product-queries pattern)
 * Məhsul transform helper-i (product-queries pattern-indən yenidən istifadə)
 */
function transformProduct(product: any): any {
  const avgRating = calculateAverageRating(product.reviews || []);
  const parsedImages = parseProductImages(product.images);

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: parsePrice(product.price),
    originalPrice: product.originalPrice ? parsePrice(product.originalPrice) : undefined,
    images: parsedImages,
    category: product.category,
    seller: product.seller,
    stock: product.stock,
    rating: avgRating,
    reviewCount: (product.reviews || []).length,
    isActive: product.isActive,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    ...(product.reviews && {
      reviews: product.reviews.map((review: any) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        user: review.user,
        createdAt: review.createdAt.toISOString(),
      })),
    }),
  };
}

/**
 * Batch get products by IDs / ID-lər ilə batch məhsulları al
 * Uses eager loading to fetch all products in a single query / Bütün məhsulları bir query-də almaq üçün eager loading istifadə edir
 * 
 * @param ids Array of product IDs / Məhsul ID-ləri array-i
 * @param includeReviews Whether to include reviews / Rəyləri daxil edib-etməmək
 * @returns Array of transformed products / Transform edilmiş məhsullar array-i
 */
export async function batchGetProducts(
  ids: string[],
  includeReviews: boolean = false
): Promise<any[]> {
  if (!ids || ids.length === 0) {
    return [];
  }

  // Fetch all products in a single query / Bütün məhsulları bir query-də al
  const readClient = await getReadClient();
  const products = await readClient.product.findMany({
    where: {
      id: { in: ids },
      isActive: true,
    },
    include: includeReviews
      ? {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          reviews: {
            select: {
              id: true,
              rating: true,
              comment: true,
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
              createdAt: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        }
      : productIncludeBasic,
  });

  // Transform products / Məhsulları transform et
  const transformedProducts = products.map((product: any) => transformProduct(product));

  // Maintain order of input IDs / Giriş ID-lərinin sırasını saxla
  const productMap = new Map(transformedProducts.map((p: any) => [p.id, p]));
  return ids.map((id) => productMap.get(id)).filter(Boolean) as any[];
}

/**
 * Batch get orders by IDs / ID-lər ilə batch sifarişləri al
 * Uses eager loading to fetch all orders in a single query / Bütün sifarişləri bir query-də almaq üçün eager loading istifadə edir
 * 
 * @param ids Array of order IDs / Sifariş ID-ləri array-i
 * @param includeDetailed Whether to include detailed relations / Ətraflı relation-ları daxil edib-etməmək
 * @returns Array of orders / Sifarişlər array-i
 */
export async function batchGetOrders(
  ids: string[],
  includeDetailed: boolean = false
): Promise<any[]> {
  if (!ids || ids.length === 0) {
    return [];
  }

  // Fetch all orders in a single query / Bütün sifarişləri bir query-də al
  const readClient = await getReadClient();
  const orders = await readClient.order.findMany({
    where: {
      id: { in: ids },
    },
    include: includeDetailed ? orderIncludeDetailed : orderIncludeBasic,
    orderBy: {
      createdAt: "desc",
    },
  });

  // Maintain order of input IDs / Giriş ID-lərinin sırasını saxla
  const orderMap = new Map(orders.map((o: any) => [o.id, o]));
  return ids.map((id) => orderMap.get(id)).filter(Boolean) as any[];
}

/**
 * Batch get users by IDs / ID-lər ilə batch istifadəçiləri al
 * Uses eager loading to fetch all users in a single query / Bütün istifadəçiləri bir query-də almaq üçün eager loading istifadə edir
 * 
 * @param ids Array of user IDs / İstifadəçi ID-ləri array-i
 * @returns Array of users / İstifadəçilər array-i
 */
export async function batchGetUsers(ids: string[]): Promise<any[]> {
  if (!ids || ids.length === 0) {
    return [];
  }

  // Fetch all users in a single query / Bütün istifadəçiləri bir query-də al
  const readClient = await getReadClient();
  const users = await readClient.user.findMany({
    where: {
      id: { in: ids },
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Maintain order of input IDs / Giriş ID-lərinin sırasını saxla
  const userMap = new Map(users.map((u: any) => [u.id, u]));
  return ids.map((id) => userMap.get(id)).filter(Boolean) as any[];
}

