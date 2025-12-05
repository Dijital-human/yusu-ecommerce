/**
 * Database Connection Utility / Veritabanı Bağlantı Utility-si
 * This utility provides a singleton Prisma client instance with optimized connection pooling
 * Bu utility optimizasiya edilmiş connection pooling ilə singleton Prisma client instance təmin edir
 * 
 * Uses @yusu/shared-db for common database utilities
 * Ümumi veritabanı utility-ləri üçün @yusu/shared-db istifadə edir
 */

import { PrismaClient } from '@prisma/client';
import { createPrismaClient, testDatabaseConnection as sharedTestConnection, reconnectDatabase as sharedReconnectDatabase, disconnectDatabase as sharedDisconnectDatabase, healthCheck as sharedHealthCheck } from '@yusu/shared-db';
import { logger } from './utils/logger';

/**
 * Get optimized connection pool configuration / Optimizasiya edilmiş connection pool konfiqurasiyasını al
 * Connection pool parametrləri environment variables-dan gəlir və ya default dəyərlər istifadə olunur
 */
function getConnectionPoolConfig() {
  // Connection pool parametrləri / Connection pool parametrləri
  const connectionLimit = parseInt(process.env.DATABASE_CONNECTION_LIMIT || '10', 10);
  const poolTimeout = parseInt(process.env.DATABASE_POOL_TIMEOUT || '10', 10);
  const connectTimeout = parseInt(process.env.DATABASE_CONNECT_TIMEOUT || '5', 10);

  return {
    connectionLimit,
    poolTimeout,
    connectTimeout,
  };
}

// Create Prisma client instance with optimized connection pooling / Optimizasiya edilmiş connection pooling ilə Prisma client instance yarat
// Uses shared-db package for client creation / Client yaratmaq üçün shared-db package istifadə edir
export const prisma = createPrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  // Connection pool optimizasiyası DATABASE_URL-də query parametrləri ilə təmin edilir
  // Connection pool optimization is provided via query parameters in DATABASE_URL
  // Example: DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=10&connect_timeout=5"
});

// Database connection test function / Veritabanı bağlantı test funksiyası
// Uses shared-db package / shared-db package istifadə edir
export async function testDatabaseConnection() {
  return sharedTestConnection(prisma, {
    info: logger.info.bind(logger),
    error: logger.error.bind(logger),
  });
}

// Reconnect database with retry logic / Retry məntiqı ilə veritabanını yenidən bağla
// Uses shared-db package / shared-db package istifadə edir
export async function reconnectDatabase(maxRetries: number = 3): Promise<boolean> {
  return sharedReconnectDatabase(prisma, maxRetries, {
    info: logger.info.bind(logger),
    error: logger.error.bind(logger),
  });
}

// Graceful shutdown function / Zərif bağlanma funksiyası
// Uses shared-db package / shared-db package istifadə edir
export async function disconnectDatabase() {
  return sharedDisconnectDatabase(prisma, {
    info: logger.info.bind(logger),
    error: logger.error.bind(logger),
  });
}

// Health check function / Sağlamlıq yoxlama funksiyası
// Uses shared-db package / shared-db package istifadə edir
export async function healthCheck() {
  return sharedHealthCheck(prisma, {
    autoReconnect: true,
    logger: {
      error: logger.error.bind(logger),
    },
  });
}

/**
 * Get connection pool metrics / Connection pool metrikalarını al
 * Returns information about current connection pool usage / Hazırkı connection pool istifadəsi haqqında məlumat qaytarır
 */
export async function getConnectionPoolMetrics() {
  try {
    const poolConfig = getConnectionPoolConfig();
    
    // PostgreSQL connection pool metrics / PostgreSQL connection pool metrikaları
    // Note: Prisma doesn't expose direct pool metrics, but we can query PostgreSQL directly
    // Qeyd: Prisma birbaşa pool metrikalarını açıqlamır, amma biz PostgreSQL-ə birbaşa sorğu göndərə bilərik
    const result = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT count(*) as count 
      FROM pg_stat_activity 
      WHERE datname = current_database() 
      AND state = 'active'
    `;
    
    const activeConnections = Number(result[0]?.count || 0);
    
    return {
      activeConnections,
      maxConnections: poolConfig.connectionLimit,
      poolTimeout: poolConfig.poolTimeout,
      connectTimeout: poolConfig.connectTimeout,
      utilizationPercent: (activeConnections / poolConfig.connectionLimit) * 100,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error('Failed to get connection pool metrics', error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Optimize DATABASE_URL with connection pool parameters / Connection pool parametrləri ilə DATABASE_URL-i optimizasiya et
 * This function ensures DATABASE_URL includes optimal connection pool settings
 * Bu funksiya DATABASE_URL-in optimal connection pool parametrləri ilə təmin olunduğunu təmin edir
 */
export function optimizeDatabaseUrl(databaseUrl: string): string {
  try {
    const url = new URL(databaseUrl);
    const poolConfig = getConnectionPoolConfig();
    
    // Add connection pool parameters if not present / Əgər mövcud deyilsə connection pool parametrlərini əlavə et
    url.searchParams.set('connection_limit', poolConfig.connectionLimit.toString());
    url.searchParams.set('pool_timeout', poolConfig.poolTimeout.toString());
    url.searchParams.set('connect_timeout', poolConfig.connectTimeout.toString());
    
    return url.toString();
  } catch (error) {
    logger.error('Failed to optimize DATABASE_URL', error);
    return databaseUrl; // Return original URL if optimization fails / Əgər optimizasiya uğursuz olarsa orijinal URL-i qaytar
  }
}

// Export default prisma client / Prisma client-i default olaraq export et
export default prisma;

// Export as db for compatibility / Uyğunluq üçün db kimi export et
export const db = prisma;
