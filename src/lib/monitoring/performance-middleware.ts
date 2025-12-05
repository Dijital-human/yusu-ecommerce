/**
 * Performance Monitoring Middleware / Performans Monitorinq Middleware-i
 * Middleware for tracking API response times
 * API cavab vaxtlarını izləmək üçün middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { trackAPIResponseTime } from './performance';

/**
 * Performance monitoring middleware wrapper / Performans monitorinq middleware wrapper
 */
export function withPerformanceMonitoring(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now();
    const url = new URL(request.url);
    const endpoint = url.pathname;
    const method = request.method;

    try {
      const response = await handler(request);
      const responseTime = Date.now() - startTime;

      // Track API response time / API cavab vaxtını izlə
      trackAPIResponseTime(
        endpoint,
        method,
        responseTime,
        response.status,
        undefined, // userId - can be extracted from request if needed / userId - lazım olsa request-dən çıxarıla bilər
        {
          url: request.url,
          userAgent: request.headers.get('user-agent') || undefined,
        }
      );

      // Add performance headers / Performans header-ləri əlavə et
      response.headers.set('X-Response-Time', `${responseTime}ms`);

      return response;
    } catch (error) {
      const responseTime = Date.now() - startTime;

      // Track error response time / Xəta cavab vaxtını izlə
      trackAPIResponseTime(
        endpoint,
        method,
        responseTime,
        500,
        undefined,
        {
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      );

      throw error;
    }
  };
}

