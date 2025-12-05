/**
 * Modern Sign In Page / Müasir Giriş Səhifəsi
 * Inspired by major e-commerce platforms like Amazon, Shopify, etc.
 * Amazon, Shopify kimi böyük e-commerce platformlarından ilham alınmış
 */

"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { 
  Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, ArrowRight, Shield, Zap, Star
} from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const locale = useLocale();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials / Yanlış məlumatlar");
      } else if (result?.ok) {
        setSuccess("Successfully signed in / Uğurla giriş edildi");
        const session = await getSession();
        const userRole = session?.user?.role;
        
        // Preserve locale in redirect / Redirect-də locale-i saxla
        if (userRole === "ADMIN") {
          router.push(`/${locale}/admin/dashboard`);
        } else if (userRole === "SELLER") {
          router.push(`/${locale}/seller/dashboard`);
        } else if (userRole === "COURIER") {
          router.push(`/${locale}/courier/dashboard`);
        } else {
          router.push(`/${locale}/`);
        }
      }
    } catch (err) {
      setError("An error occurred / Xəta baş verdi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // For OAuth providers, we need to redirect to the provider
      // OAuth provider-lər üçün provider-ə yönləndirmək lazımdır
      await signIn(provider, { 
        callbackUrl: "/"
      });
    } catch (err) {
      setError(`Failed to sign in with ${provider} / ${provider} ilə giriş uğursuz`);
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Hero Section with Benefits */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">Welcome to Yusu</h1>
              <p className="text-orange-100">Your trusted e-commerce platform</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Side - Benefits & Features */}
            <div className="hidden lg:block space-y-8">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Choose Yusu?</h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Shield className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Secure Shopping</h3>
                      <p className="text-gray-600 text-sm">Your data is protected with enterprise-grade security</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Zap className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Fast Delivery</h3>
                      <p className="text-gray-600 text-sm">Get your orders delivered within 24-48 hours</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-yellow-100 p-2 rounded-lg">
                      <Star className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Quality Products</h3>
                      <p className="text-gray-600 text-sm">Curated selection of verified, high-quality products</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
                <h3 className="text-xl font-bold mb-2">Join 10,000+ Happy Customers</h3>
                <p className="text-blue-100">Experience the future of online shopping with Yusu</p>
              </div>
            </div>

            {/* Right Side - Sign In Form */}
            <div className="w-full max-w-md mx-auto">
              <Card className="shadow-2xl border-0">
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-4">
                    <span className="text-white font-bold text-2xl">Y</span>
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Welcome Back
                  </CardTitle>
                  <p className="text-gray-600">Sign in to your account</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {error && (
                    <Alert variant="destructive" className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-red-800">{error}</AlertDescription>
                    </Alert>
                  )}
                  {success && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">{success}</AlertDescription>
                    </Alert>
                  )}
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Enter your email"
                          className="pl-10 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                          autoComplete="email"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Enter your password"
                          className="pl-10 pr-10 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                          autoComplete="current-password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff /> : <Eye />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          id="rememberMe"
                          name="rememberMe"
                          type="checkbox"
                          checked={formData.rememberMe}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-600">
                          Remember me
                        </label>
                      </div>
                      <Link href="/auth/forgot-password" className="text-sm text-orange-600 hover:text-orange-500">
                        Forgot password?
                      </Link>
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold"
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Signing in...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          Sign In
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </div>
                      )}
                    </Button>
                  </form>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">Or continue with</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      onClick={() => handleSocialSignIn("google")}
                      disabled={isLoading}
                      className="w-full h-12 border-gray-300 hover:bg-gray-50"
                    >
                      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleSocialSignIn("facebook")}
                      disabled={isLoading}
                      className="w-full h-12 border-gray-300 hover:bg-gray-50"
                    >
                      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Continue with Facebook
                    </Button>
                    {/* Apple Sign In temporarily disabled (requires $99/year Apple Developer Program) */}
                    {/* <Button
                      variant="outline"
                      onClick={() => handleSocialSignIn("apple")}
                      disabled={isLoading}
                      className="w-full h-12 border-gray-300 hover:bg-gray-50"
                    >
                      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                      </svg>
                      Continue with Apple
                    </Button> */}
                  </div>
                  <div className="text-center pt-4">
                    <p className="text-sm text-gray-600">
                      Don't have an account?{" "}
                      <Link href="/auth/signup" className="text-orange-600 hover:text-orange-500 font-semibold">
                        Sign up for free
                      </Link>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}