"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  User, 
  Save, 
  Loader2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Truck,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { ExclamationTriangleIcon, CheckCircledIcon } from "@radix-ui/react-icons";

// Profile update schema / Profil yeniləmə sxemi
const profileSchema = z.object({
  name: z.string().min(1, "Name is required / Ad tələb olunur"),
  phone: z.string().min(1, "Phone is required / Telefon tələb olunur"),
  address: z.string().min(1, "Address is required / Ünvan tələb olunur"),
  vehicleType: z.string().min(1, "Vehicle type is required / Nəqliyyat növü tələb olunur"),
  licenseNumber: z.string().min(1, "License number is required / Lisenziya nömrəsi tələb olunur"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface CourierProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  vehicleType: string;
  licenseNumber: string;
  isActive: boolean;
  createdAt: string;
  stats: {
    totalDeliveries: number;
    completedDeliveries: number;
    averageRating: number;
    totalEarnings: number;
  };
}

export default function CourierProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<CourierProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user?.role !== "COURIER") {
      router.push("/auth/signin");
      return;
    }

    fetchProfile();
  }, [session, status, router]);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/courier/profile");
      if (!res.ok) {
        throw new Error("Failed to fetch profile");
      }
      const profileData = await res.json();
      setProfile(profileData);
      
      // Set form values
      setValue("name", profileData.name);
      setValue("phone", profileData.phone);
      setValue("address", profileData.address);
      setValue("vehicleType", profileData.vehicleType);
      setValue("licenseNumber", profileData.licenseNumber);
    } catch (err: any) {
      setError(err.message || "Failed to fetch profile");
      console.error("Error fetching profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/courier/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      setSuccess("Profile updated successfully / Profil uğurla yeniləndi");
      await fetchProfile(); // Refresh profile
    } catch (err: any) {
      setError(err.message || "An error occurred while updating profile");
      console.error("Error updating profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile not found / Profil tapılmadı</h1>
            <Button onClick={() => router.push("/courier")}>
              Back to Dashboard / İdarə Panelinə Qayıt
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile / Mənim Profilim</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Form / Profil Formu */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Profile Information / Profil Məlumatları
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Error/Success Messages / Xəta/Uğur Mesajları */}
                  {error && (
                    <Alert variant="destructive">
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      <AlertTitle>Error / Xəta</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  {success && (
                    <Alert>
                      <CheckCircledIcon className="h-4 w-4" />
                      <AlertTitle>Success / Uğurlu</AlertTitle>
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}

                  {/* Name / Ad */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name / Tam Ad *</Label>
                    <Input
                      id="name"
                      placeholder="Enter your full name / Tam adınızı daxil edin"
                      {...register("name")}
                      disabled={isSaving}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Phone / Telefon */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number / Telefon Nömrəsi *</Label>
                    <Input
                      id="phone"
                      placeholder="Enter your phone number / Telefon nömrənizi daxil edin"
                      {...register("phone")}
                      disabled={isSaving}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-500">{errors.phone.message}</p>
                    )}
                  </div>

                  {/* Address / Ünvan */}
                  <div className="space-y-2">
                    <Label htmlFor="address">Address / Ünvan *</Label>
                    <Input
                      id="address"
                      placeholder="Enter your address / Ünvanınızı daxil edin"
                      {...register("address")}
                      disabled={isSaving}
                    />
                    {errors.address && (
                      <p className="text-sm text-red-500">{errors.address.message}</p>
                    )}
                  </div>

                  {/* Vehicle Type / Nəqliyyat Növü */}
                  <div className="space-y-2">
                    <Label htmlFor="vehicleType">Vehicle Type / Nəqliyyat Növü *</Label>
                    <Input
                      id="vehicleType"
                      placeholder="e.g., Motorcycle, Car, Bicycle / Məsələn, Motosikl, Avtomobil, Velosiped"
                      {...register("vehicleType")}
                      disabled={isSaving}
                    />
                    {errors.vehicleType && (
                      <p className="text-sm text-red-500">{errors.vehicleType.message}</p>
                    )}
                  </div>

                  {/* License Number / Lisenziya Nömrəsi */}
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">License Number / Lisenziya Nömrəsi *</Label>
                    <Input
                      id="licenseNumber"
                      placeholder="Enter your license number / Lisenziya nömrənizi daxil edin"
                      {...register("licenseNumber")}
                      disabled={isSaving}
                    />
                    {errors.licenseNumber && (
                      <p className="text-sm text-red-500">{errors.licenseNumber.message}</p>
                    )}
                  </div>

                  {/* Submit Button / Göndər Düyməsi */}
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving... / Saxlanılır...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes / Dəyişiklikləri Saxla
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Profile Stats / Profil Statistikaları */}
          <div className="space-y-6">
            {/* Account Info / Hesab Məlumatları */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Account Information / Hesab Məlumatları
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-sm">{profile.email}</span>
                </div>
                <div className="flex items-center">
                  <Truck className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-sm">Courier / Kuryer</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-sm">Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  {profile.isActive ? (
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                  )}
                  <span className={`text-sm ${profile.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {profile.isActive ? 'Active / Aktiv' : 'Inactive / Qeyri-aktiv'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Stats / Çatdırılma Statistikaları */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="h-5 w-5 mr-2" />
                  Delivery Statistics / Çatdırılma Statistikaları
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Deliveries / Ümumi Çatdırılma:</span>
                  <span className="font-bold">{profile.stats.totalDeliveries}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Completed / Tamamlanıb:</span>
                  <span className="font-bold text-green-600">{profile.stats.completedDeliveries}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Average Rating / Orta Reytinq:</span>
                  <span className="font-bold">{profile.stats.averageRating.toFixed(1)}/5.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Earnings / Ümumi Qazanc:</span>
                  <span className="font-bold text-green-600">${profile.stats.totalEarnings.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
