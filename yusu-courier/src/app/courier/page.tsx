"use client";

import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Truck, 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  User,
  Phone,
  Mail,
  Loader2,
  Eye,
  Navigation
} from "lucide-react";
import { StatsCardSkeleton, TableSkeleton } from "@/components/ui/Skeleton";

interface CourierStats {
  totalDeliveries: number;
  pendingDeliveries: number;
  completedDeliveries: number;
  todayDeliveries: number;
  totalEarnings: number;
  averageRating: number;
}

interface RecentDelivery {
  id: string;
  customerName: string;
  address: string;
  status: string;
  createdAt: string;
  totalAmount: number;
}

export default function CourierDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<CourierStats | null>(null);
  const [recentDeliveries, setRecentDeliveries] = useState<RecentDelivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user?.role !== "COURIER") {
      router.push("/auth/signin");
      return;
    }

    fetchCourierData();
  }, [session, status, router]);

  const fetchCourierData = async () => {
    try {
      // Fetch Stats
      const statsRes = await fetch("/api/courier/stats");
      if (!statsRes.ok) throw new Error("Failed to fetch courier stats");
      const statsData = await statsRes.json();
      setStats(statsData);

      // Fetch Recent Deliveries
      const deliveriesRes = await fetch("/api/courier/deliveries?limit=5");
      if (!deliveriesRes.ok) throw new Error("Failed to fetch recent deliveries");
      const deliveriesData = await deliveriesRes.json();
      setRecentDeliveries(deliveriesData.deliveries);

    } catch (err: any) {
      setError(err.message || "An error occurred while fetching data.");
      console.error("Courier Dashboard Data Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-orange-100 text-orange-800";
      case "IN_TRANSIT":
        return "bg-blue-100 text-blue-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Pending / Gözləyir";
      case "IN_TRANSIT":
        return "In Transit / Yolda";
      case "DELIVERED":
        return "Delivered / Çatdırılıb";
      case "FAILED":
        return "Failed / Uğursuz";
      default:
        return status;
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Courier Dashboard / Kuryer İdarə Paneli</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TableSkeleton />
            <TableSkeleton />
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4 text-red-600">
          <h1 className="text-3xl font-bold mb-4">Error / Xəta</h1>
          <p>{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Courier Dashboard / Kuryer İdarə Paneli</h1>

        {/* Stats Cards / Statistika Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Deliveries / Ümumi Çatdırılma</p>
                  <p className="text-3xl font-bold text-gray-900">{stats?.totalDeliveries || 0}</p>
                </div>
                <Truck className="h-12 w-12 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending / Gözləyən</p>
                  <p className="text-3xl font-bold text-gray-900">{stats?.pendingDeliveries || 0}</p>
                </div>
                <Clock className="h-12 w-12 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed / Tamamlanıb</p>
                  <p className="text-3xl font-bold text-gray-900">{stats?.completedDeliveries || 0}</p>
                </div>
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today / Bu Gün</p>
                  <p className="text-3xl font-bold text-gray-900">{stats?.todayDeliveries || 0}</p>
                </div>
                <Package className="h-12 w-12 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions / Sürətli Əməliyyatlar */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions / Sürətli Əməliyyatlar
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              className="flex items-center justify-center p-6 h-auto"
              onClick={() => router.push("/courier/orders")}
            >
              <Package className="h-6 w-6 mr-2" />
              <div className="text-left">
                <div className="font-medium">View All Orders / Bütün Sifarişlər</div>
                <div className="text-sm opacity-90">Bütün sifarişlərə bax</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="flex items-center justify-center p-6 h-auto"
              onClick={() => router.push("/courier/orders?status=PENDING")}
            >
              <Clock className="h-6 w-6 mr-2" />
              <div className="text-left">
                <div className="font-medium">Pending Orders / Gözləyən Sifarişlər</div>
                <div className="text-sm opacity-90">Gözləyən sifarişlərə bax</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="flex items-center justify-center p-6 h-auto"
              onClick={() => router.push("/courier/profile")}
            >
              <User className="h-6 w-6 mr-2" />
              <div className="text-left">
                <div className="font-medium">My Profile / Mənim Profilim</div>
                <div className="text-sm opacity-90">Profil məlumatlarını yenilə</div>
              </div>
            </Button>
          </div>
        </div>

        {/* Main Content / Əsas Məzmun */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Deliveries / Son Çatdırılmalar */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Deliveries / Son Çatdırılmalar</CardTitle>
                <Button variant="outline" size="sm" onClick={() => router.push("/courier/orders")}>
                  <Eye className="h-4 w-4 mr-2" />
                  View All / Hamısına Bax
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentDeliveries.length > 0 ? (
                  recentDeliveries.map((delivery) => (
                    <div key={delivery.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{delivery.customerName}</p>
                        <p className="text-sm text-gray-600 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {delivery.address}
                        </p>
                        <p className="text-xs text-gray-500">{new Date(delivery.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-900">${delivery.totalAmount.toFixed(2)}</p>
                        <Badge className={getStatusColor(delivery.status)}>
                          {getStatusLabel(delivery.status)}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500">No deliveries found / Çatdırılma tapılmadı.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Courier Info / Kuryer Məlumatları */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Courier Information / Kuryer Məlumatları
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-sm">{session?.user?.name || "N/A"}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-sm">{session?.user?.email || "N/A"}</span>
                </div>
                <div className="flex items-center">
                  <Truck className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-sm">Courier / Kuryer</span>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Earnings / Ümumi Qazanc:</span>
                    <span className="font-bold">${stats?.totalEarnings?.toFixed(2) || "0.00"}</span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-sm text-gray-600">Average Rating / Orta Reytinq:</span>
                    <span className="font-bold">{stats?.averageRating?.toFixed(1) || "0.0"}/5.0</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}