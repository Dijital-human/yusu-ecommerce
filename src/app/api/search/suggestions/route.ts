/**
 * Search Suggestions API / Axtarış Təklifləri API
 * Get search suggestions based on query
 * Sorğuya əsasən axtarış təkliflərini al
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSearchSuggestions, isSearchEngineEnabled } from "@/lib/search/search-engine";
import { logger } from "@/lib/utils/logger";

/**
 * GET - Get search suggestions / Axtarış təkliflərini al
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "10");

    if (query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const suggestions: Array<{
      type: string;
      text: string;
      subtext?: string;
      image?: string;
      url?: string;
      count?: number;
    }> = [];

    // Try Meilisearch first / Əvvəlcə Meilisearch-ı sına
    if (isSearchEngineEnabled()) {
      const searchSuggestions = await getSearchSuggestions(query, limit);
      searchSuggestions.forEach((text) => {
        suggestions.push({
          type: "query",
          text,
        });
      });
    }

    // Fallback to database search / Veritabanı axtarışına fallback
    if (suggestions.length < limit) {
      // Search products / Məhsulları axtar
      const products = await prisma.product.findMany({
        where: {
          isActive: true,
          isPublished: true,
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          images: true,
          price: true,
          category: {
            select: { name: true },
          },
        },
        take: Math.min(5, limit - suggestions.length),
      });

      products.forEach((product) => {
        let images: string[] = [];
        if (product.images) {
          try {
            images = typeof product.images === "string"
              ? JSON.parse(product.images)
              : Array.isArray(product.images)
              ? product.images
              : [];
          } catch {
            images = [];
          }
        }

        suggestions.push({
          type: "product",
          text: product.name,
          subtext: `${product.category?.name} - ${parseFloat(product.price.toString()).toFixed(2)} ₼`,
          image: images[0] || undefined,
          url: `/product/${product.id}`,
        });
      });

      // Search categories / Kateqoriyaları axtar
      const categories = await prisma.category.findMany({
        where: {
          name: { contains: query, mode: "insensitive" },
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          _count: {
            select: { products: true },
          },
        },
        take: Math.min(3, limit - suggestions.length),
      });

      categories.forEach((category) => {
        suggestions.push({
          type: "category",
          text: category.name,
          subtext: `${category._count.products} products / məhsul`,
          url: `/category/${category.slug}`,
          count: category._count.products,
        });
      });
    }

    // Remove duplicates / Dublikatları sil
    const uniqueSuggestions = suggestions.filter(
      (suggestion, index, self) =>
        index === self.findIndex((s) => s.text === suggestion.text)
    );

    return NextResponse.json({ suggestions: uniqueSuggestions.slice(0, limit) });
  } catch (error) {
    logger.error("Failed to get search suggestions / Axtarış təkliflərini almaq uğursuz oldu", error);
    return NextResponse.json({ suggestions: [] });
  }
}
