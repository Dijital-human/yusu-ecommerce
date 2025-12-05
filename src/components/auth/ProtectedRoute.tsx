/**
 * Protected Route Component / Qorunan Route Komponenti
 * This component protects routes based on user roles and permissions
 * Bu komponent istifadəçi rolları və icazələri əsasında route-ları qoruyur
 */

"use client";

import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  Shield, 
  Lock, 
  AlertTriangle,
  ArrowLeft,
  User
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string | string[];
  requiredPermission?: {
    action: string;
    resource: string;
  };
  fallback?: ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredRole,
  requiredPermission,
  fallback,
  redirectTo = "/unauthorized",
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { can, canAccess } = usePermissions();
  const t = useTranslations("common");
  const tAuth = useTranslations("auth");

  // Show loading state / Yükləmə vəziyyətini göstər
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">{t("loading")}...</p>
        </div>
      </div>
    );
  }

  // Check authentication / Autentifikasiyanı yoxla
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {tAuth("authenticationRequired")}
            </h2>
            <p className="text-gray-600 mb-4">
              {tAuth("pleaseSignIn")}
            </p>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/auth/signin">
                  {tAuth("signIn")}
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/">
                  {t("goHome")}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check role requirement / Rol tələbini yoxla
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const hasRequiredRole = roles.includes(user.role);

    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <Shield className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {tAuth("accessDenied")}
              </h2>
              <p className="text-gray-600 mb-4">
                {tAuth("noPermission")}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Required: {roles.join(" or ")}
                <br />
                Your role: {user.role}
              </p>
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link href="/">
                    {t("goHome")}
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/profile">
                    {t("viewProfile")}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  // Check permission requirement / İcazə tələbini yoxla
  if (requiredPermission) {
    const hasPermission = can(requiredPermission.action, requiredPermission.resource);

    if (!hasPermission) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {tAuth("accessDenied")}
              </h2>
              <p className="text-gray-600 mb-4">
                {tAuth("noPermission")}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Required: {requiredPermission.action} on {requiredPermission.resource}
              </p>
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link href="/">
                    {t("goHome")}
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/profile">
                    {t("viewProfile")}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  // Render children if all checks pass / Bütün yoxlamalar keçərsə uşaqları render et
  return <>{children}</>;
}

// Higher-order component for role protection / Rol qorunması üçün yüksək səviyyəli komponent
export function withRoleProtection(
  WrappedComponent: React.ComponentType<any>,
  requiredRole: string | string[]
) {
  return function RoleProtectedComponent(props: any) {
    return (
      <ProtectedRoute requiredRole={requiredRole}>
        <WrappedComponent {...props} />
      </ProtectedRoute>
    );
  };
}

// Higher-order component for permission protection / İcazə qorunması üçün yüksək səviyyəli komponent
export function withPermissionProtection(
  WrappedComponent: React.ComponentType<any>,
  requiredPermission: {
    action: string;
    resource: string;
  }
) {
  return function PermissionProtectedComponent(props: any) {
    return (
      <ProtectedRoute requiredPermission={requiredPermission}>
        <WrappedComponent {...props} />
      </ProtectedRoute>
    );
  };
}
