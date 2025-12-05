/**
 * ML Image Analysis API Route / ML Rəsim Analizi API Route-u
 * Analyze images using custom ML model
 * Öz ML modelimizlə rəsimləri analiz et
 */

import { NextRequest } from "next/server";
import { successResponse, badRequestResponse, unauthorizedResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { getImageClassifier, isMLModelEnabled } from "@/lib/ml/image-classifier";
import { logger } from "@/lib/utils/logger";
// import { requireAdmin } from "@/lib/auth/config"; // Uncomment if admin auth is needed / Admin auth lazımdırsa comment-i silin

/**
 * POST /api/ml/image-analysis
 * Analyze image and extract features / Rəsimi analiz et və xüsusiyyətləri çıxar
 */
export async function POST(request: NextRequest) {
  try {
    // Check if ML model is enabled / ML modelinin aktiv olub-olmadığını yoxla
    if (!isMLModelEnabled()) {
      return badRequestResponse(
        "ML model is not enabled / ML modeli aktiv deyil"
      );
    }

    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;
    const imageUrl = formData.get("imageUrl") as string | null;

    if (!imageFile && !imageUrl) {
      return badRequestResponse(
        "Image file or image URL is required / Rəsim faylı və ya rəsim URL-i tələb olunur"
      );
    }

    const classifier = getImageClassifier();
    let imageBuffer: Buffer;

    if (imageFile) {
      // Convert file to buffer / Faylı buffer-ə çevir
      const bytes = await imageFile.arrayBuffer();
      imageBuffer = Buffer.from(bytes);
    } else if (imageUrl) {
      // Download image from URL / URL-dən rəsimi yüklə
      const response = await fetch(imageUrl);
      if (!response.ok) {
        return badRequestResponse(
          `Failed to fetch image: ${response.statusText} / Rəsimi yükləmək uğursuz oldu: ${response.statusText}`
        );
      }
      const arrayBuffer = await response.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
    } else {
      return badRequestResponse(
        "Image file or image URL is required / Rəsim faylı və ya rəsim URL-i tələb olunur"
      );
    }

    // Extract features / Xüsusiyyətləri çıxar
    const startTime = Date.now();
    const features = await classifier.extractFeatures(imageBuffer);
    const processingTime = Date.now() - startTime;

    return successResponse({
      features: {
        labels: features.labels,
        embeddings: features.embeddings,
        dominantColors: features.dominantColors,
        objects: features.objects,
      },
      processingTime,
      modelVersion: classifier.getModelVersion(),
      message: "Image analysis completed / Rəsim analizi tamamlandı",
    });
  } catch (error) {
    return handleApiError(error, "analyze image");
  }
}

/**
 * GET /api/ml/image-analysis
 * Get ML model status / ML model statusunu al
 */
export async function GET(request: NextRequest) {
  try {
    const enabled = isMLModelEnabled();
    
    if (enabled) {
      const classifier = getImageClassifier();
      const isReady = classifier.isReady();
      
      return successResponse({
        enabled: true,
        ready: isReady,
        modelVersion: classifier.getModelVersion(),
        message: isReady
          ? "ML model is ready / ML modeli hazırdır"
          : "ML model is initializing / ML modeli işə salınır",
      });
    }

    return successResponse({
      enabled: false,
      ready: false,
      message: "ML model is not enabled / ML modeli aktiv deyil",
    });
  } catch (error) {
    return handleApiError(error, "get ML model status");
  }
}

