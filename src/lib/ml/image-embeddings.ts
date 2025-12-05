/**
 * Image Embeddings Service / Rəsim Embeddings Xidməti
 * Embedding extraction, storage, and comparison utilities
 * Embedding çıxarma, saxlama və müqayisə utility-ləri
 */

import { getImageClassifier, ImageFeatures } from './image-classifier';
import { logger } from '@/lib/utils/logger';
import { getRedisClient } from '@/lib/cache/redis';

export interface EmbeddingCache {
  embedding: number[];
  features: ImageFeatures;
  timestamp: number;
}

/**
 * Extract embeddings from image buffer / Rəsim buffer-dan embeddings çıxar
 */
export async function extractImageEmbeddings(imageBuffer: Buffer): Promise<number[]> {
  try {
    if (!isMLModelEnabled()) {
      throw new Error('ML model is not enabled / ML modeli aktiv deyil');
    }

    const classifier = getImageClassifier();
    const features = await classifier.extractFeatures(imageBuffer);
    
    return features.embeddings;
  } catch (error) {
    logger.error('Failed to extract image embeddings / Rəsim embeddings çıxarmaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Extract embeddings from image URL / Rəsim URL-dən embeddings çıxar
 */
export async function extractImageEmbeddingsFromURL(imageUrl: string): Promise<number[]> {
  try {
    // Download image / Rəsimi yüklə
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText} / Rəsimi yükləmək uğursuz oldu: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    return await extractImageEmbeddings(imageBuffer);
  } catch (error) {
    logger.error(`Failed to extract embeddings from URL: ${imageUrl} / URL-dən embeddings çıxarmaq uğursuz oldu: ${imageUrl}`, error);
    throw error;
  }
}

/**
 * Get cached embeddings or extract new ones / Cache-dən embeddings al və ya yeni çıxar
 */
export async function getOrExtractEmbeddings(
  imageUrl: string,
  imageBuffer?: Buffer
): Promise<{ embedding: number[]; cached: boolean }> {
  try {
    const cache = getRedisClient();
    const cacheKey = `image_embedding:${imageUrl}`;

    // Try to get from cache / Cache-dən almağa cəhd et
    if (cache) {
      const cached = await cache.get(cacheKey);
      if (cached) {
        const parsed: EmbeddingCache = JSON.parse(cached);
        // Check if cache is still valid (24 hours) / Cache-in hələ də etibarlı olub-olmadığını yoxla (24 saat)
        const cacheAge = Date.now() - parsed.timestamp;
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours / 24 saat

        if (cacheAge < maxAge) {
          logger.debug(`Using cached embeddings for: ${imageUrl} / Cache-dən embeddings istifadə olunur: ${imageUrl}`);
          return { embedding: parsed.embedding, cached: true };
        }
      }
    }

    // Extract new embeddings / Yeni embeddings çıxar
    let buffer: Buffer;
    if (imageBuffer) {
      buffer = imageBuffer;
    } else {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText} / Rəsimi yükləmək uğursuz oldu: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    const classifier = getImageClassifier();
    const features = await classifier.extractFeatures(buffer);

    // Cache embeddings / Embeddings-i cache-lə
    if (cache) {
      const cacheData: EmbeddingCache = {
        embedding: features.embeddings,
        features,
        timestamp: Date.now(),
      };
      await cache.setex(cacheKey, 24 * 60 * 60, JSON.stringify(cacheData)); // 24 hours TTL / 24 saat TTL
    }

    return { embedding: features.embeddings, cached: false };
  } catch (error) {
    logger.error('Failed to get or extract embeddings / Embeddings almaq və ya çıxarmaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Normalize embeddings using L2 normalization / L2 normalization istifadə edərək embeddings-i normallaşdır
 */
export function normalizeEmbeddings(embeddings: number[]): number[] {
  const magnitude = Math.sqrt(
    embeddings.reduce((sum, val) => sum + val * val, 0)
  );

  if (magnitude === 0) {
    return embeddings;
  }

  return embeddings.map(val => val / magnitude);
}

/**
 * Check if ML model is enabled / ML modelinin aktiv olub-olmadığını yoxla
 */
export function isMLModelEnabled(): boolean {
  return process.env.ML_MODEL_ENABLED === 'true';
}

