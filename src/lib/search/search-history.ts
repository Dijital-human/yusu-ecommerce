/**
 * Search History Service / Axtarış Tarixçəsi Xidməti
 * Manages user search history in database / Veritabanında istifadəçi axtarış tarixçəsini idarə edir
 */

import { logger } from '@/lib/utils/logger';
import { prisma } from '@/lib/db';

/**
 * Search history item / Axtarış tarixçəsi elementi
 */
export interface SearchHistoryItem {
  id: string;
  userId: string;
  query: string;
  resultsCount?: number;
  filters?: Record<string, any>;
  timestamp: Date;
}

/**
 * Save search query to history / Axtarış sorğusunu tarixçəyə saxla
 */
export async function saveSearchHistory(
  userId: string,
  query: string,
  options?: {
    resultsCount?: number;
    filters?: Record<string, any>;
  }
): Promise<void> {
  try {
    if (!query || query.trim().length < 2) {
      return;
    }

    // Check if same query exists recently (within last hour) / Eyni sorğunun son saatda olub olmadığını yoxla
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const existing = await prisma.search_history.findFirst({
      where: {
        userId,
        query: query.trim(),
        timestamp: {
          gte: oneHourAgo,
        },
      },
    });

    // If exists, update timestamp / Əgər varsa, timestamp-i yenilə
    if (existing) {
      await prisma.search_history.update({
        where: { id: existing.id },
        data: {
          timestamp: new Date(),
          resultsCount: options?.resultsCount,
          filters: options?.filters ? JSON.parse(JSON.stringify(options.filters)) : null,
        },
      });
      return;
    }

    // Create new history entry / Yeni tarixçə qeydi yarat
    await prisma.search_history.create({
      data: {
        userId,
        query: query.trim(),
        resultsCount: options?.resultsCount,
        filters: options?.filters ? JSON.parse(JSON.stringify(options.filters)) : null,
      },
    });

    logger.debug('Search history saved / Axtarış tarixçəsi saxlanıldı', {
      userId,
      query: query.trim(),
    });
  } catch (error) {
    logger.error('Failed to save search history / Axtarış tarixçəsini saxlatmaq uğursuz oldu', error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Get user search history / İstifadəçi axtarış tarixçəsini al
 */
export async function getUserSearchHistory(
  userId: string,
  limit: number = 10
): Promise<SearchHistoryItem[]> {
  try {
    const history = await prisma.search_history.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      select: {
        id: true,
        userId: true,
        query: true,
        resultsCount: true,
        filters: true,
        timestamp: true,
      },
    });

    return history.map(item => ({
      id: item.id,
      userId: item.userId,
      query: item.query,
      resultsCount: item.resultsCount || undefined,
      filters: item.filters as Record<string, any> | undefined,
      timestamp: item.timestamp,
    }));
  } catch (error) {
    logger.error('Failed to get search history / Axtarış tarixçəsini almaq uğursuz oldu', error instanceof Error ? error : new Error(String(error)));
    return [];
  }
}

/**
 * Delete search history item / Axtarış tarixçəsi elementini sil
 */
export async function deleteSearchHistory(
  userId: string,
  historyId: string
): Promise<void> {
  try {
    await prisma.search_history.delete({
      where: {
        id: historyId,
        userId, // Ensure user can only delete their own history / İstifadəçinin yalnız öz tarixçəsini silə bilməsini təmin et
      },
    });

    logger.debug('Search history item deleted / Axtarış tarixçəsi elementi silindi', {
      userId,
      historyId,
    });
  } catch (error) {
    logger.error('Failed to delete search history / Axtarış tarixçəsini silmək uğursuz oldu', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

/**
 * Clear user search history / İstifadəçi axtarış tarixçəsini təmizlə
 */
export async function clearUserSearchHistory(userId: string): Promise<void> {
  try {
    await prisma.search_history.deleteMany({
      where: { userId },
    });

    logger.info('User search history cleared / İstifadəçi axtarış tarixçəsi təmizləndi', { userId });
  } catch (error) {
    logger.error('Failed to clear search history / Axtarış tarixçəsini təmizləmək uğursuz oldu', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

/**
 * Get search suggestions based on history / Tarixçəyə əsasən axtarış təkliflərini al
 */
export async function getSearchSuggestionsFromHistory(
  userId: string,
  partialQuery: string,
  limit: number = 5
): Promise<string[]> {
  try {
    const suggestions = await prisma.search_history.findMany({
      where: {
        userId,
        query: {
          contains: partialQuery,
          mode: 'insensitive',
        },
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
      select: { query: true },
      distinct: ['query'],
    });

    return suggestions.map(s => s.query);
  } catch (error) {
    logger.error('Failed to get search suggestions from history / Tarixçədən axtarış təkliflərini almaq uğursuz oldu', error instanceof Error ? error : new Error(String(error)));
    return [];
  }
}
