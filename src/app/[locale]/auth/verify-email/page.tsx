"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Mail, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
      // Automatically verify email when token is present / Token mövcud olduqda avtomatik email təsdiq et
      handleVerification(tokenParam);
    }
  }, [searchParams]);

  const handleVerification = async (verificationToken: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/auth/verify-email?token=${verificationToken}`, {
        method: 'GET',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Email verification failed / Email təsdiqi uğursuz oldu');
      }

      setSuccess(data.message || "Email has been verified successfully! / Email uğurla təsdiq edildi!");
      setIsVerified(true);
      
      // Redirect to sign in after 3 seconds / 3 saniyə sonra giriş səhifəsinə yönləndir
      setTimeout(() => {
        router.push('/auth/signin');
      }, 3000);

    } catch (err: any) {
      setError(err.message || "Email verification failed. Please try again. / Email təsdiqi uğursuz oldu. Yenidən cəhd edin.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: searchParams.get("email") }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification email / Təsdiq email-i göndərilmədi');
      }

      setSuccess(data.message || "Verification email has been sent! / Təsdiq email-i göndərildi!");

    } catch (err: any) {
      setError(err.message || "Failed to send verification email. Please try again. / Təsdiq email-i göndərilmədi. Yenidən cəhd edin.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="text-center">
                <Mail className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Email Verification / Email Təsdiqi
                </h2>
                <p className="text-gray-600 mb-4">
                  Please check your email and click the verification link / Email-inizi yoxlayın və təsdiq linkinə basın.
                </p>
                <div className="space-y-2">
                  <Button
                    onClick={handleResendVerification}
                    disabled={isLoading}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    {isLoading ? "Sending... / Göndərilir..." : "Resend Verification Email / Təsdiq Email-i Yenidən Göndər"}
                  </Button>
                  <Link 
                    href="/auth/signin"
                    className="block text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Back to Sign In / Girişə Qayıt
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              {isVerified ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : isLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
              ) : (
                <Mail className="h-6 w-6 text-orange-600" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {isVerified ? "Email Verified! / Email Təsdiq Edildi!" : "Verifying Email... / Email Təsdiq Edilir..."}
            </CardTitle>
            <p className="text-gray-600 mt-2">
              {isVerified 
                ? "Your email has been successfully verified / Email-iniz uğurla təsdiq edildi"
                : "Please wait while we verify your email / Email-inizi təsdiq edərkən gözləyin"
              }
            </p>
          </CardHeader>
          
          <CardContent className="p-6">
            {error && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            {isVerified && (
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  You will be redirected to the sign-in page shortly / Tezliklə giriş səhifəsinə yönləndiriləcəksiniz.
                </p>
                <Link 
                  href="/auth/signin"
                  className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium"
                >
                  Go to Sign In / Girişə Get
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </div>
            )}

            {!isVerified && !isLoading && error && (
              <div className="text-center">
                <Button
                  onClick={handleResendVerification}
                  disabled={isLoading}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {isLoading ? "Sending... / Göndərilir..." : "Resend Verification Email / Təsdiq Email-i Yenidən Göndər"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading... / Yüklənir...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
