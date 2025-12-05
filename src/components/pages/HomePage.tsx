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
import { useTranslations } from 'next-intl';
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { RecentlyViewed } from "@/components/products/RecentlyViewed";
import { DynamicHomepage } from "@/components/homepage/DynamicHomepage";
import { ProductRecommendations } from "@/components/products/ProductRecommendations";
import { useSession } from "next-auth/react";
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

// Interface for products / Məhsullar üçün interface
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string | string[]; // Can be string or array / String və ya array ola bilər
  averageRating?: number;
  reviewCount?: number;
  seller: {
    id: string;
    name: string;
    email?: string;
  };
  category: {
    id: string;
    name: string;
  };
}

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

// Helper function to get category translation key / Kateqoriya tərcümə key-ini almaq üçün helper funksiya
const getCategoryTranslationKey = (categoryName: string): string => {
  const name = categoryName.toLowerCase();
  if (name.includes("electron")) return "electronics";
  if (name.includes("fashion") || name.includes("clothing") || name.includes("apparel")) return "clothing";
  if (name.includes("home") || name.includes("garden")) return "home";
  if (name.includes("sport")) return "sports";
  return "";
};

export function HomePage() {
  const { data: session } = useSession();
  const t = useTranslations('home');
  const tCommon = useTranslations('common');
  const tNav = useTranslations('navigation');
  const tCategories = useTranslations('categories');
  
  // Categories with translation support / Tərcümə dəstəyi ilə kateqoriyalar
  const categories = [
    {
      id: 1,
      name: "Electronics",
      translationKey: "electronics",
      image: "https://images.unsplash.com/photo-1498049794561-7780c723c1c0?w=300&h=200&fit=crop",
      productCount: 1250
    },
    {
      id: 2,
      name: "Fashion",
      translationKey: "clothing",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=200&fit=crop",
      productCount: 890
    },
    {
      id: 3,
      name: "Home & Garden",
      translationKey: "home",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop",
      productCount: 567
    },
    {
      id: 4,
      name: "Sports",
      translationKey: "sports",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop",
      productCount: 423
    }
  ];
  
  // Get translated category name / Tərcümə olunmuş kateqoriya adını al
  const getCategoryName = (category: typeof categories[0]): string => {
    if (category.translationKey) {
      try {
        return tCategories(category.translationKey);
      } catch {
        return category.name;
      }
    }
    return category.name;
  };
  const [currentSlide, setCurrentSlide] = useState(0);
  const [approvedProducts, setApprovedProducts] = useState<Product[]>([]);

  const stats = [
    { icon: Users, label: t("happyCustomers"), value: "50K+" },
    { icon: Package, label: t("products"), value: "3K+" },
    { icon: Truck, label: t("ordersDelivered"), value: "100K+" },
    { icon: TrendingUp, label: t("growthRate"), value: "25%" }
  ];

  // Fetch products from API / API-dən məhsulları al
  // Note: Now includes seller products / Qeyd: İndi seller məhsulları daxildir
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products?limit=8&sortBy=createdAt&sortOrder=desc');
        const data = await response.json();
        if (data.success && data.data) {
          // Normalize images field - handle both string and array formats
          // Images field-ini normallaşdır - həm string həm də array formatlarını idarə et
          // Also normalize price fields - ensure they are numbers
          // Həmçinin price field-lərini normallaşdır - number olduğundan əmin ol
          const normalizedProducts = data.data.map((product: any) => {
            // Parse price - handle string, number, or null/undefined
            // Price-i parse et - string, number, və ya null/undefined idarə et
            const price = typeof product.price === 'number' 
              ? product.price 
              : product.price 
                ? parseFloat(String(product.price)) || 0
                : 0;
            
            // Parse originalPrice - handle string, number, null, or undefined
            // OriginalPrice-i parse et - string, number, null, və ya undefined idarə et
            const originalPrice = product.originalPrice 
              ? (typeof product.originalPrice === 'number' 
                  ? product.originalPrice 
                  : parseFloat(String(product.originalPrice)) || undefined)
              : undefined;
            
            return {
              ...product,
              price,
              originalPrice,
              images: Array.isArray(product.images) 
                ? product.images 
                : typeof product.images === 'string' 
                  ? (product.images.startsWith('[') ? JSON.parse(product.images) : [product.images])
                  : product.images ? [product.images] : ['/placeholder-product.jpg'],
            };
          });
          setApprovedProducts(normalizedProducts);
        }
      } catch (error) {
        // Error is handled silently - products will just not show
        // Xəta səssiz idarə olunur - məhsullar sadəcə göstərilməyəcək
      }
    };

    fetchProducts();
  }, []);

  const heroSlides = [
    {
      id: "1",
      title: t("welcomeToYusu"),
      subtitle: t("discoverAmazingProducts"),
      description: t("shopLatestTrends"),
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop",
      buttonText: t("shopNow"),
      buttonLink: "/products",
      gradient: "bg-gradient-to-r from-black/70 via-black/50 to-black/30"
    },
    {
      id: "2",
      title: t("bestDeals"),
      subtitle: t("upTo70Off"),
      description: t("dontMissOut"),
      image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1200&h=600&fit=crop",
      buttonText: t("viewDeals"),
      buttonLink: "/deals",
      gradient: "bg-gradient-to-r from-primary-900/70 via-primary-800/50 to-primary-700/30"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Dynamic Homepage Content / Dinamik Ana Səhifə Məzmunu */}
      <DynamicHomepage />
      
      {/* Fallback content (if dynamic content fails) / Fallback məzmun (əgər dinamik məzmun uğursuz olarsa) */}
      {/* <HeroCarousel slides={heroSlides} autoPlay={true} autoPlayInterval={5000} /> */}


      {/* Premium Categories Section / Premium Kateqoriyalar Bölməsi - Amazon/Alibaba Style */}
      <section className="py-20 bg-gradient-to-br from-primary-50 via-white to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header with Trendyol/Amazon Style / Trendyol/Amazon Stil Başlıq */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mb-6 shadow-lg">
              <Package className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Shop by <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-600">Category</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Discover millions of products across all categories with unbeatable prices and fast delivery
            </p>
          </div>
          
          {/* Main Categories Grid - Alibaba/Shopify Style / Əsas Kateqoriya Şəbəkəsi - Alibaba/Shopify Stil */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-12">
            {categories.map((category, index) => {
              const translatedName = getCategoryName(category);
              return (
                <Link key={category.id} href={`/categories/${category.id}`}>
                  <div className="group cursor-pointer">
                    {/* Category Card with Enhanced Design / Təkmilləşdirilmiş Dizayn ilə Kateqoriya Kartı */}
                    <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-primary-100">
                      {/* Image Container / Şəkil Konteyneri */}
                      <div className="relative h-32 md:h-40 overflow-hidden">
                        <img
                          src={category.image}
                          alt={translatedName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        {/* Gradient Overlay / Gradient Örtük */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent group-hover:from-black/30 transition-all duration-500" />
                        
                        {/* Badge / Nişan */}
                        <div className="absolute top-3 left-3">
                          <span className="bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
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
                        <h3 className="font-bold text-gray-900 mb-2 text-sm md:text-base group-hover:text-primary-600 transition-colors duration-300">
                          {translatedName}
                        </h3>
                        <p className="text-xs text-gray-500 mb-3">
                          {category.productCount} products available
                        </p>
                        
                        {/* Progress Bar / Tərəqqi Çubuğu */}
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
                          <div 
                            className="bg-gradient-to-r from-primary-400 to-primary-500 h-1.5 rounded-full transition-all duration-1000 group-hover:from-primary-500 group-hover:to-primary-600"
                            style={{ width: `${Math.min(100, (category.productCount / 1000) * 100)}%` }}
                          ></div>
                        </div>
                        
                        {/* View More Button / Daha Çox Gör Düyməsi */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-primary-600 font-semibold group-hover:text-primary-700 transition-colors duration-300">
                            Shop Now
                          </span>
                          <ArrowRight className="h-3 w-3 text-primary-500 group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          
          {/* Featured Subcategories - eBay Style / Tövsiyə Edilən Alt Kateqoriyalar - eBay Stil */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-primary-100">
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
                  <div className="bg-gradient-to-br from-primary-50 to-white p-4 rounded-xl hover:shadow-lg transition-all duration-300 border border-primary-100 hover:border-primary-200">
                    <div className="text-center">
                      <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">
                        {sub.icon}
                      </div>
                      <h4 className="font-semibold text-gray-900 text-sm group-hover:text-primary-600 transition-colors duration-300">
                        {sub.name}
                      </h4>
                      <p className="text-xs text-primary-600 font-medium mt-1">
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
                className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
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
      <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header with Enhanced Design / Təkmilləşdirilmiş Dizayn ilə Başlıq */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mb-6 shadow-lg">
              <Star className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t("featuredProducts")}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Handpicked premium products with unbeatable quality and amazing deals
            </p>
          </div>
          
          {/* Products Grid with Enhanced Cards / Təkmilləşdirilmiş Kartlarla Məhsul Şəbəkəsi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {approvedProducts.length > 0 ? approvedProducts.slice(0, 8).map((product, index) => {
              // Get first image from images array / Images array-indən ilk şəkli al
              const productImage = Array.isArray(product.images) 
                ? product.images[0] 
                : typeof product.images === 'string' 
                  ? product.images 
                  : '/placeholder-product.jpg';
              
              return (
              <Link key={product.id} href={`/products/${product.id}`}>
              <div className="group cursor-pointer">
                <Card className="relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-primary-100">
                  {/* Image Container with Enhanced Effects / Təkmilləşdirilmiş Effektlərlə Şəkil Konteyneri */}
                  <div className="relative overflow-hidden">
                    {/* Remove nested Link - parent Link already handles navigation / Daxili Link-i sil - valideyn Link artıq naviqasiyanı idarə edir */}
                    <img
                      src={productImage}
                      alt={product.name}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    
                    {/* Gradient Overlay / Gradient Örtük */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent group-hover:from-black/30 transition-all duration-500" />
                    
                    {/* Badge with Enhanced Design / Təkmilləşdirilmiş Dizayn ilə Nişan */}
                    {index === 0 && (
                      <div className="absolute top-4 left-4">
                        <span className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold px-3 py-2 rounded-full shadow-lg">
                          New
                        </span>
                      </div>
                    )}
                    
                    {/* Discount Badge / Endirim Nişanı */}
                    {product.originalPrice && typeof product.originalPrice === 'number' && typeof product.price === 'number' && product.originalPrice > product.price && (
                      <div className="absolute top-4 right-4">
                        <div className="bg-white/90 backdrop-blur-sm text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                          -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                        </div>
                      </div>
                    )}
                    
                    {/* Action Buttons / Əməliyyat Düymələri */}
                    <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                      <Button size="icon" variant="secondary" className="h-10 w-10 bg-white/90 backdrop-blur-sm hover:bg-primary-100 border border-primary-200">
                        <Heart className="h-4 w-4 text-primary-600" />
                      </Button>
                      <Button size="icon" variant="secondary" className="h-10 w-10 bg-white/90 backdrop-blur-sm hover:bg-primary-100 border border-primary-200">
                        <Eye className="h-4 w-4 text-primary-600" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Content with Enhanced Design / Təkmilləşdirilmiş Dizayn ilə Məzmun */}
                  <CardContent className="p-6">
                    <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors duration-300">
                      {product.name}
                    </h3>
                    
                    {/* Rating with Enhanced Design / Təkmilləşdirilmiş Dizayn ilə Reytinq */}
                    <div className="flex items-center mb-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.averageRating || 0) ? 'text-primary-400' : 'text-gray-300'
                            }`}
                            fill={i < Math.floor(product.averageRating || 0) ? 'currentColor' : 'none'}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500 ml-2 font-medium">({product.reviewCount || 0})</span>
                    </div>
                    
                    {/* Price with Enhanced Design / Təkmilləşdirilmiş Dizayn ilə Qiymət */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-gray-900">
                          ${typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(product.price || 0).toFixed(2)}
                        </span>
                        {product.originalPrice && typeof product.originalPrice === 'number' && typeof product.price === 'number' && product.originalPrice > product.price && (
                          <span className="text-sm text-gray-500 line-through">
                            ${product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Add to Cart Button with Enhanced Design / Təkmilləşdirilmiş Dizayn ilə Səbətə Əlavə Düyməsi */}
                    <Button 
                      size="sm" 
                      className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              </div>
              </Link>
              );
            }) : (
              <div className="col-span-4 text-center py-12">
                <p className="text-gray-500">No products available / Məhsul mövcud deyil</p>
              </div>
            )}
          </div>
          
          {/* Enhanced Call to Action / Təkmilləşdirilmiş Təşviqat */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-3xl p-8 text-white shadow-2xl">
              <h3 className="text-2xl font-bold mb-4">Ready to Explore More?</h3>
              <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
                Discover thousands of amazing products with exclusive deals and fast shipping
              </p>
              <Link href="/products">
                <Button 
                  size="lg" 
                  className="bg-white text-primary-600 hover:bg-primary-50 px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
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
      <section className="py-24 bg-gradient-to-br from-primary-50 via-white to-primary-100 relative overflow-hidden">
        {/* Background Pattern / Fon Naxışı */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(249,115,22,0.1),transparent_50%)]"></div>
          <div className="absolute top-20 left-20 w-32 h-32 bg-primary-300 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-primary-200 rounded-full blur-3xl opacity-25"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-primary-100 rounded-full blur-3xl opacity-20"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header with Unique Design / Unikal Dizayn ilə Başlıq */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl mb-8 shadow-2xl">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-600">Ulustore</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Experience the future of e-commerce with our cutting-edge features and unparalleled service quality
            </p>
          </div>
          
          {/* Features Grid with Unique Cards / Unikal Kartlarla Xüsusiyyət Şəbəkəsi */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Feature 1 - Fast Delivery / Xüsusiyyət 1 - Sürətli Çatdırılma */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-200/30 to-primary-300/30 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-primary-200 hover:border-primary-400 transition-all duration-500 transform hover:-translate-y-2 shadow-lg hover:shadow-2xl">
                {/* Icon Container / İkon Konteyneri */}
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-transform duration-500">
                    <Truck className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                </div>
                
                {/* Content / Məzmun */}
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-primary-600 transition-colors duration-300">
                  {t("fastDelivery")}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {t("fastDeliveryDesc")}
                </p>
                
                {/* Stats / Statistika */}
                <div className="flex items-center justify-between text-sm text-primary-600">
                  <span>⚡ 24-48h delivery</span>
                  <span>🚚 Free shipping</span>
                </div>
              </div>
            </div>
            
            {/* Feature 2 - Secure Payment / Xüsusiyyət 2 - Təhlükəsiz Ödəniş */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-200/30 to-blue-300/30 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-primary-200 hover:border-primary-400 transition-all duration-500 transform hover:-translate-y-2 shadow-lg hover:shadow-2xl">
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
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-primary-600 transition-colors duration-300">
                  {t("securePayment")}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {t("securePaymentDesc")}
                </p>
                
                {/* Stats / Statistika */}
                <div className="flex items-center justify-between text-sm text-primary-600">
                  <span>🔐 SSL encrypted</span>
                  <span>🛡️ Fraud protected</span>
                </div>
              </div>
            </div>
            
            {/* Feature 3 - Easy Returns / Xüsusiyyət 3 - Asan Qaytarma */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-200/30 to-purple-300/30 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-primary-200 hover:border-primary-400 transition-all duration-500 transform hover:-translate-y-2 shadow-lg hover:shadow-2xl">
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
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-primary-600 transition-colors duration-300">
                  {t("easyReturns")}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {t("easyReturnsDesc")}
                </p>
                
                {/* Stats / Statistika */}
                <div className="flex items-center justify-between text-sm text-primary-600">
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
                <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-300">
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
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-3xl blur-lg opacity-75"></div>
              <div className="relative bg-gradient-to-r from-primary-500 to-primary-600 rounded-3xl p-8 text-white shadow-2xl">
                <h3 className="text-3xl font-bold mb-4">Ready to Experience the Difference?</h3>
                <p className="text-primary-100 mb-6 text-lg max-w-2xl mx-auto">
                  Join thousands of satisfied customers who trust Yusu for their shopping needs
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/products">
                    <Button 
                      size="lg" 
                      className="bg-white text-primary-600 hover:bg-primary-50 px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                    >
                      <Package className="mr-3 h-6 w-6" />
                      Start Shopping
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300"
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
      <section className="py-16 bg-gradient-to-r from-primary-500 to-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Our Success in Numbers
            </h2>
            <p className="text-primary-100 text-lg max-w-2xl mx-auto">
              Trusted by thousands of customers worldwide
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="bg-white/20 backdrop-blur-sm w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <stat.icon className="h-10 w-10 text-white" />
                </div>
                <div className="text-4xl font-bold text-white mb-2 group-hover:text-primary-200 transition-colors duration-300">
                  {stat.value}
                </div>
                <div className="text-primary-100 text-sm font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recently Viewed Products / Son Baxılan Məhsullar */}
      <RecentlyViewed />

      {/* Personalized Recommendations for Logged-in Users / Giriş edən istifadəçilər üçün Fərdiləşdirilmiş Tövsiyələr */}
      {session?.user && (
        <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ProductRecommendations
              type="personalized"
              limit={12}
              layout="carousel"
              title="Recommended for You"
              className="mb-8"
            />
            <ProductRecommendations
              type="trending"
              limit={8}
              layout="grid"
              title="Trending Now"
              className="mb-8"
            />
          </div>
        </section>
      )}

      {/* Popular Products for Non-logged Users / Giriş etməyən istifadəçilər üçün Populyar Məhsullar */}
      {!session?.user && (
        <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ProductRecommendations
              type="popular"
              limit={12}
              layout="carousel"
              title="Popular Products"
              className="mb-8"
            />
            <ProductRecommendations
              type="trending"
              limit={8}
              layout="grid"
              title="Trending Now"
              className="mb-8"
            />
          </div>
        </section>
      )}
    </div>
  );
}
