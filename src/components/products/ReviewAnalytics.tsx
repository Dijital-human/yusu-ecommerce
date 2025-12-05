/**
 * Review Analytics Component / Rəy Analitikası Komponenti
 * Display review analytics including rating distribution / Reytinq paylanması daxil olmaqla rəy analitikasını göstər
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Star } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ReviewAnalytics {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: Array<{
    rating: number;
    count: number;
    percentage: number;
  }>;
  verifiedPurchaseCount: number;
  withImagesCount: number;
  withVideosCount: number;
  recentReviewsCount: number;
}

interface ReviewAnalyticsProps {
  productId: string;
  className?: string;
}

export function ReviewAnalytics({ productId, className = '' }: ReviewAnalyticsProps) {
  const t = useTranslations('reviews');
  const [analytics, setAnalytics] = useState<ReviewAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [productId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${productId}/reviews/analytics`);
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.data);
      } else {
        setError(data.error || 'Failed to fetch analytics');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !analytics) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{t('analytics') || 'Review Analytics'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Average Rating / Orta Reytinq */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-4xl font-bold text-gray-900">
              {analytics.averageRating.toFixed(1)}
            </span>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-6 w-6 ${
                    i < Math.floor(analytics.averageRating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-600">
            {analytics.totalReviews} {t('totalReviews') || 'total reviews'}
          </p>
        </div>

        {/* Rating Distribution / Reytinq Paylanması */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            {t('ratingDistribution') || 'Rating Distribution'}
          </h3>
          <div className="space-y-2">
            {analytics.ratingDistribution
              .slice()
              .reverse()
              .map((dist) => (
                <div key={dist.rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-20">
                    <span className="text-sm font-medium">{dist.rating}</span>
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-yellow-400 h-full transition-all duration-300"
                      style={{ width: `${dist.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-16 text-right">
                    {dist.count} ({dist.percentage.toFixed(0)}%)
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Additional Stats / Əlavə Statistika */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div>
            <p className="text-sm text-gray-600">{t('verifiedPurchase') || 'Verified Purchase'}</p>
            <p className="text-lg font-bold text-gray-900">{analytics.verifiedPurchaseCount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">{t('withImages') || 'With Images'}</p>
            <p className="text-lg font-bold text-gray-900">{analytics.withImagesCount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">{t('withVideos') || 'With Videos'}</p>
            <p className="text-lg font-bold text-gray-900">{analytics.withVideosCount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">{t('recentReviews') || 'Recent (30 days)'}</p>
            <p className="text-lg font-bold text-gray-900">{analytics.recentReviewsCount}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

