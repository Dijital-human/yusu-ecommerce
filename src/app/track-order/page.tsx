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
import { useState } from "react";

export default function TrackOrderPage() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [orderData, setOrderData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock tracking data
  const mockTrackingData = {
    orderNumber: "YUSU-2024-001",
    status: "In Transit",
    estimatedDelivery: "2024-12-20",
    carrier: "DHL Express",
    trackingNumber: "1234567890",
    timeline: [
      {
        status: "Order Placed",
        date: "2024-12-15",
        time: "10:30 AM",
        location: "Online Store",
        completed: true
      },
      {
        status: "Processing",
        date: "2024-12-15",
        time: "2:45 PM",
        location: "Warehouse",
        completed: true
      },
      {
        status: "Shipped",
        date: "2024-12-16",
        time: "9:15 AM",
        location: "Distribution Center",
        completed: true
      },
      {
        status: "In Transit",
        date: "2024-12-17",
        time: "3:20 PM",
        location: "In Transit",
        completed: false
      },
      {
        status: "Out for Delivery",
        date: "2024-12-20",
        time: "Expected",
        location: "Local Delivery",
        completed: false
      },
      {
        status: "Delivered",
        date: "2024-12-20",
        time: "Expected",
        location: "Your Address",
        completed: false
      }
    ]
  };

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setOrderData(mockTrackingData);
      setIsLoading(false);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "In Transit":
        return "bg-blue-100 text-blue-800";
      case "Out for Delivery":
        return "bg-purple-100 text-purple-800";
      case "Processing":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📦 Track Your Order
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Enter your tracking number or order number to see the current status 
            and location of your package.
          </p>
        </div>

        {/* Tracking Form */}
        <Card className="max-w-2xl mx-auto mb-12 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Track Your Package</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTrackOrder} className="space-y-4">
              <div>
                <label htmlFor="tracking" className="block text-sm font-medium text-gray-700 mb-2">
                  Tracking Number or Order Number
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="tracking"
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number or order number"
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Tracking...
                  </div>
                ) : (
                  <>
                    <Package className="h-4 w-4 mr-2" />
                    Track Order
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
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">Order Details</CardTitle>
                  <Badge className={getStatusColor(orderData.status)}>
                    {orderData.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Package className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Order Number</p>
                        <p className="font-medium">{orderData.orderNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Truck className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Carrier</p>
                        <p className="font-medium">{orderData.carrier}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Estimated Delivery</p>
                        <p className="font-medium">{orderData.estimatedDelivery}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Tracking Number</p>
                        <p className="font-medium">{orderData.trackingNumber}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Delivery Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderData.timeline.map((step, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        step.completed 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-300 text-gray-600'
                      }`}>
                        {step.completed ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Clock className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${
                          step.completed ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {step.status}
                        </p>
                        <p className="text-sm text-gray-600">
                          {step.date} at {step.time}
                        </p>
                        <p className="text-sm text-gray-500">{step.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-12 bg-gray-50 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Need Help with Your Order?
          </h3>
          <p className="text-gray-600 mb-6">
            If you're having trouble tracking your order or have questions about delivery, 
            our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50">
              <Phone className="h-4 w-4 mr-2" />
              Call Support
            </Button>
            <Button variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50">
              <AlertCircle className="h-4 w-4 mr-2" />
              Report Issue
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
