/**
 * Question Sorting Component / Sual Sıralama Komponenti
 * Sort and filter questions / Sualları sırala və filtrlə
 */

'use client';

import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';
import { ArrowUpDown, CheckCircle, XCircle } from 'lucide-react';

interface QuestionSortingProps {
  sortBy: 'newest' | 'oldest' | 'most_helpful';
  status: 'all' | 'answered' | 'unanswered';
  onSortChange: (sortBy: 'newest' | 'oldest' | 'most_helpful') => void;
  onStatusChange: (status: 'all' | 'answered' | 'unanswered') => void;
}

export function QuestionSorting({
  sortBy,
  status,
  onSortChange,
  onStatusChange,
}: QuestionSortingProps) {
  const t = useTranslations('qa');

  return (
    <div className="flex flex-wrap items-center gap-4 mb-6">
      {/* Status Filter / Status Filtrləri */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">{t('filter') || 'Filter'}:</span>
        <div className="flex gap-2">
          <Button
            variant={status === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStatusChange('all')}
          >
            {t('all') || 'All'}
          </Button>
          <Button
            variant={status === 'answered' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStatusChange('answered')}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            {t('answered') || 'Answered'}
          </Button>
          <Button
            variant={status === 'unanswered' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStatusChange('unanswered')}
          >
            <XCircle className="h-4 w-4 mr-1" />
            {t('unanswered') || 'Unanswered'}
          </Button>
        </div>
      </div>

      {/* Sort Options / Sıralama Seçimləri */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">{t('sortBy') || 'Sort By'}:</span>
        <div className="flex gap-2">
          <Button
            variant={sortBy === 'newest' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSortChange('newest')}
          >
            <ArrowUpDown className="h-4 w-4 mr-1" />
            {t('newest') || 'Newest'}
          </Button>
          <Button
            variant={sortBy === 'oldest' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSortChange('oldest')}
          >
            {t('oldest') || 'Oldest'}
          </Button>
          <Button
            variant={sortBy === 'most_helpful' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSortChange('most_helpful')}
          >
            {t('mostHelpful') || 'Most Helpful'}
          </Button>
        </div>
      </div>
    </div>
  );
}

