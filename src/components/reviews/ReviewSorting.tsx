/**
 * Review Sorting Component / Rəy Sıralama Komponenti
 * Sort reviews by different criteria / Rəyləri müxtəlif meyarlara görə sırala
 */

'use client';

import { Button } from '@/components/ui/Button';
import { ArrowUpDown, Clock, Star, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ReviewSortingProps {
  sortBy: 'newest' | 'oldest' | 'highest' | 'lowest' | 'most_helpful';
  onSortChange: (sortBy: 'newest' | 'oldest' | 'highest' | 'lowest' | 'most_helpful') => void;
}

export function ReviewSorting({ sortBy, onSortChange }: ReviewSortingProps) {
  const t = useTranslations('reviews');

  const sortOptions = [
    { value: 'newest', label: t('newest') || 'Newest', icon: Clock },
    { value: 'oldest', label: t('oldest') || 'Oldest', icon: Clock },
    { value: 'highest', label: t('highestRating') || 'Highest Rating', icon: Star },
    { value: 'lowest', label: t('lowestRating') || 'Lowest Rating', icon: Star },
    { value: 'most_helpful', label: t('mostHelpful') || 'Most Helpful', icon: TrendingUp },
  ] as const;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-gray-600">{t('sortBy') || 'Sort by'}:</span>
      {sortOptions.map((option) => {
        const Icon = option.icon;
        return (
          <Button
            key={option.value}
            variant={sortBy === option.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSortChange(option.value)}
            className="flex items-center gap-1"
          >
            <Icon className="h-3 w-3" />
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}

