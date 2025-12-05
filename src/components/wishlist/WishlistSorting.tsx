/**
 * Wishlist Sorting Component / İstək Siyahısı Sıralama Komponenti
 * Sort wishlist items / İstək siyahısı elementlərini sırala
 */

'use client';

import { ArrowUpDown, Calendar, DollarSign, ArrowUpAZ } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';

export type SortOption = 'date' | 'priceAsc' | 'priceDesc' | 'nameAsc' | 'nameDesc';

interface WishlistSortingProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export function WishlistSorting({ sortBy, onSortChange }: WishlistSortingProps) {
  const t = useTranslations('wishlist');
  const tCommon = useTranslations('common');

  const sortOptions: Array<{ value: SortOption; label: string; icon: any }> = [
    { value: 'date', label: t('sortByDate') || 'Date Added', icon: Calendar },
    { value: 'priceAsc', label: t('sortByPriceLow') || 'Price: Low to High', icon: DollarSign },
    { value: 'priceDesc', label: t('sortByPriceHigh') || 'Price: High to Low', icon: DollarSign },
    { value: 'nameAsc', label: t('sortByNameAsc') || 'Name: A-Z', icon: ArrowUpAZ },
    { value: 'nameDesc', label: t('sortByNameDesc') || 'Name: Z-A', icon: ArrowUpAZ },
  ];

  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="h-4 w-4 text-gray-500" />
      <span className="text-sm font-medium text-gray-700">
        {t('sortBy') || 'Sort By'}:
      </span>
      <div className="flex gap-2">
        {sortOptions.map((option) => {
          const Icon = option.icon;
          return (
            <Button
              key={option.value}
              variant={sortBy === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSortChange(option.value)}
            >
              <Icon className="h-4 w-4 mr-1" />
              {option.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

