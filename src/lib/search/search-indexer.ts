/**
 * Search Indexer Service / Axtarış İndeksləyici Xidməti
 * Handles product indexing for search engines
 * Axtarış mühərrikləri üçün məhsul indeksləməsini idarə edir
 */

import { getSearchClient, isSearchEngineEnabled } from './search-engine';
import { getReadClient } from '@/lib/db/query-client';
import { logger } from '@/lib/utils/logger';
import { MeiliSearch } from 'meilisearch';

/**
 * Index a single product / Tək məhsulu indekslə
 */
export async function indexProduct(productId: string): Promise<boolean> {
  if (!isSearchEngineEnabled()) {
    logger.debug('Search engine is not enabled, skipping indexing / Axtarış mühərriki aktiv deyil, indeksləmə atlanır');
    return false;
  }

  const client = getSearchClient();
  if (!client) {
    return false;
  }

  try {
    const prisma = await getReadClient();
    const product = await prisma.product.findUnique({
      where: { id: productId },
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
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });

    if (!product) {
      logger.warn(`Product not found for indexing: ${productId} / İndeksləmə üçün məhsul tapılmadı: ${productId}`);
      return false;
    }

    // Calculate average rating / Orta reytinqi hesabla
    const averageRating = product.reviews.length > 0
      ? product.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / product.reviews.length
      : 0;

    // Parse images if stored as string / Əgər string kimi saxlanıbsa şəkilləri parse et
    let images: string[] = [];
    if (product.images) {
      try {
        images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
      } catch {
        images = Array.isArray(product.images) ? product.images : [];
      }
    }

    // Prepare document for indexing / İndeksləmə üçün sənədi hazırla
    const document = {
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: parseFloat(product.price.toString()),
      originalPrice: product.originalPrice ? parseFloat(product.originalPrice.toString()) : null,
      images: images,
      categoryId: product.categoryId,
      category: {
        id: product.category.id,
        name: product.category.name,
      },
      sellerId: product.sellerId,
      seller: {
        id: product.seller.id,
        name: product.seller.name,
      },
      stock: product.stock,
      rating: averageRating,
      reviewCount: product.reviews.length,
      isActive: product.isActive,
      isPublished: product.isPublished,
      isApproved: product.isApproved,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };

    const index = client.index('products');
    await index.addDocuments([document], { primaryKey: 'id' });

    logger.info(`Product indexed successfully: ${productId} / Məhsul uğurla indeksləndi: ${productId}`);
    return true;
  } catch (error) {
    logger.error(`Failed to index product: ${productId} / Məhsul indeksləmə uğursuz oldu: ${productId}`, error);
    return false;
  }
}

/**
 * Remove a product from index / Məhsulu indeksdən sil
 */
export async function removeProductFromIndex(productId: string): Promise<boolean> {
  if (!isSearchEngineEnabled()) {
    return false;
  }

  const client = getSearchClient();
  if (!client) {
    return false;
  }

  try {
    const index = client.index('products');
    await index.deleteDocument(productId);

    logger.info(`Product removed from index: ${productId} / Məhsul indeksdən silindi: ${productId}`);
    return true;
  } catch (error) {
    logger.error(`Failed to remove product from index: ${productId} / Məhsulu indeksdən silmə uğursuz oldu: ${productId}`, error);
    return false;
  }
}

/**
 * Batch index products / Məhsulları batch şəklində indekslə
 */
export async function batchIndexProducts(productIds?: string[], batchSize: number = 100): Promise<{
  success: number;
  failed: number;
  total: number;
}> {
  if (!isSearchEngineEnabled()) {
    return { success: 0, failed: 0, total: 0 };
  }

  const client = getSearchClient();
  if (!client) {
    return { success: 0, failed: 0, total: 0 };
  }

  try {
    const prisma = await getReadClient();
    
    // If no product IDs provided, index all active products / Əgər məhsul ID-ləri verilməyibsə, bütün aktiv məhsulları indekslə
    let products;
    if (productIds && productIds.length > 0) {
      products = await prisma.product.findMany({
        where: {
          id: { in: productIds },
        },
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
            },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
        },
      });
    } else {
      products = await prisma.product.findMany({
        where: {
          isActive: true,
        },
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
            },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
        },
        take: 10000, // Limit to prevent memory issues / Yaddaş problemlərini qarşısını almaq üçün limit
      });
    }

    const index = client.index('products');
    let success = 0;
    let failed = 0;

    // Process in batches / Batch-lər halında emal et
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      
      const documents = batch.map((product: any) => {
        const averageRating = product.reviews.length > 0
          ? product.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / product.reviews.length
          : 0;

        let images: string[] = [];
        if (product.images) {
          try {
            images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
          } catch {
            images = Array.isArray(product.images) ? product.images : [];
          }
        }

        return {
          id: product.id,
          name: product.name,
          description: product.description || '',
          price: parseFloat(product.price.toString()),
          originalPrice: product.originalPrice ? parseFloat(product.originalPrice.toString()) : null,
          images: images,
          categoryId: product.categoryId,
          category: {
            id: product.category.id,
            name: product.category.name,
          },
          sellerId: product.sellerId,
          seller: {
            id: product.seller.id,
            name: product.seller.name,
          },
          stock: product.stock,
          rating: averageRating,
          reviewCount: product.reviews.length,
          isActive: product.isActive,
          isPublished: product.isPublished,
          isApproved: product.isApproved,
          createdAt: product.createdAt.toISOString(),
          updatedAt: product.updatedAt.toISOString(),
        };
      });

      try {
        await index.addDocuments(documents, { primaryKey: 'id' });
        success += batch.length;
        logger.info(`Batch indexed ${batch.length} products (${success}/${products.length}) / Batch indeksləndi ${batch.length} məhsul (${success}/${products.length})`);
      } catch (error) {
        failed += batch.length;
        logger.error(`Failed to index batch (${i}-${i + batch.length}) / Batch indeksləmə uğursuz oldu (${i}-${i + batch.length})`, error);
      }
    }

    logger.info(`Batch indexing completed: ${success} succeeded, ${failed} failed / Batch indeksləmə tamamlandı: ${success} uğurlu, ${failed} uğursuz`);
    return { success, failed, total: products.length };
  } catch (error) {
    logger.error('Failed to batch index products / Məhsulları batch indeksləmə uğursuz oldu', error);
    return { success: 0, failed: 0, total: 0 };
  }
}

/**
 * Initialize search index settings / Axtarış indeks tənzimlərini başlat
 */
export async function initializeSearchIndex(): Promise<boolean> {
  if (!isSearchEngineEnabled()) {
    return false;
  }

  const client = getSearchClient();
  if (!client) {
    return false;
  }

  try {
    const index = client.index('products');

    // Configure searchable attributes / Axtarış edilə bilən atributları konfiqurasiya et
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
      'price',
      'rating',
      'stock',
      'isActive',
      'isPublished',
      'isApproved',
    ]);

    // Configure sortable attributes / Sıralana bilən atributları konfiqurasiya et
    await index.updateSortableAttributes([
      'price',
      'rating',
      'createdAt',
      'updatedAt',
      'stock',
    ]);

    // Configure ranking rules / Ranking qaydalarını konfiqurasiya et
    await index.updateRankingRules([
      'words',
      'typo',
      'proximity',
      'attribute',
      'sort',
      'exactness',
    ]);

    // Configure typo tolerance / Typo tolerantlığını konfiqurasiya et
    await index.updateTypoTolerance({
      enabled: true,
      minWordSizeForTypos: {
        oneTypo: 4,
        twoTypos: 8,
      },
    });

    logger.info('Search index initialized successfully / Axtarış indeksi uğurla başlatıldı');
    return true;
  } catch (error) {
    logger.error('Failed to initialize search index / Axtarış indeksini başlatmaq uğursuz oldu', error);
    return false;
  }
}

