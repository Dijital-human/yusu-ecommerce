/**
 * Blog Post Share API Route / Blog Yazısı Paylaşım API Route
 * Tracks blog post shares / Blog yazısı paylaşımlarını izləyir
 */

import { NextRequest, NextResponse } from "next/server";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { getBlogPostBySlug, trackBlogPostShare } from "@/lib/content/blog.service";

/**
 * POST /api/blog/[slug]/share
 * Track blog post share / Blog yazısı paylaşımını izlə
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await request.json();
    const { platform } = body;

    if (!platform) {
      return NextResponse.json(
        { success: false, error: "Platform is required / Platform tələb olunur" },
        { status: 400 }
      );
    }

    const post = await getBlogPostBySlug(slug);

    if (!post) {
      return NextResponse.json(
        { success: false, error: "Blog post not found / Blog yazısı tapılmadı" },
        { status: 404 }
      );
    }

    await trackBlogPostShare(post.id, platform);

    return successResponse(
      { success: true },
      "Share tracked successfully / Paylaşım uğurla izləndi"
    );
  } catch (error) {
    return handleApiError(error, "track blog post share");
  }
}

