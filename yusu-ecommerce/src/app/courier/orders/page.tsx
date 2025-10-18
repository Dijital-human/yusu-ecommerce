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
  Truck, 
  Search, 
  Filter,
  Eye,
  MoreHorizontal,
  Loader2,
  Calendar,
  User,
  Package,
  MapPin,
  Phone,
  CheckCircle,
  Clock,
  XCircle
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

interface Delivery {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  address: string;
  status: string;
  createdAt: string;
  totalAmount: number;
  items: {
    productName: string;
    quantity: number;
  }[];
}

export default function CourierOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user?.role !== "COURIER") {
      router.push("/auth/signin");
      return;
    }

    fetchDeliveries();
  }, [session, status, router]);

  const fetchDeliveries = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/courier/deliveries");
      if (!res.ok) {
        throw new Error("Failed to fetch deliveries");
      }
      const data = await res.json();
      setDeliveries(data.deliveries || []);
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching deliveries.");
      console.error("Error fetching deliveries:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateDeliveryStatus = async (deliveryId: string, newStatus: string) => {
    setIsUpdating(true);
    setError(null);
    try {
      const res = await fetch(`/api/courier/deliveries/${deliveryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to update delivery status");
      }
      
      await fetchDeliveries(); // Refresh deliveries
    } catch (err: any) {
      setError(err.message || "An error occurred while updating delivery status.");
      console.error("Error updating delivery status:", err);
    } finally {
      setIsUpdating(false);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4" />;
      case "IN_TRANSIT":
        return <Truck className="h-4 w-4" />;
      case "DELIVERED":
        return <CheckCircle className="h-4 w-4" />;
      case "FAILED":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = 
      delivery.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || delivery.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (status === "loading" || isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Deliveries / Mənim Çatdırılmalarım</h1>
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
            <h1 className="text-3xl font-bold text-gray-900">My Deliveries / Mənim Çatdırılmalarım</h1>
            <p className="text-gray-600 mt-2">Manage your delivery assignments / Çatdırılma tapşırıqlarını idarə edin</p>
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
                    placeholder="Search deliveries... / Çatdırılmaları axtar..."
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
                    <SelectItem value="PENDING">Pending / Gözləyir</SelectItem>
                    <SelectItem value="IN_TRANSIT">In Transit / Yolda</SelectItem>
                    <SelectItem value="DELIVERED">Delivered / Çatdırılıb</SelectItem>
                    <SelectItem value="FAILED">Failed / Uğursuz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deliveries Table / Çatdırılmalar Cədvəli */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Truck className="h-5 w-5 mr-2" />
              Deliveries ({filteredDeliveries.length}) / Çatdırılmalar ({filteredDeliveries.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID / Sifariş ID</TableHead>
                    <TableHead>Customer / Müştəri</TableHead>
                    <TableHead>Address / Ünvan</TableHead>
                    <TableHead>Items / Məhsullar</TableHead>
                    <TableHead>Total / Ümumi</TableHead>
                    <TableHead>Status / Status</TableHead>
                    <TableHead>Date / Tarix</TableHead>
                    <TableHead className="text-right">Actions / Əməliyyatlar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeliveries.length > 0 ? (
                    filteredDeliveries.map((delivery) => (
                      <TableRow key={delivery.id}>
                        <TableCell className="font-medium">
                          #{delivery.orderId.slice(-8)}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2 text-gray-400" />
                              <span className="font-medium">{delivery.customerName}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Phone className="h-3 w-3 mr-1" />
                              {delivery.customerPhone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm">
                            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="truncate max-w-xs">{delivery.address}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Package className="h-4 w-4 mr-2 text-gray-400" />
                            {delivery.items.length} item(s)
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          ${delivery.totalAmount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(delivery.status)} flex items-center w-fit`}>
                            {getStatusIcon(delivery.status)}
                            <span className="ml-1">{getStatusLabel(delivery.status)}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(delivery.createdAt).toLocaleDateString()}
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
                              <DropdownMenuItem onClick={() => router.push(`/courier/orders/${delivery.id}`)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details / Detallara Bax
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {delivery.status !== "DELIVERED" && delivery.status !== "FAILED" && (
                                <>
                                  <DropdownMenuLabel>Update Status / Status Yenilə</DropdownMenuLabel>
                                  {["IN_TRANSIT", "DELIVERED", "FAILED"].map((status) => (
                                    status !== delivery.status && (
                                      <DropdownMenuItem
                                        key={status}
                                        onClick={() => updateDeliveryStatus(delivery.id, status)}
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
                      <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                        {searchTerm || statusFilter !== "all" 
                          ? "No deliveries found matching your filters / Filtrlərinizə uyğun çatdırılma tapılmadı" 
                          : "No deliveries found / Çatdırılma tapılmadı"
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
