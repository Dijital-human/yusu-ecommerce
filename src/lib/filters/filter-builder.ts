/**
 * Filter Builder / Filter Qurucu
 * Advanced filtering system for products
 * Məhsullar üçün genişləndirilmiş filtrləmə sistemi
 */

import { getReadClient } from '@/lib/db/query-client';
import { logger } from '@/lib/utils/logger';

// Export FilterOptions for backward compatibility / Geri uyğunluq üçün FilterOptions export et
export interface FilterOptions {
  // Category filters / Kateqoriya filtrləri
  categoryId?: string;
  categoryIds?: string[];
  excludeCategoryIds?: string[];

  // Price filters / Qiymət filtrləri
  minPrice?: number;
  maxPrice?: number;
  priceRange?: { min: number; max: number }[];

  // Rating filters / Reytinq filtrləri
  minRating?: number;
  maxRating?: number;
  hasReviews?: boolean;

  // Stock filters / Stok filtrləri
  inStock?: boolean;
  minStock?: number;
  maxStock?: number;
  lowStock?: boolean; // Stock < threshold

  // Seller filters / Satıcı filtrləri
  sellerId?: string;
  sellerIds?: string[];
  verifiedSeller?: boolean;

  // Product status filters / Məhsul status filtrləri
  isActive?: boolean;
  isPublished?: boolean;
  isApproved?: boolean;
  isOnSale?: boolean; // Has discount

  // Date filters / Tarix filtrləri
  createdAfter?: Date;
  createdBefore?: Date;
  updatedAfter?: Date;
  updatedBefore?: Date;

  // Search filters / Axtarış filtrləri
  search?: string;
  searchFields?: ('name' | 'description' | 'category' | 'seller')[];

  // Brand filters / Brend filtrləri (if exists in schema)
  brand?: string;
  brands?: string[];

  // Tags filters / Tag filtrləri (if exists in schema)
  tags?: string[];
  hasTags?: boolean;

  // Custom filters / Xüsusi filtrlər
  customFilters?: Record<string, any>;
}

export interface SortOptions {
  field: 'price' | 'rating' | 'createdAt' | 'updatedAt' | 'name' | 'stock' | 'reviewCount' | 'popularity';
  order: 'asc' | 'desc';
}

export interface FilterResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters: FilterOptions;
  sort: SortOptions;
}

/**
 * Build Prisma where clause from filter options / Filter seçimlərindən Prisma where clause qur
 */
export function buildFilterWhere(filters: FilterOptions): any {
  const where: any = {};

  // Category filters / Kateqoriya filtrləri
  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  } else if (filters.categoryIds && filters.categoryIds.length > 0) {
    where.categoryId = { in: filters.categoryIds };
  }

  if (filters.excludeCategoryIds && filters.excludeCategoryIds.length > 0) {
    where.categoryId = where.categoryId
      ? { ...where.categoryId, notIn: filters.excludeCategoryIds }
      : { notIn: filters.excludeCategoryIds };
  }

  // Price filters / Qiymət filtrləri
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {};
    if (filters.minPrice !== undefined) {
      where.price.gte = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
      where.price.lte = filters.maxPrice;
    }
  }

  // Price range filters / Qiymət aralığı filtrləri
  if (filters.priceRange && filters.priceRange.length > 0) {
    where.OR = where.OR || [];
    filters.priceRange.forEach(range => {
      where.OR.push({
        price: {
          gte: range.min,
          lte: range.max,
        },
      });
    });
  }

  // Rating filters / Reytinq filtrləri
  if (filters.minRating !== undefined || filters.maxRating !== undefined) {
    where.rating = {};
    if (filters.minRating !== undefined) {
      where.rating.gte = filters.minRating;
    }
    if (filters.maxRating !== undefined) {
      where.rating.lte = filters.maxRating;
    }
  }

  if (filters.hasReviews !== undefined) {
    if (filters.hasReviews) {
      where.reviews = { some: {} };
    } else {
      where.reviews = { none: {} };
    }
  }

  // Stock filters / Stok filtrləri
  if (filters.inStock !== undefined) {
    if (filters.inStock) {
      where.stock = { gt: 0 };
    } else {
      where.stock = { lte: 0 };
    }
  }

  if (filters.minStock !== undefined || filters.maxStock !== undefined) {
    where.stock = where.stock || {};
    if (filters.minStock !== undefined) {
      where.stock.gte = filters.minStock;
    }
    if (filters.maxStock !== undefined) {
      where.stock.lte = filters.maxStock;
    }
  }

  if (filters.lowStock !== undefined && filters.lowStock) {
    const lowStockThreshold = 10; // Default threshold / Default threshold
    where.stock = { lte: lowStockThreshold, gt: 0 };
  }

  // Seller filters / Satıcı filtrləri
  if (filters.sellerId) {
    where.sellerId = filters.sellerId;
  } else if (filters.sellerIds && filters.sellerIds.length > 0) {
    where.sellerId = { in: filters.sellerIds };
  }

  // Note: verifiedSeller filter requires isVerified field in User/Seller model
  // Qeyd: verifiedSeller filtri User/Seller modelində isVerified sahəsi tələb edir
  // if (filters.verifiedSeller !== undefined) {
  //   where.seller = {
  //     ...where.seller,
  //     isVerified: filters.verifiedSeller,
  //   };
  // }

  // Product status filters / Məhsul status filtrləri
  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive;
  }

  if (filters.isPublished !== undefined) {
    where.isPublished = filters.isPublished;
  }

  if (filters.isApproved !== undefined) {
    where.isApproved = filters.isApproved;
  }

  if (filters.isOnSale !== undefined && filters.isOnSale) {
    where.originalPrice = { not: null };
    where.OR = where.OR || [];
    where.OR.push({
      originalPrice: { gt: where.price?.gte || 0 },
    });
  }

  // Date filters / Tarix filtrləri
  if (filters.createdAfter || filters.createdBefore) {
    where.createdAt = {};
    if (filters.createdAfter) {
      where.createdAt.gte = filters.createdAfter;
    }
    if (filters.createdBefore) {
      where.createdAt.lte = filters.createdBefore;
    }
  }

  if (filters.updatedAfter || filters.updatedBefore) {
    where.updatedAt = {};
    if (filters.updatedAfter) {
      where.updatedAt.gte = filters.updatedAfter;
    }
    if (filters.updatedBefore) {
      where.updatedAt.lte = filters.updatedBefore;
    }
  }

  // Search filters / Axtarış filtrləri
  if (filters.search) {
    const searchFields = filters.searchFields || ['name', 'description'];
    where.OR = where.OR || [];
    
    searchFields.forEach(field => {
      if (field === 'name' || field === 'description') {
        where.OR.push({
          [field]: {
            contains: filters.search,
            mode: 'insensitive',
          },
        });
      } else if (field === 'category') {
        where.OR.push({
          category: {
            name: {
              contains: filters.search,
              mode: 'insensitive',
            },
          },
        });
      } else if (field === 'seller') {
        where.OR.push({
          seller: {
            name: {
              contains: filters.search,
              mode: 'insensitive',
            },
          },
        });
      }
    });
  }

  // Brand filters / Brend filtrləri (if brand field exists)
  if (filters.brand) {
    where.brand = filters.brand;
  } else if (filters.brands && filters.brands.length > 0) {
    where.brand = { in: filters.brands };
  }

  // Tags filters / Tag filtrləri (if tags field exists)
  if (filters.tags && filters.tags.length > 0) {
    where.tags = { hasSome: filters.tags };
  }

  if (filters.hasTags !== undefined) {
    if (filters.hasTags) {
      where.tags = { isEmpty: false };
    } else {
      where.tags = { isEmpty: true };
    }
  }

  // Clean up empty OR array / Boş OR array-i təmizlə
  if (where.OR && where.OR.length === 0) {
    delete where.OR;
  }

  return where;
}

/**
 * Build Prisma orderBy clause from sort options / Sort seçimlərindən Prisma orderBy clause qur
 */
export function buildSortOrderBy(sort: SortOptions): any {
  const orderBy: any = {};

  switch (sort.field) {
    case 'price':
      orderBy.price = sort.order;
      break;
    case 'rating':
      orderBy.rating = sort.order;
      break;
    case 'createdAt':
      orderBy.createdAt = sort.order;
      break;
    case 'updatedAt':
      orderBy.updatedAt = sort.order;
      break;
    case 'name':
      orderBy.name = sort.order;
      break;
    case 'stock':
      orderBy.stock = sort.order;
      break;
    case 'reviewCount':
      orderBy.reviews = {
        _count: sort.order,
      };
      break;
    case 'popularity':
      // Popularity = rating * reviewCount / Populyarlıq = reytinq * rəy sayı
      // This requires a computed field or multiple sorts / Bu hesablanmış field və ya çoxlu sort tələb edir
      orderBy.rating = sort.order;
      orderBy.reviews = {
        _count: sort.order,
      };
      break;
    default:
      orderBy.createdAt = 'desc';
  }

  return orderBy;
}

/**
 * Apply filters and sorting to product query / Məhsul sorğusuna filtrləri və sıralamayı tətbiq et
 */
export async function applyProductFilters(
  filters: FilterOptions,
  sort: SortOptions = { field: 'createdAt', order: 'desc' },
  page: number = 1,
  limit: number = 12
): Promise<FilterResult<any>> {
  try {
    const prisma = await getReadClient();
    const skip = (page - 1) * limit;

    const where = buildFilterWhere(filters);
    const orderBy = buildSortOrderBy(sort);

    // Get products with filters / Filtrlər ilə məhsulları al
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
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
              // isVerified: true, // Uncomment if field exists in schema / Əgər schema-da varsa comment-i sil
            },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Calculate average rating and review count / Orta reytinqi və rəy sayını hesabla
    const productsWithRating = products.map((product: any) => {
      const avgRating = product.reviews.length > 0
        ? product.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / product.reviews.length
        : 0;

      return {
        ...product,
        rating: avgRating,
        reviewCount: product._count.reviews,
        reviews: undefined, // Remove reviews array / Reviews array-i sil
        _count: undefined, // Remove _count / _count-u sil
      };
    });

    const totalPages = Math.ceil(total / limit);

    return {
      items: productsWithRating,
      total,
      page,
      limit,
      totalPages,
      filters,
      sort,
    };
  } catch (error) {
    logger.error('Failed to apply product filters / Məhsul filtrlərini tətbiq etmək uğursuz oldu', error);
    throw error;
  }
}

/**
 * Parse filter options from URL search params / URL search parametrlərindən filter seçimlərini parse et
 */
export function parseFiltersFromURL(searchParams: URLSearchParams): FilterOptions {
  const filters: FilterOptions = {};

  // Category / Kateqoriya
  const categoryId = searchParams.get('categoryId');
  if (categoryId) filters.categoryId = categoryId;

  const categoryIds = searchParams.get('categoryIds');
  if (categoryIds) {
    filters.categoryIds = categoryIds.split(',').filter(Boolean);
  }

  // Price / Qiymət
  const minPrice = searchParams.get('minPrice');
  if (minPrice) filters.minPrice = parseFloat(minPrice);

  const maxPrice = searchParams.get('maxPrice');
  if (maxPrice) filters.maxPrice = parseFloat(maxPrice);

  // Rating / Reytinq
  const minRating = searchParams.get('minRating');
  if (minRating) filters.minRating = parseFloat(minRating);

  // Stock / Stok
  const inStock = searchParams.get('inStock');
  if (inStock === 'true') filters.inStock = true;

  const lowStock = searchParams.get('lowStock');
  if (lowStock === 'true') filters.lowStock = true;

  // Seller / Satıcı
  const sellerId = searchParams.get('sellerId');
  if (sellerId) filters.sellerId = sellerId;

  const verifiedSeller = searchParams.get('verifiedSeller');
  if (verifiedSeller === 'true') filters.verifiedSeller = true;

  // Status / Status
  const isActive = searchParams.get('isActive');
  if (isActive !== null) filters.isActive = isActive === 'true';

  const isOnSale = searchParams.get('isOnSale');
  if (isOnSale === 'true') filters.isOnSale = true;

  // Search / Axtarış
  const search = searchParams.get('search') || searchParams.get('q');
  if (search) filters.search = search;

  // Brand / Brend
  const brand = searchParams.get('brand');
  if (brand) filters.brand = brand;

  const brands = searchParams.get('brands');
  if (brands) {
    filters.brands = brands.split(',').filter(Boolean);
  }

  // Tags / Tag-lər
  const tags = searchParams.get('tags');
  if (tags) {
    filters.tags = tags.split(',').filter(Boolean);
  }

  return filters;
}

/**
 * Build URL search params from filter options / Filter seçimlərindən URL search parametrləri qur
 */
export function buildURLFromFilters(filters: FilterOptions): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.categoryId) params.set('categoryId', filters.categoryId);
  if (filters.categoryIds && filters.categoryIds.length > 0) {
    params.set('categoryIds', filters.categoryIds.join(','));
  }

  if (filters.minPrice !== undefined) params.set('minPrice', filters.minPrice.toString());
  if (filters.maxPrice !== undefined) params.set('maxPrice', filters.maxPrice.toString());

  if (filters.minRating !== undefined) params.set('minRating', filters.minRating.toString());

  if (filters.inStock !== undefined) params.set('inStock', filters.inStock.toString());
  if (filters.lowStock !== undefined) params.set('lowStock', filters.lowStock.toString());

  if (filters.sellerId) params.set('sellerId', filters.sellerId);
  if (filters.verifiedSeller !== undefined) params.set('verifiedSeller', filters.verifiedSeller.toString());

  if (filters.isActive !== undefined) params.set('isActive', filters.isActive.toString());
  if (filters.isOnSale !== undefined) params.set('isOnSale', filters.isOnSale.toString());

  if (filters.search) params.set('search', filters.search);

  if (filters.brand) params.set('brand', filters.brand);
  if (filters.brands && filters.brands.length > 0) {
    params.set('brands', filters.brands.join(','));
  }

  if (filters.tags && filters.tags.length > 0) {
    params.set('tags', filters.tags.join(','));
  }

  return params;
}

/**
 * ProductFilters interface for backward compatibility / Geri uyğunluq üçün ProductFilters interface
 * This is a simplified version of FilterOptions / Bu FilterOptions-un sadələşdirilmiş versiyasıdır
 */
export interface ProductFilters {
  category?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  minRating?: number;
  inStock?: boolean;
  brand?: string;
  seller?: string;
  sellerId?: string;
  sortBy?: 'relevance' | 'name' | 'price' | 'rating' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

/**
 * Parse filter query string from URL search string / URL search string-dən filter query parse et
 * @deprecated Use parseFiltersFromURL instead / parseFiltersFromURL istifadə et
 */
export function parseFilterQuery(searchString: string): ProductFilters {
  const params = new URLSearchParams(searchString.startsWith('?') ? searchString.slice(1) : searchString);
  const filters: ProductFilters = {};
  
  if (params.get('category')) filters.category = params.get('category')!;
  if (params.get('categoryId')) filters.categoryId = params.get('categoryId')!;
  if (params.get('minPrice')) filters.minPrice = parseFloat(params.get('minPrice')!);
  if (params.get('maxPrice')) filters.maxPrice = parseFloat(params.get('maxPrice')!);
  if (params.get('rating')) filters.rating = parseFloat(params.get('rating')!);
  if (params.get('minRating')) filters.minRating = parseFloat(params.get('minRating')!);
  if (params.get('inStock')) filters.inStock = params.get('inStock') === 'true';
  if (params.get('brand')) filters.brand = params.get('brand')!;
  if (params.get('seller')) filters.seller = params.get('seller')!;
  if (params.get('sellerId')) filters.sellerId = params.get('sellerId')!;
  if (params.get('sortBy')) filters.sortBy = params.get('sortBy') as any;
  if (params.get('sortOrder')) filters.sortOrder = params.get('sortOrder') as 'asc' | 'desc';
  if (params.get('search') || params.get('q')) filters.search = params.get('search') || params.get('q') || undefined;
  
  return filters;
}

/**
 * Build filter query string from filters object / Filter obyektindən filter query string qur
 * @deprecated Use buildURLFromFilters instead / buildURLFromFilters istifadə et
 */
export function buildFilterQuery(filters: ProductFilters): string {
  const params = new URLSearchParams();
  
  if (filters.category) params.set('category', filters.category);
  if (filters.categoryId) params.set('categoryId', filters.categoryId);
  if (filters.minPrice !== undefined) params.set('minPrice', filters.minPrice.toString());
  if (filters.maxPrice !== undefined) params.set('maxPrice', filters.maxPrice.toString());
  if (filters.rating !== undefined) params.set('rating', filters.rating.toString());
  if (filters.minRating !== undefined) params.set('minRating', filters.minRating.toString());
  if (filters.inStock !== undefined) params.set('inStock', filters.inStock.toString());
  if (filters.brand) params.set('brand', filters.brand);
  if (filters.seller) params.set('seller', filters.seller);
  if (filters.sellerId) params.set('sellerId', filters.sellerId);
  if (filters.sortBy) params.set('sortBy', filters.sortBy);
  if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
  if (filters.search) params.set('search', filters.search);
  
  return params.toString();
}

/**
 * Merge two filter objects / İki filter obyektini birləşdir
 */
export function mergeFilters(base: ProductFilters, override: Partial<ProductFilters>): ProductFilters {
  return { ...base, ...override };
}

/**
 * Clear all filters / Bütün filtrləri təmizlə
 */
export function clearFilters(): ProductFilters {
  return {};
}

/**
 * Check if filters are active / Filtrlərin aktiv olub-olmadığını yoxla
 */
export function hasActiveFilters(filters: ProductFilters): boolean {
  return !!(
    filters.category ||
    filters.categoryId ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.rating ||
    filters.minRating ||
    filters.inStock ||
    filters.brand ||
    filters.seller ||
    filters.sellerId ||
    (filters.sortBy && filters.sortBy !== 'relevance') ||
    (filters.sortOrder && filters.sortOrder !== 'desc')
  );
}
