/**
 * Deals Page / Endirimlər Səhifəsi
 * This page displays hot deals and special offers
 * Bu səhifə isti endirimlər və xüsusi təkliflər göstərir
 */

"use client";

import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  Percent, 
  Clock, 
  Star, 
  ShoppingCart, 
  Tag,
  Zap,
  Gift,
  TrendingUp
} from "lucide-react";
import Link from "next/link";

// Define deal data type / Endirim məlumatları tipini təyin et
interface Deal {
  id: string;
  title: string;
  description: string;
  discount: string;
  originalPrice: number;
  salePrice: number;
  image: string;
  category: string;
  validUntil: string;
  isHot: boolean;
}

export default function DealsPage() {
  // Mock deals data / Mock endirim məlumatları
  const deals: Deal[] = [
    {
      id: "1",
      title: "Black Friday Sale",
      description: "Up to 70% off on all electronics",
      discount: "70%",
      originalPrice: 1000,
      salePrice: 300,
      image: "/api/placeholder/300/200",
      category: "Electronics",
      validUntil: "2024-12-31",
      isHot: true,
    },
    {
      id: "2", 
      title: "Weekend Special",
      description: "50% off on fashion items",
      discount: "50%",
      originalPrice: 200,
      salePrice: 100,
      image: "/api/placeholder/300/200",
      category: "Fashion",
      validUntil: "2024-12-15",
      isHot: false,
    },
    {
      id: "3",
      title: "New Year Clearance",
      description: "Clearance sale on home & garden",
      discount: "60%",
      originalPrice: 500,
      salePrice: 200,
      image: "/api/placeholder/300/200",
      category: "Home & Garden",
      validUntil: "2024-12-20",
      isHot: true,
    },
  ];

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔥 Hot Deals & Special Offers
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover amazing discounts and limited-time offers on your favorite products. 
            Don't miss out on these incredible deals!
          </p>
        </div>

        {/* Featured Deal Banner */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 mb-12 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">⚡ Flash Sale</h2>
              <p className="text-xl mb-4">Limited time offer - Ends soon!</p>
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="bg-white text-orange-600">
                  <Clock className="h-4 w-4 mr-1" />
                  Ends in 2 days
                </Badge>
                <Badge variant="secondary" className="bg-white text-orange-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Trending
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-6xl font-bold">70%</div>
              <div className="text-xl">OFF</div>
            </div>
          </div>
        </div>

        {/* Deals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {deals.map((deal) => (
            <Card key={deal.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="relative">
                {deal.isHot && (
                  <Badge className="absolute top-4 right-4 bg-red-500 text-white">
                    <Zap className="h-3 w-3 mr-1" />
                    HOT
                  </Badge>
                )}
                <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <Gift className="h-16 w-16 text-gray-400" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  {deal.title}
                </CardTitle>
                <p className="text-gray-600">{deal.description}</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Tag className="h-5 w-5 text-orange-500" />
                    <span className="text-sm text-gray-600">{deal.category}</span>
                  </div>
                  <Badge variant="outline" className="text-orange-600 border-orange-300">
                    <Percent className="h-3 w-3 mr-1" />
                    {deal.discount} OFF
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-orange-600">
                      ${deal.salePrice}
                    </span>
                    <span className="text-lg text-gray-400 line-through">
                      ${deal.originalPrice}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Valid until {deal.validUntil}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Shop Now
                  </Button>
                  <Button variant="outline" className="px-4">
                    <Star className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="bg-gray-50 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            📧 Get Notified About New Deals
          </h3>
          <p className="text-gray-600 mb-6">
            Subscribe to our newsletter and be the first to know about exclusive offers and flash sales.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8">
              Subscribe
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
