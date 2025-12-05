/**
 * Recommendations API Route / Tövsiyələr API Route
 * Provides product recommendations
 * Məhsul tövsiyələri təmin edir
 */

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { prisma } from "@/lib/db";
import {
  getPopularProducts,
  getSimilarProducts,
  getFrequentlyBoughtTogether,
  getPersonalizedRecommendations,
  getTrendingProducts,
} from "@/lib/recommendations/recommendation-engine";
import { getMLRecommendations } from "@/lib/ml/recommendations";
import {
  getRecommendationsByUserSimilarity,
  getRecommendationsByItemSimilarity,
} from "@/lib/recommendations/collaborative-filtering";
import { getABTestRecommendations } from "@/lib/recommendations/ab-testing";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "popular";
    const productId = searchParams.get("productId");
    const limit = parseInt(searchParams.get("limit") || "10");

    let recommendations: any[] = [];

    switch (type) {
      case "popular":
        recommendations = await getPopularProducts(limit);
        break;

      case "similar":
        if (!productId) {
          return successResponse([], "Product ID is required for similar products / Oxşar məhsullar üçün məhsul ID-si tələb olunur");
        }
        recommendations = await getSimilarProducts(productId, limit);
        break;

      case "frequently_bought_together":
        if (!productId) {
          return successResponse([], "Product ID is required for frequently bought together / Tez-tez birlikdə alınanlar üçün məhsul ID-si tələb olunur");
        }
        recommendations = await getFrequentlyBoughtTogether(productId, limit);
        break;

      case "personalized":
        // Require authentication for personalized recommendations / Fərdiləşdirilmiş tövsiyələr üçün autentifikasiya tələb olunur
        const authResult = await requireAuth(request);
        if (authResult instanceof Response) {
          return authResult;
        }
        const { user } = authResult;
        recommendations = await getPersonalizedRecommendations(user.id, limit);
        break;

      case "trending":
        recommendations = await getTrendingProducts(limit);
        break;

      case "ml_based":
        // Require authentication for ML-based recommendations / ML əsaslı tövsiyələr üçün autentifikasiya tələb olunur
        const mlAuthResult = await requireAuth(request);
        if (mlAuthResult instanceof Response) {
          return mlAuthResult;
        }
        const { user: mlUser } = mlAuthResult;
        const mlRecs = await getMLRecommendations(mlUser.id, limit);
        recommendations = await Promise.all(
          mlRecs.map(async (rec) => {
            const product = await prisma.product.findUnique({
              where: { id: rec.productId },
              include: {
                category: true,
                reviews: {
                  select: {
                    rating: true,
                  },
                },
              },
            });
            return product;
          })
        );
        recommendations = recommendations.filter((p) => p !== null);
        break;

      case "collaborative":
        // Require authentication for collaborative filtering / Collaborative filtering üçün autentifikasiya tələb olunur
        const collabAuthResult = await requireAuth(request);
        if (collabAuthResult instanceof Response) {
          return collabAuthResult;
        }
        const { user: collabUser } = collabAuthResult;
        const collabRecs = await getRecommendationsByUserSimilarity(collabUser.id, limit);
        recommendations = await Promise.all(
          collabRecs.map(async (rec) => {
            const product = await prisma.product.findUnique({
              where: { id: rec.productId },
              include: {
                category: true,
                reviews: {
                  select: {
                    rating: true,
                  },
                },
              },
            });
            return product;
          })
        );
        recommendations = recommendations.filter((p) => p !== null);
        break;

      case "ab_test":
        // Require authentication for A/B test recommendations / A/B test tövsiyələri üçün autentifikasiya tələb olunur
        const abAuthResult = await requireAuth(request);
        if (abAuthResult instanceof Response) {
          return abAuthResult;
        }
        const { user: abUser } = abAuthResult;
        const abRecs = await getABTestRecommendations(abUser.id, limit);
        recommendations = await Promise.all(
          abRecs.map(async (rec) => {
            const product = await prisma.product.findUnique({
              where: { id: rec.productId },
              include: {
                category: true,
                reviews: {
                  select: {
                    rating: true,
                  },
                },
              },
            });
            return product;
          })
        );
        recommendations = recommendations.filter((p) => p !== null);
        break;

      default:
        recommendations = await getPopularProducts(limit);
    }

    return successResponse(recommendations);
  } catch (error) {
    return handleApiError(error, "get recommendations");
  }
}

