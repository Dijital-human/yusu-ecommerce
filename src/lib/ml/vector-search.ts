/**
 * Vector Search Service / Vector Axtarış Xidməti
 * Similarity search utilities for embeddings
 * Embeddings üçün oxşarlıq axtarış utility-ləri
 */

import { logger } from '@/lib/utils/logger';
import { normalizeEmbeddings } from './image-embeddings';

export interface SimilarityResult {
  itemId: string;
  similarity: number;
  distance: number;
}

/**
 * Calculate cosine similarity between two embeddings / İki embedding arasında cosine similarity hesabla
 * Returns value between -1 and 1, where 1 is identical / -1 və 1 arasında dəyər qaytarır, burada 1 eynidir
 */
export function cosineSimilarity(embedding1: number[], embedding2: number[]): number {
  if (embedding1.length !== embedding2.length) {
    throw new Error('Embeddings must have the same length / Embeddings eyni uzunluqda olmalıdır');
  }

  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  for (let i = 0; i < embedding1.length; i++) {
    dotProduct += embedding1[i] * embedding2[i];
    magnitude1 += embedding1[i] * embedding1[i];
    magnitude2 += embedding2[i] * embedding2[i];
  }

  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);

  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }

  return dotProduct / (magnitude1 * magnitude2);
}

/**
 * Calculate Euclidean distance between two embeddings / İki embedding arasında Euclidean distance hesabla
 * Returns distance, where 0 is identical / Məsafə qaytarır, burada 0 eynidir
 */
export function euclideanDistance(embedding1: number[], embedding2: number[]): number {
  if (embedding1.length !== embedding2.length) {
    throw new Error('Embeddings must have the same length / Embeddings eyni uzunluqda olmalıdır');
  }

  let sumSquaredDiff = 0;
  for (let i = 0; i < embedding1.length; i++) {
    const diff = embedding1[i] - embedding2[i];
    sumSquaredDiff += diff * diff;
  }

  return Math.sqrt(sumSquaredDiff);
}

/**
 * Find top K most similar items / Top K ən oxşar elementləri tap
 */
export function findTopKSimilar(
  queryEmbedding: number[],
  itemEmbeddings: Array<{ id: string; embedding: number[] }>,
  k: number = 10,
  minSimilarity: number = 0.5,
  useCosine: boolean = true
): SimilarityResult[] {
  try {
    // Normalize query embedding / Query embedding-i normallaşdır
    const normalizedQuery = normalizeEmbeddings(queryEmbedding);

    // Calculate similarities / Oxşarlıqları hesabla
    const similarities: SimilarityResult[] = itemEmbeddings.map(item => {
      const normalizedItem = normalizeEmbeddings(item.embedding);
      
      let similarity: number;
      let distance: number;

      if (useCosine) {
        similarity = cosineSimilarity(normalizedQuery, normalizedItem);
        // Convert cosine similarity to distance (1 - similarity) / Cosine similarity-ni məsafəyə çevir (1 - similarity)
        distance = 1 - similarity;
      } else {
        distance = euclideanDistance(normalizedQuery, normalizedItem);
        // Convert distance to similarity (1 / (1 + distance)) / Məsafəni oxşarlığa çevir (1 / (1 + distance))
        similarity = 1 / (1 + distance);
      }

      return {
        itemId: item.id,
        similarity,
        distance,
      };
    });

    // Filter by minimum similarity and sort / Minimum oxşarlığa görə filtrlə və sırala
    return similarities
      .filter(result => result.similarity >= minSimilarity)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, k);
  } catch (error) {
    logger.error('Failed to find top K similar items / Top K oxşar elementləri tapmaq uğursuz oldu', error);
    return [];
  }
}

/**
 * Batch similarity search / Batch oxşarlıq axtarışı
 */
export function batchSimilaritySearch(
  queryEmbeddings: number[][],
  itemEmbeddings: Array<{ id: string; embedding: number[] }>,
  k: number = 10,
  minSimilarity: number = 0.5
): Map<number, SimilarityResult[]> {
  const results = new Map<number, SimilarityResult[]>();

  queryEmbeddings.forEach((queryEmbedding, index) => {
    const topK = findTopKSimilar(queryEmbedding, itemEmbeddings, k, minSimilarity);
    results.set(index, topK);
  });

  return results;
}

