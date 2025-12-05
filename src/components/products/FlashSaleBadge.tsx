/**
 * Flash Sale Badge Component / Flash Sale Nişanı Komponenti
 * Displays a badge on product cards for flash sales
 * Flash sale-lər üçün məhsul kartlarında nişan göstərir
 */

"use client";

import { Zap } from "lucide-react";
import { useTranslations } from "next-intl";

interface FlashSaleBadgeProps {
  discount?: number; // Discount percentage / Endirim faizi
  className?: string; // Additional CSS classes / Əlavə CSS sinifləri
}

export function FlashSaleBadge({ discount, className = "" }: FlashSaleBadgeProps) {
  const t = useTranslations('deals');

  return (
    <div
      className={`absolute top-2 right-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full flex items-center gap-1 shadow-lg z-10 ${className}`}
    >
      <Zap className="h-4 w-4" />
      <span className="text-xs font-bold">
        {discount ? `${discount}% ${t('off')}` : t('flashSale')}
      </span>
    </div>
  );
}

