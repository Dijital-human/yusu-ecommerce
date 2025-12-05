/**
 * Recommendation A/B Testing Service / Tövsiyə A/B Test Xidməti
 * Handles A/B testing for recommendation algorithms
 * Tövsiyə alqoritmləri üçün A/B test idarə edir
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/utils/logger';
import { cache } from '@/lib/cache/cache-wrapper';
import { getPersonalizedRecommendations } from '../recommendation-engine';
import { getMLRecommendations } from '../ml/recommendations';
import { getRecommendationsByUserSimilarity } from './collaborative-filtering';

/**
 * Recommendation algorithm variants / Tövsiyə alqoritmi variantları
 */
export type RecommendationAlgorithm = 
  | 'content_based'
  | 'collaborative_filtering'
  | 'ml_based'
  | 'hybrid';

/**
 * A/B test configuration interface / A/B test konfiqurasiya interfeysi
 */
export interface ABTestConfig {
  testId: string;
  name: string;
  variants: Array<{
    id: string;
    algorithm: RecommendationAlgorithm;
    weight: number; // Percentage (0-100) / Faiz (0-100)
  }>;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

/**
 * Test result interface / Test nəticəsi interfeysi
 */
export interface TestResult {
  variantId: string;
  algorithm: RecommendationAlgorithm;
  impressions: number;
  clicks: number;
  conversions: number;
  clickThroughRate: number;
  conversionRate: number;
  revenue: number;
}

/**
 * User assignment cache / İstifadəçi təyinatı cache
 */
const userAssignments = new Map<string, string>();

/**
 * Get active A/B test for user / İstifadəçi üçün aktiv A/B test al
 */
export async function getActiveABTest(userId: string): Promise<ABTestConfig | null> {
  const cacheKey = `ab_test:active:${userId}`;
  
  // Check cache / Cache-i yoxla
  const cached = await cache.get<ABTestConfig>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    // In production, fetch from database / Production-da veritabanından al
    // For now, return a default test config / Hələlik default test konfiqurasiyası qaytar
    const now = new Date();
    const testConfig: ABTestConfig = {
      testId: 'recommendation_test_1',
      name: 'Recommendation Algorithm Test',
      variants: [
        {
          id: 'variant_a',
          algorithm: 'content_based',
          weight: 33,
        },
        {
          id: 'variant_b',
          algorithm: 'collaborative_filtering',
          weight: 33,
        },
        {
          id: 'variant_c',
          algorithm: 'ml_based',
          weight: 34,
        },
      ],
      startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago / 7 gün əvvəl
      endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now / 7 gün sonra
      isActive: true,
    };

    // Cache for 1 hour / 1 saat cache et
    await cache.set(cacheKey, testConfig, 3600);

    return testConfig;
  } catch (error) {
    logger.error('Failed to get active A/B test / Aktiv A/B test almaq uğursuz oldu', error, { userId });
    return null;
  }
}

/**
 * Assign user to test variant / İstifadəçini test variantına təyin et
 */
export function assignUserToVariant(userId: string, testConfig: ABTestConfig): string {
  const assignmentKey = `${testConfig.testId}:${userId}`;
  
  // Check if already assigned / Artıq təyin edilibsə yoxla
  if (userAssignments.has(assignmentKey)) {
    return userAssignments.get(assignmentKey)!;
  }

  // Weighted random assignment / Çəkili təsadüfi təyinat
  const random = Math.random() * 100;
  let cumulativeWeight = 0;
  let assignedVariant = testConfig.variants[0].id;

  for (const variant of testConfig.variants) {
    cumulativeWeight += variant.weight;
    if (random <= cumulativeWeight) {
      assignedVariant = variant.id;
      break;
    }
  }

  // Store assignment / Təyinatı saxla
  userAssignments.set(assignmentKey, assignedVariant);

  logger.debug('User assigned to variant / İstifadəçi varianta təyin edildi', {
    userId,
    testId: testConfig.testId,
    variantId: assignedVariant,
  });

  return assignedVariant;
}

/**
 * Get recommendations based on A/B test variant / A/B test variantına əsasən tövsiyələr al
 */
export async function getABTestRecommendations(
  userId: string,
  limit: number = 10
): Promise<Array<{ productId: string; score: number; algorithm: RecommendationAlgorithm }>> {
  try {
    const testConfig = await getActiveABTest(userId);
    
    if (!testConfig || !testConfig.isActive) {
      // No active test, use default algorithm / Aktiv test yoxdur, default alqoritmdən istifadə et
      const recommendations = await getPersonalizedRecommendations(userId, limit);
      return recommendations.map((product: any) => ({
        productId: product.id,
        score: 1.0,
        algorithm: 'content_based' as RecommendationAlgorithm,
      }));
    }

    // Assign user to variant / İstifadəçini varianta təyin et
    const variantId = assignUserToVariant(userId, testConfig);
    const variant = testConfig.variants.find((v) => v.id === variantId);

    if (!variant) {
      // Fallback to default / Default-a keç
      const recommendations = await getPersonalizedRecommendations(userId, limit);
      return recommendations.map((product: any) => ({
        productId: product.id,
        score: 1.0,
        algorithm: 'content_based' as RecommendationAlgorithm,
      }));
    }

    // Get recommendations based on variant algorithm / Variant alqoritminə əsasən tövsiyələr al
    let recommendations: Array<{ productId: string; score: number }> = [];

    switch (variant.algorithm) {
      case 'content_based':
        const contentBased = await getPersonalizedRecommendations(userId, limit);
        recommendations = contentBased.map((product: any) => ({
          productId: product.id,
          score: 1.0,
        }));
        break;

      case 'collaborative_filtering':
        const collaborative = await getRecommendationsByUserSimilarity(userId, limit);
        recommendations = collaborative.map((rec) => ({
          productId: rec.productId,
          score: rec.score,
        }));
        break;

      case 'ml_based':
        const mlBased = await getMLRecommendations(userId, limit);
        recommendations = mlBased.map((rec) => ({
          productId: rec.productId,
          score: rec.score,
        }));
        break;

      case 'hybrid':
        // Combine multiple algorithms / Bir neçə alqoritmi birləşdir
        const [content, collaborative, ml] = await Promise.all([
          getPersonalizedRecommendations(userId, Math.ceil(limit / 3)),
          getRecommendationsByUserSimilarity(userId, Math.ceil(limit / 3)),
          getMLRecommendations(userId, Math.ceil(limit / 3)),
        ]);

        recommendations = [
          ...content.map((product: any) => ({ productId: product.id, score: 0.33 })),
          ...collaborative.map((rec) => ({ productId: rec.productId, score: rec.score * 0.33 })),
          ...ml.map((rec) => ({ productId: rec.productId, score: rec.score * 0.34 })),
        ]
          .sort((a, b) => b.score - a.score)
          .slice(0, limit);
        break;
    }

    // Track impression / Impression izlə
    await trackImpression(userId, testConfig.testId, variantId);

    return recommendations.map((rec) => ({
      ...rec,
      algorithm: variant.algorithm,
    }));
  } catch (error) {
    logger.error('Failed to get A/B test recommendations / A/B test tövsiyələrini almaq uğursuz oldu', error, { userId });
    // Fallback to default / Default-a keç
    const recommendations = await getPersonalizedRecommendations(userId, limit);
    return recommendations.map((product: any) => ({
      productId: product.id,
      score: 1.0,
      algorithm: 'content_based' as RecommendationAlgorithm,
    }));
  }
}

/**
 * Track recommendation impression / Tövsiyə impression izlə
 */
async function trackImpression(userId: string, testId: string, variantId: string): Promise<void> {
  try {
    // In production, store in database / Production-da veritabanında saxla
    // For now, just log / Hələlik sadəcə log et
    logger.debug('Recommendation impression tracked / Tövsiyə impression izləndi', {
      userId,
      testId,
      variantId,
    });
  } catch (error) {
    logger.error('Failed to track impression / Impression izləmək uğursuz oldu', error, {
      userId,
      testId,
      variantId,
    });
  }
}

/**
 * Track recommendation click / Tövsiyə klik izlə
 */
export async function trackClick(
  userId: string,
  productId: string,
  testId: string,
  variantId: string
): Promise<void> {
  try {
    // In production, store in database / Production-da veritabanında saxla
    logger.info('Recommendation click tracked / Tövsiyə klik izləndi', {
      userId,
      productId,
      testId,
      variantId,
    });
  } catch (error) {
    logger.error('Failed to track click / Klik izləmək uğursuz oldu', error, {
      userId,
      productId,
      testId,
      variantId,
    });
  }
}

/**
 * Track recommendation conversion / Tövsiyə konversiya izlə
 */
export async function trackConversion(
  userId: string,
  productId: string,
  testId: string,
  variantId: string,
  revenue: number
): Promise<void> {
  try {
    // In production, store in database / Production-da veritabanında saxla
    logger.info('Recommendation conversion tracked / Tövsiyə konversiya izləndi', {
      userId,
      productId,
      testId,
      variantId,
      revenue,
    });
  } catch (error) {
    logger.error('Failed to track conversion / Konversiya izləmək uğursuz oldu', error, {
      userId,
      productId,
      testId,
      variantId,
    });
  }
}

/**
 * Get test results / Test nəticələrini al
 */
export async function getTestResults(testId: string): Promise<TestResult[]> {
  try {
    // In production, aggregate from database / Production-da veritabanından aqreqat et
    // For now, return mock data / Hələlik mock məlumat qaytar
    return [];
  } catch (error) {
    logger.error('Failed to get test results / Test nəticələrini almaq uğursuz oldu', error, { testId });
    return [];
  }
}

/**
 * Calculate statistical significance / Statistik əhəmiyyəti hesabla
 */
export function calculateStatisticalSignificance(
  variantA: TestResult,
  variantB: TestResult
): {
  isSignificant: boolean;
  pValue: number;
  confidence: number;
} {
  // Simplified statistical significance calculation / Sadələşdirilmiş statistik əhəmiyyət hesablaması
  // In production, use proper statistical tests (chi-square, t-test, etc.)
  // Production-da düzgün statistik testlərdən istifadə et (chi-square, t-test və s.)
  
  const conversionRateDiff = Math.abs(variantA.conversionRate - variantB.conversionRate);
  const minSampleSize = Math.min(variantA.impressions, variantB.impressions);
  
  // Simplified p-value calculation / Sadələşdirilmiş p-value hesablaması
  const pValue = Math.min(conversionRateDiff * minSampleSize / 100, 0.05);
  const confidence = (1 - pValue) * 100;
  const isSignificant = pValue < 0.05 && minSampleSize > 100;

  return {
    isSignificant,
    pValue,
    confidence,
  };
}

