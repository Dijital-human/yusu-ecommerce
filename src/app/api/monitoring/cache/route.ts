/**
 * Cache Monitoring API Route / Cache Monitorinq API Route-u
 * Provides cache performance metrics and statistics
 * Cache performans metrikaları və statistikalar təmin edir
 */

import { NextRequest, NextResponse } from "next/server";
import { getCacheMetrics, getCacheMetricsSummary, resetCacheMetrics } from "@/lib/cache/cache-metrics";
import { handleApiError } from "@/lib/api/error-handler";
import { successResponse, badRequestResponse } from "@/lib/api/response";
import { requireAuth, requireAdmin } from "@/lib/api/middleware";
import { getRedisClient } from "@/lib/cache/redis";

/**
 * GET /api/monitoring/cache - Get cache metrics / Cache metrikalarını al
 * 
 * Query parameters:
 * - summary: boolean (default: false) - Return summary only / Yalnız xülasə qaytar
 * - reset: boolean (default: false) - Reset metrics after returning / Metrikaları qaytardıqdan sonra sıfırla
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication (optional, can be public for internal monitoring) / Autentifikasiya yoxla (opsional, daxili monitorinq üçün public ola bilər)
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) {
      // If not authenticated, return basic metrics only / Əgər autentifikasiya edilməyibsə, yalnız əsas metrikaları qaytar
      const summary = getCacheMetricsSummary();
      return NextResponse.json({
        ...summary,
        timestamp: new Date().toISOString(),
      });
    }

    const { searchParams } = new URL(request.url);
    const summaryOnly = searchParams.get('summary') === 'true';
    const shouldReset = searchParams.get('reset') === 'true';

    // Get Redis info if available / Mövcuddursa Redis məlumatlarını al
    let redisInfo = null;
    try {
      const redis = getRedisClient();
      if (redis) {
        const info = await redis.info('stats');
        const memoryInfo = await redis.info('memory');
        
        // Parse Redis info / Redis məlumatlarını parse et
        const statsMatch = info.match(/keyspace_hits:(\d+)/);
        const missesMatch = info.match(/keyspace_misses:(\d+)/);
        const memoryMatch = memoryInfo.match(/used_memory:(\d+)/);
        
        redisInfo = {
          keyspaceHits: statsMatch ? parseInt(statsMatch[1], 10) : 0,
          keyspaceMisses: missesMatch ? parseInt(missesMatch[1], 10) : 0,
          usedMemory: memoryMatch ? parseInt(memoryMatch[1], 10) : 0,
          usedMemoryHuman: memoryMatch ? `${(parseInt(memoryMatch[1], 10) / 1024 / 1024).toFixed(2)} MB` : '0 MB',
        };
      }
    } catch (redisError) {
      // Redis info is optional / Redis məlumatları opsionaldır
      console.warn('Failed to get Redis info / Redis məlumatlarını almaq uğursuz oldu', redisError);
    }

    // Get cache metrics / Cache metrikalarını al
    const metrics = summaryOnly ? getCacheMetricsSummary() : getCacheMetrics();

    // Reset metrics if requested / Tələb olunarsa metrikaları sıfırla
    if (shouldReset) {
      const { user } = authResult;
      const roleCheck = requireAdmin(user);
      if (roleCheck) {
        return roleCheck; // Only admin can reset / Yalnız admin sıfırlaya bilər
      }
      resetCacheMetrics();
    }

    return successResponse({
      metrics,
      redis: redisInfo,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error, "get cache metrics");
  }
}

/**
 * POST /api/monitoring/cache/reset - Reset cache metrics / Cache metrikalarını sıfırla
 * Requires admin authentication / Admin autentifikasiyası tələb olunur
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;
    
    // Check if user is admin / İstifadəçinin admin olduğunu yoxla
    const roleCheck = requireAdmin(user);
    if (roleCheck) return roleCheck;

    // Reset cache metrics / Cache metrikalarını sıfırla
    resetCacheMetrics();

    return successResponse({
      message: 'Cache metrics reset successfully / Cache metrikaları uğurla sıfırlandı',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error, "reset cache metrics");
  }
}

