/**
 * Flash Sale Progress Component / Flash Sale Tərəqqi Komponenti
 * Displays progress bar showing sold/total items
 * Satılan/ümumi məhsulları göstərən tərəqqi çubuğu göstərir
 */

"use client";

import { useTranslations } from "next-intl";

interface FlashSaleProgressProps {
  sold: number; // Number of items sold / Satılan məhsul sayı
  total: number; // Total number of items / Ümumi məhsul sayı
  className?: string; // Additional CSS classes / Əlavə CSS sinifləri
}

export function FlashSaleProgress({ sold, total, className = "" }: FlashSaleProgressProps) {
  const t = useTranslations('deals');
  const percentage = total > 0 ? Math.min((sold / total) * 100, 100) : 0;
  const remaining = Math.max(total - sold, 0);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('sold')}: {sold} / {total}
        </span>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {t('remaining')}: {remaining}
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-red-500 to-orange-500 h-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-center">
        {percentage.toFixed(1)}% {t('sold')}
      </div>
    </div>
  );
}

