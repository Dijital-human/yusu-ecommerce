/**
 * Comparison Charts Component / Müqayisə Qrafikləri Komponenti
 * Visual charts for comparing products (price, rating, etc.) / Məhsulları müqayisə etmək üçün vizual qrafiklər (qiymət, reytinq, və s.)
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Star, DollarSign, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { formatCurrency } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  averageRating?: number;
  reviewCount?: number;
  stock: number;
  shippingCost?: number;
}

interface ComparisonChartsProps {
  products: Product[];
}

export function ComparisonCharts({ products }: ComparisonChartsProps) {
  const t = useTranslations('products');

  if (products.length === 0) {
    return null;
  }

  // Price comparison chart / Qiymət müqayisəsi qrafiki
  const maxPrice = Math.max(...products.map((p) => p.price));
  const minPrice = Math.min(...products.map((p) => p.price));

  // Rating comparison chart / Reytinq müqayisəsi qrafiki
  const maxRating = 5; // Max rating is 5 / Maksimum reytinq 5-dir

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      {/* Price Comparison Chart / Qiymət Müqayisəsi Qrafiki */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="h-5 w-5" />
            {t('priceComparison') || 'Price Comparison'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {products.map((product) => {
              const percentage = maxPrice > 0 ? (product.price / maxPrice) * 100 : 0;
              return (
                <div key={product.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium truncate max-w-[120px]">{product.name}</span>
                    <span className="font-bold">{formatCurrency(product.price)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Rating Comparison Chart / Reytinq Müqayisəsi Qrafiki */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="h-5 w-5" />
            {t('ratingComparison') || 'Rating Comparison'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {products.map((product) => {
              const rating = product.averageRating || 0;
              const percentage = (rating / maxRating) * 100;
              return (
                <div key={product.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium truncate max-w-[120px]">{product.name}</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="font-bold">{rating.toFixed(1)}</span>
                      {product.reviewCount && (
                        <span className="text-xs text-gray-500">({product.reviewCount})</span>
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Stock Availability Chart / Stok Mövcudluğu Qrafiki */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5" />
            {t('stockComparison') || 'Stock Comparison'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {products.map((product) => {
              const maxStock = Math.max(...products.map((p) => p.stock), 1);
              const percentage = (product.stock / maxStock) * 100;
              return (
                <div key={product.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium truncate max-w-[120px]">{product.name}</span>
                    <span className={`font-bold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.stock > 0 ? `${product.stock} ${t('inStock') || 'In Stock'}` : t('outOfStock') || 'Out of Stock'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        product.stock > 0 ? 'bg-green-600' : 'bg-red-600'
                      }`}
                      style={{ width: `${product.stock > 0 ? percentage : 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Shipping Cost Comparison / Çatdırılma Xərci Müqayisəsi */}
      {products.some((p) => p.shippingCost !== undefined) && (
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5" />
              {t('shippingCostComparison') || 'Shipping Cost Comparison'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <div key={product.id} className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-gray-600 mb-2 truncate">{product.name}</p>
                  <p className="text-lg font-bold">
                    {product.shippingCost !== undefined
                      ? formatCurrency(product.shippingCost)
                      : t('freeShipping') || 'Free Shipping'}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

