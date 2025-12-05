/**
 * Elasticsearch Service / Elasticsearch Xidməti
 * Enterprise-grade search with Elasticsearch
 * Elasticsearch ilə enterprise səviyyəli axtarış
 */

import { logger } from '@/lib/utils/logger';

/**
 * Elasticsearch client configuration / Elasticsearch client konfiqurasiyası
 */
interface ElasticsearchConfig {
  node: string;
  apiKey?: string;
  username?: string;
  password?: string;
  cloudId?: string;
  maxRetries?: number;
  requestTimeout?: number;
}

/**
 * Search result interface / Axtarış nəticəsi interfeysi
 */
interface SearchHit {
  _id: string;
  _score: number;
  _source: Record<string, any>;
  highlight?: Record<string, string[]>;
}

interface SearchResponse {
  hits: SearchHit[];
  total: number;
  maxScore: number;
  aggregations?: Record<string, any>;
  took: number;
}

/**
 * Product document for Elasticsearch / Elasticsearch üçün məhsul sənədi
 */
interface ProductDocument {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  categoryId: string;
  categoryName: string;
  categoryPath: string[];
  sellerId: string;
  sellerName: string;
  sellerRating: number;
  stock: number;
  rating: number;
  reviewCount: number;
  salesCount: number;
  isActive: boolean;
  isPublished: boolean;
  tags: string[];
  attributes: Record<string, string | number>;
  createdAt: string;
  updatedAt: string;
  boostedUntil?: string;
  location?: {
    lat: number;
    lon: number;
  };
}

/**
 * Search options / Axtarış seçimləri
 */
interface SearchOptions {
  query: string;
  filters?: {
    categoryId?: string;
    categoryPath?: string[];
    sellerId?: string;
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
    inStock?: boolean;
    tags?: string[];
    attributes?: Record<string, string | number>;
  };
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
  pagination?: {
    page: number;
    limit: number;
  };
  highlight?: boolean;
  aggregations?: boolean;
  fuzzy?: boolean;
  suggestions?: boolean;
}

/**
 * Elasticsearch client class / Elasticsearch client sinifi
 */
class ElasticsearchClient {
  private client: any = null;
  private isConnected: boolean = false;
  private readonly indexName = 'products';

  /**
   * Initialize Elasticsearch client / Elasticsearch client-i başlat
   */
  async initialize(): Promise<boolean> {
    const node = process.env.ELASTICSEARCH_URL || process.env.ELASTICSEARCH_NODE;
    const enabled = process.env.ELASTICSEARCH_ENABLED === 'true';

    if (!enabled || !node) {
      logger.warn('Elasticsearch is not configured / Elasticsearch konfiqurasiya edilməyib');
      return false;
    }

    try {
      // Dynamic import for @elastic/elasticsearch
      const { Client } = await import('@elastic/elasticsearch');

      const config: any = {
        node,
        maxRetries: 3,
        requestTimeout: 30000,
      };

      // Cloud configuration / Bulud konfiqurasiyası
      if (process.env.ELASTICSEARCH_CLOUD_ID) {
        config.cloud = {
          id: process.env.ELASTICSEARCH_CLOUD_ID,
        };
      }

      // Authentication / Autentifikasiya
      if (process.env.ELASTICSEARCH_API_KEY) {
        config.auth = {
          apiKey: process.env.ELASTICSEARCH_API_KEY,
        };
      } else if (process.env.ELASTICSEARCH_USERNAME && process.env.ELASTICSEARCH_PASSWORD) {
        config.auth = {
          username: process.env.ELASTICSEARCH_USERNAME,
          password: process.env.ELASTICSEARCH_PASSWORD,
        };
      }

      this.client = new Client(config);

      // Test connection / Bağlantını yoxla
      await this.client.ping();
      this.isConnected = true;

      logger.info('Elasticsearch connected / Elasticsearch qoşuldu', { node });
      return true;
    } catch (error) {
      logger.error('Failed to connect to Elasticsearch / Elasticsearch-ə qoşulmaq uğursuz oldu', error);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Check if Elasticsearch is available / Elasticsearch-in mövcud olub-olmadığını yoxla
   */
  isAvailable(): boolean {
    return this.isConnected && this.client !== null;
  }

  /**
   * Create product index with mappings / Mapping-lərlə məhsul indeksini yarat
   */
  async createIndex(): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const indexExists = await this.client.indices.exists({ index: this.indexName });

      if (indexExists) {
        logger.info('Elasticsearch index already exists / Elasticsearch indeksi artıq mövcuddur');
        return true;
      }

      await this.client.indices.create({
        index: this.indexName,
        body: {
          settings: {
            number_of_shards: 3,
            number_of_replicas: 1,
            analysis: {
              analyzer: {
                product_analyzer: {
                  type: 'custom',
                  tokenizer: 'standard',
                  filter: ['lowercase', 'snowball', 'synonym_filter'],
                },
                autocomplete_analyzer: {
                  type: 'custom',
                  tokenizer: 'edge_ngram_tokenizer',
                  filter: ['lowercase'],
                },
              },
              tokenizer: {
                edge_ngram_tokenizer: {
                  type: 'edge_ngram',
                  min_gram: 2,
                  max_gram: 20,
                  token_chars: ['letter', 'digit'],
                },
              },
              filter: {
                synonym_filter: {
                  type: 'synonym',
                  synonyms: [
                    'phone, telefon, smartphone',
                    'laptop, notebook, computer',
                    'headphones, earphones, kulaklık',
                  ],
                },
              },
            },
          },
          mappings: {
            properties: {
              id: { type: 'keyword' },
              name: {
                type: 'text',
                analyzer: 'product_analyzer',
                fields: {
                  autocomplete: {
                    type: 'text',
                    analyzer: 'autocomplete_analyzer',
                  },
                  keyword: {
                    type: 'keyword',
                  },
                },
              },
              description: {
                type: 'text',
                analyzer: 'product_analyzer',
              },
              price: { type: 'float' },
              originalPrice: { type: 'float' },
              images: { type: 'keyword' },
              categoryId: { type: 'keyword' },
              categoryName: {
                type: 'text',
                fields: {
                  keyword: { type: 'keyword' },
                },
              },
              categoryPath: { type: 'keyword' },
              sellerId: { type: 'keyword' },
              sellerName: {
                type: 'text',
                fields: {
                  keyword: { type: 'keyword' },
                },
              },
              sellerRating: { type: 'float' },
              stock: { type: 'integer' },
              rating: { type: 'float' },
              reviewCount: { type: 'integer' },
              salesCount: { type: 'integer' },
              isActive: { type: 'boolean' },
              isPublished: { type: 'boolean' },
              tags: { type: 'keyword' },
              attributes: { type: 'object' },
              createdAt: { type: 'date' },
              updatedAt: { type: 'date' },
              boostedUntil: { type: 'date' },
              location: { type: 'geo_point' },
              suggest: {
                type: 'completion',
              },
            },
          },
        },
      });

      logger.info('Elasticsearch index created / Elasticsearch indeksi yaradıldı');
      return true;
    } catch (error) {
      logger.error('Failed to create Elasticsearch index / Elasticsearch indeksini yaratmaq uğursuz oldu', error);
      return false;
    }
  }

  /**
   * Index a product / Məhsulu indekslə
   */
  async indexProduct(product: ProductDocument): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      await this.client.index({
        index: this.indexName,
        id: product.id,
        body: {
          ...product,
          suggest: {
            input: [product.name, ...product.tags],
            weight: product.salesCount + product.reviewCount,
          },
        },
        refresh: true,
      });

      logger.debug('Product indexed in Elasticsearch / Məhsul Elasticsearch-də indeksləndi', { productId: product.id });
      return true;
    } catch (error) {
      logger.error('Failed to index product in Elasticsearch / Elasticsearch-də məhsulu indeksləmək uğursuz oldu', error);
      return false;
    }
  }

  /**
   * Bulk index products / Məhsulları toplu indekslə
   */
  async bulkIndex(products: ProductDocument[]): Promise<{ success: number; failed: number }> {
    if (!this.isAvailable() || products.length === 0) {
      return { success: 0, failed: products.length };
    }

    try {
      const operations = products.flatMap((product) => [
        { index: { _index: this.indexName, _id: product.id } },
        {
          ...product,
          suggest: {
            input: [product.name, ...product.tags],
            weight: product.salesCount + product.reviewCount,
          },
        },
      ]);

      const result = await this.client.bulk({
        body: operations,
        refresh: true,
      });

      const failed = result.items.filter((item: any) => item.index.error).length;
      const success = products.length - failed;

      logger.info('Bulk index completed / Toplu indeksləmə tamamlandı', { success, failed });
      return { success, failed };
    } catch (error) {
      logger.error('Bulk index failed / Toplu indeksləmə uğursuz oldu', error);
      return { success: 0, failed: products.length };
    }
  }

  /**
   * Delete product from index / Məhsulu indeksdən sil
   */
  async deleteProduct(productId: string): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      await this.client.delete({
        index: this.indexName,
        id: productId,
        refresh: true,
      });

      logger.debug('Product deleted from Elasticsearch / Məhsul Elasticsearch-dən silindi', { productId });
      return true;
    } catch (error: any) {
      if (error.meta?.statusCode === 404) {
        return true; // Already deleted / Artıq silinib
      }
      logger.error('Failed to delete product from Elasticsearch / Elasticsearch-dən məhsulu silmək uğursuz oldu', error);
      return false;
    }
  }

  /**
   * Search products / Məhsulları axtar
   */
  async search(options: SearchOptions): Promise<SearchResponse | null> {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const { query, filters, sort, pagination, highlight, aggregations, fuzzy } = options;
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 20;

      // Build query / Sorğunu qur
      const must: any[] = [];
      const filter: any[] = [];

      // Main query / Əsas sorğu
      if (query) {
        const multiMatch: any = {
          multi_match: {
            query,
            fields: ['name^3', 'name.autocomplete^2', 'description', 'categoryName', 'tags'],
            type: 'best_fields',
          },
        };

        if (fuzzy !== false) {
          multiMatch.multi_match.fuzziness = 'AUTO';
        }

        must.push(multiMatch);
      } else {
        must.push({ match_all: {} });
      }

      // Filters / Filtrlər
      filter.push({ term: { isActive: true } });
      filter.push({ term: { isPublished: true } });

      if (filters?.categoryId) {
        filter.push({ term: { categoryId: filters.categoryId } });
      }

      if (filters?.categoryPath && filters.categoryPath.length > 0) {
        filter.push({ terms: { categoryPath: filters.categoryPath } });
      }

      if (filters?.sellerId) {
        filter.push({ term: { sellerId: filters.sellerId } });
      }

      if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
        const range: any = { range: { price: {} } };
        if (filters.minPrice !== undefined) range.range.price.gte = filters.minPrice;
        if (filters.maxPrice !== undefined) range.range.price.lte = filters.maxPrice;
        filter.push(range);
      }

      if (filters?.rating !== undefined) {
        filter.push({ range: { rating: { gte: filters.rating } } });
      }

      if (filters?.inStock) {
        filter.push({ range: { stock: { gt: 0 } } });
      }

      if (filters?.tags && filters.tags.length > 0) {
        filter.push({ terms: { tags: filters.tags } });
      }

      // Build request body / Sorğu body-sini qur
      const body: any = {
        query: {
          bool: {
            must,
            filter,
          },
        },
        from: (page - 1) * limit,
        size: limit,
      };

      // Sort / Sıralama
      if (sort) {
        body.sort = [
          { [sort.field]: { order: sort.order } },
          { _score: { order: 'desc' } },
        ];
      } else {
        // Default scoring with boosted products / Boost edilmiş məhsullarla default scoring
        body.sort = [
          {
            _script: {
              type: 'number',
              script: {
                source: `
                  double score = _score;
                  if (doc['boostedUntil'].size() > 0 && doc['boostedUntil'].value.millis > params.now) {
                    score = score * 1.5;
                  }
                  score = score + (doc['salesCount'].value * 0.01);
                  score = score + (doc['rating'].value * 0.1);
                  return score;
                `,
                params: {
                  now: Date.now(),
                },
              },
              order: 'desc',
            },
          },
        ];
      }

      // Highlight / Vurğulama
      if (highlight) {
        body.highlight = {
          fields: {
            name: {},
            description: { fragment_size: 150, number_of_fragments: 3 },
          },
          pre_tags: ['<mark>'],
          post_tags: ['</mark>'],
        };
      }

      // Aggregations / Aqreqasiyalar
      if (aggregations) {
        body.aggs = {
          categories: {
            terms: { field: 'categoryId', size: 20 },
          },
          price_ranges: {
            range: {
              field: 'price',
              ranges: [
                { key: '0-50', from: 0, to: 50 },
                { key: '50-100', from: 50, to: 100 },
                { key: '100-200', from: 100, to: 200 },
                { key: '200-500', from: 200, to: 500 },
                { key: '500+', from: 500 },
              ],
            },
          },
          avg_rating: {
            avg: { field: 'rating' },
          },
          rating_distribution: {
            histogram: { field: 'rating', interval: 1 },
          },
          sellers: {
            terms: { field: 'sellerId', size: 10 },
          },
          tags: {
            terms: { field: 'tags', size: 30 },
          },
        };
      }

      const result = await this.client.search({
        index: this.indexName,
        body,
      });

      return {
        hits: result.hits.hits.map((hit: any) => ({
          _id: hit._id,
          _score: hit._score,
          _source: hit._source,
          highlight: hit.highlight,
        })),
        total: typeof result.hits.total === 'number' ? result.hits.total : result.hits.total.value,
        maxScore: result.hits.max_score || 0,
        aggregations: result.aggregations,
        took: result.took,
      };
    } catch (error) {
      logger.error('Elasticsearch search failed / Elasticsearch axtarışı uğursuz oldu', error);
      return null;
    }
  }

  /**
   * Get search suggestions / Axtarış təkliflərini al
   */
  async getSuggestions(prefix: string, size: number = 10): Promise<string[]> {
    if (!this.isAvailable() || !prefix) {
      return [];
    }

    try {
      const result = await this.client.search({
        index: this.indexName,
        body: {
          suggest: {
            product_suggestions: {
              prefix,
              completion: {
                field: 'suggest',
                size,
                skip_duplicates: true,
                fuzzy: {
                  fuzziness: 'AUTO',
                },
              },
            },
          },
          _source: false,
        },
      });

      const suggestions = result.suggest?.product_suggestions?.[0]?.options || [];
      return suggestions.map((s: any) => s.text);
    } catch (error) {
      logger.error('Failed to get suggestions / Təklifləri almaq uğursuz oldu', error);
      return [];
    }
  }

  /**
   * Get similar products / Oxşar məhsulları al
   */
  async getSimilarProducts(productId: string, limit: number = 10): Promise<SearchHit[]> {
    if (!this.isAvailable()) {
      return [];
    }

    try {
      // First get the product / Əvvəlcə məhsulu al
      const product = await this.client.get({
        index: this.indexName,
        id: productId,
      });

      if (!product.found) {
        return [];
      }

      // Search for similar products / Oxşar məhsulları axtar
      const result = await this.client.search({
        index: this.indexName,
        body: {
          query: {
            bool: {
              must: [
                {
                  more_like_this: {
                    fields: ['name', 'description', 'tags'],
                    like: [
                      {
                        _index: this.indexName,
                        _id: productId,
                      },
                    ],
                    min_term_freq: 1,
                    min_doc_freq: 1,
                    max_query_terms: 25,
                  },
                },
              ],
              must_not: [
                { term: { id: productId } },
              ],
              filter: [
                { term: { isActive: true } },
                { term: { isPublished: true } },
              ],
            },
          },
          size: limit,
        },
      });

      return result.hits.hits.map((hit: any) => ({
        _id: hit._id,
        _score: hit._score,
        _source: hit._source,
      }));
    } catch (error) {
      logger.error('Failed to get similar products / Oxşar məhsulları almaq uğursuz oldu', error);
      return [];
    }
  }
}

// Singleton instance / Singleton instance
let elasticsearchInstance: ElasticsearchClient | null = null;

/**
 * Get Elasticsearch client / Elasticsearch client-i al
 */
export async function getElasticsearchClient(): Promise<ElasticsearchClient | null> {
  if (!elasticsearchInstance) {
    elasticsearchInstance = new ElasticsearchClient();
    await elasticsearchInstance.initialize();
  }
  return elasticsearchInstance.isAvailable() ? elasticsearchInstance : null;
}

/**
 * Check if Elasticsearch is enabled / Elasticsearch-in aktiv olub-olmadığını yoxla
 */
export function isElasticsearchEnabled(): boolean {
  return process.env.ELASTICSEARCH_ENABLED === 'true' && !!process.env.ELASTICSEARCH_URL;
}

export { ElasticsearchClient, type ProductDocument, type SearchOptions, type SearchResponse, type SearchHit };

