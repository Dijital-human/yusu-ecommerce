/**
 * Product Comparison Service / Məhsul Müqayisəsi Xidməti
 * Allows users to compare multiple products side by side
 * İstifadəçilərə bir neçə məhsulu yan-yana müqayisə etməyə imkan verir
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/utils/logger';
import { cache } from '@/lib/cache/cache-wrapper';

/**
 * Product for comparison / Müqayisə üçün məhsul
 */
export interface ComparisonProduct {
  id: string;
  name: string;
  images: string[];
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  stock: number;
  sellerId: string;
  sellerName: string;
  categoryId: string;
  categoryName: string;
  attributes: Record<string, string | number | boolean>;
  specifications: ProductSpecification[];
  pros: string[];
  cons: string[];
}

/**
 * Product specification / Məhsul spesifikasiyası
 */
export interface ProductSpecification {
  name: string;
  value: string | number | boolean;
  unit?: string;
  category?: string;
}

/**
 * Comparison result / Müqayisə nəticəsi
 */
export interface ComparisonResult {
  products: ComparisonProduct[];
  commonAttributes: string[];
  differingAttributes: string[];
  recommendations: ComparisonRecommendation[];
  priceAnalysis: PriceAnalysis;
  ratingAnalysis: RatingAnalysis;
}

/**
 * Comparison recommendation / Müqayisə tövsiyəsi
 */
export interface ComparisonRecommendation {
  productId: string;
  reason: string;
  score: number;
  badges: string[];
}

/**
 * Price analysis / Qiymət analizi
 */
interface PriceAnalysis {
  cheapestId: string;
  mostExpensiveId: string;
  averagePrice: number;
  priceRange: { min: number; max: number };
  bestValueId?: string;
}

/**
 * Rating analysis / Reytinq analizi
 */
interface RatingAnalysis {
  highestRatedId: string;
  lowestRatedId: string;
  averageRating: number;
  mostReviewedId: string;
}

/**
 * Product Comparison Service Class / Məhsul Müqayisəsi Xidmət Sinifi
 */
class ProductComparisonService {
  private readonly maxProducts = 4;
  private readonly cachePrefix = 'product_comparison:';
  private readonly cacheDuration = 3600; // 1 hour / 1 saat

  /**
   * Get comparison data for products / Məhsullar üçün müqayisə məlumatlarını al
   */
  async compareProducts(productIds: string[]): Promise<ComparisonResult | null> {
    if (productIds.length < 2 || productIds.length > this.maxProducts) {
      logger.warn('Invalid number of products for comparison / Müqayisə üçün yanlış məhsul sayı', {
        count: productIds.length,
        max: this.maxProducts,
      });
      return null;
    }

    try {
      // Check cache / Cache-i yoxla
      const cacheKey = `${this.cachePrefix}${productIds.sort().join(':')}`;
      const cached = await cache.get<ComparisonResult>(cacheKey);
      if (cached) {
        return cached;
      }

      // Fetch products / Məhsulları al
      const products = await this.fetchProducts(productIds);
      if (products.length < 2) {
        logger.warn('Not enough products found for comparison / Müqayisə üçün kifayət qədər məhsul tapılmadı');
        return null;
      }

      // Build comparison result / Müqayisə nəticəsini qur
      const result = await this.buildComparisonResult(products);

      // Cache result / Nəticəni cache-lə
      await cache.set(cacheKey, result, this.cacheDuration);

      logger.info('Product comparison generated / Məhsul müqayisəsi yaradıldı', {
        productCount: products.length,
        productIds,
      });

      return result;
    } catch (error) {
      logger.error('Failed to compare products / Məhsulları müqayisə etmək uğursuz oldu', error);
      return null;
    }
  }

  /**
   * Fetch products with all details / Bütün detalları ilə məhsulları al
   */
  private async fetchProducts(productIds: string[]): Promise<ComparisonProduct[]> {
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
        isPublished: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });

    return products.map((product) => {
      const avgRating = product.reviews.length > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
        : 0;

      // Parse attributes / Atributları parse et
      let attributes: Record<string, any> = {};
      if (product.attributes) {
        try {
          attributes = typeof product.attributes === 'string'
            ? JSON.parse(product.attributes)
            : product.attributes;
        } catch {
          attributes = {};
        }
      }

      // Parse specifications / Spesifikasiyaları parse et
      let specifications: ProductSpecification[] = [];
      if ((product as any).specifications) {
        try {
          const specs = typeof (product as any).specifications === 'string'
            ? JSON.parse((product as any).specifications)
            : (product as any).specifications;
          specifications = Array.isArray(specs) ? specs : [];
        } catch {
          specifications = [];
        }
      }

      // Parse images / Şəkilləri parse et
      let images: string[] = [];
      if (product.images) {
        try {
          images = typeof product.images === 'string'
            ? JSON.parse(product.images)
            : Array.isArray(product.images)
            ? product.images
            : [];
        } catch {
          images = [];
        }
      }

      return {
        id: product.id,
        name: product.name,
        images,
        price: parseFloat(product.price.toString()),
        originalPrice: product.originalPrice ? parseFloat(product.originalPrice.toString()) : undefined,
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: product.reviews.length,
        stock: product.stock,
        sellerId: product.seller.id,
        sellerName: product.seller.name || '',
        categoryId: product.category.id,
        categoryName: product.category.name,
        attributes,
        specifications,
        pros: this.extractPros(product, avgRating),
        cons: this.extractCons(product, avgRating),
      };
    });
  }

  /**
   * Build comparison result / Müqayisə nəticəsini qur
   */
  private async buildComparisonResult(products: ComparisonProduct[]): Promise<ComparisonResult> {
    // Find common and differing attributes / Ümumi və fərqli atributları tap
    const { commonAttributes, differingAttributes } = this.analyzeAttributes(products);

    // Generate price analysis / Qiymət analizini yarat
    const priceAnalysis = this.analyzePrices(products);

    // Generate rating analysis / Reytinq analizini yarat
    const ratingAnalysis = this.analyzeRatings(products);

    // Generate recommendations / Tövsiyələri yarat
    const recommendations = this.generateRecommendations(products, priceAnalysis, ratingAnalysis);

    return {
      products,
      commonAttributes,
      differingAttributes,
      recommendations,
      priceAnalysis,
      ratingAnalysis,
    };
  }

  /**
   * Analyze attributes / Atributları analiz et
   */
  private analyzeAttributes(products: ComparisonProduct[]): {
    commonAttributes: string[];
    differingAttributes: string[];
  } {
    // Get all attribute keys / Bütün atribut açarlarını al
    const allKeys = new Set<string>();
    products.forEach((product) => {
      Object.keys(product.attributes).forEach((key) => allKeys.add(key));
      product.specifications.forEach((spec) => allKeys.add(spec.name));
    });

    const commonAttributes: string[] = [];
    const differingAttributes: string[] = [];

    allKeys.forEach((key) => {
      const values = products.map((p) => {
        const attrValue = p.attributes[key];
        const specValue = p.specifications.find((s) => s.name === key)?.value;
        return attrValue !== undefined ? attrValue : specValue;
      });

      // Check if all values are the same / Bütün dəyərlərin eyni olub-olmadığını yoxla
      const firstValue = values[0];
      const allSame = values.every((v) => v === firstValue);

      if (allSame && firstValue !== undefined) {
        commonAttributes.push(key);
      } else if (values.some((v) => v !== undefined)) {
        differingAttributes.push(key);
      }
    });

    return { commonAttributes, differingAttributes };
  }

  /**
   * Analyze prices / Qiymətləri analiz et
   */
  private analyzePrices(products: ComparisonProduct[]): PriceAnalysis {
    const prices = products.map((p) => ({ id: p.id, price: p.price, rating: p.rating }));
    const sortedByPrice = [...prices].sort((a, b) => a.price - b.price);

    // Calculate best value (highest rating per price) / Ən yaxşı dəyəri hesabla (qiymətə görə ən yüksək reytinq)
    const valueScores = products.map((p) => ({
      id: p.id,
      score: p.rating / p.price * 100,
    }));
    const bestValue = valueScores.reduce((a, b) => (a.score > b.score ? a : b));

    return {
      cheapestId: sortedByPrice[0].id,
      mostExpensiveId: sortedByPrice[sortedByPrice.length - 1].id,
      averagePrice: prices.reduce((sum, p) => sum + p.price, 0) / prices.length,
      priceRange: {
        min: sortedByPrice[0].price,
        max: sortedByPrice[sortedByPrice.length - 1].price,
      },
      bestValueId: bestValue.id,
    };
  }

  /**
   * Analyze ratings / Reytinqləri analiz et
   */
  private analyzeRatings(products: ComparisonProduct[]): RatingAnalysis {
    const sortedByRating = [...products].sort((a, b) => b.rating - a.rating);
    const sortedByReviews = [...products].sort((a, b) => b.reviewCount - a.reviewCount);

    return {
      highestRatedId: sortedByRating[0].id,
      lowestRatedId: sortedByRating[sortedByRating.length - 1].id,
      averageRating: products.reduce((sum, p) => sum + p.rating, 0) / products.length,
      mostReviewedId: sortedByReviews[0].id,
    };
  }

  /**
   * Generate recommendations / Tövsiyələri yarat
   */
  private generateRecommendations(
    products: ComparisonProduct[],
    priceAnalysis: PriceAnalysis,
    ratingAnalysis: RatingAnalysis
  ): ComparisonRecommendation[] {
    return products.map((product) => {
      const badges: string[] = [];
      let score = 50; // Base score / Əsas bal
      const reasons: string[] = [];

      // Best value / Ən yaxşı dəyər
      if (product.id === priceAnalysis.bestValueId) {
        badges.push('best_value');
        score += 15;
        reasons.push('Best value for money / Pula görə ən yaxşı dəyər');
      }

      // Cheapest / Ən ucuz
      if (product.id === priceAnalysis.cheapestId) {
        badges.push('cheapest');
        score += 10;
        reasons.push('Lowest price / Ən aşağı qiymət');
      }

      // Highest rated / Ən yüksək reytinqli
      if (product.id === ratingAnalysis.highestRatedId) {
        badges.push('top_rated');
        score += 15;
        reasons.push('Highest customer rating / Ən yüksək müştəri reytinqi');
      }

      // Most reviewed / Ən çox rəy alan
      if (product.id === ratingAnalysis.mostReviewedId) {
        badges.push('most_popular');
        score += 10;
        reasons.push('Most reviews / Ən çox rəy');
      }

      // In stock bonus / Stokda bonus
      if (product.stock > 10) {
        score += 5;
      } else if (product.stock === 0) {
        score -= 20;
        badges.push('out_of_stock');
      }

      // Rating bonus / Reytinq bonusu
      score += product.rating * 5;

      return {
        productId: product.id,
        reason: reasons.length > 0 ? reasons.join('. ') : 'Good option / Yaxşı seçim',
        score: Math.min(100, Math.max(0, score)),
        badges,
      };
    }).sort((a, b) => b.score - a.score);
  }

  /**
   * Extract pros / Müsbət cəhətləri çıxar
   */
  private extractPros(product: any, rating: number): string[] {
    const pros: string[] = [];

    if (rating >= 4.5) {
      pros.push('Excellent customer reviews / Əla müştəri rəyləri');
    } else if (rating >= 4.0) {
      pros.push('Very good customer reviews / Çox yaxşı müştəri rəyləri');
    }

    if (product.originalPrice && product.price < product.originalPrice) {
      const discount = Math.round((1 - product.price / product.originalPrice) * 100);
      if (discount >= 20) {
        pros.push(`${discount}% discount / ${discount}% endirim`);
      }
    }

    if (product.stock > 50) {
      pros.push('In stock / Stokda');
    }

    return pros.slice(0, 3);
  }

  /**
   * Extract cons / Mənfi cəhətləri çıxar
   */
  private extractCons(product: any, rating: number): string[] {
    const cons: string[] = [];

    if (rating < 3.0) {
      cons.push('Below average rating / Ortanın altında reytinq');
    }

    if (product.stock === 0) {
      cons.push('Out of stock / Stokda yoxdur');
    } else if (product.stock < 5) {
      cons.push('Limited stock / Məhdud stok');
    }

    if (product.reviews && product.reviews.length < 10) {
      cons.push('Few reviews / Az rəy');
    }

    return cons.slice(0, 3);
  }

  /**
   * Get comparison attributes for category / Kateqoriya üçün müqayisə atributlarını al
   */
  async getCategoryComparisonAttributes(categoryId: string): Promise<string[]> {
    try {
      // Get products in category and extract common attributes / Kateqoriyada məhsulları al və ümumi atributları çıxar
      const products = await prisma.product.findMany({
        where: {
          categoryId,
          isActive: true,
        },
        select: {
          attributes: true,
        },
        take: 50,
      });

      const attributeCounts = new Map<string, number>();

      products.forEach((product) => {
        if (product.attributes) {
          const attrs = typeof product.attributes === 'string'
            ? JSON.parse(product.attributes)
            : product.attributes;
          
          Object.keys(attrs).forEach((key) => {
            attributeCounts.set(key, (attributeCounts.get(key) || 0) + 1);
          });
        }
      });

      // Return attributes that appear in at least 30% of products / Məhsulların ən azı 30%-ində görünən atributları qaytar
      const threshold = products.length * 0.3;
      return Array.from(attributeCounts.entries())
        .filter(([_, count]) => count >= threshold)
        .map(([key]) => key)
        .sort();
    } catch (error) {
      logger.error('Failed to get category comparison attributes / Kateqoriya müqayisə atributlarını almaq uğursuz oldu', error);
      return [];
    }
  }
}

// Singleton instance / Singleton instance
export const productComparisonService = new ProductComparisonService();

/**
 * Export functions / Funksiyaları ixrac et
 */
export async function compareProducts(productIds: string[]): Promise<ComparisonResult | null> {
  return productComparisonService.compareProducts(productIds);
}

export async function getCategoryComparisonAttributes(categoryId: string): Promise<string[]> {
  return productComparisonService.getCategoryComparisonAttributes(categoryId);
}

