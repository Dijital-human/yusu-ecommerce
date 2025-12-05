/**
 * Product Service / Məhsul Xidməti
 * Business logic for product operations
 * Məhsul əməliyyatları üçün business logic
 */

import { prisma } from "@/lib/db";
import { getProductById, getProductsWithFilters, ProductFilters } from "@/lib/db/queries/product-queries";
import { parsePrice } from "@/lib/utils/price-helpers";
import { cache, cacheKeys } from "@/lib/cache/cache-wrapper";
import { invalidateProductCache, invalidateRelatedCaches } from "@/lib/cache/cache-invalidator";
import { indexProduct, removeProductFromIndex } from "@/lib/search/search-engine";
import { logger } from "@/lib/utils/logger";
import { emitProductCreated, emitProductUpdated, emitProductDeleted, emitProductStockLow, emitProductStockOut } from "@/lib/events/product-events";
import { indexProductImage, isVisualSearchEnabled } from "@/lib/search/visual-search";
import { isMLModelEnabled } from "@/lib/ml/image-classifier";

export interface CreateProductData {
  name: string;
  description: string;
  price: number | string;
  images?: string | string[];
  categoryId: string;
  stock?: number;
  originalPrice?: number | string;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number | string;
  images?: string | string[];
  categoryId?: string;
  stock?: number;
  originalPrice?: number | string;
  isActive?: boolean;
}

/**
 * Create a new product / Yeni məhsul yarat
 */
export async function createProduct(data: CreateProductData, sellerId: string) {
  // Check if category exists / Kateqoriyanın mövcud olduğunu yoxla
  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
  });

  if (!category) {
    throw new Error("Category not found / Kateqoriya tapılmadı");
  }

  // Create product / Məhsul yarat
  const product = await prisma.product.create({
    data: {
      name: data.name,
      description: data.description,
      price: parsePrice(data.price),
      originalPrice: data.originalPrice ? parsePrice(data.originalPrice) : undefined,
      images: Array.isArray(data.images) ? JSON.stringify(data.images) : data.images || "",
      categoryId: data.categoryId,
      sellerId,
      stock: data.stock || 0,
    },
    include: {
      category: true,
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Emit product created event / Məhsul yaradıldı event-i emit et
  try {
    emitProductCreated(product, sellerId);
  } catch (eventError) {
    logger.error("Failed to emit product created event / Məhsul yaradıldı event-i emit etmək uğursuz oldu", eventError instanceof Error ? eventError : new Error(String(eventError)), { productId: product.id });
  }

  // Invalidate cache using smart cache invalidator / Ağıllı cache invalidator istifadə edərək cache-i invalide et
  // Note: Cache invalidation is now handled by event handler / Qeyd: Cache invalidation indi event handler tərəfindən idarə olunur
  await invalidateProductCache(product.id);
  await invalidateRelatedCaches('category', data.categoryId);

  // Index product in search engine (async, don't wait) / Məhsulu axtarış mühərrikində indekslə (async, gözləmə)
  try {
    await indexProduct(product.id);
  } catch (indexError) {
    logger.error("Failed to index product in search engine / Məhsulu axtarış mühərrikində indeksləmək uğursuz oldu", indexError instanceof Error ? indexError : new Error(String(indexError)), { productId: product.id });
  }

  // Index product images for visual search if ML model is enabled (async, don't wait) / ML model aktivdirsə məhsul rəsmlərini vizual axtarış üçün indekslə (async, gözləmə)
  if (isMLModelEnabled() && isVisualSearchEnabled() && product.images) {
    try {
      let imageUrls: string[] = [];
      
      // Parse images / Rəsmləri parse et
      if (typeof product.images === 'string') {
        try {
          const parsed = JSON.parse(product.images);
          imageUrls = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          imageUrls = [product.images];
        }
      } else if (Array.isArray(product.images)) {
        imageUrls = product.images;
      }

      // Index first image / İlk rəsmi indekslə
      if (imageUrls.length > 0) {
        const firstImage = imageUrls[0];
        // Don't await - process in background / Gözləmə - arxa planda işlə
        indexProductImage(product.id, firstImage).catch((visualError) => {
          logger.warn("Failed to index product image for visual search / Vizual axtarış üçün məhsul rəsimini indeksləmək uğursuz oldu", visualError instanceof Error ? visualError : new Error(String(visualError)));
        });
      }
    } catch (visualError) {
      logger.warn("Failed to index product images for visual search / Vizual axtarış üçün məhsul rəsmlərini indeksləmək uğursuz oldu", visualError instanceof Error ? visualError : new Error(String(visualError)));
    }
  }

  return product;
}

/**
 * Update a product / Məhsulu yenilə
 */
export async function updateProduct(productId: string, data: UpdateProductData, sellerId?: string) {
  // Check if product exists and user has permission / Məhsulun mövcud olduğunu və istifadəçinin icazəsi olduğunu yoxla
  const existingProduct = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!existingProduct) {
    throw new Error("Product not found / Məhsul tapılmadı");
  }

  // Check permission if sellerId is provided / Əgər sellerId təmin edilibsə icazəni yoxla
  if (sellerId && existingProduct.sellerId !== sellerId) {
    throw new Error("Unauthorized / Yetkisiz");
  }

  // Check category if categoryId is being updated / Əgər categoryId yenilənirsə kateqoriyanı yoxla
  if (data.categoryId && data.categoryId !== existingProduct.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new Error("Category not found / Kateqoriya tapılmadı");
    }
  }

  // Prepare update data / Yeniləmə məlumatlarını hazırla
  const updateData: any = {};
  
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.price !== undefined) updateData.price = parsePrice(data.price);
  if (data.originalPrice !== undefined) updateData.originalPrice = data.originalPrice ? parsePrice(data.originalPrice) : null;
  if (data.images !== undefined) {
    updateData.images = Array.isArray(data.images) ? JSON.stringify(data.images) : data.images;
  }
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
  if (data.stock !== undefined) updateData.stock = data.stock;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  // Update product / Məhsulu yenilə
  const product = await prisma.product.update({
    where: { id: productId },
    data: updateData,
    include: {
      category: true,
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Emit product updated event / Məhsul yeniləndi event-i emit et
  try {
    emitProductUpdated(productId, {
      ...updateData,
      oldCategoryId: existingProduct.categoryId,
      categoryId: product.categoryId,
    }, sellerId || existingProduct.sellerId);
  } catch (eventError) {
    logger.error("Failed to emit product updated event / Məhsul yeniləndi event-i emit etmək uğursuz oldu", eventError instanceof Error ? eventError : new Error(String(eventError)), { productId });
  }

  // Check stock levels and emit events if needed / Stok səviyyələrini yoxla və lazım olduqda event-lər emit et
  if (data.stock !== undefined) {
    const stockThreshold = 10; // Default threshold / Default threshold
    if (product.stock === 0) {
      emitProductStockOut(productId, sellerId || existingProduct.sellerId);
    } else if (product.stock <= stockThreshold && existingProduct.stock > stockThreshold) {
      emitProductStockLow(productId, product.stock, stockThreshold, sellerId || existingProduct.sellerId);
    }
  }

  // Invalidate cache using smart cache invalidator / Ağıllı cache invalidator istifadə edərək cache-i invalide et
  // Note: Cache invalidation is now handled by event handler / Qeyd: Cache invalidation indi event handler tərəfindən idarə olunur
  await invalidateRelatedCaches('product', productId, {
    categoryId: product.categoryId,
    oldCategoryId: existingProduct.categoryId,
  });

  // Re-index product images for visual search if images were updated and ML model is enabled (async, don't wait) / Rəsmlər yenilənibsə və ML model aktivdirsə məhsul rəsmlərini yenidən indekslə (async, gözləmə)
  if (isMLModelEnabled() && isVisualSearchEnabled() && data.images !== undefined && product.images) {
    try {
      let imageUrls: string[] = [];
      
      // Parse images / Rəsmləri parse et
      if (typeof product.images === 'string') {
        try {
          const parsed = JSON.parse(product.images);
          imageUrls = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          imageUrls = [product.images];
        }
      } else if (Array.isArray(product.images)) {
        imageUrls = product.images;
      }

      // Re-index first image / İlk rəsmi yenidən indekslə
      if (imageUrls.length > 0) {
        const firstImage = imageUrls[0];
        // Don't await - process in background / Gözləmə - arxa planda işlə
        indexProductImage(product.id, firstImage).catch((visualError) => {
          logger.warn("Failed to re-index product image for visual search / Vizual axtarış üçün məhsul rəsimini yenidən indeksləmək uğursuz oldu", visualError instanceof Error ? visualError : new Error(String(visualError)));
        });
      }
    } catch (visualError) {
      logger.warn("Failed to re-index product images for visual search / Vizual axtarış üçün məhsul rəsmlərini yenidən indeksləmək uğursuz oldu", visualError instanceof Error ? visualError : new Error(String(visualError)));
    }
  }

  return product;
}

/**
 * Delete a product / Məhsulu sil
 */
export async function deleteProduct(productId: string, sellerId?: string) {
  // Check if product exists and user has permission / Məhsulun mövcud olduğunu və istifadəçinin icazəsi olduğunu yoxla
  const existingProduct = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!existingProduct) {
    throw new Error("Product not found / Məhsul tapılmadı");
  }

  // Check permission if sellerId is provided / Əgər sellerId təmin edilibsə icazəni yoxla
  if (sellerId && existingProduct.sellerId !== sellerId) {
    throw new Error("Unauthorized / Yetkisiz");
  }

  // Delete product / Məhsulu sil
  await prisma.product.delete({
    where: { id: productId },
  });

  // Emit product deleted event / Məhsul silindi event-i emit et
  try {
    emitProductDeleted(productId, sellerId || existingProduct.sellerId);
  } catch (eventError) {
    logger.error("Failed to emit product deleted event / Məhsul silindi event-i emit etmək uğursuz oldu", eventError instanceof Error ? eventError : new Error(String(eventError)), { productId });
  }

  // Invalidate cache using smart cache invalidator / Ağıllı cache invalidator istifadə edərək cache-i invalide et
  // Note: Cache invalidation is now handled by event handler / Qeyd: Cache invalidation indi event handler tərəfindən idarə olunur
  await invalidateProductCache(productId);
  await invalidateRelatedCaches('category', existingProduct.categoryId);

  // Remove product from search index (async, don't wait) / Məhsulu axtarış indeksindən sil (async, gözləmə)
  try {
    await removeProductFromIndex(productId);
  } catch (indexError) {
    logger.error("Failed to remove product from search index / Məhsulu axtarış indeksindən silmək uğursuz oldu", indexError instanceof Error ? indexError : new Error(String(indexError)), { productId });
  }
}

/**
 * Get products with filters / Filtrlər ilə məhsulları al
 */
export async function getProducts(filters: ProductFilters, page: number = 1, limit: number = 12) {
  return await getProductsWithFilters(filters, page, limit);
}

/**
 * Get product by ID / ID ilə məhsulu al
 */
export async function getProduct(productId: string, includeReviews: boolean = false) {
  const result = await getProductById(productId, includeReviews);
  
  if (result instanceof Response) {
    throw new Error("Product not found / Məhsul tapılmadı");
  }

  return result.product;
}


