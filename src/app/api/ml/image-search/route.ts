/**
 * ML Image Search API Route / ML Rəsim Axtarışı API Route-u
 * Search products by image using custom ML model
 * Öz ML modelimizlə rəsim ilə məhsulları axtar
 */

import { NextRequest } from "next/server";
import { successResponse, badRequestResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { searchProductsByImage, isVisualSearchEnabled } from "@/lib/search/visual-search";
import { isMLModelEnabled } from "@/lib/ml/image-classifier";
import { logger } from "@/lib/utils/logger";

/**
 * POST /api/ml/image-search
 * Search products by image / Rəsim ilə məhsulları axtar
 */
export async function POST(request: NextRequest) {
  try {
    // Check if ML model is enabled / ML modelinin aktiv olub-olmadığını yoxla
    if (!isMLModelEnabled()) {
      return badRequestResponse(
        "ML model is not enabled / ML modeli aktiv deyil"
      );
    }

    if (!isVisualSearchEnabled()) {
      return badRequestResponse(
        "Visual search is not enabled / Vizual axtarış aktiv deyil"
      );
    }

    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;
    const imageUrl = formData.get("imageUrl") as string | null;
    const maxResults = parseInt(formData.get("maxResults") as string || "20");
    const minSimilarity = parseFloat(formData.get("minSimilarity") as string || "0.5");
    const categoryId = formData.get("categoryId") as string | null;

    if (!imageFile && !imageUrl) {
      return badRequestResponse(
        "Image file or image URL is required / Rəsim faylı və ya rəsim URL-i tələb olunur"
      );
    }

    let imageBuffer: Buffer | undefined;
    let imageBase64: string | undefined;

    if (imageFile) {
      // Convert file to buffer / Faylı buffer-ə çevir
      const bytes = await imageFile.arrayBuffer();
      imageBuffer = Buffer.from(bytes);
      imageBase64 = imageBuffer.toString('base64');
    }

    // Search products by image / Rəsim ilə məhsulları axtar
    const results = await searchProductsByImage({
      imageUrl: imageUrl || undefined,
      imageBuffer,
      imageBase64,
      maxResults,
      minSimilarity,
      categoryId: categoryId || undefined,
    });

    return successResponse({
      results,
      count: results.length,
      mlModelEnabled: true,
      message: "ML image search completed / ML rəsim axtarışı tamamlandı",
    });
  } catch (error) {
    return handleApiError(error, "perform ML image search");
  }
}

/**
 * GET /api/ml/image-search
 * Get ML image search status / ML rəsim axtarışı statusunu al
 */
export async function GET(request: NextRequest) {
  try {
    const mlEnabled = isMLModelEnabled();
    const visualSearchEnabled = isVisualSearchEnabled();
    
    return successResponse({
      mlEnabled,
      visualSearchEnabled,
      available: mlEnabled && visualSearchEnabled,
      message: mlEnabled && visualSearchEnabled
        ? "ML image search is available / ML rəsim axtarışı mövcuddur"
        : "ML image search is not available / ML rəsim axtarışı mövcud deyil",
    });
  } catch (error) {
    return handleApiError(error, "get ML image search status");
  }
}

