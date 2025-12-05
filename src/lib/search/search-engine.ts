/**
 * Search Engine Service / Axtarış Mühərriki Xidməti
 * Provides full-text search functionality using Meilisearch
 * Meilisearch istifadə edərək full-text search funksionallığı təmin edir
 */

import { MeiliSearch } from 'meilisearch';
import { logger } from '@/lib/utils/logger';
import { prisma } from '@/lib/db';
import {
  rankSearchResults,
  calculatePopularityScore,
  calculateRecencyScore,
  calculateSellerRatingScore,
  calculatePriceScore,
  ProductRankingData,
  RankingWeights,
} from './ranking';

// Search engine client instance / Axtarış mühərriki client instance
let searchClient: MeiliSearch | null = null;

/**
 * Get or create Meilisearch client instance / Meilisearch client instance al və ya yarat
 * Returns null if Meilisearch is not configured / Meilisearch konfiqurasiya edilməyibsə null qaytarır
 */
export function getSearchClient(): MeiliSearch | null {
  // If already created, return existing instance / Əgər artıq yaradılıbsa, mövcud instance qaytar
  if (searchClient) {
    return searchClient;
  }

  const host = process.env.MEILISEARCH_HOST;
  const apiKey = process.env.MEILISEARCH_API_KEY;
  const enabled = process.env.SEARCH_ENGINE_ENABLED === 'true';

  // If Meilisearch is not configured, return null / Əgər Meilisearch konfiqurasiya edilməyibsə, null qaytar
  if (!enabled || !host) {
    logger.warn('Meilisearch is not configured. Full-text search will use database fallback / Meilisearch konfiqurasiya edilməyib. Full-text search veritabanı fallback istifadə edəcək');
    return null;
  }

  try {
    // Create Meilisearch client / Meilisearch client yarat
    searchClient = new MeiliSearch({
      host,
      apiKey: apiKey || undefined,
    });

    logger.info('Meilisearch client created / Meilisearch client yaradıldı', { host });
    return searchClient;
  } catch (error) {
    logger.error('Failed to create Meilisearch client / Meilisearch client yaratmaq uğursuz oldu', error);
    return null;
  }
}

/**
 * Check if search engine is enabled / Axtarış mühərrikinin aktiv olub-olmadığını yoxla
 */
export function isSearchEngineEnabled(): boolean {
  return process.env.SEARCH_ENGINE_ENABLED === 'true' && !!process.env.MEILISEARCH_HOST;
}

/**
 * Initialize search index / Axtarış index-ini başlat
 * Creates index if it doesn't exist and configures searchable attributes
 * Əgər mövcud deyilsə index yaradır və axtarış atributlarını konfiqurasiya edir
 */
export async function initializeSearchIndex(): Promise<boolean> {
  const client = getSearchClient();
  if (!client) {
    return false;
  }

  try {
    const index = client.index('products');

    // Configure searchable attributes / Axtarış atributlarını konfiqurasiya et
    await index.updateSearchableAttributes([
      'name',
      'description',
      'category.name',
      'seller.name',
    ]);

    // Configure filterable attributes / Filtrlənə bilən atributları konfiqurasiya et
    await index.updateFilterableAttributes([
      'categoryId',
      'sellerId',
      'isActive',
      'stock',
      'price',
      'rating',
      'createdAt',
    ]);

    // Configure sortable attributes / Sıralana bilən atributları konfiqurasiya et
    await index.updateSortableAttributes([
      'name',
      'price',
      'rating',
      'createdAt',
      'reviewCount',
    ]);

    // Configure ranking rules / Reytinq qaydalarını konfiqurasiya et
    await index.updateRankingRules([
      'words',
      'typo',
      'proximity',
      'attribute',
      'sort',
      'exactness',
    ]);

    logger.info('Search index initialized / Axtarış index-i başladıldı');
    return true;
  } catch (error) {
    logger.error('Failed to initialize search index / Axtarış index-ini başlatmaq uğursuz oldu', error);
    return false;
  }
}

/**
 * Index a single product / Tək məhsulu index et
 */
export async function indexProduct(productId: string): Promise<boolean> {
  const client = getSearchClient();
  if (!client) {
    return false;
  }

  try {
    // Get product from database / Veritabanından məhsulu al
    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        originalPrice: true,
        categoryId: true,
        sellerId: true,
        stock: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!product || !product.isActive) {
      // Remove from index if product is inactive / Əgər məhsul aktiv deyilsə index-dən sil
      await client.index('products').deleteDocument(productId);
      return true;
    }

    // Get category and seller separately / Kateqoriya və satıcını ayrıca al
    const [category, seller, reviews] = await Promise.all([
      prisma.categories.findUnique({
        where: { id: product.categoryId },
        select: { id: true, name: true },
      }),
      prisma.users.findUnique({
        where: { id: product.sellerId },
        select: { id: true, name: true },
      }),
      prisma.reviews.findMany({
        where: { productId: product.id },
        select: { rating: true },
      }),
    ]);

    // Calculate average rating / Orta reytinqi hesabla
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    // Prepare document for indexing / Indexləmə üçün sənədi hazırla
    const document = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
      categoryId: product.categoryId,
      category: category ? {
        id: category.id,
        name: category.name,
      } : null,
      sellerId: product.sellerId,
      seller: seller ? {
        id: seller.id,
        name: seller.name || '',
      } : null,
      stock: product.stock,
      isActive: product.isActive,
      rating: avgRating,
      reviewCount: reviews.length,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };

    // Add or update document in index / Sənədi index-ə əlavə et və ya yenilə
    await client.index('products').addDocuments([document]);
    logger.info('Product indexed / Məhsul index edildi', { productId });
    return true;
  } catch (error) {
    logger.error('Failed to index product / Məhsulu index etmək uğursuz oldu', error, { productId });
    return false;
  }
}

/**
 * Remove product from index / Məhsulu index-dən sil
 */
export async function removeProductFromIndex(productId: string): Promise<boolean> {
  const client = getSearchClient();
  if (!client) {
    return false;
  }

  try {
    await client.index('products').deleteDocument(productId);
    logger.info('Product removed from index / Məhsul index-dən silindi', { productId });
    return true;
  } catch (error) {
    logger.error('Failed to remove product from index / Məhsulu index-dən silmək uğursuz oldu', error, { productId });
    return false;
  }
}

/**
 * Reindex all products / Bütün məhsulları yenidən index et
 * This should be run periodically or after bulk updates
 * Bu dövri olaraq və ya toplu yeniləmələrdən sonra işlədilməlidir
 */
export async function reindexAllProducts(): Promise<boolean> {
  const client = getSearchClient();
  if (!client) {
    return false;
  }

  try {
    logger.info('Starting full product reindexing / Tam məhsul yenidən indexləməsi başladıldı');

    // Get all active products / Bütün aktiv məhsulları al
    const products = await prisma.products.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        originalPrice: true,
        categoryId: true,
        sellerId: true,
        stock: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Get all categories and sellers / Bütün kateqoriyaları və satıcıları al
    const categoryIds = [...new Set(products.map(p => p.categoryId))];
    const sellerIds = [...new Set(products.map(p => p.sellerId))];
    const productIds = products.map(p => p.id);

    const [categories, sellers, reviewsByProduct] = await Promise.all([
      prisma.categories.findMany({
        where: { id: { in: categoryIds } },
        select: { id: true, name: true },
      }),
      prisma.users.findMany({
        where: { id: { in: sellerIds } },
        select: { id: true, name: true },
      }),
      prisma.reviews.groupBy({
        by: ['productId'],
        where: { productId: { in: productIds } },
        _count: { id: true },
        _avg: { rating: true },
      }),
    ]);

    const categoryMap = new Map(categories.map(c => [c.id, c]));
    const sellerMap = new Map(sellers.map(s => [s.id, s]));
    const reviewMap = new Map(reviewsByProduct.map(r => [r.productId, { count: r._count.id, avgRating: r._avg.rating || 0 }]));

    // Prepare documents for indexing / Indexləmə üçün sənədləri hazırla
    const documents = products.map((product) => {
      const category = categoryMap.get(product.categoryId);
      const seller = sellerMap.get(product.sellerId);
      const reviewData = reviewMap.get(product.id);

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: Number(product.price),
        originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
        categoryId: product.categoryId,
        category: category ? {
          id: category.id,
          name: category.name,
        } : null,
        sellerId: product.sellerId,
        seller: seller ? {
          id: seller.id,
          name: seller.name || '',
        } : null,
        stock: product.stock,
        isActive: product.isActive,
        rating: reviewData?.avgRating || 0,
        reviewCount: reviewData?.count || 0,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      };
    });

    // Add documents to index in batches / Sənədləri batch-lərlə index-ə əlavə et
    const batchSize = 1000;
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      await client.index('products').addDocuments(batch);
      logger.info(`Indexed batch ${Math.floor(i / batchSize) + 1} / Batch ${Math.floor(i / batchSize) + 1} index edildi`, {
        batch: Math.floor(i / batchSize) + 1,
        total: Math.ceil(documents.length / batchSize),
      });
    }

    logger.info('Full product reindexing completed / Tam məhsul yenidən indexləməsi tamamlandı', {
      totalProducts: documents.length,
    });
    return true;
  } catch (error) {
    logger.error('Failed to reindex all products / Bütün məhsulları yenidən index etmək uğursuz oldu', error);
    return false;
  }
}

/**
 * Search products using Meilisearch / Meilisearch istifadə edərək məhsulları axtar
 */
export async function searchProducts(params: {
  query: string;
  filters?: {
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
    inStock?: boolean;
    sellerId?: string;
    brand?: string;
  };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  useRanking?: boolean; // Enable ranking algorithm / Reytinq alqoritmini aktivləşdir
  rankingWeights?: RankingWeights; // Custom ranking weights / Xüsusi reytinq çəkiləri
}): Promise<{
  hits: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} | null> {
  const client = getSearchClient();
  if (!client) {
    return null;
  }

  try {
    const index = client.index('products');
    const page = params.page || 1;
    const limit = params.limit || 12;
    const offset = (page - 1) * limit;

    // Build filter string / Filter string-i qur
    const filterParts: string[] = [];

    if (params.filters) {
      if (params.filters.categoryId) {
        filterParts.push(`categoryId = "${params.filters.categoryId}"`);
      }

      if (params.filters.minPrice !== undefined || params.filters.maxPrice !== undefined) {
        const minPrice = params.filters.minPrice || 0;
        const maxPrice = params.filters.maxPrice || 1000000;
        filterParts.push(`price >= ${minPrice} AND price <= ${maxPrice}`);
      }

      if (params.filters.rating !== undefined && params.filters.rating > 0) {
        filterParts.push(`rating >= ${params.filters.rating}`);
      }

      if (params.filters.inStock) {
        filterParts.push('stock > 0');
      }

      if (params.filters.sellerId) {
        filterParts.push(`sellerId = "${params.filters.sellerId}"`);
      }

      if (params.filters.brand) {
        // Note: Brand filtering requires brand field in product model
        // Qeyd: Brand filtrləməsi məhsul modelində brand sahəsi tələb edir
        filterParts.push(`brand = "${params.filters.brand}"`);
      }

      // Always filter active products / Həmişə aktiv məhsulları filtrlə
      filterParts.push('isActive = true');
    } else {
      filterParts.push('isActive = true');
    }

    // Build sort array / Sort array-i qur
    const sort: string[] = [];
    if (params.sortBy) {
      const sortField = params.sortBy === 'relevance' ? 'rating:desc' : `${params.sortBy}:${params.sortOrder || 'desc'}`;
      sort.push(sortField);
    }

    // Perform search with fuzzy matching / Fuzzy matching ilə axtarışı yerinə yetir
    // Increase limit if ranking is enabled to get more results for ranking / Əgər reytinq aktivdirsə, reytinqləmə üçün daha çox nəticə almaq üçün limit-i artır
    const searchLimit = params.useRanking ? Math.min(limit * 3, 100) : limit;
    const searchResult = await index.search(params.query, {
      filter: filterParts.length > 0 ? filterParts.join(' AND ') : undefined,
      sort: sort.length > 0 ? sort : undefined,
      limit: searchLimit,
      offset: params.useRanking ? 0 : offset, // Get all results for ranking / Reytinqləmə üçün bütün nəticələri al
      attributesToRetrieve: ['*'],
      matchingStrategy: 'all', // Match all words / Bütün sözləri uyğunlaşdır
      typoTolerance: {
        enabled: true,
        minWordSizeForTypos: {
          oneTypo: 4,
          twoTypos: 8,
        },
      },
    });

    let rankedHits = searchResult.hits;

    // Apply ranking algorithm if enabled / Əgər aktivdirsə reytinq alqoritmini tətbiq et
    if (params.useRanking && searchResult.hits.length > 0) {
      try {
        // Fetch additional data for ranking / Reytinqləmə üçün əlavə məlumatları al
        const productIds = searchResult.hits.map((hit: any) => hit.id);
        const products = await prisma.products.findMany({
          where: { id: { in: productIds } },
          select: {
            id: true,
            createdAt: true,
            price: true,
            stock: true,
            sellerId: true,
          },
        });

        // Get popularity data (simplified - in production, use actual analytics) / Populyarlıq məlumatlarını al (sadələşdirilmiş - production-da faktiki analytics istifadə et)
        const orderItems = await prisma.order_items.groupBy({
          by: ['productId'],
          where: { productId: { in: productIds } },
          _count: { id: true },
          _sum: { quantity: true },
        });

        const orderCounts = new Map(orderItems.map(item => [item.productId, item._count.id || 0]));
        const maxOrders = Math.max(...Array.from(orderCounts.values()), 1);

        // Calculate price range / Qiymət aralığını hesabla
        const prices = products.map(p => parseFloat(p.price.toString()));
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const isBudgetSearch = params.query.toLowerCase().includes('cheap') || 
                              params.query.toLowerCase().includes('budget') ||
                              params.query.toLowerCase().includes('affordable');

        // Build ranking data / Reytinq məlumatlarını qur
        const rankingData = new Map<string, ProductRankingData>();
        
        for (const hit of searchResult.hits) {
          const product = products.find(p => p.id === hit.id);
          if (!product) continue;

          const orders = orderCounts.get(hit.id) || 0;
          const views = hit.reviewCount || 0; // Simplified / Sadələşdirilmiş
          const reviews = hit.reviewCount || 0;
          const sellerRating = hit.rating || 0;

          rankingData.set(hit.id, {
            productId: hit.id,
            relevanceScore: hit._rankingScore ? hit._rankingScore / 1000 : 0.5, // Normalize Meilisearch score / Meilisearch skorunu normallaşdır
            popularityScore: calculatePopularityScore(views, orders, reviews, 10000, maxOrders, 500),
            recencyScore: calculateRecencyScore(product.createdAt),
            sellerRatingScore: calculateSellerRatingScore(sellerRating),
            priceScore: calculatePriceScore(
              parseFloat(product.price.toString()),
              minPrice,
              maxPrice,
              isBudgetSearch
            ),
          });
        }

        // Rank results / Nəticələri reytinqlə
        rankedHits = rankSearchResults(
          searchResult.hits.map((hit: any) => ({ productId: hit.id, ...hit })),
          rankingData,
          params.rankingWeights
        ).map((item: any) => {
          const { productId, rankingScore, ...rest } = item;
          return rest;
        });
        
        // Apply pagination after ranking / Reytinqləmədən sonra pagination tətbiq et
        rankedHits = rankedHits.slice(offset, offset + limit);
      } catch (error) {
        logger.error('Failed to apply ranking / Reytinq tətbiq etmək uğursuz oldu', error);
        // Fallback to original results / Orijinal nəticələrə fallback
        rankedHits = searchResult.hits.slice(offset, offset + limit);
      }
    }

    return {
      hits: rankedHits,
      total: searchResult.estimatedTotalHits || 0,
      page,
      limit,
      totalPages: Math.ceil((searchResult.estimatedTotalHits || 0) / limit),
    };
  } catch (error) {
    logger.error('Search failed / Axtarış uğursuz oldu', error, { query: params.query });
    return null;
  }
}

/**
 * Get search suggestions / Axtarış təkliflərini al
 */
export async function getSearchSuggestions(query: string, limit: number = 5): Promise<string[]> {
  const client = getSearchClient();
  if (!client) {
    return [];
  }

  try {
    const index = client.index('products');
    const result = await index.search(query, {
      limit,
      attributesToRetrieve: ['name'],
    });

    // Extract unique product names / Unikal məhsul adlarını çıxar
    const suggestions = new Set<string>();
    result.hits.forEach((hit: any) => {
      if (hit.name) {
        suggestions.add(hit.name);
      }
    });

    return Array.from(suggestions).slice(0, limit);
  } catch (error) {
    logger.error('Failed to get search suggestions / Axtarış təkliflərini almaq uğursuz oldu', error);
    return [];
  }
}

