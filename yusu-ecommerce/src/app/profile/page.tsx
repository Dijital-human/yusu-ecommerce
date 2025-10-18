"use client";

import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Edit,
  Save,
  X,
  Shield,
  Package,
  Truck,
  Settings
} from "lucide-react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/signin");
      return;
    }

    // Initialize form data with session data
    setFormData({
      name: session.user?.name || "",
      email: session.user?.email || "",
      phone: session.user?.phone || "",
    });
  }, [session, status, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Here you would typically make an API call to update the user profile
      // For now, we'll just simulate a successful update
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: session?.user?.name || "",
      email: session?.user?.email || "",
      phone: session?.user?.phone || "",
    });
    setIsEditing(false);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Shield className="h-4 w-4" />;
      case "SELLER":
        return <Package className="h-4 w-4" />;
      case "COURIER":
        return <Truck className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800";
      case "SELLER":
        return "bg-blue-100 text-blue-800";
      case "COURIER":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (status === "loading") {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        {/* Header / Başlıq */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile / Profil</h1>
            <p className="text-gray-600 mt-2">Manage your account information / Hesab məlumatlarınızı idarə edin</p>
          </div>
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <Badge className={`${getRoleColor(session.user?.role || "")} flex items-center`}>
              {getRoleIcon(session.user?.role || "")}
              <span className="ml-1 capitalize">{session.user?.role?.toLowerCase()}</span>
            </Badge>
          </div>
        </div>

        {/* Profile Information / Profil Məlumatları */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Personal Information / Şəxsi Məlumatlar
              </CardTitle>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit / Redaktə Et
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save / Saxla
                  </Button>
                  <Button onClick={handleCancel} variant="outline">
                    <X className="h-4 w-4 mr-2" />
                    Cancel / Ləğv Et
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name / Ad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name / Tam Ad
              </label>
              {isEditing ? (
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name / Tam adınızı daxil edin"
                />
              ) : (
                <div className="flex items-center p-3 bg-gray-50 rounded-md">
                  <User className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-gray-900">{session.user?.name || "Not provided"}</span>
                </div>
              )}
            </div>

            {/* Email / E-poçt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address / E-poçt Ünvanı
              </label>
              {isEditing ? (
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email / E-poçtunuzu daxil edin"
                />
              ) : (
                <div className="flex items-center p-3 bg-gray-50 rounded-md">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-gray-900">{session.user?.email}</span>
                </div>
              )}
            </div>

            {/* Phone / Telefon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number / Telefon Nömrəsi
              </label>
              {isEditing ? (
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number / Telefon nömrənizi daxil edin"
                />
              ) : (
                <div className="flex items-center p-3 bg-gray-50 rounded-md">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-gray-900">{session.user?.phone || "Not provided"}</span>
                </div>
              )}
            </div>

            {/* Role / Rol */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role / Rol
              </label>
              <div className="flex items-center p-3 bg-gray-50 rounded-md">
                <Settings className="h-4 w-4 mr-2 text-gray-400" />
                <Badge className={`${getRoleColor(session.user?.role || "")} flex items-center`}>
                  {getRoleIcon(session.user?.role || "")}
                  <span className="ml-1 capitalize">{session.user?.role?.toLowerCase()}</span>
                </Badge>
              </div>
            </div>

            {/* Account Created / Hesab Yaradılıb */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Created / Hesab Yaradılıb
              </label>
              <div className="flex items-center p-3 bg-gray-50 rounded-md">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                <span className="text-gray-900">
                  {new Date().toLocaleDateString()} {/* This would come from the database */}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions / Sürətli Əməliyyatlar */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Actions / Sürətli Əməliyyatlar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center"
                onClick={() => router.push("/orders")}
              >
                <Package className="h-6 w-6 mb-2" />
                <span className="text-sm">View Orders / Sifarişlərə Bax</span>
              </Button>
              
              {session.user?.role === "ADMIN" && (
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center"
                  onClick={() => router.push("/admin")}
                >
                  <Shield className="h-6 w-6 mb-2" />
                  <span className="text-sm">Admin Panel / Admin Paneli</span>
                </Button>
              )}
              
              {session.user?.role === "SELLER" && (
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center"
                  onClick={() => router.push("/seller")}
                >
                  <Package className="h-6 w-6 mb-2" />
                  <span className="text-sm">Seller Panel / Satıcı Paneli</span>
                </Button>
              )}
              
              {session.user?.role === "COURIER" && (
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center"
                  onClick={() => router.push("/courier")}
                >
                  <Truck className="h-6 w-6 mb-2" />
                  <span className="text-sm">Courier Panel / Kuryer Paneli</span>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
