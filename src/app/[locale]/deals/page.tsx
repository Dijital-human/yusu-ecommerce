/**
 * Deals Page / Endirimlər Səhifəsi
 * This page displays hot deals and special offers
 * Bu səhifə isti endirimlər və xüsusi təkliflər göstərir
 */

"use client";

import { useState, useEffect } from "react";
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
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { FlashSaleCountdown } from "@/components/deals/FlashSaleCountdown";
import { FlashSaleBadge } from "@/components/products/FlashSaleBadge";
import { FlashSaleProgress } from "@/components/deals/FlashSaleProgress";
import { Skeleton } from "@/components/ui/Skeleton";

// Define flash sale data type / Flash satış məlumatları tipini təyin et
interface FlashSale {
  id: string;
  title: string;
  description?: string;
  discount: number;
  productIds: string[];
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export default function DealsPage() {
  const t = useTranslations('deals');
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFlashSales();
  }, []);

  const fetchFlashSales = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/deals/flash-sales?type=all&limit=20");
      const data = await response.json();

      if (data.success && data.data.flashSales) {
        setFlashSales(data.data.flashSales);
      } else {
        setError(data.error || "Failed to fetch flash sales");
      }
    } catch (err) {
      setError("Failed to fetch flash sales");
    } finally {
      setIsLoading(false);
    }
  };

  // Get featured flash sale (first active one) / Xüsusi flash satış (ilk aktiv olan)
  const featuredSale = flashSales.find(
    (sale) => new Date(sale.endDate) > new Date() && sale.isActive
  );

  // Mock deals data for fallback / Fallback üçün mock endirim məlumatları
  const mockDeals: any[] = [
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
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🔥 {t('title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            {t('description')}
          </p>
        </div>

        {/* Featured Deal Banner */}
        {featuredSale && (
          <div className="bg-gradient-to-r from-primary-500 to-red-500 rounded-2xl p-8 mb-12 text-white">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-2">⚡ {featuredSale.title}</h2>
                <p className="text-xl mb-4">{featuredSale.description || t('limitedTime')}</p>
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <FlashSaleCountdown 
                    endDate={new Date(featuredSale.endDate)}
                    className="text-white"
                  />
                  <Badge variant="secondary" className="bg-white text-primary-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {t('trending')}
                  </Badge>
                </div>
                <FlashSaleProgress sold={850} total={1000} className="text-white" />
              </div>
              <div className="text-center lg:text-right">
                <div className="text-6xl font-bold">{featuredSale.discount}%</div>
                <div className="text-xl">{t('off')}</div>
              </div>
            </div>
          </div>
        )}

        {/* Flash Sales Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-96" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-600">{error}</p>
          </div>
        ) : flashSales.length === 0 ? (
          <div className="text-center py-16">
            <Zap className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t('noFlashSales') || "No flash sales available"}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('noFlashSalesDesc') || "Check back later for special flash sale offers"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {flashSales.map((sale) => (
              <Card key={sale.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 relative">
                <CardHeader className="relative">
                  <FlashSaleBadge discount={sale.discount} />
                  <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                    <Gift className="h-16 w-16 text-gray-400" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {sale.title}
                  </CardTitle>
                  <p className="text-gray-600">{sale.description || t('limitedTimeOffer')}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className="text-orange-600 border-orange-300">
                      <Percent className="h-3 w-3 mr-1" />
                      {sale.discount}% OFF
                    </Badge>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="h-4 w-4 inline mr-1" />
                      {t('validUntil')} {new Date(sale.endDate).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <FlashSaleCountdown endDate={new Date(sale.endDate)} className="mb-4" />

                  <div className="flex space-x-2">
                    <Link href={`/products?flashSale=${sale.id}`} className="flex-1">
                      <Button className="w-full bg-primary-500 hover:bg-primary-600 text-white">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {t('shopNow')}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Fallback Mock Deals (if no flash sales) / Fallback Mock Endirimlər (flash satış yoxdursa) */}
        {flashSales.length === 0 && !isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {mockDeals.map((deal) => (
            <Card key={deal.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 relative">
              <CardHeader className="relative">
                {deal.isHot && (
                  <FlashSaleBadge discount={parseInt(deal.discount)} />
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
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="h-4 w-4 inline mr-1" />
                    {t('validUntil')} {deal.validUntil}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Link href={`/products/${deal.id}`} className="flex-1">
                    <Button className="w-full bg-primary-500 hover:bg-primary-600 text-white">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {t('shopNow')}
                    </Button>
                  </Link>
                  <Button variant="outline" className="px-4">
                    <Star className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            📧 {t('newsletterTitle')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('newsletterDescription')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder={t('emailPlaceholder')}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            />
            <Button className="bg-primary-500 hover:bg-primary-600 text-white px-8">
              {t('subscribe')}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
