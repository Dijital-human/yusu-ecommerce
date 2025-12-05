/**
 * Database Read Replica / Veritabanı Read Replica
 * Provides read/write separation for database queries
 * Database sorğuları üçün read/write separation təmin edir
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '@/lib/utils/logger';

/**
 * Read replica configuration / Read replica konfiqurasiyası
 */
interface ReplicaConfig {
  enabled: boolean;
  replicaUrl?: string;
  connectionLimit?: number;
  poolTimeout?: number;
  connectTimeout?: number;
}

/**
 * Get replica configuration from environment / Environment-dən replica konfiqurasiyasını al
 */
function getReplicaConfig(): ReplicaConfig {
  return {
    enabled: process.env.DATABASE_REPLICA_ENABLED === 'true' && !!process.env.DATABASE_REPLICA_URL,
    replicaUrl: process.env.DATABASE_REPLICA_URL,
    connectionLimit: parseInt(process.env.DATABASE_REPLICA_CONNECTION_LIMIT || '10', 10),
    poolTimeout: parseInt(process.env.DATABASE_REPLICA_POOL_TIMEOUT || '10', 10),
    connectTimeout: parseInt(process.env.DATABASE_REPLICA_CONNECT_TIMEOUT || '5', 10),
  };
}

const config = getReplicaConfig();

/**
 * Optimize replica URL with connection pool parameters / Connection pool parametrləri ilə replica URL-i optimizasiya et
 */
function optimizeReplicaUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    
    // Add connection pool parameters if not present / Əgər yoxdursa connection pool parametrləri əlavə et
    if (!urlObj.searchParams.has('connection_limit')) {
      urlObj.searchParams.set('connection_limit', String(config.connectionLimit));
    }
    if (!urlObj.searchParams.has('pool_timeout')) {
      urlObj.searchParams.set('pool_timeout', String(config.poolTimeout));
    }
    if (!urlObj.searchParams.has('connect_timeout')) {
      urlObj.searchParams.set('connect_timeout', String(config.connectTimeout));
    }
    
    return urlObj.toString();
  } catch (error) {
    logger.error('Failed to optimize replica URL / Replica URL-i optimizasiya etmək uğursuz oldu', error instanceof Error ? error : new Error(String(error)));
    return url;
  }
}

/**
 * Read replica Prisma client instance / Read replica Prisma client instance
 */
let replicaPrisma: PrismaClient | null = null;

/**
 * Initialize read replica Prisma client / Read replica Prisma client-i işə sal
 */
function initializeReplicaClient(): PrismaClient | null {
  if (!config.enabled || !config.replicaUrl) {
    return null;
  }

  try {
    const optimizedUrl = optimizeReplicaUrl(config.replicaUrl);
    
    replicaPrisma = new PrismaClient({
      datasources: {
        db: {
          url: optimizedUrl,
        },
      },
      log: process.env.NODE_ENV === 'development' 
        ? ['query', 'error', 'warn'] 
        : ['error'],
    });

    logger.info('Read replica Prisma client initialized / Read replica Prisma client işə salındı', {
      enabled: config.enabled,
      connectionLimit: config.connectionLimit,
    });

    return replicaPrisma;
  } catch (error) {
    logger.error('Failed to initialize read replica Prisma client / Read replica Prisma client-i işə salmaq uğursuz oldu', error instanceof Error ? error : new Error(String(error)));
    return null;
  }
}

/**
 * Get read replica Prisma client / Read replica Prisma client-i al
 */
export function getReplicaPrisma(): PrismaClient | null {
  if (!config.enabled) {
    return null;
  }

  if (!replicaPrisma) {
    replicaPrisma = initializeReplicaClient();
  }

  return replicaPrisma;
}

/**
 * Health check for read replica / Read replica üçün health check
 */
export async function checkReplicaHealth(): Promise<{
  healthy: boolean;
  latency?: number;
  error?: string;
}> {
  if (!config.enabled || !replicaPrisma) {
    return {
      healthy: false,
      error: 'Read replica not enabled or not initialized / Read replica aktiv deyil və ya işə salınmayıb',
    };
  }

  try {
    const startTime = Date.now();
    await replicaPrisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - startTime;

    return {
      healthy: true,
      latency,
    };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Get replica connection pool metrics / Replica connection pool metrikalarını al
 */
export async function getReplicaPoolMetrics(): Promise<{
  enabled: boolean;
  activeConnections?: number;
  maxConnections?: number;
  poolTimeout?: number;
  connectTimeout?: number;
  utilizationPercent?: number;
  timestamp: string;
  error?: string;
}> {
  if (!config.enabled || !replicaPrisma) {
    return {
      enabled: false,
      timestamp: new Date().toISOString(),
    };
  }

  try {
    // Query PostgreSQL for connection pool statistics / Connection pool statistikaları üçün PostgreSQL sorğusu
    const result = await replicaPrisma.$queryRaw<Array<{
      count: bigint;
      state: string;
    }>>`
      SELECT count(*)::int as count, state
      FROM pg_stat_activity
      WHERE datname = current_database()
      GROUP BY state
    `;

    const activeConnections = result
      .filter((r) => r.state === 'active')
      .reduce((sum, r) => sum + Number(r.count), 0);

    const maxConnections = config.connectionLimit || 10;
    const utilizationPercent = maxConnections > 0 
      ? Math.round((activeConnections / maxConnections) * 100) 
      : 0;

    return {
      enabled: true,
      activeConnections,
      maxConnections,
      poolTimeout: config.poolTimeout,
      connectTimeout: config.connectTimeout,
      utilizationPercent,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      enabled: true,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Disconnect read replica Prisma client / Read replica Prisma client-i bağla
 */
export async function disconnectReplica(): Promise<void> {
  if (replicaPrisma) {
    try {
      await replicaPrisma.$disconnect();
      replicaPrisma = null;
      logger.info('Read replica Prisma client disconnected / Read replica Prisma client bağlandı');
    } catch (error) {
      logger.error('Failed to disconnect read replica Prisma client / Read replica Prisma client-i bağlamaq uğursuz oldu', error instanceof Error ? error : new Error(String(error)));
    }
  }
}

/**
 * Get replica configuration / Replica konfiqurasiyasını al
 */
export function getReplicaConfigPublic(): ReplicaConfig {
  return { ...config };
}

