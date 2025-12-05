/**
 * Middleware for Role-based Access Control and i18n / Rol əsaslı Giriş Nəzarəti və i18n üçün Middleware
 * This middleware protects routes based on user roles and handles internationalization
 * Bu middleware istifadəçi rollarına əsasən route-ları qoruyur və beynəlxalqlaşdırmayı idarə edir
 */

import createMiddleware from 'next-intl/middleware';
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { routing } from './i18n/routing';

// Create next-intl middleware / next-intl middleware yarat
const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Edge caching for static assets / Statik assetlər üçün edge caching
  if (
    pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)
  ) {
    const response = NextResponse.next();
    // Cache static assets for 1 year / Statik assetləri 1 il cache et
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    
    // Production security headers / Production təhlükəsizlik başlıqları
    if (process.env.NODE_ENV === 'production') {
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('X-XSS-Protection', '1; mode=block');
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    }
    
    return response;
  }

  // Edge caching for API responses / API cavabları üçün edge caching
  if (pathname.startsWith('/api/products') || pathname.startsWith('/api/categories')) {
    const response = NextResponse.next();
    // Cache API responses for 5 minutes / API cavablarını 5 dəqiqə cache et
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return response;
  }

  // Skip API routes, static files, and Next.js internals / API route-ları, statik faylları və Next.js daxili fayllarını keç
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    const response = NextResponse.next();
    // Set cache headers for API routes / API route-lar üçün cache başlıqları təyin et
    if (pathname.startsWith('/api/')) {
      response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    }
    return response;
  }

  // Handle i18n routing first / Əvvəlcə i18n routing-i idarə et
  const response = intlMiddleware(request);

  // Extract locale from pathname / Pathname-dən dil çıxar
  const locale = routing.locales.find(
    (loc) => pathname.startsWith(`/${loc}/`) || pathname === `/${loc}`
  ) || routing.defaultLocale;

  // Remove locale from pathname for route checking / Route yoxlaması üçün pathname-dən dili çıxar
  const pathnameWithoutLocale = pathname.replace(`/${locale}`, '') || '/';

  // Public routes that don't require authentication / Autentifikasiya tələb etməyən ictimai route-lar
  const publicRoutes = [
    "/",
    "/products",
    "/categories",
    "/search",
    "/about",
    "/contact",
    "/auth/signin",
    "/auth/signup",
    "/auth/error",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/verify-email",
    "/unauthorized"
  ];

  // Check if route is public / Route-un ictimai olub-olmadığını yoxla
  if (publicRoutes.some(route => pathnameWithoutLocale.startsWith(route))) {
    return response;
  }

  // Protected routes - require authentication / Qorunan route-lar - autentifikasiya tələb edir
  if (
    pathnameWithoutLocale.startsWith('/dashboard') ||
    pathnameWithoutLocale.startsWith('/orders') ||
    pathnameWithoutLocale.startsWith('/profile') ||
    pathnameWithoutLocale.startsWith('/checkout')
  ) {
    try {
      // Get session token / Sessiya token-ini al
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      });

      // If no token, redirect to sign in / Token yoxdursa, sign in-ə yönləndir
      if (!token) {
        const signInUrl = new URL(`/${locale}/auth/signin`, request.url);
        signInUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(signInUrl);
      }

      // Check if user role is CUSTOMER / İstifadəçi rolu CUSTOMER olub-olmadığını yoxla
      if (token.role && token.role !== 'CUSTOMER') {
        const unauthorizedUrl = new URL(`/${locale}/unauthorized`, request.url);
        return NextResponse.redirect(unauthorizedUrl);
      }

      return response;
    } catch (error) {
      console.error('Middleware authentication error:', error);
      // On error, redirect to sign in / Xəta olduqda, sign in-ə yönləndir
      const signInUrl = new URL(`/${locale}/auth/signin`, request.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  // For other routes, allow access / Digər route-lar üçün girişə icazə ver
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - files with extensions (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
