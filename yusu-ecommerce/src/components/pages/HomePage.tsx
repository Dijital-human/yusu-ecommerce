/**
 * Home Page Component / Ana Səhifə Komponenti
 * This component displays the main landing page with hero section, categories, featured products, and features
 * Bu komponent əsas açılış səhifəsini göstərir - hero bölməsi, kateqoriyalar, tövsiyə edilən məhsullar və xüsusiyyətlər ilə
 * 
 * Features / Xüsusiyyətlər:
 * - Hero slider with multiple slides / Çoxlu slayd ilə hero slider
 * - Category showcase / Kateqoriya nümayişi
 * - Featured products grid / Tövsiyə edilən məhsullar şəbəkəsi
 * - Statistics section / Statistika bölməsi
 * - Features section / Xüsusiyyətlər bölməsi
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Eye,
  ArrowRight,
  Truck,
  Shield,
  RotateCcw,
  CreditCard,
  TrendingUp,
  Users,
  Package
} from "lucide-react";

// Mock data for featured products / Tövsiyə edilən məhsullar üçün mock məlumat
const featuredProducts = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 99.99,
    originalPrice: 149.99,
    rating: 4.5,
    reviews: 128,
    image: "https://images.unsplash.com/photo-1505740420928-5e880c94d7c0?w=300&h=300&fit=crop",
    badge: "Best Seller"
  },
  {
    id: 2,
    name: "Smart Watch",
    price: 199.99,
    originalPrice: 299.99,
    rating: 4.8,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop",
    badge: "New"
  },
  {
    id: 3,
    name: "Laptop Backpack",
    price: 49.99,
    originalPrice: 79.99,
    rating: 4.3,
    reviews: 256,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop",
    badge: "Sale"
  },
  {
    id: 4,
    name: "Bluetooth Speaker",
    price: 79.99,
    originalPrice: 119.99,
    rating: 4.6,
    reviews: 167,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop",
    badge: "Limited"
  }
];

const categories = [
  {
    id: 1,
    name: "Electronics",
    image: "https://images.unsplash.com/photo-1498049794561-7780c723c1c0?w=300&h=200&fit=crop",
    productCount: 1250
  },
  {
    id: 2,
    name: "Fashion",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=200&fit=crop",
    productCount: 890
  },
  {
    id: 3,
    name: "Home & Garden",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop",
    productCount: 567
  },
  {
    id: 4,
    name: "Sports",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop",
    productCount: 423
  }
];

const stats = [
  { icon: Users, label: "Happy Customers", value: "50K+" },
  { icon: Package, label: "Products", value: "3K+" },
  { icon: Truck, label: "Orders Delivered", value: "100K+" },
  { icon: TrendingUp, label: "Growth Rate", value: "25%" }
];

export function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      title: "Welcome to Yusu",
      subtitle: "Discover Amazing Products",
      description: "Shop the latest trends with fast delivery and secure payment",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop",
      buttonText: "Shop Now",
      buttonLink: "/products"
    },
    {
      title: "Best Deals",
      subtitle: "Up to 70% Off",
      description: "Don't miss out on our amazing discounts",
      image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1200&h=600&fit=crop",
      buttonText: "View Deals",
      buttonLink: "/deals"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  return (
    <div className="min-h-screen">
      {/* Hero Section / Hero Bölməsi */}
      <section className="relative h-[600px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroSlides[currentSlide].image}
            alt={heroSlides[currentSlide].title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40" />
        </div>
        
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                {heroSlides[currentSlide].title}
              </h1>
              <h2 className="text-xl md:text-2xl text-blue-200 mb-6">
                {heroSlides[currentSlide].subtitle}
              </h2>
              <p className="text-lg text-gray-200 mb-8">
                {heroSlides[currentSlide].description}
              </p>
              <Link href={heroSlides[currentSlide].buttonLink}>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  {heroSlides[currentSlide].buttonText}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Slide Indicators / Sürüşdürmə Göstəriciləri */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      </section>


      {/* Premium Categories Section / Premium Kateqoriyalar Bölməsi - Amazon/Alibaba Style */}
      <section className="py-20 bg-gradient-to-br from-orange-50 via-white to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header with Trendyol/Amazon Style / Trendyol/Amazon Stil Başlıq */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mb-6 shadow-lg">
              <Package className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Shop by <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">Category</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Discover millions of products across all categories with unbeatable prices and fast delivery
            </p>
          </div>
          
          {/* Main Categories Grid - Alibaba/Shopify Style / Əsas Kateqoriya Şəbəkəsi - Alibaba/Shopify Stil */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-12">
            {categories.map((category, index) => (
              <Link key={category.id} href={`/categories/${category.id}`}>
                <div className="group cursor-pointer">
                  {/* Category Card with Enhanced Design / Təkmilləşdirilmiş Dizayn ilə Kateqoriya Kartı */}
                  <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-orange-100">
                    {/* Image Container / Şəkil Konteyneri */}
                    <div className="relative h-32 md:h-40 overflow-hidden">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      {/* Gradient Overlay / Gradient Örtük */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent group-hover:from-black/30 transition-all duration-500" />
                      
                      {/* Badge / Nişan */}
                      <div className="absolute top-3 left-3">
                        <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                          {index === 0 ? 'HOT' : index === 1 ? 'NEW' : index === 2 ? 'SALE' : 'POPULAR'}
                        </span>
                      </div>
                      
                      {/* Product Count Badge / Məhsul Sayı Nişanı */}
                      <div className="absolute top-3 right-3">
                        <div className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-semibold px-2 py-1 rounded-full">
                          {category.productCount}+
                        </div>
                      </div>
                    </div>
                    
                    {/* Content / Məzmun */}
                    <div className="p-4 md:p-5">
                      <h3 className="font-bold text-gray-900 mb-2 text-sm md:text-base group-hover:text-orange-600 transition-colors duration-300">
                        {category.name}
                      </h3>
                      <p className="text-xs text-gray-500 mb-3">
                        {category.productCount} products available
                      </p>
                      
                      {/* Progress Bar / Tərəqqi Çubuğu */}
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
                        <div 
                          className="bg-gradient-to-r from-orange-400 to-orange-500 h-1.5 rounded-full transition-all duration-1000 group-hover:from-orange-500 group-hover:to-orange-600"
                          style={{ width: `${Math.min(100, (category.productCount / 1000) * 100)}%` }}
                        ></div>
                      </div>
                      
                      {/* View More Button / Daha Çox Gör Düyməsi */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-orange-600 font-semibold group-hover:text-orange-700 transition-colors duration-300">
                          Shop Now
                        </span>
                        <ArrowRight className="h-3 w-3 text-orange-500 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {/* Featured Subcategories - eBay Style / Tövsiyə Edilən Alt Kateqoriyalar - eBay Stil */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-orange-100">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Popular Subcategories</h3>
              <p className="text-gray-600">Browse our most searched categories</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { name: "Smartphones", icon: "📱", count: "2.5K" },
                { name: "Laptops", icon: "💻", count: "1.8K" },
                { name: "Headphones", icon: "🎧", count: "3.2K" },
                { name: "Cameras", icon: "📷", count: "1.1K" },
                { name: "Watches", icon: "⌚", count: "2.1K" },
                { name: "Gaming", icon: "🎮", count: "1.9K" }
              ].map((sub, index) => (
                <div key={index} className="group cursor-pointer">
                  <div className="bg-gradient-to-br from-orange-50 to-white p-4 rounded-xl hover:shadow-lg transition-all duration-300 border border-orange-100 hover:border-orange-200">
                    <div className="text-center">
                      <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">
                        {sub.icon}
                      </div>
                      <h4 className="font-semibold text-gray-900 text-sm group-hover:text-orange-600 transition-colors duration-300">
                        {sub.name}
                      </h4>
                      <p className="text-xs text-orange-600 font-medium mt-1">
                        {sub.count} items
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Call to Action - Shopify Style / Təşviqat - Shopify Stil */}
          <div className="text-center mt-12">
            <Link href="/categories">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <Package className="mr-3 h-6 w-6" />
                Explore All Categories
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Premium Featured Products Section / Premium Tövsiyə Edilən Məhsullar Bölməsi - Amazon/Trendyol Style */}
      <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header with Enhanced Design / Təkmilləşdirilmiş Dizayn ilə Başlıq */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mb-6 shadow-lg">
              <Star className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">Products</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Handpicked premium products with unbeatable quality and amazing deals
            </p>
          </div>
          
          {/* Products Grid with Enhanced Cards / Təkmilləşdirilmiş Kartlarla Məhsul Şəbəkəsi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {featuredProducts.map((product, index) => (
              <div key={product.id} className="group cursor-pointer">
                <Card className="relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-orange-100">
                  {/* Image Container with Enhanced Effects / Təkmilləşdirilmiş Effektlərlə Şəkil Konteyneri */}
                  <div className="relative overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    
                    {/* Gradient Overlay / Gradient Örtük */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent group-hover:from-black/30 transition-all duration-500" />
                    
                    {/* Badge with Enhanced Design / Təkmilləşdirilmiş Dizayn ilə Nişan */}
                    <div className="absolute top-4 left-4">
                      <span className={`text-white text-xs font-bold px-3 py-2 rounded-full shadow-lg ${
                        product.badge === 'Best Seller' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                        product.badge === 'New' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                        product.badge === 'Sale' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                        'bg-gradient-to-r from-orange-500 to-orange-600'
                      }`}>
                        {product.badge}
                      </span>
                    </div>
                    
                    {/* Discount Badge / Endirim Nişanı */}
                    <div className="absolute top-4 right-4">
                      <div className="bg-white/90 backdrop-blur-sm text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                        -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </div>
                    </div>
                    
                    {/* Action Buttons / Əməliyyat Düymələri */}
                    <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                      <Button size="icon" variant="secondary" className="h-10 w-10 bg-white/90 backdrop-blur-sm hover:bg-orange-100 border border-orange-200">
                        <Heart className="h-4 w-4 text-orange-600" />
                      </Button>
                      <Button size="icon" variant="secondary" className="h-10 w-10 bg-white/90 backdrop-blur-sm hover:bg-orange-100 border border-orange-200">
                        <Eye className="h-4 w-4 text-orange-600" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Content with Enhanced Design / Təkmilləşdirilmiş Dizayn ilə Məzmun */}
                  <CardContent className="p-6">
                    <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-orange-600 transition-colors duration-300">
                      {product.name}
                    </h3>
                    
                    {/* Rating with Enhanced Design / Təkmilləşdirilmiş Dizayn ilə Reytinq */}
                    <div className="flex items-center mb-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.rating) ? 'text-orange-400' : 'text-gray-300'
                            }`}
                            fill={i < Math.floor(product.rating) ? 'currentColor' : 'none'}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500 ml-2 font-medium">({product.reviews})</span>
                    </div>
                    
                    {/* Price with Enhanced Design / Təkmilləşdirilmiş Dizayn ilə Qiymət */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-gray-900">${product.price}</span>
                        <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
                      </div>
                    </div>
                    
                    {/* Add to Cart Button with Enhanced Design / Təkmilləşdirilmiş Dizayn ilə Səbətə Əlavə Düyməsi */}
                    <Button 
                      size="sm" 
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
          
          {/* Enhanced Call to Action / Təkmilləşdirilmiş Təşviqat */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-8 text-white shadow-2xl">
              <h3 className="text-2xl font-bold mb-4">Ready to Explore More?</h3>
              <p className="text-orange-100 mb-6 max-w-2xl mx-auto">
                Discover thousands of amazing products with exclusive deals and fast shipping
              </p>
              <Link href="/products">
                <Button 
                  size="lg" 
                  className="bg-white text-orange-600 hover:bg-orange-50 px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  <Package className="mr-3 h-6 w-6" />
                  View All Products
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Features Section / Premium Xüsusiyyətlər Bölməsi - Brand Consistent Design */}
      <section className="py-24 bg-gradient-to-br from-orange-50 via-white to-orange-100 relative overflow-hidden">
        {/* Background Pattern / Fon Naxışı */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(249,115,22,0.1),transparent_50%)]"></div>
          <div className="absolute top-20 left-20 w-32 h-32 bg-orange-300 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-orange-200 rounded-full blur-3xl opacity-25"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-orange-100 rounded-full blur-3xl opacity-20"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header with Unique Design / Unikal Dizayn ilə Başlıq */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl mb-8 shadow-2xl">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">Yusu</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Experience the future of e-commerce with our cutting-edge features and unparalleled service quality
            </p>
          </div>
          
          {/* Features Grid with Unique Cards / Unikal Kartlarla Xüsusiyyət Şəbəkəsi */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Feature 1 - Fast Delivery / Xüsusiyyət 1 - Sürətli Çatdırılma */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-200/30 to-orange-300/30 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-orange-200 hover:border-orange-400 transition-all duration-500 transform hover:-translate-y-2 shadow-lg hover:shadow-2xl">
                {/* Icon Container / İkon Konteyneri */}
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-transform duration-500">
                    <Truck className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                </div>
                
                {/* Content / Məzmun */}
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-orange-600 transition-colors duration-300">
                  Lightning Fast Delivery
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Get your orders delivered within 24-48 hours with our advanced logistics network
                </p>
                
                {/* Stats / Statistika */}
                <div className="flex items-center justify-between text-sm text-orange-600">
                  <span>⚡ 24-48h delivery</span>
                  <span>🚚 Free shipping</span>
                </div>
              </div>
            </div>
            
            {/* Feature 2 - Secure Payment / Xüsusiyyət 2 - Təhlükəsiz Ödəniş */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-200/30 to-blue-300/30 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-orange-200 hover:border-orange-400 transition-all duration-500 transform hover:-translate-y-2 shadow-lg hover:shadow-2xl">
                {/* Icon Container / İkon Konteyneri */}
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-transform duration-500">
                    <Shield className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">🔒</span>
                  </div>
                </div>
                
                {/* Content / Məzmun */}
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-orange-600 transition-colors duration-300">
                  Bank-Level Security
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Your payment information is protected with military-grade encryption and fraud detection
                </p>
                
                {/* Stats / Statistika */}
                <div className="flex items-center justify-between text-sm text-orange-600">
                  <span>🔐 SSL encrypted</span>
                  <span>🛡️ Fraud protected</span>
                </div>
              </div>
            </div>
            
            {/* Feature 3 - Easy Returns / Xüsusiyyət 3 - Asan Qaytarma */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-200/30 to-purple-300/30 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-orange-200 hover:border-orange-400 transition-all duration-500 transform hover:-translate-y-2 shadow-lg hover:shadow-2xl">
                {/* Icon Container / İkon Konteyneri */}
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-transform duration-500">
                    <RotateCcw className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">↻</span>
                  </div>
                </div>
                
                {/* Content / Məzmun */}
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-orange-600 transition-colors duration-300">
                  Hassle-Free Returns
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  30-day return policy with free pickup and instant refund processing
                </p>
                
                {/* Stats / Statistika */}
                <div className="flex items-center justify-between text-sm text-orange-600">
                  <span>📦 Free pickup</span>
                  <span>💰 Instant refund</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Additional Features Row / Əlavə Xüsusiyyətlər Sətiri */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {[
              { icon: CreditCard, title: "Multiple Payment", desc: "All major cards", color: "green" },
              { icon: Users, title: "24/7 Support", desc: "Always here", color: "orange" },
              { icon: Package, title: "Quality Guarantee", desc: "100% authentic", color: "blue" },
              { icon: TrendingUp, title: "Best Prices", desc: "Price match", color: "purple" }
            ].map((feature, index) => (
              <div key={index} className="group text-center">
                <div className={`w-16 h-16 bg-gradient-to-br from-${feature.color}-500 to-${feature.color}-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors duration-300">
                  {feature.title}
                </h4>
                <p className="text-gray-600 text-sm">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
          
          {/* Call to Action with Unique Design / Unikal Dizayn ilə Təşviqat */}
          <div className="text-center">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl blur-lg opacity-75"></div>
              <div className="relative bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-8 text-white shadow-2xl">
                <h3 className="text-3xl font-bold mb-4">Ready to Experience the Difference?</h3>
                <p className="text-orange-100 mb-6 text-lg max-w-2xl mx-auto">
                  Join thousands of satisfied customers who trust Yusu for their shopping needs
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/products">
                    <Button 
                      size="lg" 
                      className="bg-white text-orange-600 hover:bg-orange-50 px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                    >
                      <Package className="mr-3 h-6 w-6" />
                      Start Shopping
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="border-2 border-white text-white hover:bg-white hover:text-orange-600 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300"
                    >
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Footer üstündə / Statistika Bölməsi - Footer üstündə */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Our Success in Numbers
            </h2>
            <p className="text-orange-100 text-lg max-w-2xl mx-auto">
              Trusted by thousands of customers worldwide
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="bg-white/20 backdrop-blur-sm w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <stat.icon className="h-10 w-10 text-white" />
                </div>
                <div className="text-4xl font-bold text-white mb-2 group-hover:text-orange-200 transition-colors duration-300">
                  {stat.value}
                </div>
                <div className="text-orange-100 text-sm font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
