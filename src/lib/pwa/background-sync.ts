/**
 * Background Sync Service / Background Sync Xidməti
 * Handles background synchronization of offline data
 * Offline məlumatların background sinxronizasiyasını idarə edir
 */

import { logger } from '@/lib/utils/logger';
import {
  getPendingSyncItems,
  updateSyncQueueItem,
  addToSyncQueue,
  type SyncQueueItem,
} from './offline-storage';

/**
 * Sync status interface / Sinxronizasiya statusu interfeysi
 */
export interface SyncStatus {
  isSyncing: boolean;
  pendingCount: number;
  lastSyncTime?: Date;
  error?: string;
}

/**
 * Sync status / Sinxronizasiya statusu
 */
let syncStatus: SyncStatus = {
  isSyncing: false,
  pendingCount: 0,
};

/**
 * Maximum retry attempts / Maksimum yenidən cəhd sayı
 */
const MAX_RETRY_ATTEMPTS = 3;

/**
 * Retry delay in milliseconds / Yenidən cəhd gecikməsi millisaniyələrdə
 */
const RETRY_DELAYS = [1000, 5000, 15000]; // 1s, 5s, 15s

/**
 * Register background sync / Background sync qeydiyyatı
 */
export async function registerBackgroundSync(tag: string): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('sync' in (self as any).registration)) {
    logger.warn('Background sync not supported / Background sync dəstəklənmir');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await (registration as any).sync.register(tag);
    logger.info('Background sync registered / Background sync qeydiyyatdan keçdi', { tag });
    return true;
  } catch (error) {
    logger.error('Failed to register background sync / Background sync qeydiyyatı uğursuz oldu', error);
    return false;
  }
}

/**
 * Process sync queue / Sinxronizasiya növbəsini işlə
 */
export async function processSyncQueue(): Promise<void> {
  if (syncStatus.isSyncing) {
    logger.debug('Sync already in progress / Sinxronizasiya artıq davam edir');
    return;
  }

  syncStatus.isSyncing = true;
  syncStatus.error = undefined;

  try {
    const pendingItems = await getPendingSyncItems();
    syncStatus.pendingCount = pendingItems.length;

    if (pendingItems.length === 0) {
      logger.debug('No pending items to sync / Sinxronizasiya üçün gözləyən element yoxdur');
      syncStatus.isSyncing = false;
      syncStatus.lastSyncTime = new Date();
      return;
    }

    logger.info('Processing sync queue / Sinxronizasiya növbəsi işlənir', {
      count: pendingItems.length,
    });

    // Process items sequentially / Elementləri ardıcıl işlə
    for (const item of pendingItems) {
      await syncItem(item);
    }

    syncStatus.isSyncing = false;
    syncStatus.lastSyncTime = new Date();
    syncStatus.pendingCount = (await getPendingSyncItems()).length;

    logger.info('Sync queue processed / Sinxronizasiya növbəsi işləndi', {
      lastSyncTime: syncStatus.lastSyncTime,
      remainingCount: syncStatus.pendingCount,
    });
  } catch (error) {
    syncStatus.isSyncing = false;
    syncStatus.error = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Sync queue processing failed / Sinxronizasiya növbəsi işləməsi uğursuz oldu', error);
  }
}

/**
 * Sync a single item / Tək elementi sinxronizasiya et
 */
async function syncItem(item: SyncQueueItem): Promise<void> {
  if (!item.id) {
    logger.warn('Sync item missing ID / Sinxronizasiya elementində ID yoxdur', item);
    return;
  }

  try {
    // Update status to syncing / Statusu sinxronizasiya olunur kimi yenilə
    await updateSyncQueueItem(item.id, { status: 'syncing' });

    // Perform sync based on type / Tipə görə sinxronizasiya yerinə yetir
    let success = false;

    switch (item.type) {
      case 'cart':
        success = await syncCartItem(item);
        break;
      case 'order':
        success = await syncOrderItem(item);
        break;
      case 'product':
        success = await syncProductItem(item);
        break;
      case 'category':
        success = await syncCategoryItem(item);
        break;
      default:
        logger.warn('Unknown sync item type / Naməlum sinxronizasiya elementi tipi', {
          type: item.type,
        });
    }

    if (success) {
      // Mark as completed / Tamamlandı kimi işarələ
      await updateSyncQueueItem(item.id, { status: 'completed' });
      logger.debug('Item synced successfully / Element uğurla sinxronizasiya edildi', {
        id: item.id,
        type: item.type,
      });
    } else {
      throw new Error('Sync failed / Sinxronizasiya uğursuz oldu');
    }
  } catch (error) {
    const retryCount = item.retryCount + 1;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (retryCount >= MAX_RETRY_ATTEMPTS) {
      // Max retries reached, mark as failed / Maksimum yenidən cəhd çatdı, uğursuz kimi işarələ
      await updateSyncQueueItem(item.id, {
        status: 'failed',
        retryCount,
        error: errorMessage,
      });
      logger.error('Item sync failed after max retries / Element maksimum yenidən cəhddən sonra uğursuz oldu', {
        id: item.id,
        retryCount,
        error: errorMessage,
      });
    } else {
      // Retry later / Daha sonra yenidən cəhd et
      await updateSyncQueueItem(item.id, {
        status: 'pending',
        retryCount,
        error: errorMessage,
      });
      logger.warn('Item sync failed, will retry / Element sinxronizasiyası uğursuz oldu, yenidən cəhd ediləcək', {
        id: item.id,
        retryCount,
        error: errorMessage,
      });

      // Schedule retry / Yenidən cəhd planlaşdır
      setTimeout(() => {
        processSyncQueue();
      }, RETRY_DELAYS[retryCount - 1] || 5000);
    }
  }
}

/**
 * Sync cart item / Səbət elementini sinxronizasiya et
 */
async function syncCartItem(item: SyncQueueItem): Promise<boolean> {
  try {
    const response = await fetch('/api/cart', {
      method: item.action === 'delete' ? 'DELETE' : item.action === 'update' ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item.data),
    });

    return response.ok;
  } catch (error) {
    logger.error('Failed to sync cart item / Səbət elementini sinxronizasiya etmək uğursuz oldu', error);
    return false;
  }
}

/**
 * Sync order item / Sifariş elementini sinxronizasiya et
 */
async function syncOrderItem(item: SyncQueueItem): Promise<boolean> {
  try {
    const url = item.action === 'delete' 
      ? `/api/orders/${item.data.id}`
      : '/api/orders';
    
    const response = await fetch(url, {
      method: item.action === 'delete' ? 'DELETE' : item.action === 'update' ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item.data),
    });

    return response.ok;
  } catch (error) {
    logger.error('Failed to sync order item / Sifariş elementini sinxronizasiya etmək uğursuz oldu', error);
    return false;
  }
}

/**
 * Sync product item / Məhsul elementini sinxronizasiya et
 */
async function syncProductItem(item: SyncQueueItem): Promise<boolean> {
  // Products are typically read-only from client / Məhsullar adətən client-dən yalnız oxunur
  // This is mainly for caching / Bu əsasən cache üçündür
  return true;
}

/**
 * Sync category item / Kateqoriya elementini sinxronizasiya et
 */
async function syncCategoryItem(item: SyncQueueItem): Promise<boolean> {
  // Categories are typically read-only from client / Kateqoriyalar adətən client-dən yalnız oxunur
  // This is mainly for caching / Bu əsasən cache üçündür
  return true;
}

/**
 * Get sync status / Sinxronizasiya statusunu al
 */
export async function getSyncStatus(): Promise<SyncStatus> {
  const pendingItems = await getPendingSyncItems();
  syncStatus.pendingCount = pendingItems.length;
  return { ...syncStatus };
}

/**
 * Queue item for sync / Elementi sinxronizasiya üçün növbəyə qoy
 */
export async function queueForSync(
  type: SyncQueueItem['type'],
  action: SyncQueueItem['action'],
  data: any
): Promise<void> {
  await addToSyncQueue({
    type,
    action,
    data,
  });

  // Trigger background sync if supported / Dəstəklənirsə background sync-i təmin et
  if ('serviceWorker' in navigator) {
    await registerBackgroundSync(`sync-${type}`);
  }

  // Process queue immediately if online / Əgər onlayndırsa növbəni dərhal işlə
  if (navigator.onLine) {
    processSyncQueue();
  }
}

/**
 * Start periodic sync / Dövri sinxronizasiyanı başlat
 */
export function startPeriodicSync(intervalMs: number = 60000): void {
  // Sync every minute by default / Default olaraq hər dəqiqə sinxronizasiya et
  setInterval(() => {
    if (navigator.onLine && !syncStatus.isSyncing) {
      processSyncQueue();
    }
  }, intervalMs);

  logger.info('Periodic sync started / Dövri sinxronizasiya başladı', { intervalMs });
}

/**
 * Stop periodic sync / Dövri sinxronizasiyanı dayandır
 */
let syncIntervalId: NodeJS.Timeout | null = null;

export function stopPeriodicSync(): void {
  if (syncIntervalId) {
    clearInterval(syncIntervalId);
    syncIntervalId = null;
    logger.info('Periodic sync stopped / Dövri sinxronizasiya dayandırıldı');
  }
}

