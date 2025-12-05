/**
 * Blog Tags API Route / Blog Tag-ləri API Route
 * Handles blog tag operations / Blog tag əməliyyatlarını idarə edir
 */

import { NextRequest, NextResponse } from "next/server";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { getBlogTags } from "@/lib/content/blog.service";

/**
 * GET /api/blog/tags
 * Get blog tags / Blog tag-lərini al
 */
export async function GET(request: NextRequest) {
  try {
    const tags = await getBlogTags();
    return successResponse(tags);
  } catch (error) {
    return handleApiError(error, "get blog tags");
  }
}

