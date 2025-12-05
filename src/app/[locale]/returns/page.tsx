"use client";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { RotateCcw, Clock, Shield, CheckCircle } from "lucide-react";

export default function ReturnsPage() {
  const returnSteps = [
    {
      step: "1",
      title: "Request Return",
      description: "Initiate a return request within 30 days of delivery",
      icon: <RotateCcw className="h-6 w-6 text-orange-600" />
    },
    {
      step: "2", 
      title: "Package Item",
      description: "Pack the item securely in original packaging",
      icon: <Shield className="h-6 w-6 text-orange-600" />
    },
    {
      step: "3",
      title: "Ship Back",
      description: "Use our prepaid return label to ship the item",
      icon: <Clock className="h-6 w-6 text-orange-600" />
    },
    {
      step: "4",
      title: "Receive Refund",
      description: "Get your refund processed within 5-7 business days",
      icon: <CheckCircle className="h-6 w-6 text-orange-600" />
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Returns & Exchanges</h1>
              <p className="text-xl text-orange-100 max-w-3xl mx-auto">
                Easy returns and exchanges within 30 days of purchase
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Return Process */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">How to Return an Item</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {returnSteps.map((step, index) => (
                <Card key={index} className="shadow-lg text-center">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      {step.icon}
                    </div>
                    <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-bold">
                      {step.step}
                    </div>
                    <h3 className="text-lg font-semibold mb-3">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Return Policy */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Return Policy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">30-Day Return Window</h4>
                    <p className="text-gray-600">You have 30 days from the delivery date to return most items for a full refund.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Condition Requirements</h4>
                    <p className="text-gray-600">Items must be in original condition with tags and packaging intact.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Free Returns</h4>
                    <p className="text-gray-600">We provide free return shipping labels for all returns.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Exchanges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Size Exchanges</h4>
                    <p className="text-gray-600">Exchange for a different size within 30 days of delivery.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Color Exchanges</h4>
                    <p className="text-gray-600">Exchange for a different color if available in stock.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Product Exchanges</h4>
                    <p className="text-gray-600">Exchange for a different product of equal or greater value.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* What Can Be Returned */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">What Can Be Returned</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-green-600">✓ Eligible for Return</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Clothing and accessories</li>
                    <li>• Electronics (unopened)</li>
                    <li>• Home and garden items</li>
                    <li>• Books and media</li>
                    <li>• Beauty and personal care</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-red-600">✗ Not Eligible for Return</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Personalized or custom items</li>
                    <li>• Perishable goods</li>
                    <li>• Intimate apparel (underwear, swimwear)</li>
                    <li>• Digital products</li>
                    <li>• Items damaged by misuse</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Refund Information */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-center mb-12">Refund Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Processing Time</h3>
                <p className="text-gray-600">Refunds are processed within 5-7 business days after we receive your return.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Refund Method</h3>
                <p className="text-gray-600">Refunds are issued to the original payment method used for the purchase.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Confirmation</h3>
                <p className="text-gray-600">You'll receive an email confirmation once your refund has been processed.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
