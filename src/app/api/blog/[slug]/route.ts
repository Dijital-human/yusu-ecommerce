/**
 * Blog Post API Route / Blog Yazısı API Route
 * Handles individual blog post operations / Fərdi blog yazısı əməliyyatlarını idarə edir
 */

import { NextRequest, NextResponse } from "next/server";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import {
  getBlogPostBySlug,
  getRelatedBlogPosts,
  trackBlogPostView,
} from "@/lib/content/blog.service";
import { headers } from "next/headers";

/**
 * GET /api/blog/[slug]
 * Get blog post by slug / Slug ilə blog yazısını al
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const post = await getBlogPostBySlug(slug);

    if (!post) {
      return NextResponse.json(
        { success: false, error: "Blog post not found / Blog yazısı tapılmadı" },
        { status: 404 }
      );
    }

    // Track view / Baxışı izlə
    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || undefined;
    const userAgent = headersList.get("user-agent") || undefined;
    
    // Get user ID from session if available / Varsa sessiyadan istifadəçi ID-sini al
    const userId = undefined; // TODO: Get from session / Sessiyadan al

    await trackBlogPostView(post.id, userId, ipAddress, userAgent);

    // Get related posts / Əlaqəli yazıları al
    const tagIds = post.tags.map((pt) => pt.tag.id);
    const relatedPosts = await getRelatedBlogPosts(
      post.id,
      post.categoryId || undefined,
      tagIds,
      3
    );

    return successResponse({
      post,
      relatedPosts,
    });
  } catch (error) {
    return handleApiError(error, "get blog post");
  }
}

