/**
 * API Middleware / API Middleware
 * Authentication and authorization helpers for API routes
 * API route-ları üçün autentifikasiya və yetkiləndirmə köməkçiləri
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";

export interface AuthContext {
  session: any;
  user: {
    id: string;
    email: string;
    name?: string;
    role: string;
  };
}

/**
 * Require authentication for API route
 * API route üçün autentifikasiya tələb et
 */
export async function requireAuth(request: NextRequest): Promise<AuthContext | NextResponse> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized / Yetkisiz" },
      { status: 401 }
    );
  }

  // Ensure email exists / Email-in mövcud olduğundan əmin ol
  if (!session.user.email) {
    return NextResponse.json(
      { success: false, error: "User email not found / İstifadəçi email-i tapılmadı" },
      { status: 401 }
    );
  }

  return {
    session,
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name || undefined,
      role: (session.user as any).role || "USER",
    },
  };
}

/**
 * Require specific role(s) for API route
 * API route üçün müəyyən rol(lar) tələb et
 */
export function requireRole(user: any, roles: string[]): NextResponse | null {
  if (!roles.includes(user.role)) {
    return NextResponse.json(
      { success: false, error: "Forbidden / Qadağandır" },
      { status: 403 }
    );
  }
  return null;
}

/**
 * Require admin role
 * Admin rolunu tələb et
 */
export function requireAdmin(user: any): NextResponse | null {
  return requireRole(user, ["ADMIN"]);
}

/**
 * Require seller role
 * Satıcı rolunu tələb et
 */
export function requireSeller(user: any): NextResponse | null {
  return requireRole(user, ["SELLER", "ADMIN"]);
}

/**
 * Require courier role
 * Kuryer rolunu tələb et
 */
export function requireCourier(user: any): NextResponse | null {
  return requireRole(user, ["COURIER", "ADMIN"]);
}

/**
 * Wrapper for authenticated API routes
 * Autentifikasiya olunmuş API route-ları üçün wrapper
 */
export function withAuth<T extends any[]>(
  handler: (
    request: NextRequest,
    context: AuthContext,
    ...args: T
  ) => Promise<NextResponse>,
  options?: {
    roles?: string[];
    requireAdmin?: boolean;
    requireSeller?: boolean;
    requireCourier?: boolean;
  }
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const authResult = await requireAuth(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Check role requirements / Rol tələblərini yoxla
    if (options?.requireAdmin) {
      const adminCheck = requireAdmin(user);
      if (adminCheck) return adminCheck;
    }

    if (options?.requireSeller) {
      const sellerCheck = requireSeller(user);
      if (sellerCheck) return sellerCheck;
    }

    if (options?.requireCourier) {
      const courierCheck = requireCourier(user);
      if (courierCheck) return courierCheck;
    }

    if (options?.roles && options.roles.length > 0) {
      const roleCheck = requireRole(user, options.roles);
      if (roleCheck) return roleCheck;
    }

    return handler(request, authResult, ...args);
  };
}

