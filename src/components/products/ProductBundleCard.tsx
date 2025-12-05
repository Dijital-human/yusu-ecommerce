/**
 * Product Bundle Card Component / Məhsul Paketi Kartı Komponenti
 * Display a product bundle card / Məhsul paketi kartını göstər
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ShoppingCart, Package, Tag } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Image from 'next/image';

interface BundleProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string;
  stock: number;
}

interface BundleItem {
  id: string;
  product: BundleProduct;
  quantity: number;
  isRequired: boolean;
}

interface ProductBundle {
  id: string;
  name: string;
  description?: string;
  discountType: string;
  discountValue: number;
  seller?: {
    id: string;
    name: string;
  };
  items: BundleItem[];
}

interface ProductBundleCardProps {
  bundle: ProductBundle;
  pricing?: {
    originalPrice: number;
    discountAmount: number;
    finalPrice: number;
    savings: number;
  };
  onAddToCart?: (bundleId: string) => void;
}

export function ProductBundleCard({ bundle, pricing, onAddToCart }: ProductBundleCardProps) {
  const t = useTranslations('products');
  const tCommon = useTranslations('common');
  const [bundlePricing, setBundlePricing] = useState(pricing);

  useEffect(() => {
    if (!bundlePricing && bundle.id) {
      fetchPricing();
    }
  }, [bundle.id]);

  const fetchPricing = async () => {
    try {
      const response = await fetch(`/api/products/bundles/${bundle.id}?includePricing=true`);
      const data = await response.json();
      if (data.success && data.data.pricing) {
        setBundlePricing(data.data.pricing);
      }
    } catch (error) {
      console.error('Error fetching bundle pricing', error);
    }
  };

  const getFirstProductImage = (): string => {
    if (bundle.items.length > 0 && bundle.items[0].product.images) {
      const images = typeof bundle.items[0].product.images === 'string'
        ? bundle.items[0].product.images.split(',')
        : bundle.items[0].product.images;
      return images[0] || '/placeholder-product.jpg';
    }
    return '/placeholder-product.jpg';
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">{bundle.name}</CardTitle>
            </div>
            {bundle.description && (
              <p className="text-sm text-gray-600 line-clamp-2">{bundle.description}</p>
            )}
          </div>
          {bundlePricing && bundlePricing.savings > 0 && (
            <Badge variant="default" className="bg-red-500">
              {bundle.discountType === 'percentage'
                ? `-${bundle.discountValue}%`
                : `-${formatCurrency(bundle.discountValue)}`}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bundle Image / Paket Şəkli */}
        <div className="relative aspect-square w-full bg-gray-100 rounded-lg overflow-hidden">
          <Image
            src={getFirstProductImage()}
            alt={bundle.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Bundle Items / Paket Elementləri */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            {t('bundleIncludes') || 'Includes'} ({bundle.items.length} {t('items') || 'items'}):
          </p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {bundle.items.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">
                  {item.quantity}x {item.product.name}
                </span>
                {!item.isRequired && (
                  <Badge variant="outline" className="text-xs">
                    {t('optional') || 'Optional'}
                  </Badge>
                )}
              </div>
            ))}
            {bundle.items.length > 3 && (
              <p className="text-xs text-gray-500">
                +{bundle.items.length - 3} {t('moreItems') || 'more items'}
              </p>
            )}
          </div>
        </div>

        {/* Pricing / Qiymətləndirmə */}
        {bundlePricing && (
          <div className="space-y-2 pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{t('originalPrice') || 'Original Price'}:</span>
              <span className="text-sm text-gray-500 line-through">
                {formatCurrency(bundlePricing.originalPrice)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{t('bundlePrice') || 'Bundle Price'}:</span>
              <span className="text-lg font-bold text-blue-600">
                {formatCurrency(bundlePricing.finalPrice)}
              </span>
            </div>
            {bundlePricing.savings > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-600 font-medium">
                  {t('youSave') || 'You Save'}:
                </span>
                <span className="text-sm text-green-600 font-bold">
                  {formatCurrency(bundlePricing.savings)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Actions / Əməliyyatlar */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="default"
            className="flex-1"
            onClick={() => onAddToCart && onAddToCart(bundle.id)}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {t('addBundleToCart') || 'Add Bundle to Cart'}
          </Button>
          <Link href={`/products/bundles/${bundle.id}`}>
            <Button variant="outline">
              {t('viewDetails') || 'View Details'}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

