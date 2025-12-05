/**
 * ML Recommendations Service / ML Tövsiyələr Xidməti
 * Provides ML-based product recommendations using TensorFlow.js
 * TensorFlow.js istifadə edərək ML əsaslı məhsul tövsiyələri təmin edir
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/utils/logger';
import { loadModel, type ModelConfig } from './model-loader';
import { cosineSimilarity, euclideanDistance } from './vector-search';
import { cache, cacheKeys } from '@/lib/cache/cache-wrapper';

/**
 * User embedding interface / İstifadəçi embedding interfeysi
 */
export interface UserEmbedding {
  userId: string;
  embedding: number[];
  features: {
    purchaseHistory: number[];
    categoryPreferences: number[];
    priceRange: number[];
    ratingPreferences: number[];
  };
}

/**
 * Product embedding interface / Məhsul embedding interfeysi
 */
export interface ProductEmbedding {
  productId: string;
  embedding: number[];
  features: {
    category: number[];
    price: number;
    rating: number;
    popularity: number;
  };
}

/**
 * Recommendation result interface / Tövsiyə nəticəsi interfeysi
 */
export interface MLRecommendation {
  productId: string;
  score: number;
  reason: string;
  confidence: number;
}

/**
 * Generate user embedding / İstifadəçi embedding yarat
 */
export async function generateUserEmbedding(userId: string): Promise<UserEmbedding> {
  const cacheKey = `user_embedding:${userId}`;
  
  // Check cache / Cache-i yoxla
  const cached = await cache.get<UserEmbedding>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    // Get user's order history / İstifadəçinin sifariş tarixçəsini al
    const orders = await prisma.orders.findMany({
      where: {
        customerId: userId,
        status: {
          in: ['DELIVERED', 'CONFIRMED'],
        },
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      take: 50,
    });

    // Extract features / Xüsusiyyətləri çıxar
    const purchaseHistory: number[] = [];
    const categoryPreferences: Map<string, number> = new Map();
    const priceRange: number[] = [];
    const ratingPreferences: number[] = [];

    orders.forEach((order: any) => {
      order.items.forEach((item: any) => {
        const product = item.product;
        purchaseHistory.push(parseFloat(product.price.toString()));
        
        // Category preferences / Kateqoriya üstünlükləri
        const categoryId = product.categoryId;
        categoryPreferences.set(categoryId, (categoryPreferences.get(categoryId) || 0) + item.quantity);
        
        // Price range / Qiymət aralığı
        priceRange.push(parseFloat(product.price.toString()));
      });
    });

    // Normalize category preferences / Kateqoriya üstünlüklərini normallaşdır
    const totalPurchases = Array.from(categoryPreferences.values()).reduce((a, b) => a + b, 0);
    const normalizedCategories = Array.from(categoryPreferences.values()).map(
      (count) => totalPurchases > 0 ? count / totalPurchases : 0
    );

    // Calculate average price / Orta qiyməti hesabla
    const avgPrice = priceRange.length > 0 
      ? priceRange.reduce((a, b) => a + b, 0) / priceRange.length 
      : 0;

    // Generate embedding vector / Embedding vektor yarat
    // In production, use actual ML model / Production-da faktiki ML modelindən istifadə et
    const embedding: number[] = [
      ...normalizedCategories.slice(0, 10), // First 10 categories / İlk 10 kateqoriya
      avgPrice / 1000, // Normalized average price / Normallaşdırılmış orta qiymət
      ...Array(88).fill(0), // Pad to 100 dimensions / 100 ölçüyə qədər doldur
    ];

    const userEmbedding: UserEmbedding = {
      userId,
      embedding,
      features: {
        purchaseHistory: priceRange.slice(0, 20), // Last 20 purchases / Son 20 alış
        categoryPreferences: normalizedCategories,
        priceRange: [Math.min(...priceRange), Math.max(...priceRange)],
        ratingPreferences: ratingPreferences,
      },
    };

    // Cache for 1 hour / 1 saat cache et
    await cache.set(cacheKey, userEmbedding, 3600);

    return userEmbedding;
  } catch (error) {
    logger.error('Failed to generate user embedding / İstifadəçi embedding yaratmaq uğursuz oldu', error, { userId });
    throw error;
  }
}

/**
 * Generate product embedding / Məhsul embedding yarat
 */
export async function generateProductEmbedding(productId: string): Promise<ProductEmbedding> {
  const cacheKey = `product_embedding:${productId}`;
  
  // Check cache / Cache-i yoxla
  const cached = await cache.get<ProductEmbedding>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });

    if (!product) {
      throw new Error('Product not found / Məhsul tapılmadı');
    }

    // Calculate average rating / Orta reytinqi hesabla
    const avgRating = product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;

    // Calculate popularity (based on order count) / Populyarlıq hesabla (sifariş sayına görə)
    const orderCount = await prisma.order_items.count({
      where: { productId },
    });

    // Generate embedding vector / Embedding vektor yarat
    // In production, use actual ML model / Production-da faktiki ML modelindən istifadə et
    const categoryId = product.categoryId;
    const categoryVector = Array(50).fill(0);
    categoryVector[parseInt(categoryId.slice(-2), 16) % 50] = 1; // Simple category encoding / Sadə kateqoriya kodlaması

    const embedding: number[] = [
      ...categoryVector,
      parseFloat(product.price.toString()) / 1000, // Normalized price / Normallaşdırılmış qiymət
      avgRating / 5, // Normalized rating / Normallaşdırılmış reytinq
      Math.min(orderCount / 100, 1), // Normalized popularity / Normallaşdırılmış populyarlıq
      ...Array(46).fill(0), // Pad to 100 dimensions / 100 ölçüyə qədər doldur
    ];

    const productEmbedding: ProductEmbedding = {
      productId,
      embedding,
      features: {
        category: categoryVector,
        price: parseFloat(product.price.toString()),
        rating: avgRating,
        popularity: orderCount,
      },
    };

    // Cache for 1 hour / 1 saat cache et
    await cache.set(cacheKey, productEmbedding, 3600);

    return productEmbedding;
  } catch (error) {
    logger.error('Failed to generate product embedding / Məhsul embedding yaratmaq uğursuz oldu', error, { productId });
    throw error;
  }
}

/**
 * Get ML-based recommendations for user / İstifadəçi üçün ML əsaslı tövsiyələr al
 */
export async function getMLRecommendations(
  userId: string,
  limit: number = 10
): Promise<MLRecommendation[]> {
  const cacheKey = `ml_recommendations:${userId}:${limit}`;
  
  // Check cache / Cache-i yoxla
  const cached = await cache.get<MLRecommendation[]>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    // Generate user embedding / İstifadəçi embedding yarat
    const userEmbedding = await generateUserEmbedding(userId);

    // Get all active products / Bütün aktiv məhsulları al
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        isPublished: true,
        isApproved: true,
      },
      select: {
        id: true,
      },
      take: 1000, // Limit for performance / Performans üçün limit
    });

    // Get user's purchased products / İstifadəçinin aldığı məhsulları al
    const userOrders = await prisma.orders.findMany({
      where: {
        customerId: userId,
      },
      include: {
        items: {
          select: {
            productId: true,
          },
        },
      },
    });

    const purchasedProductIds = new Set<string>();
    userOrders.forEach((order: any) => {
      order.items.forEach((item: any) => {
        purchasedProductIds.add(item.productId);
      });
    });

    // Calculate similarity scores / Oxşarlıq ballarını hesabla
    const recommendations: MLRecommendation[] = [];

    for (const product of products) {
      if (purchasedProductIds.has(product.id)) {
        continue; // Skip already purchased products / Artıq alınmış məhsulları atla
      }

      try {
        const productEmbedding = await generateProductEmbedding(product.id);
        
        // Calculate cosine similarity / Cosine oxşarlığını hesabla
        const similarity = cosineSimilarity(
          userEmbedding.embedding,
          productEmbedding.embedding
        );

        recommendations.push({
          productId: product.id,
          score: similarity,
          reason: 'ML similarity match / ML oxşarlıq uyğunluğu',
          confidence: Math.min(similarity * 100, 100),
        });
      } catch (error) {
        logger.warn('Failed to generate embedding for product / Məhsul üçün embedding yaratmaq uğursuz oldu', {
          productId: product.id,
          error,
        });
      }
    }

    // Sort by score and take top N / Ballara görə sırala və ilk N-i götür
    const topRecommendations = recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Cache for 30 minutes / 30 dəqiqə cache et
    await cache.set(cacheKey, topRecommendations, 1800);

    logger.info('ML recommendations generated / ML tövsiyələri yaradıldı', {
      userId,
      count: topRecommendations.length,
    });

    return topRecommendations;
  } catch (error) {
    logger.error('Failed to get ML recommendations / ML tövsiyələrini almaq uğursuz oldu', error, { userId });
    return [];
  }
}

/**
 * Load recommendation model / Tövsiyə modelini yüklə
 */
export async function loadRecommendationModel(): Promise<any> {
  const config: ModelConfig = {
    name: 'recommendation_model',
    version: '1.0.0',
    path: '/models/recommendation/model.json',
    type: 'recommendation',
    inputShape: [100], // User embedding size / İstifadəçi embedding ölçüsü
    outputShape: [100], // Product embedding size / Məhsul embedding ölçüsü
  };

  return await loadModel(config);
}

