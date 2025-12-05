/**
 * Health Check API Route / Sağlamlıq Yoxlama API Route-u
 * This endpoint provides health check information for monitoring
 * Bu endpoint monitorinq üçün sağlamlıq yoxlama məlumatları təmin edir
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma, getConnectionPoolMetrics } from "@/lib/db";
import { getReplicaPoolMetrics, checkReplicaHealth } from "@/lib/db/replica";
import { logger } from "@/lib/utils/logger";

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Check database connection / Veritabanı bağlantısını yoxla
    let dbStatus = 'healthy';
    let dbResponseTime = 0;
    let connectionPoolMetrics = null;
    let replicaHealth = null;
    let replicaPoolMetrics = null;
    
    try {
      const dbStartTime = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      dbResponseTime = Date.now() - dbStartTime;
      
      // Get connection pool metrics / Connection pool metrikalarını al
      try {
        connectionPoolMetrics = await getConnectionPoolMetrics();
      } catch (poolError) {
        logger.warn('Failed to get connection pool metrics / Connection pool metrikalarını almaq uğursuz oldu', poolError instanceof Error ? poolError : new Error(String(poolError)));
      }
      
      // Get replica health and metrics if enabled / Əgər aktivdirsə replica health və metrikalarını al
      try {
        replicaHealth = await checkReplicaHealth();
        replicaPoolMetrics = await getReplicaPoolMetrics();
      } catch (replicaError) {
        // Silently fail if replica is not configured / Əgər replica konfiqurasiya edilməyibsə səssizcə uğursuz ol
      }
    } catch (error) {
      dbStatus = 'unhealthy';
      logger.error('Database health check failed / Veritabanı sağlamlıq yoxlaması uğursuz', error);
    }

    const responseTime = Date.now() - startTime;

    // Check environment variables / Mühit dəyişənlərini yoxla
    const envStatus = {
      NODE_ENV: process.env.NODE_ENV || 'development',
      DATABASE_URL: process.env.DATABASE_URL ? 'configured' : 'missing',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'configured' : 'missing',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'not set',
    };

    // Determine overall health status / Ümumi sağlamlıq statusunu təyin et
    const overallStatus = dbStatus === 'healthy' ? 'healthy' : 'unhealthy';

    const healthData = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: `${responseTime}ms`,
      version: process.env.npm_package_version || '1.0.0',
      environment: envStatus,
      services: {
        database: {
          status: dbStatus,
          responseTime: `${dbResponseTime}ms`,
          ...(connectionPoolMetrics && !connectionPoolMetrics.error && {
            connectionPool: connectionPoolMetrics,
          }),
          ...(replicaHealth && {
            replica: {
              healthy: replicaHealth.healthy,
              ...(replicaHealth.latency && { latency: `${replicaHealth.latency}ms` }),
              ...(replicaHealth.error && { error: replicaHealth.error }),
            },
          }),
          ...(replicaPoolMetrics && replicaPoolMetrics.enabled && {
            replicaPool: replicaPoolMetrics,
          }),
        },
        api: {
          status: 'healthy',
          responseTime: `${responseTime}ms`,
        },
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
      },
    };

    // Return appropriate status code / Uyğun status kodu qaytar
    const statusCode = overallStatus === 'healthy' ? 200 : 503;

    return NextResponse.json(healthData, { status: statusCode });

  } catch (error) {
    logger.error('Health check error / Sağlamlıq yoxlama xətası', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Internal server error / Daxili server xətası',
        message: 'Health check failed / Sağlamlıq yoxlaması uğursuz',
      },
      { status: 503 }
    );
  }
}
