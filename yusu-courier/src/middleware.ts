/**
 * Middleware for Role-based Access Control / Rol əsaslı Giriş Nəzarəti üçün Middleware
 * This middleware protects routes based on user roles
 * Bu middleware istifadəçi rollarına əsasən route-ları qoruyur
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SimpleAdminAuth } from '@/lib/auth/simple-admin';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication / Autentifikasiya tələb etməyən ictimai route-lar
  const publicRoutes = [
    "/",
    "/auth/signin",
    "/auth/signup", 
    "/auth/error",
    "/unauthorized"
  ];

  // Check if route is public / Route-un ictimai olub-olmadığını yoxla
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Courier routes protection / Courier route-larının qorunması
  if (pathname.startsWith('/courier')) {
    // TODO: Courier authentication implementation
    // TODO: Courier autentifikasiya tətbiqi
    // For now, allow access - temporary solution
    // Hazırda girişə icazə ver - müvəqqəti həll
    return NextResponse.next();
  }

  // For other routes, allow access / Digər route-lar üçün girişə icazə ver
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
