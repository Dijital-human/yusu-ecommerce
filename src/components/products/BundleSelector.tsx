/**
 * Bundle Selector Component / Paket Seçici Komponenti
 * Select products for bundle / Paket üçün məhsulları seç
 */

'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/i18n/routing';

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

interface BundleSelectorProps {
  items: BundleItem[];
  selectedItems: string[];
  onToggleItem: (itemId: string) => void;
}

export function BundleSelector({ items, selectedItems, onToggleItem }: BundleSelectorProps) {
  const t = useTranslations('products');
  const tCommon = useTranslations('common');

  const requiredItems = items.filter((item) => item.isRequired);
  const optionalItems = items.filter((item) => !item.isRequired);

  const getImage = (product: BundleProduct): string => {
    if (typeof product.images === 'string') {
      const imageArray = product.images.split(',');
      return imageArray[0] || '/placeholder-product.jpg';
    }
    return product.images[0] || '/placeholder-product.jpg';
  };

  return (
    <div className="space-y-6">
      {/* Required Items / Tələb Olunan Elementlər */}
      {requiredItems.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('requiredItems') || 'Required Items'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {requiredItems.map((item) => (
              <Card key={item.id} className="relative">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={getImage(item.product)}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.product.id}`}>
                        <h4 className="font-medium text-gray-900 hover:text-blue-600 line-clamp-2">
                          {item.product.name}
                        </h4>
                      </Link>
                      <div className="mt-1">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(item.product.price)}
                        </span>
                        {item.quantity > 1 && (
                          <span className="text-xs text-gray-500 ml-1">
                            x{item.quantity}
                          </span>
                        )}
                      </div>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {t('required') || 'Required'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Optional Items / Opsional Elementlər */}
      {optionalItems.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('optionalItems') || 'Optional Items'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {optionalItems.map((item) => {
              const isSelected = selectedItems.includes(item.id);
              return (
                <Card
                  key={item.id}
                  className={`relative cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => onToggleItem(item.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={getImage(item.product)}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-blue-500 bg-opacity-50 flex items-center justify-center">
                            <Check className="h-6 w-6 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${item.product.id}`}>
                          <h4 className="font-medium text-gray-900 hover:text-blue-600 line-clamp-2">
                            {item.product.name}
                          </h4>
                        </Link>
                        <div className="mt-1">
                          <span className="text-sm font-semibold text-gray-900">
                            {formatCurrency(item.product.price)}
                          </span>
                          {item.quantity > 1 && (
                            <span className="text-xs text-gray-500 ml-1">
                              x{item.quantity}
                            </span>
                          )}
                        </div>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {t('optional') || 'Optional'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

