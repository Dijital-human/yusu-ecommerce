/**
 * Product Query Helpers / Məhsul Sorğu Köməkçiləri
 * Reusable Prisma queries for products
 * Məhsullar üçün təkrar istifadə olunan Prisma sorğuları
 */

import { getReadClient, getWriteClient } from "@/lib/db/query-client";
import { productIncludeBasic } from "@/lib/db/selectors";
import { parseProductImages, calculateAverageRating } from "@/lib/utils/product-helpers";
import { parsePrice } from "@/lib/utils/price-helpers";
import { notFoundResponse } from "@/lib/api/response";
import { NextResponse } from "next/server";

/**
 * Transform product with rating and parsed images / Məhsulu reytinq və parse edilmiş şəkillərlə transform et
 */
function transformProduct(product: any): {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: any;
  seller: any;
  stock: number;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  reviews?: any[];
} {
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
 * Get product by ID with active check / ID ilə aktiv məhsulu al
 * Automatically transforms product with rating and parsed images / Avtomatik olaraq məhsulu reytinq və parse edilmiş şəkillərlə transform edir
 */
export async function getProductById(
  productId: string,
  includeReviews: boolean = false
): Promise<{ product: any } | NextResponse> {
  const readClient = await getReadClient();
  const product = await (readClient as any).product.findUnique({
    where: {
      id: productId,
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

  if (!product) {
    return notFoundResponse("Product");
  }

  // Transform product automatically / Məhsulu avtomatik transform et
  const transformedProduct = transformProduct(product);

  return { product: transformedProduct };
}

/**
 * Get products with filters and pagination / Filtrlər və səhifələmə ilə məhsulları al
 */
export interface ProductFilters {
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sellerId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export async function getProductsWithFilters(
  filters: ProductFilters,
  page: number = 1,
  limit: number = 12
) {
  const skip = (page - 1) * limit;

  // Build where clause / Where şərtini qur
  // For customer-facing API, only show approved and published products / Müştəri üçün API-də yalnız təsdiqlənmiş və publish olunmuş məhsulları göstər
  const where: any = {
    isActive: true,
    isPublished: true,
    isApproved: true, // Admin təsdiqi tələb olunur / Admin approval required
  };

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters.sellerId) {
    where.sellerId = filters.sellerId;
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {};
    if (filters.minPrice !== undefined) {
      where.price.gte = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
      where.price.lte = filters.maxPrice;
    }
  }

  if (filters.inStock) {
    where.stock = { gt: 0 };
  }

  // Build orderBy clause / OrderBy şərtini qur
  const orderBy: any = {};
  if (filters.sortBy) {
    orderBy[filters.sortBy] = filters.sortOrder || "desc";
  } else {
    orderBy.createdAt = "desc";
  }

  // Fetch products / Məhsulları al
  const readClient = await getReadClient();
  const [products, total] = await Promise.all([
    (readClient as any).product.findMany({
      where,
      include: productIncludeBasic,
      orderBy,
      skip,
      take: limit,
    }),
    (readClient as any).product.count({ where }),
  ]);

  // Transform products with rating and parsed images / Məhsulları reytinq və parse edilmiş şəkillərlə transform et
  const transformedProducts = products.map((product: any) => transformProduct(product));

  return {
    products: transformedProducts,
    total,
  };
}

