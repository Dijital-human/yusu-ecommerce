/**
 * Product Reviews API Route / Məhsul Rəyləri API Route
 * This route handles fetching reviews for a specific product
 * Bu route müəyyən məhsul üçün rəyləri almağı idarə edir
 */

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { parsePagination, createPaginationInfo } from "@/lib/api/pagination";
import { successResponseWithPagination, successResponse, badRequestResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { getProductReviews, createReview } from "@/services/review.service";
import { getReviewsWithFilters } from "@/lib/reviews/review-enhancement";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const productId = resolvedParams.id;
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams, 10);

    // Get sorting and filtering options / Sıralama və filtrləmə seçimlərini al
    const sortBy = (searchParams.get('sortBy') as 'newest' | 'oldest' | 'highest' | 'lowest' | 'most_helpful') || 'newest';
    const withImages = searchParams.get('withImages') === 'true';
    const withVideos = searchParams.get('withVideos') === 'true';
    const verifiedPurchase = searchParams.get('verifiedPurchase') === 'true';
    const rating = searchParams.get('rating') ? parseInt(searchParams.get('rating')!) : undefined;

    // Use enhanced review service if filters are applied / Filtrlər tətbiq olunubsa təkmilləşdirilmiş rəy xidmətindən istifadə et
    if (withImages || withVideos || verifiedPurchase || rating || sortBy !== 'newest') {
      const result = await getReviewsWithFilters(productId, {
        sortBy,
        filterBy: {
          withImages,
          withVideos,
          verifiedPurchase,
          rating,
        },
        limit,
        offset: skip,
      });

      return successResponseWithPagination(result.reviews, result.pagination);
    }

    // Get product reviews using service layer / Service layer istifadə edərək məhsul rəylərini al
    const { reviews, total } = await getProductReviews(productId, page, limit);

    const pagination = createPaginationInfo(page, limit, total);
    return successResponseWithPagination(reviews, pagination);
  } catch (error) {
    return handleApiError(error, "fetch product reviews");
  }
}

// POST /api/products/[id]/reviews - Create a new review / Yeni rəy yarat
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;

    const resolvedParams = await params;
    const productId = resolvedParams.id;
    const body = await request.json();
    const { rating, comment } = body;

    // Create review using service layer / Service layer istifadə edərək rəy yarat
    const review = await createReview(user.id, productId, rating, comment);

    return successResponse(review, "Review created successfully / Rəy uğurla yaradıldı");
  } catch (error: any) {
    if (error.message?.includes("Rating must be") || error.message?.includes("Reytinq")) {
      return badRequestResponse(error.message);
    }
    if (error.message?.includes("already reviewed") || error.message?.includes("artıq rəy yazmısınız")) {
      return badRequestResponse(error.message);
    }
    if (error.message?.includes("not found") || error.message?.includes("tapılmadı")) {
      return badRequestResponse(error.message);
    }
    return handleApiError(error, "create review");
  }
}
