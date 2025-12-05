"use client";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Truck, Clock, Shield, MapPin } from "lucide-react";

export default function ShippingPage() {
  const shippingOptions = [
    {
      name: "Standard Shipping",
      price: "Free",
      duration: "3-5 business days",
      description: "Free shipping on orders over $50",
      icon: <Truck className="h-8 w-8 text-orange-600" />
    },
    {
      name: "Express Shipping", 
      price: "$9.99",
      duration: "1-2 business days",
      description: "Fast delivery for urgent orders",
      icon: <Clock className="h-8 w-8 text-orange-600" />
    },
    {
      name: "Overnight Shipping",
      price: "$19.99", 
      duration: "Next business day",
      description: "Guaranteed next-day delivery",
      icon: <Shield className="h-8 w-8 text-orange-600" />
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Shipping Information</h1>
              <p className="text-xl text-orange-100 max-w-3xl mx-auto">
                Fast, reliable, and secure delivery to your doorstep
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Shipping Options */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Shipping Options</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {shippingOptions.map((option, index) => (
                <Card key={index} className="shadow-lg text-center">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      {option.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{option.name}</h3>
                    <div className="text-3xl font-bold text-orange-600 mb-2">{option.price}</div>
                    <div className="text-gray-600 mb-4">{option.duration}</div>
                    <p className="text-gray-700">{option.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Shipping Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <MapPin className="h-6 w-6 text-orange-500 mr-3" />
                  Delivery Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Domestic Shipping</h4>
                    <p className="text-gray-600">We deliver to all major cities in Azerbaijan with free shipping on orders over $50.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">International Shipping</h4>
                    <p className="text-gray-600">International shipping available to select countries. Contact us for rates and delivery times.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Shield className="h-6 w-6 text-orange-500 mr-3" />
                  Tracking & Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Order Tracking</h4>
                    <p className="text-gray-600">Track your order in real-time with our tracking system. You'll receive updates via email and SMS.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Secure Packaging</h4>
                    <p className="text-gray-600">All items are carefully packaged to ensure they arrive in perfect condition.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Shipping Policy */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-center mb-12">Shipping Policy</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Processing Time</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Orders are processed within 1-2 business days</li>
                  <li>• Custom items may take 3-5 business days</li>
                  <li>• Orders placed on weekends are processed on Monday</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">Delivery Time</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Standard: 3-5 business days</li>
                  <li>• Express: 1-2 business days</li>
                  <li>• Overnight: Next business day</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">Free Shipping</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Free on orders over $50</li>
                  <li>• Applies to standard shipping only</li>
                  <li>• Excludes international orders</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">Special Handling</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Fragile items require signature</li>
                  <li>• High-value items are insured</li>
                  <li>• Perishable items have special packaging</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
