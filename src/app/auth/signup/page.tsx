/**
 * Sign Up Page / Qeydiyyat Səhifəsi
 * User registration page
 * İstifadəçi qeydiyyat səhifəsi
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  ArrowLeft,
  Eye,
  EyeOff
} from "lucide-react";

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "customer" as "customer" | "seller" | "courier"
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match / Şifrələr uyğun gəlmir");
      setIsLoading(false);
      return;
    }

    try {
      // TODO: Implement registration logic
      console.log("Registration data:", formData);
      setError("Registration feature coming soon / Qeydiyyat funksiyası tezliklə");
    } catch (err) {
      setError("Registration failed / Qeydiyyat uğursuz oldu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center text-primary-600 hover:text-primary-500 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home / Ana Səhifəyə Qayıt
            </Link>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Create Account / Hesab Yarat
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Join our platform today / Bu gün platformamıza qoşulun
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">Sign Up / Qeydiyyat</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div>
                  <Label htmlFor="name">Full Name / Tam Ad</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      className="pl-10"
                      placeholder="Enter your full name / Tam adınızı daxil edin"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address / Email Ünvanı</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="pl-10"
                      placeholder="Enter your email / Email daxil edin"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number / Telefon Nömrəsi</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      className="pl-10"
                      placeholder="Enter your phone / Telefon daxil edin"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="role">Account Type / Hesab Növü</Label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="customer">Customer / Müştəri</option>
                    <option value="seller">Seller / Satıcı</option>
                    <option value="courier">Courier / Kuryer</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="password">Password / Şifrə</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      className="pl-10 pr-10"
                      placeholder="Create a password / Şifrə yaradın"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password / Şifrəni Təsdiq Et</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      className="pl-10 pr-10"
                      placeholder="Confirm your password / Şifrənizi təsdiq edin"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account... / Hesab yaradılır..." : "Create Account / Hesab Yarat"}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account? / Artıq hesabınız var?
                    <Link href="/auth/signin" className="text-primary-600 hover:text-primary-500 ml-1">
                      Sign In / Giriş Et
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
