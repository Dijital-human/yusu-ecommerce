/**
 * Inventory Forecasting Service / İnventar Proqnozlaşdırma Xidməti
 * ML-based demand forecasting and stock optimization
 * ML əsaslı tələb proqnozlaşdırma və stok optimallaşdırma
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/utils/logger';
import { cache } from '@/lib/cache/cache-wrapper';

/**
 * Sales data point / Satış məlumat nöqtəsi
 */
interface SalesDataPoint {
  date: Date;
  quantity: number;
  revenue: number;
}

/**
 * Forecast result / Proqnoz nəticəsi
 */
export interface ForecastResult {
  productId: string;
  productName: string;
  currentStock: number;
  predictions: DailyPrediction[];
  weeklyForecast: number;
  monthlyForecast: number;
  reorderPoint: number;
  recommendedOrderQuantity: number;
  stockoutRisk: 'low' | 'medium' | 'high';
  daysUntilStockout?: number;
  seasonalTrend: 'increasing' | 'stable' | 'decreasing';
  confidence: number;
}

/**
 * Daily prediction / Gündəlik proqnoz
 */
interface DailyPrediction {
  date: string;
  predictedDemand: number;
  lowerBound: number;
  upperBound: number;
  confidence: number;
}

/**
 * Inventory alert / İnventar xəbərdarlığı
 */
export interface InventoryAlert {
  productId: string;
  productName: string;
  alertType: 'low_stock' | 'stockout' | 'overstock' | 'slow_moving' | 'expiring';
  severity: 'info' | 'warning' | 'critical';
  currentStock: number;
  threshold?: number;
  message: string;
  recommendedAction: string;
  createdAt: Date;
}

/**
 * Restock recommendation / Stok əlavəsi tövsiyəsi
 */
export interface RestockRecommendation {
  productId: string;
  productName: string;
  sellerId: string;
  currentStock: number;
  recommendedQuantity: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  estimatedCost?: number;
  leadTime?: number;
  supplierInfo?: {
    id: string;
    name: string;
    price: number;
  };
}

/**
 * Inventory Forecasting Service / İnventar Proqnozlaşdırma Xidməti
 */
class InventoryForecastingService {
  private readonly cachePrefix = 'inventory_forecast:';
  private readonly cacheDuration = 3600; // 1 hour / 1 saat
  private readonly leadTimeDays = 7; // Default lead time / Default lead time
  private readonly safetyStockMultiplier = 1.5; // Safety stock multiplier / Təhlükəsizlik stoku multiplikatoru

  /**
   * Generate forecast for product / Məhsul üçün proqnoz yarat
   */
  async generateForecast(productId: string, forecastDays: number = 30): Promise<ForecastResult | null> {
    try {
      // Check cache / Cache-i yoxla
      const cacheKey = `${this.cachePrefix}${productId}:${forecastDays}`;
      const cached = await cache.get<ForecastResult>(cacheKey);
      if (cached) {
        return cached;
      }

      // Get product info / Məhsul məlumatlarını al
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: {
          id: true,
          name: true,
          stock: true,
          price: true,
        },
      });

      if (!product) {
        return null;
      }

      // Get historical sales data / Tarixi satış məlumatlarını al
      const salesData = await this.getHistoricalSales(productId, 90); // 90 days history / 90 günlük tarixçə

      // Calculate forecasts / Proqnozları hesabla
      const predictions = this.calculatePredictions(salesData, forecastDays);
      const weeklyForecast = predictions.slice(0, 7).reduce((sum, p) => sum + p.predictedDemand, 0);
      const monthlyForecast = predictions.slice(0, 30).reduce((sum, p) => sum + p.predictedDemand, 0);

      // Calculate reorder point / Yenidən sifariş nöqtəsini hesabla
      const avgDailyDemand = monthlyForecast / 30;
      const reorderPoint = Math.ceil(avgDailyDemand * this.leadTimeDays * this.safetyStockMultiplier);

      // Calculate recommended order quantity (EOQ simplified) / Tövsiyə olunan sifariş miqdarını hesabla (EOQ sadələşdirilmiş)
      const recommendedOrderQuantity = Math.ceil(monthlyForecast * 1.2); // 20% buffer / 20% bufer

      // Calculate stockout risk / Stok tükənmə riskini hesabla
      const daysUntilStockout = avgDailyDemand > 0 
        ? Math.floor(product.stock / avgDailyDemand) 
        : undefined;
      
      const stockoutRisk = this.calculateStockoutRisk(product.stock, avgDailyDemand, this.leadTimeDays);

      // Detect seasonal trend / Mövsümi trendi aşkar et
      const seasonalTrend = this.detectSeasonalTrend(salesData);

      // Calculate confidence / Güvənliyi hesabla
      const confidence = this.calculateConfidence(salesData);

      const result: ForecastResult = {
        productId: product.id,
        productName: product.name,
        currentStock: product.stock,
        predictions,
        weeklyForecast,
        monthlyForecast,
        reorderPoint,
        recommendedOrderQuantity,
        stockoutRisk,
        daysUntilStockout,
        seasonalTrend,
        confidence,
      };

      // Cache result / Nəticəni cache-lə
      await cache.set(cacheKey, result, this.cacheDuration);

      logger.info('Forecast generated / Proqnoz yaradıldı', {
        productId,
        weeklyForecast,
        monthlyForecast,
        stockoutRisk,
      });

      return result;
    } catch (error) {
      logger.error('Failed to generate forecast / Proqnoz yaratmaq uğursuz oldu', error);
      return null;
    }
  }

  /**
   * Get historical sales data / Tarixi satış məlumatlarını al
   */
  private async getHistoricalSales(productId: string, days: number): Promise<SalesDataPoint[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orderItems = await prisma.order_items.findMany({
      where: {
        productId,
        order: {
          createdAt: { gte: startDate },
          status: { in: ['CONFIRMED', 'DELIVERED'] },
        },
      },
      include: {
        order: {
          select: {
            createdAt: true,
          },
        },
      },
    });

    // Group by date / Tarixə görə qruplaşdır
    const salesByDate = new Map<string, { quantity: number; revenue: number }>();

    orderItems.forEach((item) => {
      const dateStr = item.order.createdAt.toISOString().split('T')[0];
      const existing = salesByDate.get(dateStr) || { quantity: 0, revenue: 0 };
      existing.quantity += item.quantity;
      existing.revenue += parseFloat(item.totalPrice.toString());
      salesByDate.set(dateStr, existing);
    });

    // Fill in missing dates with zeros / Çatışmayan tarixləri sıfırlarla doldur
    const result: SalesDataPoint[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const sales = salesByDate.get(dateStr) || { quantity: 0, revenue: 0 };
      result.push({
        date,
        quantity: sales.quantity,
        revenue: sales.revenue,
      });
    }

    return result;
  }

  /**
   * Calculate predictions using simple moving average and trend
   * Sadə hərəkətli ortalama və trend istifadə edərək proqnozları hesabla
   */
  private calculatePredictions(salesData: SalesDataPoint[], forecastDays: number): DailyPrediction[] {
    const predictions: DailyPrediction[] = [];

    // Calculate moving average / Hərəkətli ortalamını hesabla
    const movingAverageWindow = 7;
    const recentData = salesData.slice(-30); // Last 30 days / Son 30 gün
    
    // Calculate average and standard deviation / Ortalama və standart sapmayı hesabla
    const quantities = recentData.map((d) => d.quantity);
    const avg = quantities.reduce((a, b) => a + b, 0) / quantities.length;
    const stdDev = Math.sqrt(
      quantities.reduce((sum, q) => sum + Math.pow(q - avg, 2), 0) / quantities.length
    );

    // Calculate trend / Trendi hesabla
    const trend = this.calculateTrend(recentData);

    // Generate predictions / Proqnozları yarat
    for (let i = 0; i < forecastDays; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i + 1);

      // Apply day of week seasonality / Həftənin günü mövsümiliyini tətbiq et
      const dayOfWeek = date.getDay();
      const weekdayMultiplier = this.getDayOfWeekMultiplier(dayOfWeek, salesData);

      // Base prediction with trend / Trend ilə əsas proqnoz
      const basePrediction = Math.max(0, avg + trend * (i + 1));
      const predictedDemand = Math.round(basePrediction * weekdayMultiplier);

      // Confidence interval / Güvən aralığı
      const marginOfError = stdDev * 1.96; // 95% confidence / 95% güvən
      const confidence = Math.min(100, Math.max(50, 100 - (i * 2))); // Decrease confidence over time / Zamanla güvəni azalt

      predictions.push({
        date: date.toISOString().split('T')[0],
        predictedDemand: Math.max(0, predictedDemand),
        lowerBound: Math.max(0, predictedDemand - marginOfError),
        upperBound: predictedDemand + marginOfError,
        confidence,
      });
    }

    return predictions;
  }

  /**
   * Calculate linear trend / Xətti trendi hesabla
   */
  private calculateTrend(data: SalesDataPoint[]): number {
    if (data.length < 2) return 0;

    const n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    data.forEach((point, i) => {
      sumX += i;
      sumY += point.quantity;
      sumXY += i * point.quantity;
      sumX2 += i * i;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }

  /**
   * Get day of week multiplier / Həftənin günü multiplikatorunu al
   */
  private getDayOfWeekMultiplier(dayOfWeek: number, salesData: SalesDataPoint[]): number {
    // Calculate average sales by day of week / Həftənin gününə görə orta satışları hesabla
    const salesByDay: number[][] = [[], [], [], [], [], [], []];
    
    salesData.forEach((point) => {
      const day = point.date.getDay();
      salesByDay[day].push(point.quantity);
    });

    const dayAverages = salesByDay.map((sales) => 
      sales.length > 0 ? sales.reduce((a, b) => a + b, 0) / sales.length : 1
    );

    const overallAvg = dayAverages.reduce((a, b) => a + b, 0) / 7;
    
    return overallAvg > 0 ? dayAverages[dayOfWeek] / overallAvg : 1;
  }

  /**
   * Calculate stockout risk / Stok tükənmə riskini hesabla
   */
  private calculateStockoutRisk(
    currentStock: number,
    avgDailyDemand: number,
    leadTime: number
  ): 'low' | 'medium' | 'high' {
    if (avgDailyDemand === 0) return 'low';

    const daysOfStock = currentStock / avgDailyDemand;
    const riskThreshold = leadTime * this.safetyStockMultiplier;

    if (daysOfStock > riskThreshold * 2) return 'low';
    if (daysOfStock > riskThreshold) return 'medium';
    return 'high';
  }

  /**
   * Detect seasonal trend / Mövsümi trendi aşkar et
   */
  private detectSeasonalTrend(salesData: SalesDataPoint[]): 'increasing' | 'stable' | 'decreasing' {
    if (salesData.length < 14) return 'stable';

    // Compare recent week to previous week / Son həftəni əvvəlki həftə ilə müqayisə et
    const recentWeek = salesData.slice(-7).reduce((sum, d) => sum + d.quantity, 0);
    const previousWeek = salesData.slice(-14, -7).reduce((sum, d) => sum + d.quantity, 0);

    if (previousWeek === 0) return 'stable';

    const changeRate = (recentWeek - previousWeek) / previousWeek;

    if (changeRate > 0.1) return 'increasing';
    if (changeRate < -0.1) return 'decreasing';
    return 'stable';
  }

  /**
   * Calculate confidence / Güvəni hesabla
   */
  private calculateConfidence(salesData: SalesDataPoint[]): number {
    if (salesData.length < 7) return 50;
    if (salesData.length < 30) return 70;
    if (salesData.length < 90) return 85;
    return 95;
  }

  /**
   * Get inventory alerts for seller / Satıcı üçün inventar xəbərdarlıqlarını al
   */
  async getInventoryAlerts(sellerId: string): Promise<InventoryAlert[]> {
    try {
      const products = await prisma.product.findMany({
        where: { sellerId, isActive: true },
        select: {
          id: true,
          name: true,
          stock: true,
          lowStockThreshold: true,
        },
      });

      const alerts: InventoryAlert[] = [];

      for (const product of products) {
        const threshold = product.lowStockThreshold || 10;

        // Low stock alert / Aşağı stok xəbərdarlığı
        if (product.stock <= threshold && product.stock > 0) {
          alerts.push({
            productId: product.id,
            productName: product.name,
            alertType: 'low_stock',
            severity: product.stock <= threshold / 2 ? 'warning' : 'info',
            currentStock: product.stock,
            threshold,
            message: `Stock is running low / Stok azalır`,
            recommendedAction: `Reorder ${threshold * 3 - product.stock} units / ${threshold * 3 - product.stock} ədəd sifariş edin`,
            createdAt: new Date(),
          });
        }

        // Stockout alert / Stok tükənmə xəbərdarlığı
        if (product.stock === 0) {
          alerts.push({
            productId: product.id,
            productName: product.name,
            alertType: 'stockout',
            severity: 'critical',
            currentStock: 0,
            message: 'Product is out of stock / Məhsul stokda yoxdur',
            recommendedAction: 'Urgent reorder required / Təcili sifariş tələb olunur',
            createdAt: new Date(),
          });
        }

        // Overstock check / Artıq stok yoxlaması
        const forecast = await this.generateForecast(product.id, 30);
        if (forecast && product.stock > forecast.monthlyForecast * 3) {
          alerts.push({
            productId: product.id,
            productName: product.name,
            alertType: 'overstock',
            severity: 'info',
            currentStock: product.stock,
            message: `Stock level is 3x higher than monthly forecast / Stok səviyyəsi aylıq proqnozdan 3 qat yüksəkdir`,
            recommendedAction: 'Consider promotion or price reduction / Promosyon və ya qiymət azaldılması nəzərdən keçirin',
            createdAt: new Date(),
          });
        }
      }

      // Sort by severity / Ciddilikə görə sırala
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

      return alerts;
    } catch (error) {
      logger.error('Failed to get inventory alerts / İnventar xəbərdarlıqlarını almaq uğursuz oldu', error);
      return [];
    }
  }

  /**
   * Get restock recommendations / Stok əlavəsi tövsiyələrini al
   */
  async getRestockRecommendations(sellerId: string): Promise<RestockRecommendation[]> {
    try {
      const products = await prisma.product.findMany({
        where: { sellerId, isActive: true },
        select: {
          id: true,
          name: true,
          stock: true,
          price: true,
        },
      });

      const recommendations: RestockRecommendation[] = [];

      for (const product of products) {
        const forecast = await this.generateForecast(product.id, 30);
        
        if (forecast && forecast.stockoutRisk !== 'low') {
          let urgency: RestockRecommendation['urgency'] = 'low';
          
          if (forecast.stockoutRisk === 'high') {
            urgency = forecast.currentStock === 0 ? 'critical' : 'high';
          } else if (forecast.stockoutRisk === 'medium') {
            urgency = 'medium';
          }

          recommendations.push({
            productId: product.id,
            productName: product.name,
            sellerId,
            currentStock: product.stock,
            recommendedQuantity: forecast.recommendedOrderQuantity,
            urgency,
            estimatedCost: forecast.recommendedOrderQuantity * parseFloat(product.price.toString()) * 0.6, // Estimate 60% of retail price / Pərakəndə qiymətin 60%-i təxmini
            leadTime: this.leadTimeDays,
          });
        }
      }

      // Sort by urgency / Təcililiyə görə sırala
      const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      recommendations.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

      return recommendations;
    } catch (error) {
      logger.error('Failed to get restock recommendations / Stok əlavəsi tövsiyələrini almaq uğursuz oldu', error);
      return [];
    }
  }

  /**
   * Bulk forecast for seller / Satıcı üçün toplu proqnoz
   */
  async bulkForecast(sellerId: string): Promise<ForecastResult[]> {
    try {
      const products = await prisma.product.findMany({
        where: { sellerId, isActive: true },
        select: { id: true },
        take: 100, // Limit to 100 products / 100 məhsulla məhdudlaşdır
      });

      const forecasts: ForecastResult[] = [];

      for (const product of products) {
        const forecast = await this.generateForecast(product.id, 30);
        if (forecast) {
          forecasts.push(forecast);
        }
      }

      return forecasts;
    } catch (error) {
      logger.error('Failed to generate bulk forecast / Toplu proqnoz yaratmaq uğursuz oldu', error);
      return [];
    }
  }
}

// Singleton instance / Singleton instance
export const inventoryForecastingService = new InventoryForecastingService();

/**
 * Export functions / Funksiyaları ixrac et
 */
export async function generateForecast(productId: string, forecastDays?: number): Promise<ForecastResult | null> {
  return inventoryForecastingService.generateForecast(productId, forecastDays);
}

export async function getInventoryAlerts(sellerId: string): Promise<InventoryAlert[]> {
  return inventoryForecastingService.getInventoryAlerts(sellerId);
}

export async function getRestockRecommendations(sellerId: string): Promise<RestockRecommendation[]> {
  return inventoryForecastingService.getRestockRecommendations(sellerId);
}

