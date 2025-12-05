/**
 * Review Helpful Button Component / Rəy Faydalı Düyməsi Komponenti
 * Button to vote if review is helpful / Rəyin faydalı olub-olmadığına səs vermək üçün düymə
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

interface ReviewHelpfulButtonProps {
  reviewId: string;
  productId: string;
  initialHelpfulCount?: number;
  initialNotHelpfulCount?: number;
  userVote?: 'helpful' | 'not_helpful' | null;
}

export function ReviewHelpfulButton({
  reviewId,
  productId,
  initialHelpfulCount = 0,
  initialNotHelpfulCount = 0,
  userVote = null,
}: ReviewHelpfulButtonProps) {
  const t = useTranslations('reviews');
  const [helpfulCount, setHelpfulCount] = useState(initialHelpfulCount);
  const [notHelpfulCount, setNotHelpfulCount] = useState(initialNotHelpfulCount);
  const [currentVote, setCurrentVote] = useState<'helpful' | 'not_helpful' | null>(userVote);
  const [isLoading, setIsLoading] = useState(false);

  const handleVote = async (voteType: 'helpful' | 'not_helpful') => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/products/${productId}/reviews/${reviewId}/vote`, {
        method: currentVote === voteType ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voteType,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to vote');
      }

      if (currentVote === voteType) {
        // Remove vote / Səsi sil
        setCurrentVote(null);
        if (voteType === 'helpful') {
          setHelpfulCount(Math.max(0, helpfulCount - 1));
        } else {
          setNotHelpfulCount(Math.max(0, notHelpfulCount - 1));
        }
      } else {
        // Update vote / Səsi yenilə
        const previousVote = currentVote;
        setCurrentVote(voteType);

        if (previousVote === 'helpful') {
          setHelpfulCount(Math.max(0, helpfulCount - 1));
        } else if (previousVote === 'not_helpful') {
          setNotHelpfulCount(Math.max(0, notHelpfulCount - 1));
        }

        if (voteType === 'helpful') {
          setHelpfulCount(helpfulCount + 1);
        } else {
          setNotHelpfulCount(notHelpfulCount + 1);
        }
      }
    } catch (error: any) {
      toast.error(error.message || t('errorVoting') || 'Error voting on review');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote('helpful')}
        disabled={isLoading}
        className={`flex items-center gap-1 ${
          currentVote === 'helpful' ? 'bg-blue-50 text-blue-600' : ''
        }`}
      >
        <ThumbsUp className={`h-4 w-4 ${currentVote === 'helpful' ? 'fill-current' : ''}`} />
        <span>{t('helpful') || 'Helpful'}</span>
        {helpfulCount > 0 && (
          <span className="text-xs">({helpfulCount})</span>
        )}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote('not_helpful')}
        disabled={isLoading}
        className={`flex items-center gap-1 ${
          currentVote === 'not_helpful' ? 'bg-red-50 text-red-600' : ''
        }`}
      >
        <ThumbsDown className={`h-4 w-4 ${currentVote === 'not_helpful' ? 'fill-current' : ''}`} />
        <span>{t('notHelpful') || 'Not Helpful'}</span>
        {notHelpfulCount > 0 && (
          <span className="text-xs">({notHelpfulCount})</span>
        )}
      </Button>
    </div>
  );
}

