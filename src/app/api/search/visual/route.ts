/**
 * Visual Search API Route / Vizual Axtarış API Route-u
 * Image-based product search
 * Rəsim əsaslı məhsul axtarışı
 */

import { NextRequest } from "next/server";
import { successResponse, badRequestResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { searchProductsByImage, isVisualSearchEnabled } from "@/lib/search/visual-search";
import { logger } from "@/lib/utils/logger";

/**
 * POST /api/search/visual
 * Search products by image / Rəsim ilə məhsulları axtar
 */
export async function POST(request: NextRequest) {
  try {
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

      // Also convert to base64 for some APIs / Bəzi API-lər üçün base64-ə də çevir
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
      message: "Visual search completed / Vizual axtarış tamamlandı",
    });
  } catch (error) {
    return handleApiError(error, "perform visual search");
  }
}

/**
 * GET /api/search/visual
 * Get visual search status / Vizual axtarış statusunu al
 */
export async function GET(request: NextRequest) {
  try {
    const enabled = isVisualSearchEnabled();
    
    return successResponse({
      enabled,
      provider: process.env.VISUAL_SEARCH_PROVIDER || null,
      message: enabled
        ? "Visual search is enabled / Vizual axtarış aktivdir"
        : "Visual search is not enabled / Vizual axtarış aktiv deyil",
    });
  } catch (error) {
    return handleApiError(error, "get visual search status");
  }
}

