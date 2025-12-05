/**
 * Search API Route / Axtarış API Route
 * This route handles product search functionality
 * Bu route məhsul axtarış funksiyasını idarə edir
 */

import { NextRequest } from "next/server";
import { parsePagination, createPaginationInfo } from "@/lib/api/pagination";
import { successResponseWithPagination } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { searchProducts, isSearchEngineEnabled } from "@/lib/search/search-engine";
import { getProductsWithFilters } from "@/lib/db/queries/product-queries";
import { trackSearchQuery } from "@/lib/search/search-analytics";
import { saveSearchHistory } from "@/lib/search/search-history";
import { parseFiltersFromURL, applyProductFilters, buildSortOrderBy } from "@/lib/filters/filter-builder";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { getSession } from "next-auth/react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters / Sorğu parametrlərini parse et
    const query = searchParams.get("q") || "";
    const { page, limit, skip } = parsePagination(searchParams, 12);
    const sortBy = searchParams.get("sortBy") || "relevance";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const category = searchParams.get("category") || "";
    const minPrice = parseFloat(searchParams.get("minPrice") || "0");
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "1000000");
    const rating = parseFloat(searchParams.get("rating") || "0");
    const inStock = searchParams.get("inStock") === "true";

    // Parse advanced filters / Genişləndirilmiş filtrləri parse et
    const filters = parseFiltersFromURL(searchParams);
    
    // Override with explicit parameters / Açıq parametrlərlə override et
    if (query) filters.search = query;
    if (category) filters.categoryId = category;
    if (minPrice > 0) filters.minPrice = minPrice;
    if (maxPrice < 1000000) filters.maxPrice = maxPrice;
    if (rating > 0) filters.minRating = rating;
    if (inStock) filters.inStock = true;

    // Try to use search engine if enabled / Əgər aktivdirsə axtarış mühərrikini istifadə et
    if (isSearchEngineEnabled() && query) {
      const searchResult = await searchProducts({
        query,
        filters: {
          categoryId: category || undefined,
          minPrice: minPrice > 0 ? minPrice : undefined,
          maxPrice: maxPrice < 1000000 ? maxPrice : undefined,
          rating: rating > 0 ? rating : undefined,
          inStock: inStock || undefined,
        },
        sortBy: sortBy === "relevance" ? undefined : sortBy,
        sortOrder: sortOrder as "asc" | "desc",
        page,
        limit,
      });

      if (searchResult) {
        // Transform search results to match expected format / Axtarış nəticələrini gözlənilən formata çevir
        const productsWithRating = searchResult.hits.map((hit: any) => ({
          id: hit.id,
          name: hit.name,
          description: hit.description,
          price: hit.price,
          originalPrice: hit.originalPrice || undefined,
          images: hit.images || [], // Note: Images need to be parsed if stored as string / Qeyd: Əgər string kimi saxlanıbsa şəkillər parse edilməlidir
          category: hit.category,
          seller: hit.seller,
          stock: hit.stock,
          rating: hit.rating || 0,
          reviewCount: hit.reviewCount || 0,
          isActive: hit.isActive,
          createdAt: hit.createdAt,
          updatedAt: hit.updatedAt,
        }));

        const pagination = createPaginationInfo(page, limit, searchResult.total);
        
        // Track search query for analytics and save history (async, don't wait) / Analitika üçün axtarış sorğusunu izlə və tarixçəni saxla (async, gözləmə)
        try {
          // Get session for user ID / İstifadəçi ID-si üçün session al
          const session = await getServerSession(authOptions);
          const userId = session?.user?.id;

          // Track search query for analytics / Analitika üçün axtarış sorğusunu izlə
          await trackSearchQuery({
            query,
            resultsCount: searchResult.total,
            filters: {
              categoryId: category || undefined,
              minPrice: minPrice > 0 ? minPrice : undefined,
              maxPrice: maxPrice < 1000000 ? maxPrice : undefined,
              rating: rating > 0 ? rating : undefined,
            },
            userId,
          });

          // Save search history if user is authenticated / Əgər istifadəçi autentifikasiya olunubsa axtarış tarixçəsini saxla
          if (userId) {
            await saveSearchHistory(userId, query, {
              resultsCount: searchResult.total,
              filters: {
                categoryId: category || undefined,
                minPrice: minPrice > 0 ? minPrice : undefined,
                maxPrice: maxPrice < 1000000 ? maxPrice : undefined,
                rating: rating > 0 ? rating : undefined,
              },
            });
          }
        } catch (analyticsError) {
          // Silently fail analytics tracking / Analitika izləməsini səssiz şəkildə uğursuz et
        }
        
        return successResponseWithPagination(productsWithRating, pagination);
      }
      // If search engine fails, fall back to database search / Əgər axtarış mühərriki uğursuz olarsa, veritabanı axtarışına keç
    }

    // Use query helper for database fallback / Veritabanı fallback üçün query helper istifadə et
    const result = await getProductsWithFilters(
      {
        categoryId: category || undefined,
        search: query || undefined,
        minPrice: minPrice > 0 ? minPrice : undefined,
        maxPrice: maxPrice < 1000000 ? maxPrice : undefined,
        inStock: inStock || undefined,
        sortBy: sortBy === "relevance" ? "createdAt" : sortBy,
        sortOrder: sortOrder as "asc" | "desc",
      },
      page,
      limit
    );

    // Products are already filtered and sorted by applyProductFilters / Məhsullar artıq applyProductFilters tərəfindən filtirlənib və sıralanıb
    let productsWithRating = result.products;

    // Sort by relevance if requested (only if not using search engine) / Uyğunluğa görə sırala (yalnız search engine istifadə etmirsə)
    if (sortBy === "relevance" && query && !isSearchEngineEnabled()) {
      productsWithRating.sort((a: any, b: any) => {
        // Simple relevance scoring based on name and description matches
        // Ad və təsvir uyğunluqlarına əsaslanan sadə uyğunluq hesablaması
        const scoreA = calculateRelevanceScore(a, query);
        const scoreB = calculateRelevanceScore(b, query);
        return sortOrder === "asc" ? scoreA - scoreB : scoreB - scoreA;
      });
    }

    const totalCount = result.total;

    const pagination = createPaginationInfo(page, limit, totalCount);
    
    // Track search query for analytics and save history (async, don't wait) / Analitika üçün axtarış sorğusunu izlə və tarixçəni saxla (async, gözləmə)
    if (query) {
      try {
        // Get session for user ID / İstifadəçi ID-si üçün session al
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;

        // Track search query for analytics / Analitika üçün axtarış sorğusunu izlə
        await trackSearchQuery({
          query,
          resultsCount: totalCount,
          filters: {
            categoryId: category || undefined,
            minPrice: minPrice > 0 ? minPrice : undefined,
            maxPrice: maxPrice < 1000000 ? maxPrice : undefined,
            rating: rating > 0 ? rating : undefined,
          },
          userId,
        });

        // Save search history if user is authenticated / Əgər istifadəçi autentifikasiya olunubsa axtarış tarixçəsini saxla
        if (userId) {
          await saveSearchHistory(userId, query, {
            resultsCount: totalCount,
            filters: {
              categoryId: category || undefined,
              minPrice: minPrice > 0 ? minPrice : undefined,
              maxPrice: maxPrice < 1000000 ? maxPrice : undefined,
              rating: rating > 0 ? rating : undefined,
            },
          });
        }
      } catch (analyticsError) {
        // Silently fail analytics tracking / Analitika izləməsini səssiz şəkildə uğursuz et
      }
    }
    
    return successResponseWithPagination(productsWithRating, pagination);
  } catch (error) {
    return handleApiError(error, "perform search");
  }
}

/**
 * Calculate relevance score for a product based on search query
 * Axtarış sorğusuna əsaslanaraq məhsul üçün uyğunluq balı hesabla
 */
function calculateRelevanceScore(product: any, query: string): number {
  const queryLower = query.toLowerCase();
  let score = 0;

  // Name match (highest priority) / Ad uyğunluğu (ən yüksək prioritet)
  if (product.name.toLowerCase().includes(queryLower)) {
    score += 10;
  }

  // Description match / Təsvir uyğunluğu
  if (product.description.toLowerCase().includes(queryLower)) {
    score += 5;
  }

  // Category match / Kateqoriya uyğunluğu
  if (product.category.name.toLowerCase().includes(queryLower)) {
    score += 3;
  }

  // Rating bonus / Reytinq bonusu
  score += product.rating * 0.5;

  // Review count bonus / Rəy sayı bonusu
  score += Math.min(product.reviewCount * 0.1, 2);

  return score;
}
