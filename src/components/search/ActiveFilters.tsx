/**
 * Active Filters Component / Aktiv Filtrlər Komponenti
 * Display active filters with remove buttons / Aktiv filtrləri silmə düymələri ilə göstər
 */

'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FilterState } from '@/components/filters/ProductFilters';
import { useTranslations } from 'next-intl';

interface ActiveFiltersProps {
  filters: FilterState;
  priceRange: { min: number; max: number };
  onRemoveFilter: (key: keyof FilterState, value?: any) => void;
  onClearAll: () => void;
}

export function ActiveFilters({
  filters,
  priceRange,
  onRemoveFilter,
  onClearAll,
}: ActiveFiltersProps) {
  const t = useTranslations('search');
  const tCommon = useTranslations('common');

  const activeFilters: Array<{ key: keyof FilterState; label: string; value: any }> = [];

  // Price range / Qiymət aralığı
  if (filters.priceRange[0] !== priceRange.min || filters.priceRange[1] !== priceRange.max) {
    activeFilters.push({
      key: 'priceRange',
      label: t('priceRange') || 'Price Range',
      value: `$${filters.priceRange[0]} - $${filters.priceRange[1]}`,
    });
  }

  // Brands / Markalar
  filters.brands.forEach((brand) => {
    activeFilters.push({
      key: 'brands',
      label: brand,
      value: brand,
    });
  });

  // Rating / Reytinq
  if (filters.rating > 0) {
    activeFilters.push({
      key: 'rating',
      label: t('rating') || 'Rating',
      value: `${filters.rating}+ ${t('stars') || 'stars'}`,
    });
  }

  // Colors / Rənglər
  filters.colors.forEach((color) => {
    activeFilters.push({
      key: 'colors',
      label: color,
      value: color,
    });
  });

  // Sizes / Ölçülər
  filters.sizes.forEach((size) => {
    activeFilters.push({
      key: 'sizes',
      label: size,
      value: size,
    });
  });

  // In Stock / Stokda var
  if (filters.inStock) {
    activeFilters.push({
      key: 'inStock',
      label: t('inStock') || 'In Stock',
      value: true,
    });
  }

  // On Sale / Endirimdə
  if (filters.onSale) {
    activeFilters.push({
      key: 'onSale',
      label: t('onSale') || 'On Sale',
      value: true,
    });
  }

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-sm font-medium text-gray-700">
        {t('activeFilters') || 'Active Filters'}:
      </span>
      {activeFilters.map((filter, index) => (
        <Badge
          key={`${filter.key}-${index}`}
          variant="secondary"
          className="flex items-center gap-1 px-3 py-1"
        >
          <span className="text-xs">
            {filter.key === 'priceRange' || filter.key === 'rating' ? (
              <>
                <span className="font-medium">{filter.label}:</span> {filter.value}
              </>
            ) : (
              filter.value
            )}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => {
              if (filter.key === 'brands') {
                onRemoveFilter('brands', filter.value);
              } else if (filter.key === 'colors') {
                onRemoveFilter('colors', filter.value);
              } else if (filter.key === 'sizes') {
                onRemoveFilter('sizes', filter.value);
              } else {
                onRemoveFilter(filter.key);
              }
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        {t('clearAll') || 'Clear All'}
      </Button>
    </div>
  );
}

