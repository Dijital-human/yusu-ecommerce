/**
 * Blog API Route / Blog API Route
 * Handles blog post operations / Blog yazısı əməliyyatlarını idarə edir
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import {
  createBlogPost,
  getBlogPosts,
  generateSlug,
  BlogPostInput,
  BlogPostFilters,
} from "@/lib/content/blog.service";
import { logger } from "@/lib/utils/logger";

/**
 * GET /api/blog
 * Get blog posts with filters / Filtrlərlə blog yazılarını al
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters: BlogPostFilters = {
      categoryId: searchParams.get("categoryId") || undefined,
      tagId: searchParams.get("tagId") || undefined,
      authorId: searchParams.get("authorId") || undefined,
      isPublished: searchParams.get("isPublished")
        ? searchParams.get("isPublished") === "true"
        : undefined,
      isFeatured: searchParams.get("isFeatured")
        ? searchParams.get("isFeatured") === "true"
        : undefined,
      search: searchParams.get("search") || undefined,
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "10"),
    };

    const result = await getBlogPosts(filters);
    return successResponse(result);
  } catch (error) {
    return handleApiError(error, "get blog posts");
  }
}

/**
 * POST /api/blog
 * Create a new blog post / Yeni blog yazısı yarat
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Check if user has permission to create blog posts / İstifadəçinin blog yazısı yaratma icazəsi var mı yoxla
    if (user.role !== "ADMIN" && user.role !== "SELLER") {
      return NextResponse.json(
        { success: false, error: "Unauthorized / Yetkisiz" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      categoryId,
      tagIds,
      isPublished,
      isFeatured,
      readingTime,
      seoTitle,
      seoDescription,
      seoKeywords,
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: "Title and content are required / Başlıq və məzmun tələb olunur" },
        { status: 400 }
      );
    }

    const postSlug = slug || generateSlug(title);

    const postData: BlogPostInput = {
      title,
      slug: postSlug,
      excerpt,
      content,
      featuredImage,
      authorId: user.id,
      categoryId,
      tagIds,
      isPublished: isPublished || false,
      isFeatured: isFeatured || false,
      readingTime,
      seoTitle,
      seoDescription,
      seoKeywords,
    };

    const post = await createBlogPost(postData);

    logger.info("Blog post created via API / API vasitəsilə blog yazısı yaradıldı", {
      postId: post.id,
      authorId: user.id,
    });

    return successResponse(post, "Blog post created successfully / Blog yazısı uğurla yaradıldı");
  } catch (error) {
    return handleApiError(error, "create blog post");
  }
}

