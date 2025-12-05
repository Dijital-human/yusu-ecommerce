"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { ArrowLeft, Lock, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      setError("Invalid reset link / Yanlış sıfırlama linki");
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Validate passwords / Şifrələri yoxla
    if (password !== confirmPassword) {
      setError("Passwords don't match / Şifrələr uyğun gəlmir");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters / Şifrə ən azı 8 simvol olmalıdır");
      setIsLoading(false);
      return;
    }

    try {
      // Send password reset request to API / Şifrə sıfırlama sorğusunu API-ya göndər
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token,
          password,
          confirmPassword 
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password / Şifrə sıfırlanmadı');
      }

      setSuccess(data.message || "Password has been reset successfully! You can now sign in. / Şifrə uğurla sıfırlandı! İndi giriş edə bilərsiniz.");
      
      // Redirect to sign in after 3 seconds / 3 saniyə sonra giriş səhifəsinə yönləndir
      setTimeout(() => {
        router.push('/auth/signin');
      }, 3000);

    } catch (err: any) {
      setError(err.message || "Failed to reset password. Please try again. / Şifrə sıfırlanmadı. Yenidən cəhd edin.");
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
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Invalid Reset Link / Yanlış Sıfırlama Linki
                </h2>
                <p className="text-gray-600 mb-4">
                  The password reset link is invalid or has expired / Şifrə sıfırlama linki yanlışdır və ya müddəti bitib.
                </p>
                <Link 
                  href="/auth/forgot-password"
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  Request a new reset link / Yeni sıfırlama linki soruş
                </Link>
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
              <Lock className="h-6 w-6 text-orange-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Reset Password / Şifrəni Sıfırla
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Enter your new password / Yeni şifrənizi daxil edin
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  New Password / Yeni Şifrə
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                    placeholder="Enter new password / Yeni şifrə daxil edin"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm Password / Şifrəni Təsdiq Et
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pr-10"
                    placeholder="Confirm new password / Yeni şifrəni təsdiq edin"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Resetting Password / Şifrə Sıfırlanır...
                  </div>
                ) : (
                  "Reset Password / Şifrəni Sıfırla"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link 
                href="/auth/signin"
                className="flex items-center justify-center text-orange-600 hover:text-orange-700 font-medium"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sign In / Girişə Qayıt
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

export default function ResetPasswordPage() {
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
      <ResetPasswordContent />
    </Suspense>
  );
}
