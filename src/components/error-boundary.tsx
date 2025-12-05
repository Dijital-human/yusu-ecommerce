/**
 * Error Boundary Component / Error Boundary Komponenti
 * Catches React errors and displays user-friendly error messages
 * React xətalarını tutur və istifadəçi dostu xəta mesajları göstərir
 */

"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { AlertCircle, RefreshCw, Home, Bug } from "lucide-react";
import * as Sentry from "@sentry/nextjs";
import { logger } from "@/lib/utils/logger";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

/**
 * Error Boundary Class Component / Error Boundary Class Komponenti
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI / Növbəti render fallback UI göstərsin deyə state-i yenilə
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console / Xətanı console-a log et
    logger.error("Error Boundary caught an error / Error Boundary xəta tutdu", {
      error,
      errorInfo,
    });

    // Report to Sentry / Sentry-ə bildir
    const errorId = Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
      tags: {
        errorBoundary: true,
      },
    });

    this.setState({
      error,
      errorInfo,
      errorId,
    });

    // Call custom error handler / Xüsusi xəta handler-ını çağır
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI / Xüsusi fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI / Default xəta UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertCircle className="h-8 w-8 text-red-500" />
                <CardTitle className="text-2xl">
                  Something went wrong / Nəsə səhv getdi
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error / Xəta</AlertTitle>
                <AlertDescription>
                  {this.state.error?.message ||
                    "An unexpected error occurred / Gözlənilməz xəta baş verdi"}
                </AlertDescription>
              </Alert>

              {this.state.errorId && (
                <div className="text-sm text-gray-500">
                  Error ID: {this.state.errorId} (Reported to Sentry / Sentry-ə bildirildi)
                </div>
              )}

              {process.env.NODE_ENV === "development" && this.state.errorInfo && (
                <details className="mt-4 p-4 bg-gray-100 rounded-lg">
                  <summary className="cursor-pointer font-medium text-sm">
                    Error Details (Development Only) / Xəta Detalları (Yalnız İnkişaf)
                  </summary>
                  <pre className="mt-2 text-xs overflow-auto max-h-64">
                    {this.state.error?.stack}
                    {"\n\n"}
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}

              <div className="flex flex-wrap gap-3 pt-4">
                <Button onClick={this.handleReset} variant="default">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again / Yenidən Cəhd Et
                </Button>
                <Button onClick={this.handleReload} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Page / Səhifəni Yenilə
                </Button>
                <Button onClick={this.handleGoHome} variant="outline">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home / Ana Səhifəyə Get
                </Button>
                {this.state.errorId && (
                  <Button
                    onClick={() => {
                      // Copy error ID to clipboard / Xəta ID-sini clipboard-a kopyala
                      navigator.clipboard.writeText(this.state.errorId || "");
                    }}
                    variant="ghost"
                    size="sm"
                  >
                    <Bug className="h-4 w-4 mr-2" />
                    Copy Error ID / Xəta ID-sini Kopyala
                  </Button>
                )}
              </div>

              <div className="mt-4 text-sm text-gray-600">
                <p>
                  If this problem persists, please contact support / Əgər bu problem davam edərsə, dəstəklə əlaqə saxlayın
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC for Error Boundary / Error Boundary üçün HOC
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundaryComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

/**
 * Hook for error recovery / Xəta bərpası üçün hook
 */
export function useErrorRecovery() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error: Error) => {
    setError(error);
    logger.error("Error caught in hook / Hook-da tutulan xəta", error);
  }, []);

  return {
    error,
    resetError,
    handleError,
    hasError: !!error,
  };
}

