"use client";
import { useState } from "react";
import { Link } from "@/i18n/routing";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { ArrowLeft, Mail, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Send password reset request to API / Şifrə sıfırlama sorğusunu API-ya göndər
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email / Sıfırlama email-i göndərilmədi');
      }

      setSuccess(data.message || "Password reset email sent! Please check your inbox. / Parol sıfırlama email-i göndərildi! Gələn qutunuzu yoxlayın.");
    } catch (err: any) {
      setError(err.message || "Failed to send reset email. Please try again. / Sıfırlama email-i göndərilmədi. Yenidən cəhd edin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card className="shadow-2xl border-0">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-4">
                <span className="text-white font-bold text-2xl">Y</span>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Forgot Password / Parolu Unutdum
              </CardTitle>
              <p className="text-gray-600">Enter your email to reset your password / Parolunuzu sıfırlamaq üçün email-inizi daxil edin</p>
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
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address / Email Ünvanı
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="pl-10 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                      required
                    />
                  </div>
                </div>
                
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending... / Göndərilir...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      Send Reset Email / Sıfırlama Email-i Göndər
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  )}
                </Button>
              </form>
              
              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  Remember your password? / Parolunuzu xatırlayırsınız?{" "}
                  <Link href="/auth/signin" className="text-orange-600 hover:text-orange-500 font-semibold">
                    Sign In / Giriş Et
                  </Link>
                </p>
              </div>
              
              <div className="text-center">
                <Link 
                  href="/auth/signin"
                  className="inline-flex items-center text-sm text-gray-600 hover:text-orange-600 transition-colors duration-200"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Sign In / Giriş Səhifəsinə Qayıt
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
