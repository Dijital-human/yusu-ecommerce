/**
 * Monitoring Dashboard API Route / Monitorinq Dashboard API Route-u
 * Provides aggregated monitoring metrics for real-time dashboard
 * Real-time dashboard üçün aqreqat monitorinq metrikaları təmin edir
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { getCacheMetricsSummary } from "@/lib/cache/cache-metrics";
import { getAPIPerformanceStats, getDatabasePerformanceStats } from "@/lib/monitoring/performance";
import { getConnectionPoolMetrics } from "@/lib/db";
import { getRedisClient } from "@/lib/cache/redis";
import { prisma } from "@/lib/db";

/**
 * GET /api/monitoring/dashboard - Get dashboard metrics / Dashboard metrikalarını al
 * Returns aggregated metrics for real-time monitoring dashboard
 * Real-time monitoring dashboard üçün aqreqat metrikaları qaytarır
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;
    
    // Check if user is admin / İstifadəçinin admin olduğunu yoxla
    const roleCheck = requireAdmin(user);
    if (roleCheck) return roleCheck;

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("timeRange") || "1h"; // 1h, 6h, 24h, 7d
    const now = new Date();
    const startDate = getStartDateForRange(timeRange, now);

    // Collect all metrics in parallel / Bütün metrikaları paralel topla
    const [
      cacheMetrics,
      apiStats,
      dbStats,
      dbPoolMetrics,
      redisInfo,
      systemStats,
    ] = await Promise.all([
      // Cache metrics / Cache metrikaları
      Promise.resolve(getCacheMetricsSummary()),
      
      // API performance stats / API performans statistikaları
      Promise.resolve(getAPIPerformanceStats(undefined, startDate, now)),
      
      // Database performance stats / Veritabanı performans statistikaları
      Promise.resolve(getDatabasePerformanceStats(undefined, startDate, now)),
      
      // Database connection pool metrics / Veritabanı connection pool metrikaları
      Promise.resolve(getConnectionPoolMetrics()),
      
      // Redis info / Redis məlumatları
      getRedisInfo(),
      
      // System stats / Sistem statistikaları
      getSystemStats(),
    ]);

    return successResponse({
      timestamp: now.toISOString(),
      timeRange,
      period: {
        start: startDate.toISOString(),
        end: now.toISOString(),
      },
      cache: {
        ...cacheMetrics,
        timestamp: now.toISOString(),
      },
      api: {
        ...apiStats,
        timestamp: now.toISOString(),
      },
      database: {
        ...dbStats,
        pool: dbPoolMetrics,
        timestamp: now.toISOString(),
      },
      redis: redisInfo,
      system: systemStats,
    });
  } catch (error) {
    return handleApiError(error, "fetch dashboard metrics");
  }
}

/**
 * Get start date for time range / Zaman aralığı üçün başlanğıc tarixi al
 */
function getStartDateForRange(timeRange: string, now: Date): Date {
  const startDate = new Date(now);
  
  switch (timeRange) {
    case "1h":
      startDate.setHours(startDate.getHours() - 1);
      break;
    case "6h":
      startDate.setHours(startDate.getHours() - 6);
      break;
    case "24h":
      startDate.setHours(startDate.getHours() - 24);
      break;
    case "7d":
      startDate.setDate(startDate.getDate() - 7);
      break;
    case "30d":
      startDate.setDate(startDate.getDate() - 30);
      break;
    default:
      startDate.setHours(startDate.getHours() - 1);
  }
  
  return startDate;
}

/**
 * Get Redis info / Redis məlumatlarını al
 */
async function getRedisInfo() {
  try {
    const redis = getRedisClient();
    if (!redis) {
      return {
        available: false,
        error: "Redis client not available / Redis client mövcud deyil",
      };
    }

    const [info, memoryInfo, stats] = await Promise.all([
      redis.info('server'),
      redis.info('memory'),
      redis.info('stats'),
    ]);

    // Parse Redis info / Redis məlumatlarını parse et
    const uptimeMatch = info.match(/uptime_in_seconds:(\d+)/);
    const memoryMatch = memoryInfo.match(/used_memory:(\d+)/);
    const memoryPeakMatch = memoryInfo.match(/used_memory_peak:(\d+)/);
    const hitsMatch = stats.match(/keyspace_hits:(\d+)/);
    const missesMatch = stats.match(/keyspace_misses:(\d+)/);
    const keysMatch = memoryInfo.match(/db0:keys=(\d+)/);

    const hits = hitsMatch ? parseInt(hitsMatch[1], 10) : 0;
    const misses = missesMatch ? parseInt(missesMatch[1], 10) : 0;
    const total = hits + misses;
    const hitRate = total > 0 ? (hits / total) * 100 : 0;

    return {
      available: true,
      uptime: uptimeMatch ? parseInt(uptimeMatch[1], 10) : 0,
      memory: {
        used: memoryMatch ? parseInt(memoryMatch[1], 10) : 0,
        usedHuman: memoryMatch ? `${(parseInt(memoryMatch[1], 10) / 1024 / 1024).toFixed(2)} MB` : '0 MB',
        peak: memoryPeakMatch ? parseInt(memoryPeakMatch[1], 10) : 0,
        peakHuman: memoryPeakMatch ? `${(parseInt(memoryPeakMatch[1], 10) / 1024 / 1024).toFixed(2)} MB` : '0 MB',
      },
      stats: {
        hits,
        misses,
        total,
        hitRate: hitRate.toFixed(2),
      },
      keys: keysMatch ? parseInt(keysMatch[1], 10) : 0,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      available: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Get system stats / Sistem statistikalarını al
 */
async function getSystemStats() {
  try {
    // Get basic database stats / Əsas veritabanı statistikalarını al
    const [productCount, orderCount, userCount, categoryCount] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.user.count(),
      prisma.category.count(),
    ]);

    // Get recent activity / Son aktivliyi al
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);

    const [recentOrders, recentUsers] = await Promise.all([
      prisma.order.count({
        where: {
          createdAt: {
            gte: last24Hours,
          },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: last24Hours,
          },
        },
      }),
    ]);

    return {
      counts: {
        products: productCount,
        orders: orderCount,
        users: userCount,
        categories: categoryCount,
      },
      recent: {
        orders24h: recentOrders,
        users24h: recentUsers,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    };
  }
}

