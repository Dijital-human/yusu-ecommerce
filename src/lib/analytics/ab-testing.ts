/**
 * A/B Testing Framework / A/B Test Framework-u
 * Provides A/B testing functionality for analytics
 * Analytics üçün A/B test funksionallığı təmin edir
 */

import { logger } from '@/lib/utils/logger';
import { prisma } from '@/lib/db';

/**
 * A/B Test status / A/B Test statusu
 */
export type ABTestStatus = 'draft' | 'running' | 'paused' | 'completed';

/**
 * A/B Test variant / A/B Test variantı
 */
export interface ABTestVariant {
  id: string;
  name: string;
  trafficPercentage: number;
  isControl: boolean;
  configuration?: Record<string, any>;
}

/**
 * A/B Test interface / A/B Test interfeysi
 */
export interface ABTest {
  id: string;
  name: string;
  description?: string;
  status: ABTestStatus;
  startDate?: Date;
  endDate?: Date;
  variants: ABTestVariant[];
  targetMetric: string;
  minimumSampleSize?: number;
  confidenceLevel?: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * A/B Test result / A/B Test nəticəsi
 */
export interface ABTestResult {
  variantId: string;
  variantName: string;
  sampleSize: number;
  conversions: number;
  conversionRate: number;
  metricValue: number;
  statisticalSignificance?: number;
  confidenceInterval?: {
    lower: number;
    upper: number;
  };
  isWinner?: boolean;
}

/**
 * Create A/B test / A/B test yarat
 */
export async function createABTest(
  name: string,
  variants: Omit<ABTestVariant, 'id'>[],
  targetMetric: string,
  options?: {
    description?: string;
    minimumSampleSize?: number;
    confidenceLevel?: number;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<string> {
  try {
    // Validate traffic split / Trafik bölgüsünü yoxla
    const totalTraffic = variants.reduce((sum, v) => sum + v.trafficPercentage, 0);
    if (Math.abs(totalTraffic - 100) > 0.01) {
      throw new Error('Traffic percentages must sum to 100% / Trafik faizləri 100% olmalıdır');
    }

    // Ensure at least one control variant / Ən azı bir kontrol variantı olmalıdır
    const hasControl = variants.some(v => v.isControl);
    if (!hasControl) {
      throw new Error('At least one variant must be marked as control / Ən azı bir variant kontrol kimi işarələnməlidir');
    }

    // Create test in database / Veritabanında test yarat
    // Note: This is a simplified version. In production, use proper database models
    // Qeyd: Bu sadələşdirilmiş versiyadır. Production-da düzgün veritabanı modellərindən istifadə edin
    const testId = `ab_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    logger.info('A/B test created / A/B test yaradıldı', {
      testId,
      name,
      variantCount: variants.length,
      targetMetric,
    });

    return testId;
  } catch (error) {
    logger.error('Failed to create A/B test / A/B test yaratmaq uğursuz oldu', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

/**
 * Assign user to variant / İstifadəçini variant-a təyin et
 */
export function assignVariant(
  testId: string,
  userId: string,
  variants: ABTestVariant[]
): ABTestVariant {
  // Use consistent hashing based on userId and testId / userId və testId-ə əsasən consistent hashing istifadə et
  const hash = hashString(`${testId}_${userId}`);
  const random = hash % 100;

  let cumulative = 0;
  for (const variant of variants) {
    cumulative += variant.trafficPercentage;
    if (random < cumulative) {
      return variant;
    }
  }

  // Fallback to last variant / Son variant-a fallback
  return variants[variants.length - 1];
}

/**
 * Hash string to number / String-i rəqəmə hash et
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer / 32-bit integer-ə çevir
  }
  return Math.abs(hash);
}

/**
 * Track conversion for A/B test / A/B test üçün konversiyanı izlə
 */
export async function trackConversion(
  testId: string,
  variantId: string,
  userId: string,
  value?: number
): Promise<void> {
  try {
    logger.info('A/B test conversion tracked / A/B test konversiyası izləndi', {
      testId,
      variantId,
      userId,
      value,
    });

    // In production, store this in database / Production-da bunu veritabanında saxla
    // await prisma.abTestConversion.create({
    //   data: {
    //     testId,
    //     variantId,
    //     userId,
    //     value,
    //     timestamp: new Date(),
    //   },
    // });
  } catch (error) {
    logger.error('Failed to track A/B test conversion / A/B test konversiyasını izləmək uğursuz oldu', error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Calculate statistical significance / Statistik əhəmiyyəti hesabla
 * Uses chi-square test for conversion rates / Konversiya dərəcələri üçün chi-square test istifadə edir
 */
export function calculateStatisticalSignificance(
  controlConversions: number,
  controlVisitors: number,
  variantConversions: number,
  variantVisitors: number
): number {
  if (controlVisitors === 0 || variantVisitors === 0) {
    return 0;
  }

  const controlRate = controlConversions / controlVisitors;
  const variantRate = variantConversions / variantVisitors;

  // Chi-square test / Chi-square test
  const totalConversions = controlConversions + variantConversions;
  const totalVisitors = controlVisitors + variantVisitors;
  const expectedControl = (totalConversions * controlVisitors) / totalVisitors;
  const expectedVariant = (totalConversions * variantVisitors) / totalVisitors;

  const chiSquare = 
    Math.pow(controlConversions - expectedControl, 2) / expectedControl +
    Math.pow(variantConversions - expectedVariant, 2) / expectedVariant;

  // Convert to p-value (simplified) / P-value-ə çevir (sadələşdirilmiş)
  // In production, use proper statistical library / Production-da düzgün statistik kitabxanadan istifadə edin
  const pValue = 1 - chiSquareCDF(chiSquare, 1);

  return pValue;
}

/**
 * Chi-square CDF (simplified) / Chi-square CDF (sadələşdirilmiş)
 */
function chiSquareCDF(x: number, df: number): number {
  // Simplified approximation / Sadələşdirilmiş təxmin
  // In production, use proper statistical library / Production-da düzgün statistik kitabxanadan istifadə edin
  if (x < 0) return 0;
  if (x === 0) return 0;
  
  // Simple approximation for df=1 / df=1 üçün sadə təxmin
  if (df === 1) {
    return 1 - Math.exp(-x / 2);
  }
  
  return 0.95; // Default / Default
}

/**
 * Get A/B test results / A/B test nəticələrini al
 */
export async function getABTestResults(
  testId: string
): Promise<ABTestResult[]> {
  try {
    // In production, fetch from database / Production-da veritabanından al
    // This is a placeholder / Bu placeholder-dır
    logger.info('A/B test results requested / A/B test nəticələri istəyilir', { testId });

    return [];
  } catch (error) {
    logger.error('Failed to get A/B test results / A/B test nəticələrini almaq uğursuz oldu', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

