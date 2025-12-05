/**
 * Filter Count Badge Component / Filter Sayı Badge Komponenti
 * Display active filter count / Aktiv filter sayını göstər
 */

'use client';

import { Badge } from '@/components/ui/Badge';
import { FilterState } from '@/components/filters/ProductFilters';
import { getActiveFilterCount } from '@/lib/filters/filter-persistence';

interface FilterCountBadgeProps {
  filters: FilterState;
  priceRange: { min: number; max: number };
}

export function FilterCountBadge({ filters, priceRange }: FilterCountBadgeProps) {
  const count = getActiveFilterCount(filters, priceRange);

  if (count === 0) {
    return null;
  }

  return (
    <Badge variant="default" className="ml-2">
      {count}
    </Badge>
  );
}

