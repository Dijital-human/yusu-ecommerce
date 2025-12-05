/**
 * Bundle Price Display Component / Paket Qiymət Göstəricisi Komponenti
 * Display bundle pricing information / Paket qiymətləndirmə məlumatını göstər
 */

'use client';

import { Tag, DollarSign, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface BundlePriceDisplayProps {
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  savings: number;
  discountType: string;
  discountValue: number;
}

export function BundlePriceDisplay({
  originalPrice,
  discountAmount,
  finalPrice,
  savings,
  discountType,
  discountValue,
}: BundlePriceDisplayProps) {
  const t = useTranslations('products');

  return (
    <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center gap-2 mb-3">
        <Tag className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">
          {t('bundlePricing') || 'Bundle Pricing'}
        </h3>
      </div>

      <div className="space-y-2">
        {/* Original Price / Orijinal Qiymət */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {t('originalPrice') || 'Original Price'}:
            </span>
          </div>
          <span className="text-sm font-medium text-gray-700 line-through">
            {formatCurrency(originalPrice)}
          </span>
        </div>

        {/* Discount / Endirim */}
        {discountAmount > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span className="text-sm text-gray-600">
                {t('discount') || 'Discount'}:
              </span>
            </div>
            <span className="text-sm font-medium text-red-600">
              -{formatCurrency(discountAmount)}
              {discountType === 'percentage' && ` (${discountValue}%)`}
            </span>
          </div>
        )}

        {/* Final Price / Son Qiymət */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-300">
          <span className="text-base font-semibold text-gray-900">
            {t('bundlePrice') || 'Bundle Price'}:
          </span>
          <span className="text-xl font-bold text-blue-600">
            {formatCurrency(finalPrice)}
          </span>
        </div>

        {/* Savings / Qənaət */}
        {savings > 0 && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <span className="text-sm font-medium text-green-600">
              {t('youSave') || 'You Save'}:
            </span>
            <span className="text-base font-bold text-green-600">
              {formatCurrency(savings)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

