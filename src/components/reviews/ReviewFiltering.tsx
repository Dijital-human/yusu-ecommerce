/**
 * Review Filtering Component / Rəy Filtrləmə Komponenti
 * Filter reviews by different criteria / Rəyləri müxtəlif meyarlara görə filtrlə
 */

'use client';

import { Button } from '@/components/ui/Button';
import { Image, Video, CheckCircle, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ReviewFilteringProps {
  filters: {
    withImages?: boolean;
    withVideos?: boolean;
    verifiedPurchase?: boolean;
    rating?: number | null;
  };
  onFilterChange: (filters: {
    withImages?: boolean;
    withVideos?: boolean;
    verifiedPurchase?: boolean;
    rating?: number | null;
  }) => void;
}

export function ReviewFiltering({ filters, onFilterChange }: ReviewFilteringProps) {
  const t = useTranslations('reviews');

  const handleToggleFilter = (key: keyof typeof filters) => {
    onFilterChange({
      ...filters,
      [key]: filters[key] ? undefined : true,
    });
  };

  const handleRatingFilter = (rating: number | null) => {
    onFilterChange({
      ...filters,
      rating: filters.rating === rating ? null : rating,
    });
  };

  const hasActiveFilters = filters.withImages || filters.withVideos || filters.verifiedPurchase || filters.rating;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-gray-700">{t('filters') || 'Filters'}:</span>
        
        <Button
          variant={filters.withImages ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleToggleFilter('withImages')}
          className="flex items-center gap-1"
        >
          <Image className="h-3 w-3" />
          {t('withImages') || 'With Images'}
        </Button>

        <Button
          variant={filters.withVideos ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleToggleFilter('withVideos')}
          className="flex items-center gap-1"
        >
          <Video className="h-3 w-3" />
          {t('withVideos') || 'With Videos'}
        </Button>

        <Button
          variant={filters.verifiedPurchase ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleToggleFilter('verifiedPurchase')}
          className="flex items-center gap-1"
        >
          <CheckCircle className="h-3 w-3" />
          {t('verifiedPurchase') || 'Verified Purchase'}
        </Button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-600">{t('rating') || 'Rating'}:</span>
        {[5, 4, 3, 2, 1].map((rating) => (
          <Button
            key={rating}
            variant={filters.rating === rating ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleRatingFilter(rating)}
            className="flex items-center gap-1"
          >
            <Star className={`h-3 w-3 ${filters.rating === rating ? 'fill-current' : ''}`} />
            {rating}
          </Button>
        ))}
      </div>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFilterChange({})}
          className="text-sm"
        >
          {t('clearFilters') || 'Clear Filters'}
        </Button>
      )}
    </div>
  );
}

