/**
 * Admin Dashboard Page / Admin Dashboard Səhifəsi
 * Main admin control panel with full permissions
 * Tam icazələrlə əsas admin idarə paneli
 */

"use client";

import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatsCardSkeleton, TableSkeleton } from "@/components/ui/Skeleton";
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Trash2,
  Plus,
  Settings,
  BarChart3,
  Activity
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  userGrowth: number;
  orderGrowth: number;
  revenueGrowth: number;
}

interface RecentOrder {
  id: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch admin statistics
      const statsResponse = await fetch('/api/admin/stats');
      const statsData = await statsResponse.json();
      setStats(statsData);

      // Fetch recent orders
      const ordersResponse = await fetch('/api/admin/orders?limit=5');
      const ordersData = await ordersResponse.json();
      setRecentOrders(ordersData.orders || []);

    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Admin Dashboard / Admin İdarə Paneli
              </h1>
              <p className="text-gray-600">
                Complete control over the platform / Platforma üzərində tam nəzarət
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <StatsCardSkeleton key={i} />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders / Son Sifarişlər</CardTitle>
                </CardHeader>
                <CardContent>
                  <TableSkeleton rows={5} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header / Başlıq */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Admin Dashboard / Admin İdarə Paneli
                </h1>
                <p className="text-gray-600">
                  Complete control over the platform / Platforma üzərində tam nəzarət
                </p>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings / Tənzimləmələr
                </Button>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New / Yeni Əlavə Et
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards / Statistika Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users / Ümumi İstifadəçilər</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
                    <div className="flex items-center mt-2">
                      {stats?.userGrowth && stats.userGrowth > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm ${stats?.userGrowth && stats.userGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stats?.userGrowth || 0}%
                      </span>
                    </div>
                  </div>
                  <Users className="h-12 w-12 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Products / Ümumi Məhsullar</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.totalProducts || 0}</p>
                    <div className="flex items-center mt-2">
                      <Activity className="h-4 w-4 text-blue-500 mr-1" />
                      <span className="text-sm text-gray-600">Active / Aktiv</span>
                    </div>
                  </div>
                  <Package className="h-12 w-12 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Orders / Ümumi Sifarişlər</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.totalOrders || 0}</p>
                    <div className="flex items-center mt-2">
                      {stats?.orderGrowth && stats.orderGrowth > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm ${stats?.orderGrowth && stats.orderGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stats?.orderGrowth || 0}%
                      </span>
                    </div>
                  </div>
                  <ShoppingCart className="h-12 w-12 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue / Ümumi Gəlir</p>
                    <p className="text-3xl font-bold text-gray-900">${stats?.totalRevenue || 0}</p>
                    <div className="flex items-center mt-2">
                      {stats?.revenueGrowth && stats.revenueGrowth > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm ${stats?.revenueGrowth && stats.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stats?.revenueGrowth || 0}%
                      </span>
                    </div>
                  </div>
                  <DollarSign className="h-12 w-12 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions / Sürətli Əməliyyatlar */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Quick Actions / Sürətli Əməliyyatlar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                className="flex items-center justify-center p-6 h-auto"
                onClick={() => window.location.href = '/admin/users'}
              >
                <Users className="h-6 w-6 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Manage Users</div>
                  <div className="text-sm opacity-90">İstifadəçiləri İdarə Et</div>
                </div>
              </Button>
              
              <Button variant="outline" className="flex items-center justify-center p-6 h-auto">
                <Package className="h-6 w-6 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Manage Products</div>
                  <div className="text-sm opacity-90">Məhsulları İdarə Et</div>
                </div>
              </Button>
              
              <Button variant="outline" className="flex items-center justify-center p-6 h-auto">
                <ShoppingCart className="h-6 w-6 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Manage Orders</div>
                  <div className="text-sm opacity-90">Sifarişləri İdarə Et</div>
                </div>
              </Button>
              
              <Button variant="outline" className="flex items-center justify-center p-6 h-auto">
                <Settings className="h-6 w-6 mr-2" />
                <div className="text-left">
                  <div className="font-medium">System Settings</div>
                  <div className="text-sm opacity-90">Sistem Tənzimləmələri</div>
                </div>
              </Button>
            </div>
          </div>

          {/* Main Content / Əsas Məzmun */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders / Son Sifarişlər */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Orders / Son Sifarişlər</CardTitle>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View All / Hamısına Bax
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{order.customerName}</p>
                          <p className="text-sm text-gray-600">Order #{order.id}</p>
                          <p className="text-xs text-gray-500">{order.createdAt}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline">${order.total}</Badge>
                          <Badge variant="secondary">{order.status}</Badge>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No recent orders / Son sifarişlər yoxdur
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions / Sürətli Əməliyyatlar */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions / Sürətli Əməliyyatlar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20 flex-col">
                    <Users className="h-6 w-6 mb-2" />
                    Manage Users / İstifadəçiləri İdarə Et
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Package className="h-6 w-6 mb-2" />
                    Manage Products / Məhsulları İdarə Et
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <ShoppingCart className="h-6 w-6 mb-2" />
                    Manage Orders / Sifarişləri İdarə Et
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <BarChart3 className="h-6 w-6 mb-2" />
                    View Analytics / Analitikaya Bax
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
