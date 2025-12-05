/**
 * Product Reviews Service / Məhsul Rəyləri Xidməti
 * Database operations for product reviews / Məhsul rəyləri üçün veritabanı əməliyyatları
 */

import { getReadClient, getWriteClient } from "@/lib/db/query-client";

export interface ProductReview {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment?: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  isSpam: boolean;
  reportCount: number;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  helpfulCount?: number;
  notHelpfulCount?: number;
  images?: Array<{ id: string; imageUrl: string; order: number }>;
  video?: { id: string; videoUrl: string; thumbnailUrl?: string; duration?: number };
}

/**
 * Check if user has purchased the product / İstifadəçinin məhsulu alıb-almadığını yoxla
 */
export async function checkVerifiedPurchase(
  userId: string,
  productId: string
): Promise<boolean> {
  try {
    const readClient = await getReadClient();
    
    // Check if user has any completed orders with this product / İstifadəçinin bu məhsulla tamamlanmış sifarişləri olub-olmadığını yoxla
    const orderItem = await (readClient as any).orderItem.findFirst({
      where: {
        productId,
        order: {
          userId,
          status: {
            in: ['DELIVERED', 'COMPLETED'],
          },
        },
      },
    });

    return !!orderItem;
  } catch (error) {
    console.error("Error checking verified purchase:", error);
    return false;
  }
}

/**
 * Get review analytics for a product / Məhsul üçün rəy analitikasını al
 */
export async function getReviewAnalytics(productId: string): Promise<{
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    rating: number;
    count: number;
    percentage: number;
  }[];
  verifiedPurchaseCount: number;
  withImagesCount: number;
  withVideosCount: number;
  recentReviewsCount: number; // Reviews in last 30 days / Son 30 gündə rəylər
}> {
  try {
    const readClient = await getReadClient();
    
    // Get all reviews for the product / Məhsul üçün bütün rəyləri al
    const reviews = await (readClient as any).review.findMany({
      where: {
        productId,
        isApproved: true,
        isSpam: false,
      },
      include: {
        images: true,
        video: true,
      },
    });

    const totalReviews = reviews.length;
    
    // Calculate average rating / Orta reytinqi hesabla
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / totalReviews
      : 0;

    // Rating distribution / Reytinq paylanması
    const ratingCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((review: any) => {
      ratingCounts[review.rating] = (ratingCounts[review.rating] || 0) + 1;
    });

    const ratingDistribution = [1, 2, 3, 4, 5].map((rating) => ({
      rating,
      count: ratingCounts[rating] || 0,
      percentage: totalReviews > 0 ? (ratingCounts[rating] || 0) / totalReviews * 100 : 0,
    }));

    // Verified purchase count / Təsdiqlənmiş alış sayı
    const verifiedPurchaseCount = reviews.filter((r: any) => r.isVerifiedPurchase).length;

    // Reviews with images / Şəkilləri olan rəylər
    const withImagesCount = reviews.filter((r: any) => r.images && r.images.length > 0).length;

    // Reviews with videos / Videoları olan rəylər
    const withVideosCount = reviews.filter((r: any) => r.video).length;

    // Recent reviews (last 30 days) / Son rəylər (son 30 gün)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentReviewsCount = reviews.filter((r: any) => {
      return new Date(r.createdAt) >= thirtyDaysAgo;
    }).length;

    return {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal / 1 onluğa yuvarla
      ratingDistribution,
      verifiedPurchaseCount,
      withImagesCount,
      withVideosCount,
      recentReviewsCount,
    };
  } catch (error) {
    console.error("Error fetching review analytics:", error);
    throw error;
  }
}

/**
 * Report review as spam / Rəyi spam kimi bildir
 */
export async function reportReview(reviewId: string, userId: string): Promise<void> {
  try {
    const writeClient = await getWriteClient();
    
    // Increment report count / Şikayət sayını artır
    await (writeClient as any).review.update({
      where: { id: reviewId },
      data: {
        reportCount: {
          increment: 1,
        },
      },
    });

    // Auto-mark as spam if report count >= 5 / Əgər şikayət sayı >= 5 olarsa avtomatik spam kimi işarələ
    const review = await (writeClient as any).review.findUnique({
      where: { id: reviewId },
    });

    if (review && review.reportCount >= 5) {
      await (writeClient as any).review.update({
        where: { id: reviewId },
        data: {
          isSpam: true,
          isApproved: false,
        },
      });
    }
  } catch (error) {
    console.error("Error reporting review:", error);
    throw error;
  }
}

