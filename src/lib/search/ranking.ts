/**
 * Search Result Ranking Service / Axtarış Nəticələri Reytinq Xidməti
 * Provides ranking algorithm for search results
 * Axtarış nəticələri üçün reytinq alqoritmi təmin edir
 */

import { logger } from '@/lib/utils/logger';

/**
 * Ranking weights configuration / Reytinq çəkiləri konfiqurasiyası
 */
export interface RankingWeights {
  relevance: number;      // Text relevance score / Mətn uyğunluq skoru
  popularity: number;     // Product popularity / Məhsul populyarlığı
  recency: number;        // Product recency / Məhsul yeniliyi
  sellerRating: number;  // Seller rating / Satıcı reytinqi
  price: number;         // Price factor / Qiymət faktoru
}

/**
 * Default ranking weights / Default reytinq çəkiləri
 */
export const DEFAULT_RANKING_WEIGHTS: RankingWeights = {
  relevance: 0.4,      // 40% - Most important / Ən vacib
  popularity: 0.25,   // 25%
  recency: 0.15,      // 15%
  sellerRating: 0.1,  // 10%
  price: 0.1,         // 10%
};

/**
 * Product ranking data / Məhsul reytinq məlumatları
 */
export interface ProductRankingData {
  productId: string;
  relevanceScore: number;    // 0-1
  popularityScore: number;   // 0-1 (based on views, orders, etc.)
  recencyScore: number;      // 0-1 (based on creation date)
  sellerRatingScore: number; // 0-1 (based on seller rating)
  priceScore: number;        // 0-1 (lower price = higher score for budget searches)
}

/**
 * Calculate ranking score for a product / Məhsul üçün reytinq skoru hesabla
 */
export function calculateRankingScore(
  data: ProductRankingData,
  weights: RankingWeights = DEFAULT_RANKING_WEIGHTS
): number {
  const score =
    data.relevanceScore * weights.relevance +
    data.popularityScore * weights.popularity +
    data.recencyScore * weights.recency +
    data.sellerRatingScore * weights.sellerRating +
    data.priceScore * weights.price;

  return Math.max(0, Math.min(1, score)); // Clamp between 0 and 1
}

/**
 * Calculate popularity score / Populyarlıq skoru hesabla
 */
export function calculatePopularityScore(
  views: number,
  orders: number,
  reviews: number,
  maxViews: number = 10000,
  maxOrders: number = 1000,
  maxReviews: number = 500
): number {
  const normalizedViews = Math.min(views / maxViews, 1);
  const normalizedOrders = Math.min(orders / maxOrders, 1);
  const normalizedReviews = Math.min(reviews / maxReviews, 1);

  // Weighted combination / Çəkili kombinasiya
  return (
    normalizedViews * 0.3 +
    normalizedOrders * 0.5 +
    normalizedReviews * 0.2
  );
}

/**
 * Calculate recency score / Yenilik skoru hesabla
 */
export function calculateRecencyScore(
  createdAt: Date,
  maxAgeDays: number = 365
): number {
  const ageInDays = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  const normalizedAge = Math.min(ageInDays / maxAgeDays, 1);
  
  // Newer products get higher score / Yeni məhsullar daha yüksək skor alır
  return 1 - normalizedAge;
}

/**
 * Calculate seller rating score / Satıcı reytinq skoru hesabla
 */
export function calculateSellerRatingScore(
  rating: number,
  maxRating: number = 5
): number {
  return Math.min(rating / maxRating, 1);
}

/**
 * Calculate price score / Qiymət skoru hesabla
 * Lower price = higher score (for budget-conscious searches) / Aşağı qiymət = yüksək skor (büdcəyə həssas axtarışlar üçün)
 */
export function calculatePriceScore(
  price: number,
  minPrice: number,
  maxPrice: number,
  isBudgetSearch: boolean = false
): number {
  if (maxPrice === minPrice) return 0.5; // Neutral if all prices are same / Bütün qiymətlər eynidirsə neytral

  if (isBudgetSearch) {
    // For budget searches, lower price = higher score / Büdcə axtarışları üçün, aşağı qiymət = yüksək skor
    const normalizedPrice = (price - minPrice) / (maxPrice - minPrice);
    return 1 - normalizedPrice;
  } else {
    // For regular searches, price is neutral / Adi axtarışlar üçün qiymət neytraldır
    return 0.5;
  }
}

/**
 * Rank search results / Axtarış nəticələrini reytinqlə
 */
export function rankSearchResults<T extends { productId: string }>(
  results: T[],
  rankingData: Map<string, ProductRankingData>,
  weights?: RankingWeights
): T[] {
  return results
    .map(result => {
      const data = rankingData.get(result.productId);
      if (!data) {
        // If no ranking data, use default score / Əgər reytinq məlumatı yoxdursa, default skor istifadə et
        return { ...result, rankingScore: 0.5 };
      }

      const score = calculateRankingScore(data, weights);
      return { ...result, rankingScore: score };
    })
    .sort((a, b) => {
      // Sort by ranking score descending / Reytinq skoruna görə azalan sırada sırala
      const scoreA = (a as any).rankingScore || 0;
      const scoreB = (b as any).rankingScore || 0;
      return scoreB - scoreA;
    });
}

/**
 * Get ranking weights for A/B testing / A/B test üçün reytinq çəkilərini al
 */
export function getRankingWeightsForABTest(
  testId: string,
  variantId: string
): RankingWeights {
  // In production, fetch from A/B test configuration / Production-da A/B test konfiqurasiyasından al
  // This allows testing different ranking algorithms / Bu müxtəlif reytinq alqoritmlərini test etməyə imkan verir
  return DEFAULT_RANKING_WEIGHTS;
}

