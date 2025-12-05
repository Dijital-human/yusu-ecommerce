/**
 * Offline Storage Service / Offline Storage Xidməti
 * Provides IndexedDB integration for offline data storage and sync
 * Offline məlumat saxlama və sinxronizasiya üçün IndexedDB inteqrasiyası təmin edir
 */

import { logger } from '@/lib/utils/logger';

/**
 * Database name and version / Veritabanı adı və versiyası
 */
const DB_NAME = 'yusu_offline_db';
const DB_VERSION = 1;

/**
 * Store names / Store adları
 */
const STORES = {
  CART: 'cart',
  ORDERS: 'orders',
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  SYNC_QUEUE: 'sync_queue',
} as const;

/**
 * Database instance / Veritabanı instance
 */
let dbInstance: IDBDatabase | null = null;

/**
 * Initialize IndexedDB / IndexedDB-ni işə sal
 */
export async function initOfflineStorage(): Promise<IDBDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      logger.error('Failed to open IndexedDB / IndexedDB açmaq uğursuz oldu', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      logger.info('IndexedDB opened successfully / IndexedDB uğurla açıldı');
      resolve(dbInstance!);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create stores / Store-ları yarat
      if (!db.objectStoreNames.contains(STORES.CART)) {
        const cartStore = db.createObjectStore(STORES.CART, { keyPath: 'id' });
        cartStore.createIndex('userId', 'userId', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.ORDERS)) {
        const ordersStore = db.createObjectStore(STORES.ORDERS, { keyPath: 'id' });
        ordersStore.createIndex('userId', 'userId', { unique: false });
        ordersStore.createIndex('status', 'status', { unique: false });
        ordersStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.PRODUCTS)) {
        const productsStore = db.createObjectStore(STORES.PRODUCTS, { keyPath: 'id' });
        productsStore.createIndex('categoryId', 'categoryId', { unique: false });
        productsStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.CATEGORIES)) {
        db.createObjectStore(STORES.CATEGORIES, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id', autoIncrement: true });
        syncStore.createIndex('type', 'type', { unique: false });
        syncStore.createIndex('status', 'status', { unique: false });
        syncStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      logger.info('IndexedDB stores created / IndexedDB store-ları yaradıldı');
    };
  });
}

/**
 * Save data to offline storage / Məlumatı offline storage-a yadda saxla
 */
export async function saveToOfflineStorage<T>(
  storeName: string,
  data: T | T[],
  key?: string
): Promise<void> {
  try {
    const db = await initOfflineStorage();
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    if (Array.isArray(data)) {
      // Save multiple items / Çoxlu elementləri yadda saxla
      await Promise.all(
        data.map((item: any) => {
          const itemWithTimestamp = {
            ...item,
            savedAt: new Date().toISOString(),
            synced: false,
          };
          return new Promise<void>((resolve, reject) => {
            const request = store.put(itemWithTimestamp);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
          });
        })
      );
    } else {
      // Save single item / Tək elementi yadda saxla
      const itemWithTimestamp = {
        ...(data as any),
        savedAt: new Date().toISOString(),
        synced: false,
      };
      await new Promise<void>((resolve, reject) => {
        const request = key ? store.put(itemWithTimestamp, key) : store.put(itemWithTimestamp);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }

    logger.debug(`Data saved to offline storage / Məlumat offline storage-a yadda saxlandı`, {
      storeName,
      count: Array.isArray(data) ? data.length : 1,
    });
  } catch (error) {
    logger.error('Failed to save to offline storage / Offline storage-a yadda saxlamaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Get data from offline storage / Offline storage-dan məlumat al
 */
export async function getFromOfflineStorage<T>(
  storeName: string,
  key?: string
): Promise<T | T[] | null> {
  try {
    const db = await initOfflineStorage();
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);

    if (key) {
      // Get single item / Tək elementi al
      return new Promise<T | null>((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } else {
      // Get all items / Bütün elementləri al
      return new Promise<T[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    }
  } catch (error) {
    logger.error('Failed to get from offline storage / Offline storage-dan almaq uğursuz oldu', error);
    return null;
  }
}

/**
 * Delete data from offline storage / Offline storage-dan məlumat sil
 */
export async function deleteFromOfflineStorage(storeName: string, key: string): Promise<void> {
  try {
    const db = await initOfflineStorage();
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    await new Promise<void>((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    logger.debug(`Data deleted from offline storage / Məlumat offline storage-dan silindi`, {
      storeName,
      key,
    });
  } catch (error) {
    logger.error('Failed to delete from offline storage / Offline storage-dan silmək uğursuz oldu', error);
    throw error;
  }
}

/**
 * Sync queue item interface / Sinxronizasiya növbəsi elementi interfeysi
 */
export interface SyncQueueItem {
  id?: number;
  type: 'cart' | 'order' | 'product' | 'category';
  action: 'create' | 'update' | 'delete';
  data: any;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  retryCount: number;
  createdAt: string;
  lastAttempt?: string;
  error?: string;
}

/**
 * Add item to sync queue / Sinxronizasiya növbəsinə element əlavə et
 */
export async function addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'status' | 'retryCount' | 'createdAt'>): Promise<void> {
  try {
    const syncItem: SyncQueueItem = {
      ...item,
      status: 'pending',
      retryCount: 0,
      createdAt: new Date().toISOString(),
    };

    await saveToOfflineStorage(STORES.SYNC_QUEUE, syncItem);
    logger.debug('Item added to sync queue / Element sinxronizasiya növbəsinə əlavə edildi', {
      type: syncItem.type,
      action: syncItem.action,
    });
  } catch (error) {
    logger.error('Failed to add to sync queue / Sinxronizasiya növbəsinə əlavə etmək uğursuz oldu', error);
    throw error;
  }
}

/**
 * Get pending sync queue items / Gözləyən sinxronizasiya növbəsi elementlərini al
 */
export async function getPendingSyncItems(): Promise<SyncQueueItem[]> {
  try {
    const db = await initOfflineStorage();
    const transaction = db.transaction([STORES.SYNC_QUEUE], 'readonly');
    const store = transaction.objectStore(STORES.SYNC_QUEUE);
    const index = store.index('status');

    return new Promise<SyncQueueItem[]>((resolve, reject) => {
      const request = index.getAll('pending');
      request.onsuccess = () => {
        const items = request.result || [];
        resolve(items);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    logger.error('Failed to get pending sync items / Gözləyən sinxronizasiya elementlərini almaq uğursuz oldu', error);
    return [];
  }
}

/**
 * Update sync queue item status / Sinxronizasiya növbəsi elementi statusunu yenilə
 */
export async function updateSyncQueueItem(
  id: number,
  updates: Partial<SyncQueueItem>
): Promise<void> {
  try {
    const db = await initOfflineStorage();
    const transaction = db.transaction([STORES.SYNC_QUEUE], 'readwrite');
    const store = transaction.objectStore(STORES.SYNC_QUEUE);

    const item = await new Promise<SyncQueueItem | null>((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });

    if (!item) {
      throw new Error('Sync queue item not found / Sinxronizasiya növbəsi elementi tapılmadı');
    }

    const updatedItem: SyncQueueItem = {
      ...item,
      ...updates,
      lastAttempt: updates.status === 'syncing' ? new Date().toISOString() : item.lastAttempt,
    };

    await new Promise<void>((resolve, reject) => {
      const request = store.put(updatedItem);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    logger.debug('Sync queue item updated / Sinxronizasiya növbəsi elementi yeniləndi', {
      id,
      status: updatedItem.status,
    });
  } catch (error) {
    logger.error('Failed to update sync queue item / Sinxronizasiya növbəsi elementini yeniləmək uğursuz oldu', error);
    throw error;
  }
}

/**
 * Resolve conflicts between local and server data / Lokal və server məlumatları arasında konfliktləri həll et
 */
export async function resolveConflict<T>(
  localData: T,
  serverData: T,
  strategy: 'local' | 'server' | 'merge' = 'server'
): Promise<T> {
  if (strategy === 'local') {
    return localData;
  }

  if (strategy === 'server') {
    return serverData;
  }

  // Merge strategy: Combine both, preferring server data / Merge strategiyası: Hər ikisini birləşdir, server məlumatına üstünlük ver
  return {
    ...localData,
    ...serverData,
  } as T;
}

/**
 * Clear offline storage / Offline storage-ı təmizlə
 */
export async function clearOfflineStorage(storeName?: string): Promise<void> {
  try {
    const db = await initOfflineStorage();

    if (storeName) {
      // Clear specific store / Müəyyən store-u təmizlə
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      await new Promise<void>((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } else {
      // Clear all stores / Bütün store-ları təmizlə
      const storeNames = Object.values(STORES);
      const transaction = db.transaction(storeNames, 'readwrite');

      await Promise.all(
        storeNames.map(
          (name) =>
            new Promise<void>((resolve, reject) => {
              const request = transaction.objectStore(name).clear();
              request.onsuccess = () => resolve();
              request.onerror = () => reject(request.error);
            })
        )
      );
    }

    logger.info('Offline storage cleared / Offline storage təmizləndi', { storeName });
  } catch (error) {
    logger.error('Failed to clear offline storage / Offline storage-ı təmizləmək uğursuz oldu', error);
    throw error;
  }
}

