/**
 * Image Classifier Service / Rəsim Təsnifatçı Xidməti
 * Pre-trained ML model istifadə edərək rəsim analizi və feature extraction
 * Using pre-trained ML models for image analysis and feature extraction
 */

import * as tf from '@tensorflow/tfjs-node';
import * as mobilenet from '@tensorflow-models/mobilenet';
import sharp from 'sharp';
import { logger } from '@/lib/utils/logger';

export interface ImageFeatures {
  labels: Array<{ className: string; probability: number }>;
  embeddings: number[];
  dominantColors: string[];
  objects: Array<{ name: string; confidence: number }>;
}

export interface ImageAnalysisResult {
  features: ImageFeatures;
  processingTime: number;
  modelVersion: string;
}

class ImageClassifier {
  private model: mobilenet.MobileNet | null = null;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;
  private readonly modelVersion = 'mobilenet_v2_1.0_224';

  /**
   * Initialize the MobileNet model / MobileNet modelini işə sal
   */
  async initialize(): Promise<void> {
    if (this.isInitialized && this.model) {
      return;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = (async () => {
      try {
        logger.info('Initializing MobileNet model / MobileNet modeli işə salınır...');
        
        // Load MobileNet model / MobileNet modelini yüklə
        this.model = await mobilenet.load({
          version: 2,
          alpha: 1.0,
        });

        this.isInitialized = true;
        logger.info('MobileNet model initialized successfully / MobileNet modeli uğurla işə salındı');
      } catch (error) {
        logger.error('Failed to initialize MobileNet model / MobileNet modelini işə salmaq uğursuz oldu', error);
        this.initializationPromise = null;
        throw error;
      }
    })();

    return this.initializationPromise;
  }

  /**
   * Preprocess image for model input / Model input üçün rəsimi hazırla
   */
  private async preprocessImage(imageBuffer: Buffer): Promise<tf.Tensor3D> {
    const targetSize = parseInt(process.env.ML_EMBEDDING_DIMENSION || '224', 10); // MobileNet expects 224x224

    try {
      // First, validate and convert image to a standard format using sharp
      // Əvvəlcə, sharp istifadə edərək rəsimi standart formata çevir və yoxla
      const image = sharp(imageBuffer);
      const metadata = await image.metadata();

      if (!metadata.width || !metadata.height) {
        throw new Error('Invalid image buffer: could not get dimensions / Yanlış rəsim buffer-i: ölçülər alına bilmədi');
      }

      // Resize to target size and convert to RGB JPEG format
      // Hədəf ölçüyə ölçüləndir və RGB JPEG formatına çevir
      const resizedBuffer = await image
        .resize(targetSize, targetSize, {
          fit: sharp.fit.cover,
          position: sharp.strategy.entropy,
        })
        .jpeg({ quality: 90 })
        .toBuffer();

      // Now decode the JPEG buffer to tensor / İndi JPEG buffer-i tensor-a dekod et
      const tensor = tf.node.decodeImage(resizedBuffer, 3) as tf.Tensor3D;
      
      // Normalize to [0, 1] range (MobileNet expects this) / [0, 1] aralığına normallaşdır (MobileNet bunu gözləyir)
      const normalized = tensor.toFloat().div(tf.scalar(255.0));
      
      tensor.dispose();
      
      return normalized as tf.Tensor3D;
    } catch (error) {
      logger.error('Failed to preprocess image / Rəsimi hazırlamaq uğursuz oldu', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Extract dominant colors from image / Rəsimdən dominant rəngləri çıxar
   */
  private async extractDominantColors(imageBuffer: Buffer): Promise<string[]> {
    try {
      const stats = await sharp(imageBuffer)
        .resize(100, 100)
        .stats();

      // Get top 5 dominant colors / Top 5 dominant rəngi al
      const colors = stats.channels
        .map((channel, index) => ({
          r: stats.channels[0]?.mean || 0,
          g: stats.channels[1]?.mean || 0,
          b: stats.channels[2]?.mean || 0,
        }))
        .slice(0, 1); // Take first RGB combination / İlk RGB kombinasiyasını al

      return colors.map(color => {
        const r = Math.round(color.r);
        const g = Math.round(color.g);
        const b = Math.round(color.b);
        return `rgb(${r},${g},${b})`;
      });
    } catch (error) {
      logger.warn('Failed to extract dominant colors / Dominant rəngləri çıxarmaq uğursuz oldu', error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  /**
   * Extract image features using MobileNet / MobileNet istifadə edərək rəsim xüsusiyyətlərini çıxar
   */
  async extractFeatures(imageBuffer: Buffer): Promise<ImageFeatures> {
    const startTime = Date.now();

    try {
      // Ensure model is initialized / Modelin işə salındığını təmin et
      await this.initialize();

      if (!this.model) {
        throw new Error('Model not initialized / Model işə salınmayıb');
      }

      // Preprocess image / Rəsimi hazırla
      const preprocessedImage = await this.preprocessImage(imageBuffer);

      // Get predictions (labels) / Proqnozları al (label-lər)
      const predictions = await this.model.classify(preprocessedImage);

      // Get embeddings (feature vector) / Embeddings al (feature vector)
      const embeddingsTensor = await this.model.infer(preprocessedImage, true) as tf.Tensor;
      const embeddingsArray = await embeddingsTensor.array();
      
      // Flatten embeddings / Embeddings-i düzəlt
      let embeddings: number[];
      if (Array.isArray(embeddingsArray)) {
        if (Array.isArray(embeddingsArray[0])) {
          embeddings = embeddingsArray[0] as number[];
        } else {
          embeddings = embeddingsArray as number[];
        }
      } else {
        // If it's a single number, wrap it in an array / Əgər tək rəqəmdirsə, array-ə sarılaq
        embeddings = [embeddingsArray as unknown as number];
      }

      // Normalize embeddings (L2 normalization) / Embeddings-i normallaşdır (L2 normalization)
      const normalizedEmbeddings = this.normalizeEmbeddings(embeddings);

      // Extract dominant colors / Dominant rəngləri çıxar
      const dominantColors = await this.extractDominantColors(imageBuffer);

      // Convert predictions to objects / Proqnozları obyektlərə çevir
      const objects = predictions.map(pred => ({
        name: pred.className,
        confidence: pred.probability,
      }));

      // Clean up tensors / Tensor-ları təmizlə
      preprocessedImage.dispose();
      embeddingsTensor.dispose();

      const processingTime = Date.now() - startTime;

      logger.debug(`Image features extracted in ${processingTime}ms / Rəsim xüsusiyyətləri ${processingTime}ms-də çıxarıldı`);

      return {
        labels: predictions.map(pred => ({
          className: pred.className,
          probability: pred.probability,
        })),
        embeddings: normalizedEmbeddings,
        dominantColors,
        objects,
      };
    } catch (error) {
      logger.error('Failed to extract image features / Rəsim xüsusiyyətlərini çıxarmaq uğursuz oldu', error);
      throw error;
    }
  }

  /**
   * Normalize embeddings using L2 normalization / L2 normalization istifadə edərək embeddings-i normallaşdır
   */
  private normalizeEmbeddings(embeddings: number[]): number[] {
    const magnitude = Math.sqrt(
      embeddings.reduce((sum, val) => sum + val * val, 0)
    );

    if (magnitude === 0) {
      return embeddings;
    }

    return embeddings.map(val => val / magnitude);
  }

  /**
   * Check if model is initialized / Modelin işə salınıb-salınmadığını yoxla
   */
  isReady(): boolean {
    return this.isInitialized && this.model !== null;
  }

  /**
   * Get model version / Model versiyasını al
   */
  getModelVersion(): string {
    return this.modelVersion;
  }
}

// Singleton instance / Singleton instansiya
let classifierInstance: ImageClassifier | null = null;

/**
 * Get or create ImageClassifier instance / ImageClassifier instansiyasını al və ya yarat
 */
export function getImageClassifier(): ImageClassifier {
  if (!classifierInstance) {
    classifierInstance = new ImageClassifier();
  }
  return classifierInstance;
}

/**
 * Check if ML model is enabled / ML modelinin aktiv olub-olmadığını yoxla
 */
export function isMLModelEnabled(): boolean {
  return process.env.ML_MODEL_ENABLED === 'true';
}

