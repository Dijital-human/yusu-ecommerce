/**
 * ML-Based Recommendations Service / ML-Based Tövsiyələr Xidməti
 * Provides ML-based product recommendations / ML-based məhsul tövsiyələri təmin edir
 */

import { getReadClient } from "@/lib/db/query-client";
import { getUserPreferences } from "./user-behavior";
import { getSimilarProducts, getFrequentlyBoughtTogether } from "./recommendation-engine";

export interface MLRecommendation {
  productId: string;
  score: number;
  reason: string;
}

export type RecommendationType = "personalized" | "similar" | "trending";

/**
 * Get personalized recommendations for user / İstifadəçi üçün personalizasiya edilmiş tövsiyələr al
 */
export async function getPersonalizedRecommendations(
  userId: string,
  limit: number = 10
): Promise<MLRecommendation[]> {
  try {
    const readClient = await getReadClient();
    
    // Get user preferences / İstifadəçi üstünlüklərini al
    const preferences = await getUserPreferences(userId);

    // Get products matching user preferences / İstifadəçi üstünlüklərinə uyğun məhsulları al
    const products = await readClient.product.findMany({
      where: {
        isActive: true,
        isPublished: true,
        isApproved: true,
        price: {
          gte: preferences.priceRange.min,
          lte: preferences.priceRange.max,
        },
        ...(preferences.preferredCategories.length > 0 && {
          category: {
            name: {
              in: preferences.preferredCategories,
            },
          },
        }),
      },
      include: {
        category: true,
        reviews: {
          select: {
            rating: true,
          },
        },
      },
      take: limit * 2, // Get more to filter / Filtrləmək üçün daha çox al
    });

    // Score products based on preferences / Məhsulları üstünlüklərə əsasən qiymətləndir
    const scoredProducts = products.map((product) => {
      let score = 0;

      // Category match score / Kateqoriya uyğunluq skoru
      if (product.category && preferences.preferredCategories.includes(product.category.name)) {
        score += 10;
      }

      // Price range score / Qiymət aralığı skoru
      const price = Number(product.price);
      const priceRange = preferences.priceRange.max - preferences.priceRange.min;
      if (priceRange > 0) {
        const priceScore = 1 - Math.abs(price - (preferences.priceRange.min + priceRange / 2)) / priceRange;
        score += priceScore * 5;
      }

      // Rating score / Reytinq skoru
      if (product.reviews && product.reviews.length > 0) {
        const avgRating = product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length;
        score += avgRating * 2;
      }

      return {
        productId: product.id,
        score,
        reason: "Personalized based on your preferences",
      };
    });

    // Sort by score and return top recommendations / Skora görə sırala və ən yaxşı tövsiyələri qaytar
    return scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  } catch (error) {
    console.error("Error getting personalized recommendations:", error);
    return [];
  }
}

/**
 * Get similar products based on ML / ML-ə əsasən oxşar məhsulları al
 */
export async function getSimilarProductsML(
  productId: string,
  limit: number = 10
): Promise<MLRecommendation[]> {
  try {
    // Use existing recommendation engine / Mövcud recommendation engine istifadə et
    const similarProducts = await getSimilarProducts(productId, limit);
    
    return similarProducts.map((product) => ({
      productId: product.id,
      score: 0.8, // Default similarity score / Default oxşarlıq skoru
      reason: "Similar products",
    }));
  } catch (error) {
    console.error("Error getting similar products:", error);
    return [];
  }
}

/**
 * Get trending products / Trend olan məhsulları al
 */
export async function getTrendingProducts(limit: number = 10): Promise<MLRecommendation[]> {
  try {
    const readClient = await getReadClient();
    
    // Get products with most views/purchases in last 7 days / Son 7 gündə ən çox baxılan/satın alınan məhsulları al
    const products = await readClient.product.findMany({
      where: {
        isActive: true,
        isPublished: true,
        isApproved: true,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days / Son 7 gün
        },
      },
      include: {
        reviews: {
          select: {
            rating: true,
          },
        },
        orderItems: {
          select: {
            id: true,
          },
        },
      },
      take: limit * 2,
    });

    // Score products based on recent activity / Məhsulları son aktivliyə əsasən qiymətləndir
    const scoredProducts = products.map((product) => {
      let score = 0;

      // Order count score / Sifariş sayı skoru
      score += product.orderItems.length * 5;

      // Rating score / Reytinq skoru
      if (product.reviews && product.reviews.length > 0) {
        const avgRating = product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length;
        score += avgRating * 3;
      }

      // Recency score / Yaxınlıq skoru
      const daysSinceCreation = (Date.now() - product.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      score += Math.max(0, 7 - daysSinceCreation) * 2;

      return {
        productId: product.id,
        score,
        reason: "Trending products",
      };
    });

    // Sort by score and return top recommendations / Skora görə sırala və ən yaxşı tövsiyələri qaytar
    return scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  } catch (error) {
    console.error("Error getting trending products:", error);
    return [];
  }
}

