"use client";

import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  ShoppingCart, 
  Search, 
  Filter,
  Eye,
  MoreHorizontal,
  Loader2,
  Calendar,
  User,
  Package
} from "lucide-react";
import { TableSkeleton } from "@/components/ui/Skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { OrderStatus } from "@prisma/client";

interface Order {
  id: string;
  customerName: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
  items: {
    productName: string;
    quantity: number;
    price: number;
  }[];
}

export default function SellerOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user?.role !== "SELLER") {
      router.push("/auth/signin");
      return;
    }

    fetchOrders();
  }, [session, status, router]);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/seller/orders");
      if (!res.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching orders.");
      console.error("Error fetching orders:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setIsUpdating(true);
    setError(null);
    try {
      const res = await fetch("/api/seller/orders", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to update order status");
      }
      
      await fetchOrders(); // Refresh orders
    } catch (err: any) {
      setError(err.message || "An error occurred while updating order status.");
      console.error("Error updating order status:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return "bg-orange-100 text-orange-800";
      case OrderStatus.PROCESSING:
        return "bg-blue-100 text-blue-800";
      case OrderStatus.SHIPPED:
        return "bg-indigo-100 text-indigo-800";
      case OrderStatus.DELIVERED:
        return "bg-green-100 text-green-800";
      case OrderStatus.CANCELLED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return "Pending / Gözləyir";
      case OrderStatus.PROCESSING:
        return "Processing / İşlənir";
      case OrderStatus.SHIPPED:
        return "Shipped / Göndərilib";
      case OrderStatus.DELIVERED:
        return "Delivered / Çatdırılıb";
      case OrderStatus.CANCELLED:
        return "Cancelled / Ləğv edilib";
      default:
        return status;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (status === "loading" || isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders / Mənim Sifarişlərim</h1>
          <TableSkeleton />
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
        {/* Header / Başlıq */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Orders / Mənim Sifarişlərim</h1>
            <p className="text-gray-600 mt-2">Manage your customer orders / Müştəri sifarişlərini idarə edin</p>
          </div>
        </div>

        {/* Search and Filters / Axtarış və Filtrlər */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search orders... / Sifarişləri axtar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status / Statusa görə filtr" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status / Bütün Statuslar</SelectItem>
                    <SelectItem value={OrderStatus.PENDING}>Pending / Gözləyir</SelectItem>
                    <SelectItem value={OrderStatus.PROCESSING}>Processing / İşlənir</SelectItem>
                    <SelectItem value={OrderStatus.SHIPPED}>Shipped / Göndərilib</SelectItem>
                    <SelectItem value={OrderStatus.DELIVERED}>Delivered / Çatdırılıb</SelectItem>
                    <SelectItem value={OrderStatus.CANCELLED}>Cancelled / Ləğv edilib</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table / Sifarişlər Cədvəli */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Orders ({filteredOrders.length}) / Sifarişlər ({filteredOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID / Sifariş ID</TableHead>
                    <TableHead>Customer / Müştəri</TableHead>
                    <TableHead>Items / Məhsullar</TableHead>
                    <TableHead>Total / Ümumi</TableHead>
                    <TableHead>Status / Status</TableHead>
                    <TableHead>Date / Tarix</TableHead>
                    <TableHead className="text-right">Actions / Əməliyyatlar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          #{order.id.slice(-8)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-gray-400" />
                            {order.customerName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Package className="h-4 w-4 mr-2 text-gray-400" />
                            {order.items.length} item(s)
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          ${order.total.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusLabel(order.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0" disabled={isUpdating}>
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions / Əməliyyatlar</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => router.push(`/seller/orders/${order.id}`)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details / Detallara Bax
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {order.status !== OrderStatus.CANCELLED && order.status !== OrderStatus.DELIVERED && (
                                <>
                                  <DropdownMenuLabel>Update Status / Status Yenilə</DropdownMenuLabel>
                                  {Object.values(OrderStatus).map((status) => (
                                    status !== order.status && status !== OrderStatus.CANCELLED && (
                                      <DropdownMenuItem
                                        key={status}
                                        onClick={() => updateOrderStatus(order.id, status)}
                                        disabled={isUpdating}
                                      >
                                        {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Mark as {getStatusLabel(status)}
                                      </DropdownMenuItem>
                                    )
                                  ))}
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                        {searchTerm || statusFilter !== "all" 
                          ? "No orders found matching your filters / Filtrlərinizə uyğun sifariş tapılmadı" 
                          : "No orders found / Sifariş tapılmadı"
                        }
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
