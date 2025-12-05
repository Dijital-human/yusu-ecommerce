/**
 * Track Order Page / Sifariş İzləmə Səhifəsi
 * This page allows users to track their orders using tracking number
 * Bu səhifə istifadəçilərə izləmə nömrəsi ilə sifarişlərini izləməyə imkan verir
 */

"use client";

import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { 
  Package, 
  Search, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Truck,
  AlertCircle,
  Phone
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { OrderTracking } from "@/components/orders/OrderTracking";

// Define order data type / Sifariş məlumatları tipini təyin et
interface OrderData {
  orderId: string;
  orderNumber: string;
  status: string;
  estimatedDelivery: string;
  carrier: string;
  trackingNumber: string;
  shippingAddress?: any;
  customer?: {
    name: string;
    email: string;
    phone?: string;
  };
  items?: Array<{
    id: string;
    product: {
      id: string;
      name: string;
      images: string;
    };
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  paymentStatus?: string;
  createdAt: string;
  updatedAt: string;
  timeline: Array<{
    status: string;
    date: string;
    time: string;
    location: string;
    completed: boolean;
    description?: string;
  }>;
}

export default function TrackOrderPage() {
  const t = useTranslations("trackOrder");
  const tCommon = useTranslations("common");
  
  const [trackingNumber, setTrackingNumber] = useState("");
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      setError(t("enterTrackingNumber"));
      return;
    }

    setIsLoading(true);
    setError(null);
    setOrderData(null);
    
    try {
      // Determine if it's an order ID or tracking number / Sifariş ID və ya izləmə nömrəsi olduğunu müəyyən et
      const isOrderId = trackingNumber.length > 20 || trackingNumber.includes("-");
      const params = isOrderId 
        ? new URLSearchParams({ orderId: trackingNumber })
        : new URLSearchParams({ trackingNumber: trackingNumber });

      const response = await fetch(`/api/orders/track?${params.toString()}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || t("orderNotFound"));
      }

      setOrderData(result.data);
    } catch (err) {
      console.error("Error tracking order:", err);
      setError(err instanceof Error ? err.message : t("trackingError"));
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusUpper = status.toUpperCase();
    switch (statusUpper) {
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "SHIPPED":
      case "IN_TRANSIT":
        return "bg-blue-100 text-blue-800";
      case "OUT_FOR_DELIVERY":
        return "bg-purple-100 text-purple-800";
      case "CONFIRMED":
      case "PROCESSING":
        return "bg-yellow-100 text-yellow-800";
      case "PENDING":
        return "bg-gray-100 text-gray-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    if (timeString === "Expected" || !timeString) return timeString;
    try {
      const [hours, minutes] = timeString.split(":");
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📦 {t("title")}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t("description")}
          </p>
        </div>

        {/* Tracking Form */}
        <Card className="max-w-2xl mx-auto mb-12 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">{t("trackPackage")}</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleTrackOrder} className="space-y-4">
              <div>
                <label htmlFor="tracking" className="block text-sm font-medium text-gray-700 mb-2">
                  {t("trackingNumberLabel")}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="tracking"
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => {
                      setTrackingNumber(e.target.value);
                      setError(null);
                    }}
                    placeholder={t("trackingNumberPlaceholder")}
                    className="pl-10 h-12"
                    required
                    aria-label={t("trackingNumberLabel")}
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12"
                disabled={isLoading}
                aria-label={t("trackOrder")}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" aria-hidden="true"></div>
                    {t("tracking")}
                  </div>
                ) : (
                  <>
                    <Package className="h-4 w-4 mr-2" aria-hidden="true" />
                    {t("trackOrder")}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tracking Results */}
        {orderData && (
          <div className="max-w-4xl mx-auto">
            {/* Order Summary */}
            <Card className="mb-8 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <CardTitle className="text-2xl">{t("orderDetails")}</CardTitle>
                  <Badge className={getStatusColor(orderData.status)}>
                    {t(`status.${orderData.status.toLowerCase().replace(/_/g, "")}`) || orderData.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Package className="h-5 w-5 text-gray-400 mr-3" aria-hidden="true" />
                      <div>
                        <p className="text-sm text-gray-600">{t("orderNumber")}</p>
                        <p className="font-medium">{orderData.orderNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Truck className="h-5 w-5 text-gray-400 mr-3" aria-hidden="true" />
                      <div>
                        <p className="text-sm text-gray-600">{t("carrier")}</p>
                        <p className="font-medium">{orderData.carrier}</p>
                      </div>
                    </div>
                    {orderData.totalAmount && (
                      <div className="flex items-center">
                        <Package className="h-5 w-5 text-gray-400 mr-3" aria-hidden="true" />
                        <div>
                          <p className="text-sm text-gray-600">{t("totalAmount")}</p>
                          <p className="font-medium">{tCommon("currency", { value: Number(orderData.totalAmount) })}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-gray-400 mr-3" aria-hidden="true" />
                      <div>
                        <p className="text-sm text-gray-600">{t("estimatedDelivery")}</p>
                        <p className="font-medium">{formatDate(orderData.estimatedDelivery)}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-gray-400 mr-3" aria-hidden="true" />
                      <div>
                        <p className="text-sm text-gray-600">{t("trackingNumber")}</p>
                        <p className="font-medium">{orderData.trackingNumber}</p>
                      </div>
                    </div>
                    {orderData.paymentStatus && (
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-gray-400 mr-3" aria-hidden="true" />
                        <div>
                          <p className="text-sm text-gray-600">{t("paymentStatus")}</p>
                          <p className="font-medium">{orderData.paymentStatus}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Real-Time Tracking Component / Real-Time İzləmə Komponenti */}
            <OrderTracking
              orderId={orderData.orderId}
              enableRealtime={true}
              showMap={true}
            />
          </div>
        )}

        {/* Help Section */}
        <div className="mt-12 bg-gray-50 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            {t("needHelp")}
          </h3>
          <p className="text-gray-600 mb-6">
            {t("helpDescription")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50" asChild>
              <a href="/contact" aria-label={t("callSupport")}>
                <Phone className="h-4 w-4 mr-2" aria-hidden="true" />
                {t("callSupport")}
              </a>
            </Button>
            <Button variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50" asChild>
              <a href="/contact" aria-label={t("reportIssue")}>
                <AlertCircle className="h-4 w-4 mr-2" aria-hidden="true" />
                {t("reportIssue")}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
