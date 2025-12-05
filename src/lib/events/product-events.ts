/**
 * Product Events / Məhsul Event-ləri
 * Product-related event handlers and utilities
 * Məhsulla bağlı event handler-ləri və utility-lər
 */

import { emit } from './event-bus';
import { on } from './event-bus';
import { invalidateProductCache, invalidateRelatedCaches } from '@/lib/cache/cache-invalidator';
import { indexProduct } from '@/lib/search/search-engine';
import { emitRealtimeEvent } from '@/lib/realtime/sse';
import { emitStockUpdate, emitPriceUpdate, emitNewProductNotification } from '@/lib/realtime/realtime-service';
import { logger } from '@/lib/utils/logger';
import { prisma } from '@/lib/db';
import type { Event } from './types';

/**
 * Emit product created event / Məhsul yaradıldı event-i emit et
 */
export function emitProductCreated(product: any, sellerId: string, requestId?: string): void {
  emit('product.created', {
    productId: product.id,
    name: product.name,
    sellerId,
    categoryId: product.categoryId,
    price: product.price,
    stock: product.stock,
  }, {
    userId: sellerId,
    requestId,
    priority: 'normal',
  });
}

/**
 * Emit product updated event / Məhsul yeniləndi event-i emit et
 */
export function emitProductUpdated(productId: string, updates: any, sellerId?: string, requestId?: string): void {
  emit('product.updated', {
    productId,
    updates,
  }, {
    userId: sellerId,
    requestId,
    priority: 'normal',
  });
}

/**
 * Emit product deleted event / Məhsul silindi event-i emit et
 */
export function emitProductDeleted(productId: string, sellerId?: string, requestId?: string): void {
  emit('product.deleted', {
    productId,
  }, {
    userId: sellerId,
    requestId,
    priority: 'high',
  });
}

/**
 * Emit product stock low event / Məhsul stoku aşağı event-i emit et
 */
export function emitProductStockLow(productId: string, currentStock: number, threshold: number, sellerId?: string, requestId?: string): void {
  emit('product.stock.low', {
    productId,
    currentStock,
    threshold,
  }, {
    userId: sellerId,
    requestId,
    priority: 'high',
  });
}

/**
 * Emit product stock out event / Məhsul stoku bitdi event-i emit et
 */
export function emitProductStockOut(productId: string, sellerId?: string, requestId?: string): void {
  emit('product.stock.out', {
    productId,
  }, {
    userId: sellerId,
    requestId,
    priority: 'critical',
  });
}

/**
 * Register product event handlers / Məhsul event handler-lərini qeydiyyatdan keçir
 */
export function registerProductEventHandlers(): void {
  // Product created handler / Məhsul yaradıldı handler-i
  on('product.created', async (event: Event) => {
    try {
      const { productId, categoryId } = event.payload;

      // Invalidate cache / Cache-i invalidate et
      try {
        await invalidateProductCache(productId);
        await invalidateRelatedCaches('product', productId, {
          categoryId,
        });
      } catch (error) {
        logger.error('Failed to invalidate cache / Cache-i invalidate etmək uğursuz oldu', error instanceof Error ? error : new Error(String(error)), {
          productId,
        });
      }

      // Index product in search engine / Məhsulu search engine-də index et
      try {
        await indexProduct(productId);
      } catch (error) {
        logger.error('Failed to index product / Məhsulu index etmək uğursuz oldu', error instanceof Error ? error : new Error(String(error)), {
          productId,
        });
      }

      // Emit real-time event / Real-time event emit et
      try {
        await emitNewProductNotification(productId);
      } catch (error) {
        logger.error('Failed to emit real-time event / Real-time event emit etmək uğursuz oldu', error instanceof Error ? error : new Error(String(error)), {
          productId,
        });
      }
    } catch (error) {
      logger.error('Product created event handler failed / Məhsul yaradıldı event handler-i uğursuz oldu', error instanceof Error ? error : new Error(String(error)), {
        eventType: event.type,
      });
    }
  }, {
    priority: 'normal',
    async: true,
  });

  // Product updated handler / Məhsul yeniləndi handler-i
  on('product.updated', async (event: Event) => {
    try {
      const { productId, updates } = event.payload;

      // Invalidate cache / Cache-i invalidate et
      try {
        await invalidateProductCache(productId);
        
        // If category changed, invalidate both old and new category caches / Əgər kateqoriya dəyişibsə, həm köhnə həm də yeni kateqoriya cache-lərini ləğv et
        if (updates.categoryId || updates.oldCategoryId) {
          await invalidateRelatedCaches('product', productId, {
            categoryId: updates.categoryId,
            oldCategoryId: updates.oldCategoryId,
          });
        } else {
          await invalidateRelatedCaches('product', productId);
        }
      } catch (error) {
        logger.error('Failed to invalidate cache / Cache-i invalidate etmək uğursuz oldu', error instanceof Error ? error : new Error(String(error)), {
          productId,
        });
      }

      // Update search index / Search index-i yenilə
      try {
        await indexProduct(productId);
      } catch (error) {
        logger.error('Failed to update search index / Search index-i yeniləmək uğursuz oldu', error instanceof Error ? error : new Error(String(error)), {
          productId,
        });
      }

      // Emit real-time events based on updates / Yeniləmələrə görə real-time event-lər emit et
      try {
        // Get previous values for comparison / Müqayisə üçün əvvəlki dəyərləri al
        const previousProduct = await prisma.products.findUnique({
          where: { id: productId },
          select: { stock: true, price: true },
        });

        if (updates.stock !== undefined && previousProduct) {
          await emitStockUpdate(productId, updates.stock, previousProduct.stock);
        }
        if (updates.price !== undefined && previousProduct) {
          await emitPriceUpdate(productId, parseFloat(updates.price.toString()), parseFloat(previousProduct.price.toString()));
        }
      } catch (error) {
        logger.error('Failed to emit real-time event / Real-time event emit etmək uğursuz oldu', error instanceof Error ? error : new Error(String(error)), {
          productId,
        });
      }
    } catch (error) {
      logger.error('Product updated event handler failed / Məhsul yeniləndi event handler-i uğursuz oldu', error instanceof Error ? error : new Error(String(error)), {
        eventType: event.type,
      });
    }
  }, {
    priority: 'normal',
    async: true,
  });

  // Product deleted handler / Məhsul silindi handler-i
  on('product.deleted', async (event: Event) => {
    try {
      const { productId } = event.payload;

      // Invalidate cache / Cache-i invalidate et
      try {
        await invalidateProductCache(productId);
        await invalidateRelatedCaches('product', productId);
      } catch (error) {
        logger.error('Failed to invalidate cache / Cache-i invalidate etmək uğursuz oldu', error instanceof Error ? error : new Error(String(error)), {
          productId,
        });
      }

      // Remove from search index / Search index-dən sil
      try {
        // Note: Search engine should handle product deletion / Qeyd: Search engine məhsul silinməsini idarə etməlidir
        // This might require a separate deleteProduct function / Bu ayrı deleteProduct funksiyası tələb edə bilər
      } catch (error) {
        logger.error('Failed to remove product from search index / Məhsulu search index-dən silmək uğursuz oldu', error instanceof Error ? error : new Error(String(error)), {
          productId,
        });
      }
    } catch (error) {
      logger.error('Product deleted event handler failed / Məhsul silindi event handler-i uğursuz oldu', error instanceof Error ? error : new Error(String(error)), {
        eventType: event.type,
      });
    }
  }, {
    priority: 'high',
    async: true,
  });

  // Product stock low handler / Məhsul stoku aşağı handler-i
  on('product.stock.low', async (event: Event) => {
    try {
      const { productId, currentStock, threshold } = event.payload;

      // Log warning / Xəbərdarlıq log et
      logger.warn('Product stock is low / Məhsul stoku aşağıdır', {
        productId,
        currentStock,
        threshold,
      });

      // TODO: Send notification to seller / Satıcıya bildiriş göndər
      // TODO: Send alert if critical / Əgər kritikdirsə alert göndər
    } catch (error) {
      logger.error('Product stock low event handler failed / Məhsul stoku aşağı event handler-i uğursuz oldu', error instanceof Error ? error : new Error(String(error)), {
        eventType: event.type,
      });
    }
  }, {
    priority: 'high',
    async: true,
  });

  // Product stock out handler / Məhsul stoku bitdi handler-i
  on('product.stock.out', async (event: Event) => {
    try {
      const { productId } = event.payload;

      // Log critical warning / Kritik xəbərdarlıq log et
      logger.error('Product stock is out / Məhsul stoku bitdi', {
        productId,
      });

      // TODO: Send critical alert to seller / Satıcıya kritik alert göndər
      // TODO: Update product status to out of stock / Məhsul statusunu stokda yox kimi yenilə
    } catch (error) {
      logger.error('Product stock out event handler failed / Məhsul stoku bitdi event handler-i uğursuz oldu', error instanceof Error ? error : new Error(String(error)), {
        eventType: event.type,
      });
    }
  }, {
    priority: 'critical',
    async: true,
  });

  logger.info('Product event handlers registered / Məhsul event handler-ləri qeydiyyatdan keçdi');
}

