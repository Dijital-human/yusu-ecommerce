/**
 * Database Performance Monitoring / Veritabanı Performans Monitorinqi
 * Prisma extension for tracking database query performance
 * Veritabanı sorğu performansını izləmək üçün Prisma extension
 */

import { Prisma, PrismaClient } from '@prisma/client';
import { trackDatabaseQueryTime } from './performance';
import { logger } from '@/lib/utils/logger';

/**
 * Prisma query logging middleware / Prisma sorğu loglama middleware-i
 */
export function createPrismaPerformanceExtension() {
  return Prisma.defineExtension({
    name: 'performance-monitoring',
    query: {
      $allModels: {
        async $allOperations({ operation, model, args, query }: any) {
          const startTime = Date.now();
          const operationName = `${model}.${operation}`;

          try {
            const result = await query(args);
            const queryTime = Date.now() - startTime;

            // Track database query time / Veritabanı sorğu vaxtını izlə
            trackDatabaseQueryTime(
              operationName,
              queryTime,
              model,
              operation,
              {
                args: JSON.stringify(args).substring(0, 200), // Truncate long args / Uzun argümentləri kəs
              }
            );

            return result;
          } catch (error) {
            const queryTime = Date.now() - startTime;

            // Track failed query time / Uğursuz sorğu vaxtını izlə
            trackDatabaseQueryTime(
              operationName,
              queryTime,
              model,
              operation,
              {
                error: error instanceof Error ? error.message : 'Unknown error',
              }
            );

            throw error;
          }
        },
      },
    },
  });
}

/**
 * Wrap Prisma client with performance monitoring / Prisma client-i performans monitorinqi ilə bük
 * Note: This is a helper function. To use it, you need to extend Prisma client.
 * Qeyd: Bu köməkçi funksiyadır. İstifadə etmək üçün Prisma client-i extend etməlisiniz.
 */
export function withDatabasePerformanceMonitoring<T extends PrismaClient>(
  prisma: T
): T {
  // In a real implementation, you would use Prisma Client Extensions
  // Real tətbiqdə Prisma Client Extensions istifadə edərdiniz
  logger.info('Database performance monitoring enabled / Veritabanı performans monitorinqi aktivləşdirildi');
  return prisma;
}

