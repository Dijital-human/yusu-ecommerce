/**
 * API Version Middleware / API Versiya Middleware-i
 * Handles API versioning and backward compatibility
 * API versiyalaşdırma və geri uyğunluğu idarə edir
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';

/**
 * Supported API versions / Dəstəklənən API versiyaları
 */
export const SUPPORTED_VERSIONS = ['v1'] as const;
export type ApiVersion = typeof SUPPORTED_VERSIONS[number];
export const DEFAULT_VERSION: ApiVersion = 'v1';

/**
 * Version extraction from request / Sorğudan versiya çıxarılması
 */
export function extractVersion(request: NextRequest): ApiVersion | null {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Check if path starts with /api/v{version} / Yol /api/v{version} ilə başlayırmı yoxla
  const versionMatch = pathname.match(/^\/api\/(v\d+)\//);
  if (versionMatch) {
    const version = versionMatch[1] as ApiVersion;
    if (SUPPORTED_VERSIONS.includes(version)) {
      return version;
    }
  }

  // Check Accept header / Accept header-ı yoxla
  const acceptHeader = request.headers.get('accept');
  if (acceptHeader) {
    const versionMatch = acceptHeader.match(/version=(\w+)/);
    if (versionMatch) {
      const version = versionMatch[1] as ApiVersion;
      if (SUPPORTED_VERSIONS.includes(version)) {
        return version;
      }
    }
  }

  // Check custom header / Xüsusi header yoxla
  const apiVersionHeader = request.headers.get('x-api-version');
  if (apiVersionHeader) {
    const version = apiVersionHeader as ApiVersion;
    if (SUPPORTED_VERSIONS.includes(version)) {
      return version;
    }
  }

  return null;
}

/**
 * Get API version from request / Sorğudan API versiyasını al
 */
export function getApiVersion(request: NextRequest): ApiVersion {
  return extractVersion(request) || DEFAULT_VERSION;
}

/**
 * Check if version is deprecated / Versiyanın köhnəlmiş olub-olmadığını yoxla
 */
export function isVersionDeprecated(version: ApiVersion): boolean {
  // Currently no deprecated versions / Hal-hazırda köhnəlmiş versiya yoxdur
  return false;
}

/**
 * Get deprecation date for version / Versiya üçün köhnəlmə tarixini al
 */
export function getDeprecationDate(version: ApiVersion): string | null {
  // Currently no deprecated versions / Hal-hazırda köhnəlmiş versiya yoxdur
  return null;
}

/**
 * Add version headers to response / Cavaba versiya header-ləri əlavə et
 */
export function addVersionHeaders(
  response: NextResponse,
  version: ApiVersion,
  isDeprecated: boolean = false
): NextResponse {
  response.headers.set('X-API-Version', version);
  
  if (isDeprecated) {
    response.headers.set('X-API-Deprecated', 'true');
    const deprecationDate = getDeprecationDate(version);
    if (deprecationDate) {
      response.headers.set('X-API-Deprecation-Date', deprecationDate);
    }
    response.headers.set('X-API-Sunset', deprecationDate || '');
  }

  return response;
}

/**
 * Create versioned response / Versiyalaşdırılmış cavab yarat
 */
export function createVersionedResponse(
  data: any,
  version: ApiVersion,
  status: number = 200
): NextResponse {
  const response = NextResponse.json(data, { status });
  const isDeprecated = isVersionDeprecated(version);
  return addVersionHeaders(response, version, isDeprecated);
}

/**
 * Redirect to versioned endpoint / Versiyalaşdırılmış endpoint-ə yönləndir
 */
export function redirectToVersion(
  request: NextRequest,
  version: ApiVersion = DEFAULT_VERSION
): NextResponse {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Remove /api prefix if exists / Əgər varsa /api prefiksini sil
  let newPath = pathname.replace(/^\/api/, '');

  // Remove existing version if exists / Əgər varsa mövcud versiyanı sil
  newPath = newPath.replace(/^\/v\d+\//, '/');

  // Add version prefix / Versiya prefiksi əlavə et
  const versionedPath = `/api/${version}${newPath}`;

  // Preserve query parameters / Sorğu parametrlərini saxla
  const newUrl = new URL(versionedPath, request.url);
  url.searchParams.forEach((value, key) => {
    newUrl.searchParams.set(key, value);
  });

  logger.info('Redirecting to versioned endpoint / Versiyalaşdırılmış endpoint-ə yönləndirilir', {
    from: pathname,
    to: versionedPath,
    version,
  });

  return NextResponse.redirect(newUrl);
}

/**
 * Proxy request to versioned endpoint / Sorğunu versiyalaşdırılmış endpoint-ə proxy et
 * Use this for POST/PUT/DELETE requests / POST/PUT/DELETE request-lər üçün istifadə et
 */
export async function proxyToVersion(
  request: NextRequest,
  version: ApiVersion = DEFAULT_VERSION
): Promise<NextResponse> {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Remove /api prefix if exists / Əgər varsa /api prefiksini sil
  let newPath = pathname.replace(/^\/api/, '');

  // Remove existing version if exists / Əgər varsa mövcud versiyanı sil
  newPath = newPath.replace(/^\/v\d+\//, '/');

  // Add version prefix / Versiya prefiksi əlavə et
  const versionedPath = `/api/${version}${newPath}`;

  // Create new URL / Yeni URL yarat
  const newUrl = new URL(versionedPath, request.url);
  url.searchParams.forEach((value, key) => {
    newUrl.searchParams.set(key, value);
  });

  logger.info('Proxying to versioned endpoint / Versiyalaşdırılmış endpoint-ə proxy edilir', {
    from: pathname,
    to: versionedPath,
    version,
    method: request.method,
  });

  // Forward request to versioned endpoint / Sorğunu versiyalaşdırılmış endpoint-ə yönləndir
  try {
    const body = request.method !== 'GET' && request.method !== 'HEAD' 
      ? await request.text() 
      : undefined;

    const headers = new Headers(request.headers);
    headers.set('X-Forwarded-From', pathname);
    headers.set('X-API-Version', version);

    const response = await fetch(newUrl.toString(), {
      method: request.method,
      headers,
      body,
    });

    const responseBody = await response.text();
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('X-API-Version', version);
    responseHeaders.set('X-API-Deprecated', 'false');

    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    logger.error('Failed to proxy request / Sorğunu proxy etmək uğursuz oldu', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to proxy request / Sorğunu proxy etmək uğursuz oldu' },
      { status: 502 }
    );
  }
}

/**
 * Version middleware wrapper / Versiya middleware wrapper-i
 */
export function withVersioning(
  handler: (request: NextRequest, version: ApiVersion) => Promise<NextResponse> | NextResponse
) {
  return async (request: NextRequest) => {
    try {
      const version = getApiVersion(request);
      const isDeprecated = isVersionDeprecated(version);

      // Log version usage / Versiya istifadəsini log et
      logger.debug('API version request / API versiya sorğusu', {
        version,
        path: request.nextUrl.pathname,
        isDeprecated,
      });

      // Execute handler / Handler-i yerinə yetir
      const response = await handler(request, version);

      // Add version headers / Versiya header-ləri əlavə et
      return addVersionHeaders(response, version, isDeprecated);
    } catch (error) {
      logger.error('Version middleware error / Versiya middleware xətası', error instanceof Error ? error : new Error(String(error)));
      return NextResponse.json(
        { error: 'Internal server error / Daxili server xətası' },
        { status: 500 }
      );
    }
  };
}

