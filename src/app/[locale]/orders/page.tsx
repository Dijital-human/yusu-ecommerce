/**
 * Orders Page / Sifarişlər Səhifəsi
 * This page displays user's orders with filtering and management
 * Bu səhifə istifadəçinin sifarişlərini filtr və idarəetmə ilə göstərir
 */

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/layout/Layout";
import { OrderCard } from "@/components/orders/OrderCard";
import { OrderFilters, OrderFilters as OrderFiltersType } from "@/components/orders/OrderFilters";
import { OrderSearch } from "@/components/orders/OrderSearch";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { 
  Package, 
  Filter, 
  Search,
  Plus,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/Alert";

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  customer?: {
    name: string;
    email: string;
  };
  seller?: {
    name: string;
    email: string;
  };
  courier?: {
    name: string;
    email: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      images: string;
    };
  }>;
}

export default function OrdersPage() {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [filters, setFilters] = useState<OrderFiltersType>({});
  const [searchQuery, setSearchQuery] = useState("");

  // Status options based on user role / İstifadəçi roluna əsasən status seçimləri
  const getStatusOptions = () => {
    if (!user) return [];
    
    switch (user.role) {
      case "CUSTOMER":
        return [
          { value: "", label: "All Orders / Bütün Sifarişlər" },
          { value: "PENDING", label: "Pending / Gözləyir" },
          { value: "CONFIRMED", label: "Confirmed / Təsdiqləndi" },
          { value: "SHIPPED", label: "Shipped / Göndərildi" },
          { value: "DELIVERED", label: "Delivered / Çatdırıldı" },
          { value: "CANCELLED", label: "Cancelled / Ləğv edildi" },
        ];
      case "SELLER":
        return [
          { value: "", label: "All Orders / Bütün Sifarişlər" },
          { value: "PENDING", label: "Pending / Gözləyir" },
          { value: "CONFIRMED", label: "Confirmed / Təsdiqləndi" },
          { value: "SHIPPED", label: "Shipped / Göndərildi" },
          { value: "CANCELLED", label: "Cancelled / Ləğv edildi" },
        ];
      case "COURIER":
        return [
          { value: "", label: "All Orders / Bütün Sifarişlər" },
          { value: "SHIPPED", label: "Shipped / Göndərildi" },
          { value: "DELIVERED", label: "Delivered / Çatdırıldı" },
        ];
      case "ADMIN":
        return [
          { value: "", label: "All Orders / Bütün Sifarişlər" },
          { value: "PENDING", label: "Pending / Gözləyir" },
          { value: "CONFIRMED", label: "Confirmed / Təsdiqləndi" },
          { value: "SHIPPED", label: "Shipped / Göndərildi" },
          { value: "DELIVERED", label: "Delivered / Çatdırıldı" },
          { value: "CANCELLED", label: "Cancelled / Ləğv edildi" },
        ];
      default:
        return [];
    }
  };

  // Fetch orders / Sifarişləri əldə et
  const fetchOrders = async (page = 1, reset = false) => {
    if (!isAuthenticated || !user) return;

    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });

      // Add role parameter based on user role / İstifadəçi roluna əsasən rol parametri əlavə et
      if (user.role === "CUSTOMER") {
        params.append("role", "customer");
      } else if (user.role === "SELLER") {
        params.append("role", "seller");
      } else if (user.role === "COURIER") {
        params.append("role", "courier");
      }

      // Add filters / Filtrləri əlavə et
      if (filters.status || selectedStatus) {
        params.append("status", filters.status || selectedStatus);
      }
      if (filters.startDate) {
        params.append("startDate", filters.startDate);
      }
      if (filters.endDate) {
        params.append("endDate", filters.endDate);
      }
      if (filters.minPrice) {
        params.append("minPrice", filters.minPrice);
      }
      if (filters.maxPrice) {
        params.append("maxPrice", filters.maxPrice);
      }
      if (filters.productName) {
        params.append("productName", filters.productName);
      }
      if (filters.sellerName) {
        params.append("sellerName", filters.sellerName);
      }
      if (filters.search || searchQuery) {
        params.append("search", filters.search || searchQuery);
      }
      if (filters.sortBy) {
        params.append("sortBy", filters.sortBy);
      }
      if (filters.sortOrder) {
        params.append("sortOrder", filters.sortOrder);
      }

      const response = await fetch(`/api/v1/orders?${params}`);
      const data = await response.json();

      if (data.success) {
        if (reset) {
          setOrders(data.data);
        } else {
          setOrders(prev => [...prev, ...data.data]);
        }
        setHasMore(page < data.pagination.totalPages);
        setCurrentPage(page);
      } else {
        setError(data.error || "Failed to fetch orders / Sifarişləri əldə etmək uğursuz");
      }
    } catch (err) {
      setError("An error occurred while fetching orders / Sifarişləri əldə etməkdə xəta baş verdi");
      console.error("Error fetching orders:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load more orders / Daha çox sifariş yüklə
  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      fetchOrders(currentPage + 1, false);
    }
  };

  // Filter orders by status / Sifarişləri statusa görə filtr et
  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
    fetchOrders(1, true);
  };

  // Update order status / Sifariş statusunu yenilə
  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local state / Lokal vəziyyəti yenilə
        setOrders(prev => 
          prev.map(order => 
            order.id === orderId 
              ? { ...order, status: newStatus }
              : order
          )
        );
      } else {
        setError(data.error || "Failed to update order status / Sifariş statusunu yeniləmək uğursuz");
      }
    } catch (err) {
      setError("An error occurred while updating order / Sifarişi yeniləməkdə xəta baş verdi");
      console.error("Error updating order:", err);
    }
  };

  // Assign courier / Kuryer təyin et
  const handleAssignCourier = async (orderId: string) => {
    // This would open a courier selection modal / Bu kuryer seçimi modalını açacaq
    console.log("Assign courier to order:", orderId);
  };

  // Initial load / İlkin yükləmə
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchOrders(1, true);
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Authentication Required / Autentifikasiya Tələb Olunur
              </h2>
              <p className="text-gray-600 mb-4">
                Please sign in to view your orders / Sifarişlərinizi görmək üçün giriş edin
              </p>
              <Button asChild>
                <a href="/auth/signin">Sign In / Giriş Et</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header / Başlıq */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Orders / Sifarişlər
                </h1>
                <p className="text-gray-600">
                  Manage your orders and track their status / Sifarişlərinizi idarə edin və statuslarını izləyin
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => fetchOrders(1, true)}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh / Yenilə
                </Button>
                
                <Button asChild>
                  <a href="/products">
                    <Plus className="h-4 w-4 mr-2" />
                    New Order / Yeni Sifariş
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {/* Search / Axtarış */}
          <div className="mb-6">
            <OrderSearch
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={(query) => {
                setSearchQuery(query);
                setFilters({ ...filters, search: query });
                setCurrentPage(1);
                fetchOrders(1, true);
              }}
            />
          </div>

          {/* Filters / Filtrlər */}
          <div className="mb-6">
            <OrderFilters
              filters={filters}
              onFiltersChange={(newFilters) => {
                setFilters(newFilters);
                setCurrentPage(1);
                fetchOrders(1, true);
              }}
              onClear={() => {
                setFilters({});
                setSelectedStatus("");
                setSearchQuery("");
                setCurrentPage(1);
                fetchOrders(1, true);
              }}
            />
          </div>

          {/* Error State / Xəta Vəziyyəti */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Loading State / Yükləmə Vəziyyəti */}
          {isLoading && orders.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading orders... / Sifarişlər yüklənir...</p>
              </div>
            </div>
          ) : orders.length === 0 ? (
            /* Empty State / Boş Vəziyyət */
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No orders found / Sifariş tapılmadı
                </h3>
                <p className="text-gray-600 mb-6">
                  {user?.role === "CUSTOMER" 
                    ? "You haven't placed any orders yet / Hələ heç bir sifariş verməmisiniz"
                    : "No orders match your criteria / Sifarişlər meyarlarınıza uyğun gəlmir"
                  }
                </p>
                <Button asChild>
                  <a href="/products">
                    Start Shopping / Alış-verişə Başla
                  </a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            /* Orders List / Sifarişlər Siyahısı */
            <div className="space-y-6">
              {orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  userRole={user?.role}
                  onStatusUpdate={handleStatusUpdate}
                  onAssignCourier={handleAssignCourier}
                />
              ))}

              {/* Load More Button / Daha Çox Yüklə Düyməsi */}
              {hasMore && (
                <div className="text-center pt-6">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleLoadMore}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2" />
                        Loading... / Yüklənir...
                      </>
                    ) : (
                      "Load More Orders / Daha Çox Sifariş Yüklə"
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
