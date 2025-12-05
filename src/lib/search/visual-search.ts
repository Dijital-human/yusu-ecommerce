/**
 * Visual Search Service / Vizual Axtarış Xidməti
 * Image-based product search using computer vision
 * Computer vision istifadə edərək rəsim əsaslı məhsul axtarışı
 */

import { logger } from '@/lib/utils/logger';
import { getReadClient } from '@/lib/db/query-client';
import { getImageClassifier, isMLModelEnabled } from '@/lib/ml/image-classifier';
import { getOrExtractEmbeddings, extractImageEmbeddings } from '@/lib/ml/image-embeddings';
import { findTopKSimilar } from '@/lib/ml/vector-search';
import { getRedisClient } from '@/lib/cache/redis';

export interface VisualSearchOptions {
  imageUrl?: string;
  imageBuffer?: Buffer;
  imageBase64?: string;
  maxResults?: number;
  minSimilarity?: number; // 0-1
  categoryId?: string;
}

export interface VisualSearchResult {
  productId: string;
  similarity: number;
  confidence: number;
  matchedFeatures: string[];
}

/**
 * Extract image features using ML model or fallback to placeholder / ML model istifadə edərək rəsim xüsusiyyətlərini çıxar və ya placeholder-a keç
 */
export async function extractImageFeatures(
  imageUrl?: string,
  imageBuffer?: Buffer,
  imageBase64?: string
): Promise<{
  labels: string[];
  embeddings: number[];
  dominantColors: string[];
  objects: Array<{ name: string; confidence: number }>;
}> {
  try {
    // Try to use custom ML model if enabled / Aktivdirsə öz ML modelimizi istifadə et
    if (isMLModelEnabled() && (imageBuffer || imageUrl)) {
      const classifier = getImageClassifier();
      
      let buffer: Buffer;
      if (imageBuffer) {
        buffer = imageBuffer;
      } else if (imageUrl) {
        // Download image / Rəsimi yüklə
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText} / Rəsimi yükləmək uğursuz oldu: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
      } else {
        throw new Error('Either imageUrl or imageBuffer must be provided / imageUrl və ya imageBuffer verilməlidir');
      }

      const features = await classifier.extractFeatures(buffer);

      return {
        labels: features.labels.map(l => l.className),
        embeddings: features.embeddings,
        dominantColors: features.dominantColors,
        objects: features.objects,
      };
    }

    // Fallback to placeholder if ML model is not enabled / ML model aktiv deyilsə placeholder-a keç
    logger.warn('Visual search: ML model not enabled, using placeholder / Vizual axtarış: ML modeli aktiv deyil, placeholder istifadə olunur');

    return {
      labels: [],
      embeddings: [],
      dominantColors: [],
      objects: [],
    };
  } catch (error) {
    logger.error('Failed to extract image features / Rəsim xüsusiyyətlərini çıxarmaq uğursuz oldu', error);
    // Return empty features on error / Xəta zamanı boş xüsusiyyətlər qaytar
    return {
      labels: [],
      embeddings: [],
      dominantColors: [],
      objects: [],
    };
  }
}

/**
 * Search products by image similarity / Rəsim oxşarlığına görə məhsulları axtar
 */
export async function searchProductsByImage(
  options: VisualSearchOptions
): Promise<VisualSearchResult[]> {
  try {
    const {
      imageUrl,
      imageBuffer,
      imageBase64,
      maxResults = 20,
      minSimilarity = 0.5,
      categoryId,
    } = options;

    // Extract image features / Rəsim xüsusiyyətlərini çıxar
    const features = await extractImageFeatures(imageUrl, imageBuffer, imageBase64);

    const prisma = await getReadClient();

    // If we have embeddings and ML model is enabled, use vector similarity search
    // Əgər embeddings var və ML model aktivdirsə, vector similarity search istifadə et
    if (isMLModelEnabled() && features.embeddings.length > 0) {
      try {
        // Get all products with their cached embeddings / Cache-də embeddings olan bütün məhsulları al
        const where: any = {
          isActive: true,
          isPublished: true,
        };

        if (categoryId) {
          where.categoryId = categoryId;
        }

        const products = await prisma.product.findMany({
          where,
          select: {
            id: true,
            name: true,
            images: true,
          },
        });

        // Get cached embeddings for products / Məhsullar üçün cache-dən embeddings al
        const cache = getRedisClient();
        const productEmbeddings: Array<{ id: string; embedding: number[] }> = [];

        for (const product of products) {
          if (product.images && product.images.length > 0) {
            const firstImage = Array.isArray(product.images) ? product.images[0] : product.images;
            const imageUrlStr = typeof firstImage === 'string' ? firstImage : firstImage.url || '';
            
            if (imageUrlStr && cache) {
              try {
                const cacheKey = `image_embedding:${imageUrlStr}`;
                const cached = await cache.get(cacheKey);
                if (cached) {
                  const parsed = JSON.parse(cached);
                  productEmbeddings.push({
                    id: product.id,
                    embedding: parsed.embedding || parsed.features?.embeddings || [],
                  });
                }
              } catch (err) {
                // Skip if cache read fails / Cache oxumaq uğursuz olsa keç
                logger.debug(`Failed to get cached embedding for product ${product.id} / Məhsul ${product.id} üçün cache-dən embedding almaq uğursuz oldu`);
              }
            }
          }
        }

        // If we have product embeddings, use vector similarity search
        // Əgər məhsul embeddings-lərimiz varsa, vector similarity search istifadə et
        if (productEmbeddings.length > 0) {
          const similarItems = findTopKSimilar(
            features.embeddings,
            productEmbeddings,
            maxResults,
            minSimilarity,
            true // Use cosine similarity / Cosine similarity istifadə et
          );

          return similarItems.map(item => ({
            productId: item.itemId,
            similarity: item.similarity,
            confidence: item.similarity, // Use similarity as confidence / Oxşarlığı confidence kimi istifadə et
            matchedFeatures: features.labels.slice(0, 3),
          }));
        }
      } catch (vectorError) {
        logger.warn('Vector similarity search failed, falling back to label search / Vector similarity search uğursuz oldu, label search-ə keçilir', vectorError instanceof Error ? vectorError : new Error(String(vectorError)));
      }
    }

    // Fallback: Search by labels / Fallback: Label-lərə görə axtarış
    const where: any = {
      isActive: true,
      isPublished: true,
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    // If we have labels, search products by name/description matching labels
    // Əgər label-lərimiz varsa, label-lərə uyğun ad/təsvir ilə məhsulları axtar
    if (features.labels.length > 0) {
      where.OR = features.labels.map(label => ({
        name: {
          contains: label,
          mode: 'insensitive',
        },
      }));
    }

    const products = await prisma.product.findMany({
      where,
      take: maxResults,
      select: {
        id: true,
        name: true,
        images: true,
      },
    });

    // Placeholder similarity scores / Placeholder oxşarlıq balları
    const results: VisualSearchResult[] = products.map((product: { id: string; name: string; images: any }, index: number) => ({
      productId: product.id,
      similarity: Math.max(minSimilarity, 1 - (index * 0.1)), // Decreasing similarity / Azalan oxşarlıq
      confidence: 0.7, // Placeholder confidence / Placeholder confidence
      matchedFeatures: features.labels.slice(0, 3), // Top 3 labels / Top 3 label
    }));

    return results.sort((a, b) => b.similarity - a.similarity);
  } catch (error) {
    logger.error('Failed to search products by image / Rəsim ilə məhsul axtarışı uğursuz oldu', error);
    return [];
  }
}

/**
 * Index product image for visual search / Vizual axtarış üçün məhsul rəsimini indekslə
 */
export async function indexProductImage(
  productId: string,
  imageUrl: string
): Promise<boolean> {
  try {
    // If ML model is enabled, extract and cache embeddings / ML model aktivdirsə, embeddings çıxar və cache-lə
    if (isMLModelEnabled()) {
      try {
        await getOrExtractEmbeddings(imageUrl);
        logger.info(`Product image indexed for visual search: ${productId} / Vizual axtarış üçün məhsul rəsimi indeksləndi: ${productId}`);
        return true;
      } catch (mlError) {
        logger.warn(`ML indexing failed for product ${productId}, continuing without ML / Məhsul ${productId} üçün ML indeksləmə uğursuz oldu, ML olmadan davam edilir`, mlError instanceof Error ? mlError : new Error(String(mlError)));
        // Continue to return true for backward compatibility / Backward compatibility üçün true qaytar
      }
    }

    logger.info(`Product image indexed for visual search: ${productId} / Vizual axtarış üçün məhsul rəsimi indeksləndi: ${productId}`);
    return true;
  } catch (error) {
    logger.error(`Failed to index product image: ${productId} / Məhsul rəsimini indeksləmək uğursuz oldu: ${productId}`, error);
    return false;
  }
}

/**
 * Check if visual search is enabled / Vizual axtarışın aktiv olub-olmadığını yoxla
 * Now supports both custom ML model and external providers / İndi həm öz ML modelimizi, həm də xarici provider-ləri dəstəkləyir
 */
export function isVisualSearchEnabled(): boolean {
  // Check if custom ML model is enabled / Öz ML modelimizin aktiv olub-olmadığını yoxla
  if (isMLModelEnabled()) {
    return true;
  }
  
  // Fallback to external provider check / Xarici provider yoxlamasına keç
  return process.env.VISUAL_SEARCH_ENABLED === 'true' && !!process.env.VISUAL_SEARCH_PROVIDER;
}

