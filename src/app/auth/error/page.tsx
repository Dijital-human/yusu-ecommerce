"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "Configuration":
        return {
          title: "Configuration Error / Konfiqurasiya Xətası",
          description: "There is a problem with the server configuration. Please contact support. / Server konfiqurasiyasında problem var. Dəstək ilə əlaqə saxlayın.",
        };
      case "AccessDenied":
        return {
          title: "Access Denied / Giriş Rədd Edildi",
          description: "You do not have permission to sign in. / Giriş icazəniz yoxdur.",
        };
      case "Verification":
        return {
          title: "Verification Error / Doğrulama Xətası",
          description: "The verification token has expired or has already been used. / Doğrulama token-i müddəti bitib və ya artıq istifadə edilib.",
        };
      case "Callback":
        return {
          title: "Callback Error / Callback Xətası",
          description: "There was an error during the authentication process. This usually happens when the OAuth provider configuration is incorrect. / Autentifikasiya prosesində xəta baş verdi. Bu adətən OAuth provider konfiqurasiyası yanlış olduqda baş verir.",
        };
      case "Default":
        return {
          title: "Authentication Error / Autentifikasiya Xətası",
          description: "An error occurred during authentication. Please try again. / Autentifikasiya zamanı xəta baş verdi. Yenidən cəhd edin.",
        };
      default:
        return {
          title: "Unknown Error / Naməlum Xəta",
          description: "An unknown error occurred. Please try again or contact support. / Naməlum xəta baş verdi. Yenidən cəhd edin və ya dəstək ilə əlaqə saxlayın.",
        };
    }
  };

  const errorInfo = getErrorMessage(error);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card className="shadow-2xl border-0">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                {errorInfo.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800">
                  {errorInfo.description}
                </AlertDescription>
              </Alert>

              {error && (
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Error Code / Xəta Kodu:</p>
                  <code className="text-sm font-mono text-gray-800">{error}</code>
                </div>
              )}

              <div className="space-y-3">
                <Button
                  onClick={() => window.location.reload()}
                  className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again / Yenidən Cəhd Et
                </Button>
                
                <Link href="/auth/signin">
                  <Button
                    variant="outline"
                    className="w-full h-12 border-gray-300 hover:bg-gray-50"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Sign In / Giriş Səhifəsinə Qayıt
                  </Button>
                </Link>
              </div>

              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  Need help? / Kömək lazımdır?{" "}
                  <Link href="/contact" className="text-orange-600 hover:text-orange-500 font-semibold">
                    Contact Support / Dəstək ilə Əlaqə
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full">
            <Card className="shadow-2xl border-0">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Loading... / Yüklənir...
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">Please wait while we load the error details. / Xəta təfərrüatlarını yükləyərkən gözləyin.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}
