/**
 * ML Recommendations API Route / ML Tövsiyələr API Route
 * Provides ML-based product recommendations / ML-based məhsul tövsiyələri təmin edir
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import {
  getPersonalizedRecommendations,
  getSimilarProductsML,
  getTrendingProducts,
} from "@/lib/recommendations/ml-recommendations";
import { batchGetProducts } from "@/lib/db/queries/batch-queries";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const productId = searchParams.get("productId");
    const type = searchParams.get("type") || "personalized";
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    let recommendations: any[] = [];

    switch (type) {
      case "personalized":
        if (!userId) {
          return NextResponse.json(
            { error: "User ID is required for personalized recommendations" },
            { status: 400 }
          );
        }
        recommendations = await getPersonalizedRecommendations(userId, limit);
        break;

      case "similar":
        if (!productId) {
          return NextResponse.json(
            { error: "Product ID is required for similar products" },
            { status: 400 }
          );
        }
        recommendations = await getSimilarProductsML(productId, limit);
        break;

      case "trending":
        recommendations = await getTrendingProducts(limit);
        break;

      default:
        return NextResponse.json(
          { error: "Invalid recommendation type" },
          { status: 400 }
        );
    }

    // Get full product details / Tam məhsul detallarını al
    const productIds = recommendations.map((r) => r.productId);
    const products = await batchGetProducts(productIds, false);

    // Combine recommendations with products / Tövsiyələri məhsullarla birləşdir
    const recommendationsWithProducts = recommendations.map((rec) => {
      const product = products.find((p: any) => p.id === rec.productId);
      return {
        ...rec,
        product: product || null,
      };
    }).filter((rec) => rec.product !== null);

    return NextResponse.json({
      recommendations: recommendationsWithProducts,
      count: recommendationsWithProducts.length,
      type,
    });
  } catch (error) {
    console.error("Error fetching ML recommendations:", error);
    return NextResponse.json(
      { error: "Failed to fetch ML recommendations" },
      { status: 500 }
    );
  }
}

