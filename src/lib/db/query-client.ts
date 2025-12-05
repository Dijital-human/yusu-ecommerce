/**
 * Query Client Helper / Sorğu Client Köməkçisi
 * Provides read/write separation for database queries
 * Database sorğuları üçün read/write separation təmin edir
 * 
 * Uses lazy initialization to avoid Prisma client initialization issues during build
 * Build zamanı Prisma client initialization problemlərindən qaçmaq üçün lazy initialization istifadə edir
 */

import { prisma } from '@/lib/db';
import { getReplicaPrisma } from './replica';

/**
 * Get Prisma client for read operations / Read əməliyyatları üçün Prisma client-i al
 * Returns replica client if enabled, otherwise returns primary client
 * Əgər aktivdirsə replica client qaytarır, əks halda primary client qaytarır
 */
export async function getReadClient() {
  try {
    const replicaClient = getReplicaPrisma();
    if (replicaClient) {
      // Test connection before returning / Qaytarmadan əvvəl bağlantını test et
      try {
        await replicaClient.$queryRaw`SELECT 1`;
        return replicaClient;
      } catch (error) {
        // Replica connection failed, fallback to primary / Replica bağlantısı uğursuz oldu, primary-yə keç
        console.warn('Replica connection failed, using primary / Replica bağlantısı uğursuz oldu, primary istifadə olunur:', error);
      }
    }
  } catch (error) {
    // If replica fails, fallback to primary / Əgər replica uğursuz olarsa, primary-yə keç
    console.warn('Replica client initialization failed, using primary / Replica client işə salmaq uğursuz oldu, primary istifadə olunur:', error);
  }
  
  // Test primary connection / Primary bağlantını test et
  try {
    await prisma.$queryRaw`SELECT 1`;
    return prisma;
  } catch (error) {
    // Primary connection also failed / Primary bağlantısı da uğursuz oldu
    console.error('Primary database connection failed / Primary veritabanı bağlantısı uğursuz oldu:', error);
    // Still return prisma client - let the calling function handle the error
    // Hələ də prisma client qaytar - çağıran funksiya xətanı idarə etsin
    return prisma;
  }
}

/**
 * Get Prisma client for write operations / Write əməliyyatları üçün Prisma client-i al
 * Always returns primary client for write operations
 * Write əməliyyatları üçün həmişə primary client qaytarır
 */
export async function getWriteClient() {
  return prisma;
}

/**
 * Execute read operation / Read əməliyyatını yerinə yetir
 * Automatically uses replica if enabled / Əgər aktivdirsə avtomatik olaraq replica istifadə edir
 */
export async function executeRead<T>(
  operation: (client: any) => Promise<T>
): Promise<T> {
  const readClient = await getReadClient();
  return operation(readClient);
}

/**
 * Execute write operation / Write əməliyyatını yerinə yetir
 * Always uses primary client / Həmişə primary client istifadə edir
 */
export async function executeWrite<T>(
  operation: (client: any) => Promise<T>
): Promise<T> {
  const writeClient = await getWriteClient();
  return operation(writeClient);
}

