/**
 * Review Service / Rəy Xidməti
 * Business logic for review operations
 * Rəy əməliyyatları üçün business logic
 */

import { prisma } from "@/lib/db";
import { validateProductId } from "@/lib/api/validators";
import { getProductById } from "@/lib/db/queries/product-queries";

/**
 * Get product reviews with pagination / Səhifələmə ilə məhsul rəylərini al
 */
export async function getProductReviews(productId: string, page: number = 1, limit: number = 10) {
  // Validate product ID / Məhsul ID-ni yoxla
  const validatedProductId = validateProductId(productId);
  if (validatedProductId instanceof Response) {
    throw new Error("Invalid product ID / Etibarsız məhsul ID");
  }

  // Check if product exists using query helper / Query helper ilə məhsulun mövcud olduğunu yoxla
  const result = await getProductById(validatedProductId);
  if (result instanceof Response) {
    throw new Error("Product not found / Məhsul tapılmadı");
  }

  const skip = (page - 1) * limit;

  // Fetch reviews with pagination / Səhifələmə ilə rəyləri al
  const [reviews, totalCount] = await Promise.all([
    prisma.review.findMany({
      where: {
        productId: validatedProductId,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.review.count({
      where: {
        productId: validatedProductId,
      },
    }),
  ]);

  return {
    reviews,
    total: totalCount,
    page,
    limit,
  };
}

/**
 * Create a new review / Yeni rəy yarat
 */
export async function createReview(
  userId: string,
  productId: string,
  rating: number,
  comment?: string
) {
  // Validate product ID / Məhsul ID-ni yoxla
  const validatedProductId = validateProductId(productId);
  if (validatedProductId instanceof Response) {
    throw new Error("Invalid product ID / Etibarsız məhsul ID");
  }

  // Validate rating / Reytinqi yoxla
  if (!rating || rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5 / Reytinq 1-5 arasında olmalıdır");
  }

  // Check if product exists using query helper / Query helper ilə məhsulun mövcud olduğunu yoxla
  const result = await getProductById(validatedProductId);
  if (result instanceof Response) {
    throw new Error("Product not found / Məhsul tapılmadı");
  }

  // Check if user already reviewed this product / İstifadəçinin artıq bu məhsula rəy yazdığını yoxla
  const existingReview = await prisma.review.findUnique({
    where: {
      userId_productId: {
        userId,
        productId: validatedProductId,
      },
    },
  });

  if (existingReview) {
    throw new Error("You have already reviewed this product / Bu məhsula artıq rəy yazmısınız");
  }

  // Check if user has purchased this product / İstifadəçinin bu məhsulu alıb-almadığını yoxla
  const { checkVerifiedPurchase } = await import("@/lib/db/product-reviews");
  const isVerifiedPurchase = await checkVerifiedPurchase(userId, validatedProductId);

  // Create new review / Yeni rəy yarat
  const review = await prisma.review.create({
    data: {
      userId,
      productId: validatedProductId,
      rating: rating,
      comment: comment || null,
      isVerifiedPurchase,
      isApproved: true, // Auto-approve for now, admin can review later / İndilik avtomatik təsdiqlə, admin sonra yoxlaya bilər
      isSpam: false,
      reportCount: 0,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return review;
}

/**
 * Update review / Rəyi yenilə
 */
export async function updateReview(
  reviewId: string,
  userId: string,
  rating?: number,
  comment?: string
) {
  // Check if review exists and belongs to user / Rəyin mövcud olduğunu və istifadəçiyə aid olduğunu yoxla
  const existingReview = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!existingReview) {
    throw new Error("Review not found / Rəy tapılmadı");
  }

  if (existingReview.userId !== userId) {
    throw new Error("You can only update your own reviews / Yalnız öz rəylərinizi yeniləyə bilərsiniz");
  }

  // Validate rating if provided / Reytinq verilmişsə yoxla
  if (rating !== undefined && (rating < 1 || rating > 5)) {
    throw new Error("Rating must be between 1 and 5 / Reytinq 1-5 arasında olmalıdır");
  }

  // Update review / Rəyi yenilə
  const updateData: any = {};
  if (rating !== undefined) updateData.rating = rating;
  if (comment !== undefined) updateData.comment = comment || null;

  const review = await prisma.review.update({
    where: { id: reviewId },
    data: updateData,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return review;
}

/**
 * Delete review / Rəyi sil
 */
export async function deleteReview(reviewId: string, userId: string) {
  // Check if review exists and belongs to user / Rəyin mövcud olduğunu və istifadəçiyə aid olduğunu yoxla
  const existingReview = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!existingReview) {
    throw new Error("Review not found / Rəy tapılmadı");
  }

  if (existingReview.userId !== userId) {
    throw new Error("You can only delete your own reviews / Yalnız öz rəylərinizi silə bilərsiniz");
  }

  // Delete review / Rəyi sil
  await prisma.review.delete({
    where: { id: reviewId },
  });
}

/**
 * Get user's review for a product / İstifadəçinin məhsul üçün rəyini al
 */
export async function getUserReview(userId: string, productId: string) {
  // Validate product ID / Məhsul ID-ni yoxla
  const validatedProductId = validateProductId(productId);
  if (validatedProductId instanceof Response) {
    throw new Error("Invalid product ID / Etibarsız məhsul ID");
  }

  const review = await prisma.review.findUnique({
    where: {
      userId_productId: {
        userId,
        productId: validatedProductId,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return review;
}

