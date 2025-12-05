/**
 * Tracing Middleware / Tracing Middleware-si
 * Provides tracing wrapper for API routes
 * API route-lar üçün tracing wrapper təmin edir
 */

import { NextRequest, NextResponse } from 'next/server';
import { traceFunction, addSpanAttributes, recordSpanException } from '@/lib/monitoring/tracing';

/**
 * Wrap API route handler with tracing / API route handler-i tracing ilə wrap et
 */
export function withTracing<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T,
  routeName: string
): T {
  return (async (...args: Parameters<T>) => {
    const request = args[0] as NextRequest;
    
    return traceFunction(
      `api.${routeName}`,
      async (span) => {
        // Add request attributes / Request atributlarını əlavə et
        span.setAttribute('http.method', request.method);
        span.setAttribute('http.url', request.url);
        span.setAttribute('http.route', routeName);
        
        // Add headers if needed / Lazımdırsa header-ları əlavə et
        const userAgent = request.headers.get('user-agent');
        if (userAgent) {
          span.setAttribute('http.user_agent', userAgent);
        }
        
        const startTime = Date.now();
        
        try {
          const response = await handler(...args);
          const duration = Date.now() - startTime;
          
          span.setAttribute('http.status_code', response.status);
          span.setAttribute('http.duration', duration);
          
          if (response.status >= 400) {
            span.setStatus({
              code: response.status >= 500 ? 2 : 1, // ERROR or UNSET
            });
          }
          
          return response;
        } catch (error) {
          const duration = Date.now() - startTime;
          span.setAttribute('http.duration', duration);
          recordSpanException(error instanceof Error ? error : new Error(String(error)));
          throw error;
        }
      }
    ) as Promise<NextResponse>;
  }) as T;
}

