/**
 * Review Enhancement Service / Rəy Təkmilləşdirmə Xidməti
 * Service functions for review enhancements / Rəy təkmilləşdirmələri üçün xidmət funksiyaları
 */

import { db } from '@/lib/db';
import { logger } from '@/lib/utils/logger';

/**
 * Get review with enhancements / Təkmilləşdirmələrlə rəyi al
 */
export async function getReviewWithEnhancements(reviewId: string) {
  try {
    const review = await (db as any).review.findUnique({
      where: { id: reviewId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        images: {
          orderBy: { order: 'asc' },
        },
        video: true,
        votes: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        response: true,
      },
    });

    // Calculate helpful count / Faydalı sayını hesabla
    const helpfulCount = review?.votes?.filter((v: any) => v.voteType === 'helpful').length || 0;
    const notHelpfulCount = review?.votes?.filter((v: any) => v.voteType === 'not_helpful').length || 0;

    return {
      ...review,
      helpfulCount,
      notHelpfulCount,
    };
  } catch (error) {
    logger.error('Failed to get review with enhancements / Təkmilləşdirmələrlə rəyi almaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Add review image / Rəy şəkli əlavə et
 */
export async function addReviewImage(
  reviewId: string,
  imageUrl: string,
  order: number = 0
) {
  try {
    // Check if review exists / Rəyin mövcud olub-olmadığını yoxla
    const review = await (db as any).review.findUnique({
      where: { id: reviewId },
      include: { images: true },
    });

    if (!review) {
      throw new Error('Review not found / Rəy tapılmadı');
    }

    // Check image limit (max 5) / Şəkil limitini yoxla (maksimum 5)
    if (review.images.length >= 5) {
      throw new Error('Maximum 5 images per review / Rəy başına maksimum 5 şəkil');
    }

    const image = await (db as any).reviewImage.create({
      data: {
        reviewId,
        imageUrl,
        order,
      },
    });

    logger.info('Review image added / Rəy şəkli əlavə edildi', {
      reviewId,
      imageId: image.id,
    });

    return image;
  } catch (error) {
    logger.error('Failed to add review image / Rəy şəkli əlavə etmək uğursuz oldu', error);
    throw error;
  }
}

/**
 * Add review video / Rəy videosu əlavə et
 */
export async function addReviewVideo(
  reviewId: string,
  videoUrl: string,
  thumbnailUrl?: string,
  duration?: number
) {
  try {
    // Check if review already has video / Rəyin artıq videosu olub-olmadığını yoxla
    const existingVideo = await (db as any).reviewVideo.findUnique({
      where: { reviewId },
    });

    if (existingVideo) {
      throw new Error('Review already has a video / Rəyin artıq videosu var');
    }

    // Validate duration (max 30 seconds) / Müddəti yoxla (maksimum 30 saniyə)
    if (duration && duration > 30) {
      throw new Error('Video duration must be 30 seconds or less / Video müddəti 30 saniyə və ya daha az olmalıdır');
    }

    const video = await (db as any).reviewVideo.create({
      data: {
        reviewId,
        videoUrl,
        thumbnailUrl: thumbnailUrl || null,
        duration: duration || null,
      },
    });

    logger.info('Review video added / Rəy videosu əlavə edildi', {
      reviewId,
      videoId: video.id,
    });

    return video;
  } catch (error) {
    logger.error('Failed to add review video / Rəy videosu əlavə etmək uğursuz oldu', error);
    throw error;
  }
}

/**
 * Vote on review / Rəyə səs ver
 */
export async function voteOnReview(
  reviewId: string,
  userId: string,
  voteType: 'helpful' | 'not_helpful'
) {
  try {
    // Check if user already voted / İstifadəçinin artıq səs verdiyini yoxla
    const existingVote = await (db as any).reviewVote.findUnique({
      where: {
        reviewId_userId: {
          reviewId,
          userId,
        },
      },
    });

    if (existingVote) {
      // Update existing vote / Mövcud səsi yenilə
      const vote = await (db as any).reviewVote.update({
        where: {
          reviewId_userId: {
            reviewId,
            userId,
          },
        },
        data: {
          voteType,
        },
      });

      return vote;
    }

    // Create new vote / Yeni səs yarat
    const vote = await (db as any).reviewVote.create({
      data: {
        reviewId,
        userId,
        voteType,
      },
    });

    logger.info('Review vote created / Rəy səsi yaradıldı', {
      reviewId,
      userId,
      voteType,
    });

    return vote;
  } catch (error) {
    logger.error('Failed to vote on review / Rəyə səs vermək uğursuz oldu', error);
    throw error;
  }
}

/**
 * Remove review vote / Rəy səsini sil
 */
export async function removeReviewVote(reviewId: string, userId: string) {
  try {
    await (db as any).reviewVote.delete({
      where: {
        reviewId_userId: {
          reviewId,
          userId,
        },
      },
    });

    logger.info('Review vote removed / Rəy səsi silindi', {
      reviewId,
      userId,
    });
  } catch (error) {
    logger.error('Failed to remove review vote / Rəy səsini silmək uğursuz oldu', error);
    throw error;
  }
}

/**
 * Get reviews with sorting and filtering / Sıralama və filtrləmə ilə rəyləri al
 */
export async function getReviewsWithFilters(
  productId: string,
  options: {
    sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'most_helpful';
    filterBy?: {
      withImages?: boolean;
      withVideos?: boolean;
      verifiedPurchase?: boolean;
      rating?: number;
    };
    limit?: number;
    offset?: number;
  } = {}
) {
  try {
    const {
      sortBy = 'newest',
      filterBy = {},
      limit = 10,
      offset = 0,
    } = options;

    const where: any = { productId };

    // Apply filters / Filtrləri tətbiq et
    if (filterBy.withImages) {
      where.images = { some: {} };
    }

    if (filterBy.withVideos) {
      where.video = { isNot: null };
    }

    if (filterBy.rating) {
      where.rating = filterBy.rating;
    }

    // TODO: Add verified purchase filter when order tracking is available
    // / Sifariş izləməsi mövcud olduqda təsdiqlənmiş alış filtresini əlavə et

    // Determine sort order / Sıralama sırasını müəyyən et
    let orderBy: any = {};
    switch (sortBy) {
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'highest':
        orderBy = { rating: 'desc' };
        break;
      case 'lowest':
        orderBy = { rating: 'asc' };
        break;
      case 'most_helpful':
        // Sort by helpful votes count / Faydalı səslərin sayına görə sırala
        // This requires a more complex query / Bu daha mürəkkəb sorğu tələb edir
        orderBy = { createdAt: 'desc' }; // Placeholder / Yer tutucu
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    const [reviews, total] = await Promise.all([
      (db as any).review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          images: {
            orderBy: { order: 'asc' },
          },
          video: true,
          votes: true,
          response: true,
        },
        orderBy,
        take: limit,
        skip: offset,
      }),
      (db as any).review.count({ where }),
    ]);

    // Calculate helpful counts for each review / Hər rəy üçün faydalı saylarını hesabla
    const reviewsWithCounts = reviews.map((review: any) => {
      const helpfulCount = review.votes?.filter((v: any) => v.voteType === 'helpful').length || 0;
      const notHelpfulCount = review.votes?.filter((v: any) => v.voteType === 'not_helpful').length || 0;
      return {
        ...review,
        helpfulCount,
        notHelpfulCount,
      };
    });

    return {
      reviews: reviewsWithCounts,
      total,
      pagination: {
        page: Math.floor(offset / limit) + 1,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Failed to get reviews with filters / Filtrlərlə rəyləri almaq uğursuz oldu', error);
    throw error;
  }
}

