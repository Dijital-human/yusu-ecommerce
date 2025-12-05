/**
 * Search Engine Unit Tests / Axtarış Mühərriki Unit Testləri
 * Tests for search engine functionality
 * Axtarış mühərriki funksionallığı üçün testlər
 */

import {
  getSearchClient,
  isSearchEngineEnabled,
  initializeSearchIndex,
  searchProducts,
  getSearchSuggestions,
} from '../search-engine';

// Mock Meilisearch / Meilisearch-i mock et
jest.mock('meilisearch', () => {
  const mockIndex = {
    updateSearchableAttributes: jest.fn().mockResolvedValue(undefined),
    updateFilterableAttributes: jest.fn().mockResolvedValue(undefined),
    updateSortableAttributes: jest.fn().mockResolvedValue(undefined),
    updateRankingRules: jest.fn().mockResolvedValue(undefined),
    addDocuments: jest.fn().mockResolvedValue({ taskUid: 1 }),
    updateDocuments: jest.fn().mockResolvedValue({ taskUid: 1 }),
    deleteDocument: jest.fn().mockResolvedValue({ taskUid: 1 }),
    search: jest.fn().mockResolvedValue({
      hits: [],
      estimatedTotalHits: 0,
    }),
  };

  return {
    MeiliSearch: jest.fn().mockImplementation(() => ({
      index: jest.fn().mockReturnValue(mockIndex),
    })),
  };
});

// Mock Prisma / Prisma-nı mock et
jest.mock('@/lib/db', () => ({
  prisma: {
    products: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    order_items: {
      groupBy: jest.fn().mockResolvedValue([]),
    },
    categories: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    users: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    reviews: {
      findMany: jest.fn().mockResolvedValue([]),
      groupBy: jest.fn().mockResolvedValue([]),
    },
  },
}));

// Mock logger / Logger-i mock et
jest.mock('@/lib/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('Search Engine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables / Mühit dəyişənlərini sıfırla
    delete process.env.MEILISEARCH_HOST;
    delete process.env.MEILISEARCH_API_KEY;
    delete process.env.SEARCH_ENGINE_ENABLED;
  });

  describe('isSearchEngineEnabled', () => {
    it('should return false when not configured / Konfiqurasiya edilməyəndə false qaytarmalıdır', () => {
      expect(isSearchEngineEnabled()).toBe(false);
    });

    it('should return true when configured / Konfiqurasiya edildikdə true qaytarmalıdır', () => {
      process.env.SEARCH_ENGINE_ENABLED = 'true';
      process.env.MEILISEARCH_HOST = 'http://localhost:7700';

      expect(isSearchEngineEnabled()).toBe(true);
    });
  });

  describe('getSearchClient', () => {
    it('should return null when not configured / Konfiqurasiya edilməyəndə null qaytarmalıdır', () => {
      const client = getSearchClient();
      expect(client).toBeNull();
    });

    it('should return client when configured / Konfiqurasiya edildikdə client qaytarmalıdır', () => {
      process.env.SEARCH_ENGINE_ENABLED = 'true';
      process.env.MEILISEARCH_HOST = 'http://localhost:7700';

      const client = getSearchClient();
      expect(client).not.toBeNull();
    });
  });

  describe('searchProducts', () => {
    it('should return null when search engine not enabled / Axtarış mühərriki aktiv olmayanda null qaytarmalıdır', async () => {
      const result = await searchProducts({ query: 'test' });
      expect(result).toBeNull();
    });

    it('should search products with filters / Filtrlərlə məhsulları axtarmalıdır', async () => {
      process.env.SEARCH_ENGINE_ENABLED = 'true';
      process.env.MEILISEARCH_HOST = 'http://localhost:7700';

      const result = await searchProducts({
        query: 'laptop',
        filters: {
          minPrice: 100,
          maxPrice: 1000,
          rating: 4,
        },
        page: 1,
        limit: 12,
      });

      expect(result).toBeDefined();
    });
  });

  describe('getSearchSuggestions', () => {
    it('should return empty array when search engine not enabled / Axtarış mühərriki aktiv olmayanda boş array qaytarmalıdır', async () => {
      const result = await getSearchSuggestions('test');
      expect(result).toEqual([]);
    });
  });
});

