/**
 * Product Reviews Component / Məhsul Rəyləri Komponenti
 * Display product reviews with photo/video support, verified badge, and voting
 * Foto/video dəstəyi, təsdiqlənmiş nişan və səsvermə ilə məhsul rəylərini göstər
 */

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star, CheckCircle2, ThumbsUp, ThumbsDown, Image as ImageIcon, Video, Play, Filter, SortAsc } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ReviewHelpfulButton } from '@/components/reviews/ReviewHelpfulButton';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';

interface Review {
  id: string;
  rating: number;
  comment: string;
  isVerifiedPurchase?: boolean;
  helpfulCount?: number;
  notHelpfulCount?: number;
  images?: Array<{ id: string; imageUrl: string; order: number }>;
  video?: { id: string; videoUrl: string; thumbnailUrl?: string };
  user: {
    name: string;
    email: string;
    image?: string;
  };
  createdAt: string;
}

interface ProductReviewsProps {
  productId: string;
  reviews?: Review[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  className?: string;
}

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest' | 'most_helpful';
type FilterOption = 'all' | 'verified' | 'with_photos' | 'with_videos';

export function ProductReviews({
  productId,
  reviews: initialReviews = [],
  onLoadMore,
  hasMore = false,
  className = '',
}: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const t = useTranslations('reviews');

  useEffect(() => {
    fetchReviews();
  }, [productId, sortBy, filterBy]);

  const fetchReviews = async () => {
    try {
      const params = new URLSearchParams({
        sortBy,
        ...(filterBy !== 'all' && { filter: filterBy }),
      });

      const response = await fetch(`/api/products/${productId}/reviews?${params}`);
      const data = await response.json();

      if (data.success) {
        setReviews(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const filteredReviews = reviews.filter((review) => {
    if (filterBy === 'verified') return review.isVerifiedPurchase;
    if (filterBy === 'with_photos') return review.images && review.images.length > 0;
    if (filterBy === 'with_videos') return review.video;
    return true;
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      case 'most_helpful':
        return (b.helpfulCount || 0) - (a.helpfulCount || 0);
      default:
        return 0;
    }
  });

  if (reviews.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <p className="text-gray-600">{t('noReviews') || 'No reviews yet'}</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filters and Sort / Filtrlər və Sıralama */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filterBy === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterBy('all')}
          >
            {t('all') || 'All'}
          </Button>
          <Button
            variant={filterBy === 'verified' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterBy('verified')}
          >
            <CheckCircle2 className="h-4 w-4 mr-1" />
            {t('verified') || 'Verified'}
          </Button>
          <Button
            variant={filterBy === 'with_photos' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterBy('with_photos')}
          >
            <ImageIcon className="h-4 w-4 mr-1" />
            {t('withPhotos') || 'With Photos'}
          </Button>
          <Button
            variant={filterBy === 'with_videos' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterBy('with_videos')}
          >
            <Video className="h-4 w-4 mr-1" />
            {t('withVideos') || 'With Videos'}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <SortAsc className="h-4 w-4 text-gray-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="newest">{t('newest') || 'Newest'}</option>
            <option value="oldest">{t('oldest') || 'Oldest'}</option>
            <option value="highest">{t('highest') || 'Highest Rating'}</option>
            <option value="lowest">{t('lowest') || 'Lowest Rating'}</option>
            <option value="most_helpful">{t('mostHelpful') || 'Most Helpful'}</option>
          </select>
        </div>
      </div>

      {/* Reviews List / Rəylər Siyahısı */}
      <div className="space-y-6">
        {sortedReviews.map((review) => (
          <Card key={review.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              {/* Review Header / Rəy Başlığı */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {/* User Avatar / İstifadəçi Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                    {review.user.image ? (
                      <Image
                        src={review.user.image}
                        alt={review.user.name}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    ) : (
                      review.user.name.charAt(0).toUpperCase()
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-900">{review.user.name}</h4>
                      {review.isVerifiedPurchase && (
                        <Badge className="bg-green-100 text-green-800 text-xs flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          {t('verifiedPurchase') || 'Verified Purchase'}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <span className="text-sm text-gray-500">
                  {format(new Date(review.createdAt), 'MMM d, yyyy')}
                </span>
              </div>

              {/* Review Comment / Rəy Şərhi */}
              {review.comment && (
                <p className="text-gray-700 mb-4 whitespace-pre-wrap">{review.comment}</p>
              )}

              {/* Review Images / Rəy Şəkilləri */}
              {review.images && review.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                  {review.images.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(img.imageUrl)}
                      className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-blue-500 transition-colors"
                    >
                      <Image
                        src={img.imageUrl}
                        alt={`Review image ${img.order}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Review Video / Rəy Videosu */}
              {review.video && (
                <div className="mb-4">
                  <button
                    onClick={() => setSelectedVideo(review.video!.videoUrl)}
                    className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden border border-gray-200 hover:border-blue-500 transition-colors group"
                  >
                    {review.video.thumbnailUrl ? (
                      <Image
                        src={review.video.thumbnailUrl}
                        alt="Review video"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <Video className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                      <Play className="h-16 w-16 text-white" />
                    </div>
                  </button>
                </div>
              )}

              {/* Helpful Button / Faydalı Düyməsi */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                <ReviewHelpfulButton
                  reviewId={review.id}
                  helpfulCount={review.helpfulCount || 0}
                  notHelpfulCount={review.notHelpfulCount || 0}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More / Daha Çox Yüklə */}
      {hasMore && onLoadMore && (
        <div className="text-center">
          <Button variant="outline" onClick={onLoadMore}>
            {t('loadMore') || 'Load More Reviews'}
          </Button>
        </div>
      )}

      {/* Image Lightbox / Şəkil Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <Image
              src={selectedImage}
              alt="Review image"
              width={1200}
              height={800}
              className="object-contain max-h-[90vh]"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Video Modal / Video Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <video
              src={selectedVideo}
              controls
              autoPlay
              className="max-h-[90vh]"
            />
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

