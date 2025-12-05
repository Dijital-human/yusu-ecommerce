/**
 * Category Service / Kateqoriya Xidməti
 * Business logic for category operations
 * Kateqoriya əməliyyatları üçün business logic
 */

import { prisma } from "@/lib/db";
import { getCategories, getCategoryById, CategoryQueryOptions } from "@/lib/db/queries/category-queries";
import { cache, cacheKeys } from "@/lib/cache/cache-wrapper";
import { invalidateCategoryCache, invalidateRelatedCaches } from "@/lib/cache/cache-invalidator";

export interface CreateCategoryData {
  name: string;
  description?: string;
  image?: string;
  parentId?: string;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  image?: string;
  parentId?: string;
  isActive?: boolean;
}

/**
 * Get all categories / Bütün kateqoriyaları al
 */
export async function getAllCategories(options: CategoryQueryOptions = {}) {
  const { parentOnly = false, includeProducts = false } = options;

  try {
    // Build cache key / Cache açarı qur
    const cacheKey = cacheKeys.categories() + `:includeProducts:${includeProducts}:parentOnly:${parentOnly}`;

    // Try to get from cache first / Əvvəlcə cache-dən al
    let categories = await cache.get(cacheKey);
    
    // If not in cache, fetch from database / Əgər cache-də yoxdursa, veritabanından al
    if (!categories) {
      categories = await getCategories(options);
      // Cache for 24 hours only if we got valid data / Yalnız düzgün məlumat aldıqda 24 saat cache et
      if (categories && Array.isArray(categories) && categories.length > 0) {
        try {
          await cache.set(cacheKey, categories, 86400); // 24 hours / 24 saat
        } catch (cacheError) {
          // Cache error is not critical, continue / Cache xətası kritik deyil, davam et
          console.warn('Failed to cache categories / Kateqoriyaları cache etmək uğursuz oldu:', cacheError);
        }
      }
    }

    return categories || [];
  } catch (error) {
    console.error('Error in getAllCategories / getAllCategories xətası:', error);
    // Return empty array on error / Xəta olduqda boş array qaytar
    // This allows the app to continue working even if database is unavailable
    // Bu, veritabanı əlçatan olmasa belə tətbiqin işləməsinə imkan verir
    return [];
  }
}

/**
 * Get category by ID / ID ilə kateqoriyanı al
 */
export async function getCategory(categoryId: string, includeStats: boolean = false) {
  const result = await getCategoryById(categoryId, includeStats);
  
  if (result instanceof Response) {
    throw new Error("Category not found / Kateqoriya tapılmadı");
  }

  if (includeStats && 'stats' in result) {
    return result as { category: any; stats: { productCount: number; minPrice: number; maxPrice: number } };
  }

  return result as { category: any };
}

/**
 * Create new category / Yeni kateqoriya yarat
 */
export async function createCategory(data: CreateCategoryData) {
  // Validate required fields / Tələb olunan sahələri yoxla
  if (!data.name) {
    throw new Error("Category name is required / Kateqoriya adı tələb olunur");
  }

  // Check if parent category exists (if parentId provided) / Ana kateqoriyanın mövcud olduğunu yoxla
  if (data.parentId) {
    const parentResult = await getCategoryById(data.parentId);
    if (parentResult instanceof Response) {
      throw new Error("Parent category not found / Ana kateqoriya tapılmadı");
    }
  }

  // Check if category with same name already exists / Eyni adlı kateqoriyanın artıq mövcud olduğunu yoxla
  const existingCategory = await prisma.category.findFirst({
    where: {
      name: {
        equals: data.name,
      },
      parentId: data.parentId || null,
    },
  });

  if (existingCategory) {
    throw new Error("Category with this name already exists / Bu adlı kateqoriya artıq mövcuddur");
  }

  // Create category / Kateqoriya yarat
  const category = await prisma.category.create({
    data: {
      name: data.name,
      description: data.description || null,
      image: data.image || null,
      parentId: data.parentId || null,
    },
    include: {
      parent: true,
      children: true,
    },
  });

  // Invalidate categories cache using smart cache invalidator / Ağıllı cache invalidator istifadə edərək categories cache-i invalide et
  await invalidateCategoryCache(category.id);
  if (category.parentId) {
    await invalidateCategoryCache(category.parentId);
  }

  return category;
}

/**
 * Update category / Kateqoriyanı yenilə
 */
export async function updateCategory(categoryId: string, data: UpdateCategoryData) {
  // Check if category exists / Kateqoriyanın mövcud olduğunu yoxla
  const existingResult = await getCategoryById(categoryId);
  if (existingResult instanceof Response) {
    throw new Error("Category not found / Kateqoriya tapılmadı");
  }

  // Check if parent category exists (if parentId provided) / Ana kateqoriyanın mövcud olduğunu yoxla
  if (data.parentId) {
    const parentResult = await getCategoryById(data.parentId);
    if (parentResult instanceof Response) {
      throw new Error("Parent category not found / Ana kateqoriya tapılmadı");
    }
  }

  // Check if category with same name already exists (if name changed) / Eyni adlı kateqoriyanın artıq mövcud olduğunu yoxla
  if (data.name && data.name !== existingResult.category.name) {
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: {
          equals: data.name,
        },
        parentId: data.parentId !== undefined ? data.parentId : existingResult.category.parentId || null,
        id: {
          not: categoryId,
        },
      },
    });

    if (existingCategory) {
      throw new Error("Category with this name already exists / Bu adlı kateqoriya artıq mövcuddur");
    }
  }

  // Update category / Kateqoriyanı yenilə
  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description || null;
  if (data.image !== undefined) updateData.image = data.image || null;
  if (data.parentId !== undefined) updateData.parentId = data.parentId || null;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  const category = await prisma.category.update({
    where: { id: categoryId },
    data: updateData,
    include: {
      parent: true,
      children: true,
    },
  });

  // Invalidate categories cache using smart cache invalidator / Ağıllı cache invalidator istifadə edərək categories cache-i invalide et
  await invalidateCategoryCache(categoryId);
  if (data.parentId !== undefined && data.parentId !== existingResult.category.parentId) {
    // If parent changed, invalidate both old and new parent caches / Əgər ana kateqoriya dəyişibsə, həm köhnə həm də yeni ana kateqoriya cache-lərini invalide et
    if (existingResult.category.parentId) {
      await invalidateCategoryCache(existingResult.category.parentId);
    }
    if (data.parentId) {
      await invalidateCategoryCache(data.parentId);
    }
  }

  return category;
}

/**
 * Delete category / Kateqoriyanı sil
 */
export async function deleteCategory(categoryId: string) {
  // Check if category exists / Kateqoriyanın mövcud olduğunu yoxla
  const existingResult = await getCategoryById(categoryId);
  if (existingResult instanceof Response) {
    throw new Error("Category not found / Kateqoriya tapılmadı");
  }

  // Check if category has products / Kateqoriyanın məhsulları olub-olmadığını yoxla
  const productCount = await prisma.product.count({
    where: {
      categoryId: categoryId,
      isActive: true,
    },
  });

  if (productCount > 0) {
    throw new Error("Cannot delete category with products / Məhsulları olan kateqoriya silinə bilməz");
  }

  // Check if category has children / Kateqoriyanın uşaqları olub-olmadığını yoxla
  const childrenCount = await prisma.category.count({
    where: {
      parentId: categoryId,
      isActive: true,
    },
  });

  if (childrenCount > 0) {
    throw new Error("Cannot delete category with subcategories / Alt kateqoriyaları olan kateqoriya silinə bilməz");
  }

  // Delete category / Kateqoriyanı sil
  await prisma.category.delete({
    where: { id: categoryId },
  });

  // Invalidate categories cache using smart cache invalidator / Ağıllı cache invalidator istifadə edərək categories cache-i invalide et
  await invalidateCategoryCache(categoryId);
  if (existingResult.category.parentId) {
    await invalidateCategoryCache(existingResult.category.parentId);
  }
}

