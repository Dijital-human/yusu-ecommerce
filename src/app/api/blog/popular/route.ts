/**
 * Popular Blog Posts API Route / Məşhur Blog Yazıları API Route
 * Gets popular blog posts / Məşhur blog yazılarını alır
 */

import { NextRequest, NextResponse } from "next/server";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { getPopularBlogPosts } from "@/lib/content/blog.service";

/**
 * GET /api/blog/popular
 * Get popular blog posts / Məşhur blog yazılarını al
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "5");

    const posts = await getPopularBlogPosts(limit);
    return successResponse(posts);
  } catch (error) {
    return handleApiError(error, "get popular blog posts");
  }
}

