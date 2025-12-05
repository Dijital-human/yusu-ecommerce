/**
 * Search Analytics Service / Axtarış Analitika Xidməti
 * Tracks search queries and analytics
 * Axtarış sorğularını və analitikanı izləyir
 */

import { getReadClient, getWriteClient } from '@/lib/db/query-client';
import { logger } from '@/lib/utils/logger';
import { cache } from '@/lib/cache/cache-wrapper';

interface SearchQuery {
  query: string;
  resultsCount: number;
  filters?: {
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
  };
  userId?: string;
  sessionId?: string;
  timestamp: Date;
}

/**
 * Track a search query / Axtarış sorğusunu izlə
 */
export async function trackSearchQuery(data: {
  query: string;
  resultsCount: number;
  filters?: {
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
  };
  userId?: string;
  sessionId?: string;
}): Promise<void> {
  try {
    // For now, we'll use in-memory storage
    // Production-da bu veritabanında SearchQuery model olmalıdır
    // Hal-hazırda in-memory storage istifadə edəcəyik
    // Production-da bu veritabanında SearchQuery model olmalıdır

    const searchQuery: SearchQuery = {
      query: data.query,
      resultsCount: data.resultsCount,
      filters: data.filters,
      userId: data.userId,
      sessionId: data.sessionId,
      timestamp: new Date(),
    };

    // Store in cache for analytics / Analitika üçün cache-də saxla
    const cacheKey = `search:analytics:${new Date().toISOString().split('T')[0]}`;
    const existing = await cache.get<SearchQuery[]>(cacheKey) || [];
    existing.push(searchQuery);
    
    // Keep only last 1000 queries per day / Günə yalnız son 1000 sorğunu saxla
    if (existing.length > 1000) {
      existing.shift();
    }
    
    await cache.set(cacheKey, existing, 24 * 60 * 60); // 24 hours TTL

    logger.debug('Search query tracked / Axtarış sorğusu izləndi', {
      query: data.query,
      resultsCount: data.resultsCount,
    });
  } catch (error) {
    logger.error('Failed to track search query / Axtarış sorğusunu izləmək uğursuz oldu', error);
  }
}

/**
 * Get popular searches / Populyar axtarışları al
 */
export async function getPopularSearches(limit: number = 10, days: number = 7): Promise<Array<{
  query: string;
  count: number;
  avgResultsCount: number;
}>> {
  try {
    const searches: SearchQuery[] = [];
    const today = new Date();

    // Collect searches from cache for the last N days / Son N gün üçün cache-dən axtarışları topla
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const cacheKey = `search:analytics:${date.toISOString().split('T')[0]}`;
      const daySearches = await cache.get<SearchQuery[]>(cacheKey) || [];
      searches.push(...daySearches);
    }

    // Count occurrences and calculate average results / Təkrarları say və orta nəticələri hesabla
    const queryMap = new Map<string, { count: number; totalResults: number }>();

    searches.forEach(search => {
      const normalizedQuery = search.query.toLowerCase().trim();
      const existing = queryMap.get(normalizedQuery) || { count: 0, totalResults: 0 };
      queryMap.set(normalizedQuery, {
        count: existing.count + 1,
        totalResults: existing.totalResults + search.resultsCount,
      });
    });

    // Convert to array and sort by count / Array-ə çevir və sayına görə sırala
    const popularSearches = Array.from(queryMap.entries())
      .map(([query, data]) => ({
        query,
        count: data.count,
        avgResultsCount: Math.round(data.totalResults / data.count),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return popularSearches;
  } catch (error) {
    logger.error('Failed to get popular searches / Populyar axtarışları almaq uğursuz oldu', error);
    return [];
  }
}

/**
 * Get search statistics / Axtarış statistikalarını al
 */
export async function getSearchStatistics(days: number = 7): Promise<{
  totalSearches: number;
  uniqueQueries: number;
  avgResultsPerQuery: number;
  noResultsQueries: number;
  popularSearches: Array<{ query: string; count: number; avgResultsCount: number }>;
}> {
  try {
    const searches: SearchQuery[] = [];
    const today = new Date();

    // Collect searches from cache / Cache-dən axtarışları topla
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const cacheKey = `search:analytics:${date.toISOString().split('T')[0]}`;
      const daySearches = await cache.get<SearchQuery[]>(cacheKey) || [];
      searches.push(...daySearches);
    }

    const totalSearches = searches.length;
    const uniqueQueries = new Set(searches.map(s => s.query.toLowerCase().trim())).size;
    const totalResults = searches.reduce((sum, s) => sum + s.resultsCount, 0);
    const avgResultsPerQuery = totalSearches > 0 ? Math.round(totalResults / totalSearches) : 0;
    const noResultsQueries = searches.filter(s => s.resultsCount === 0).length;

    const popularSearches = await getPopularSearches(10, days);

    return {
      totalSearches,
      uniqueQueries,
      avgResultsPerQuery,
      noResultsQueries,
      popularSearches,
    };
  } catch (error) {
    logger.error('Failed to get search statistics / Axtarış statistikalarını almaq uğursuz oldu', error);
    return {
      totalSearches: 0,
      uniqueQueries: 0,
      avgResultsPerQuery: 0,
      noResultsQueries: 0,
      popularSearches: [],
    };
  }
}

/**
 * Get trending searches / Trend axtarışları al
 * Searches that are increasing in popularity / Populyarlığı artan axtarışlar
 */
export async function getTrendingSearches(limit: number = 10, days: number = 7): Promise<Array<{
  query: string;
  count: number;
  growth: number; // Percentage growth / Faiz artım
}>> {
  try {
    const today = new Date();
    const halfDays = Math.floor(days / 2);
    
    // Get searches from first half / İlk yarıdan axtarışları al
    const firstHalfSearches: SearchQuery[] = [];
    for (let i = days; i >= halfDays; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const cacheKey = `search:analytics:${date.toISOString().split('T')[0]}`;
      const daySearches = await cache.get<SearchQuery[]>(cacheKey) || [];
      firstHalfSearches.push(...daySearches);
    }

    // Get searches from second half / İkinci yarıdan axtarışları al
    const secondHalfSearches: SearchQuery[] = [];
    for (let i = halfDays - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const cacheKey = `search:analytics:${date.toISOString().split('T')[0]}`;
      const daySearches = await cache.get<SearchQuery[]>(cacheKey) || [];
      secondHalfSearches.push(...daySearches);
    }

    // Count queries in each period / Hər dövrdə sorğuları say
    const firstHalfMap = new Map<string, number>();
    firstHalfSearches.forEach(search => {
      const normalizedQuery = search.query.toLowerCase().trim();
      firstHalfMap.set(normalizedQuery, (firstHalfMap.get(normalizedQuery) || 0) + 1);
    });

    const secondHalfMap = new Map<string, number>();
    secondHalfSearches.forEach(search => {
      const normalizedQuery = search.query.toLowerCase().trim();
      secondHalfMap.set(normalizedQuery, (secondHalfMap.get(normalizedQuery) || 0) + 1);
    });

    // Calculate growth / Artımı hesabla
    const trending: Array<{ query: string; count: number; growth: number }> = [];
    
    secondHalfMap.forEach((count, query) => {
      const firstHalfCount = firstHalfMap.get(query) || 0;
      if (firstHalfCount > 0) {
        const growth = ((count - firstHalfCount) / firstHalfCount) * 100;
        trending.push({ query, count, growth });
      } else if (count > 0) {
        // New trending query / Yeni trend sorğu
        trending.push({ query, count, growth: 100 });
      }
    });

    return trending
      .sort((a, b) => b.growth - a.growth)
      .slice(0, limit);
  } catch (error) {
    logger.error('Failed to get trending searches / Trend axtarışları almaq uğursuz oldu', error);
    return [];
  }
}

/**
 * Get search volume over time / Vaxt üzrə axtarış həcmini al
 */
export async function getSearchVolumeOverTime(days: number = 7): Promise<Array<{
  date: string;
  count: number;
}>> {
  try {
    const volume: Array<{ date: string; count: number }> = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const cacheKey = `search:analytics:${dateStr}`;
      const daySearches = await cache.get<SearchQuery[]>(cacheKey) || [];
      
      volume.push({
        date: dateStr,
        count: daySearches.length,
      });
    }

    return volume;
  } catch (error) {
    logger.error('Failed to get search volume over time / Vaxt üzrə axtarış həcmini almaq uğursuz oldu', error);
    return [];
  }
}

/**
 * Get search-to-purchase conversion / Axtarışdan-alışa konversiyanı al
 */
export async function getSearchToPurchaseConversion(days: number = 7): Promise<{
  totalSearches: number;
  searchesWithPurchases: number;
  conversionRate: number;
  topConvertingSearches: Array<{
    query: string;
    searches: number;
    purchases: number;
    conversionRate: number;
  }>;
}> {
  try {
    // Get searches / Axtarışları al
    const searches: SearchQuery[] = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const cacheKey = `search:analytics:${date.toISOString().split('T')[0]}`;
      const daySearches = await cache.get<SearchQuery[]>(cacheKey) || [];
      searches.push(...daySearches);
    }

    const totalSearches = searches.length;
    
    // Get users who searched and made purchases / Axtarış edib alış edən istifadəçiləri al
    // Note: This is simplified. In production, track search-to-purchase journey
    // Qeyd: Bu sadələşdirilmişdir. Production-da axtarışdan-alışa səyahəti izləyin
    const searchUsers = new Set(searches.map(s => s.userId).filter(Boolean));
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - days);

    const purchases = await prisma.orders.count({
      where: {
        customerId: { in: Array.from(searchUsers) },
        createdAt: { gte: startDate },
        status: { in: ['CONFIRMED', 'SHIPPED', 'DELIVERED'] },
      },
    });

    const searchesWithPurchases = Math.min(purchases, totalSearches);
    const conversionRate = totalSearches > 0 
      ? (searchesWithPurchases / totalSearches) * 100 
      : 0;

    // Top converting searches (simplified) / Ən çox konversiya edən axtarışlar (sadələşdirilmiş)
    const topConvertingSearches: Array<{
      query: string;
      searches: number;
      purchases: number;
      conversionRate: number;
    }> = [];

    // Group searches by query / Sorğulara görə axtarışları qruplaşdır
    const queryMap = new Map<string, number>();
    searches.forEach(search => {
      const normalizedQuery = search.query.toLowerCase().trim();
      queryMap.set(normalizedQuery, (queryMap.get(normalizedQuery) || 0) + 1);
    });

    // Calculate conversion for top queries / Ən çox sorğulan sorğular üçün konversiyanı hesabla
    const topQueries = Array.from(queryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    topQueries.forEach(([query, searchCount]) => {
      // Simplified: assume 10% conversion for top searches / Sadələşdirilmiş: ən çox sorğulan axtarışlar üçün 10% konversiya fərz et
      const estimatedPurchases = Math.floor(searchCount * 0.1);
      topConvertingSearches.push({
        query,
        searches: searchCount,
        purchases: estimatedPurchases,
        conversionRate: 10,
      });
    });

    return {
      totalSearches,
      searchesWithPurchases,
      conversionRate: Math.round(conversionRate * 100) / 100,
      topConvertingSearches,
    };
  } catch (error) {
    logger.error('Failed to get search-to-purchase conversion / Axtarışdan-alışa konversiyanı almaq uğursuz oldu', error);
    return {
      totalSearches: 0,
      searchesWithPurchases: 0,
      conversionRate: 0,
      topConvertingSearches: [],
    };
  }
}

