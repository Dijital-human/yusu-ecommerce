/**
 * ML Embeddings API Route / ML Embeddings API Route-u
 * Extract embeddings from images
 * Rəsimlərdən embeddings çıxar
 */

import { NextRequest } from "next/server";
import { successResponse, badRequestResponse, unauthorizedResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { extractImageEmbeddings, extractImageEmbeddingsFromURL, getOrExtractEmbeddings, isMLModelEnabled } from "@/lib/ml/image-embeddings";
import { logger } from "@/lib/utils/logger";
// import { requireAdmin } from "@/lib/auth/config"; // Uncomment if admin auth is needed / Admin auth lazımdırsa comment-i silin

/**
 * POST /api/ml/embeddings
 * Extract embeddings from image / Rəsimdən embeddings çıxar
 * Optional: Requires admin authentication for security / İstəyə bağlı: Təhlükəsizlik üçün admin autentifikasiyası tələb olunur
 */
export async function POST(request: NextRequest) {
  try {
    // Check if ML model is enabled / ML modelinin aktiv olub-olmadığını yoxla
    if (!isMLModelEnabled()) {
      return badRequestResponse(
        "ML model is not enabled / ML modeli aktiv deyil"
      );
    }

    // Optional: Require admin authentication / İstəyə bağlı: Admin autentifikasiyası tələb et
    // Uncomment if you want to restrict this endpoint / Bu endpoint-i məhdudlaşdırmaq istəyirsinizsə, comment-i silin
    // const session = await requireAdmin(request);
    // if (!session) {
    //   return unauthorizedResponse("Admin authentication required / Admin autentifikasiyası tələb olunur");
    // }

    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;
    const imageUrl = formData.get("imageUrl") as string | null;
    const useCache = formData.get("useCache") === "true";

    if (!imageFile && !imageUrl) {
      return badRequestResponse(
        "Image file or image URL is required / Rəsim faylı və ya rəsim URL-i tələb olunur"
      );
    }

    let embedding: number[];
    let cached = false;

    if (useCache && imageUrl) {
      // Use cache if available / Mövcuddursa cache istifadə et
      const result = await getOrExtractEmbeddings(imageUrl);
      embedding = result.embedding;
      cached = result.cached;
    } else if (imageFile) {
      // Extract from file / Fayldan çıxar
      const bytes = await imageFile.arrayBuffer();
      const imageBuffer = Buffer.from(bytes);
      embedding = await extractImageEmbeddings(imageBuffer);
    } else if (imageUrl) {
      // Extract from URL / URL-dən çıxar
      embedding = await extractImageEmbeddingsFromURL(imageUrl);
    } else {
      return badRequestResponse(
        "Image file or image URL is required / Rəsim faylı və ya rəsim URL-i tələb olunur"
      );
    }

    return successResponse({
      embedding,
      dimension: embedding.length,
      cached,
      message: "Embeddings extracted successfully / Embeddings uğurla çıxarıldı",
    });
  } catch (error) {
    return handleApiError(error, "extract embeddings");
  }
}

/**
 * GET /api/ml/embeddings
 * Get embeddings API status / Embeddings API statusunu al
 */
export async function GET(request: NextRequest) {
  try {
    const enabled = isMLModelEnabled();
    
    return successResponse({
      enabled,
      message: enabled
        ? "Embeddings API is available / Embeddings API mövcuddur"
        : "Embeddings API is not available / Embeddings API mövcud deyil",
    });
  } catch (error) {
    return handleApiError(error, "get embeddings API status");
  }
}

