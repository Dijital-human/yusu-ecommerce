/**
 * Blog Comments API Route / Blog Şərhləri API Route
 * Handles blog comment operations / Blog şərh əməliyyatlarını idarə edir
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { getBlogPostBySlug } from "@/lib/content/blog.service";
import { getReadClient, getWriteClient } from "@/lib/db/query-client";
import { logger } from "@/lib/utils/logger";

/**
 * GET /api/blog/[slug]/comments
 * Get blog post comments / Blog yazısı şərhlərini al
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

    return successResponse(post.comments);
  } catch (error) {
    return handleApiError(error, "get blog comments");
  }
}

/**
 * POST /api/blog/[slug]/comments
 * Create a blog comment / Blog şərhi yarat
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await request.json();
    const { content, parentId, name, email } = body;

    if (!content) {
      return NextResponse.json(
        { success: false, error: "Content is required / Məzmun tələb olunur" },
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

    // Try to get user from session / Sessiyadan istifadəçini almağa cəhd et
    let userId: string | undefined;
    try {
      const authResult = await requireAuth(request);
      if (!(authResult instanceof NextResponse)) {
        userId = authResult.user.id;
      }
    } catch {
      // User not authenticated, use anonymous comment / İstifadəçi autentifikasiya olunmayıb, anonim şərh istifadə et
    }

    // For anonymous comments, name and email are required / Anonim şərhlər üçün ad və email tələb olunur
    if (!userId && (!name || !email)) {
      return NextResponse.json(
        { success: false, error: "Name and email are required for anonymous comments / Anonim şərhlər üçün ad və email tələb olunur" },
        { status: 400 }
      );
    }

    const writeClient = await getWriteClient();

    const comment = await writeClient.blogComment.create({
      data: {
        postId: post.id,
        userId,
        name: userId ? undefined : name,
        email: userId ? undefined : email,
        content,
        parentId: parentId || undefined,
        isApproved: userId ? true : false, // Auto-approve comments from authenticated users / Autentifikasiya olunmuş istifadəçilərin şərhlərini avtomatik təsdiqlə
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        replies: {
          where: {
            isApproved: true,
            isSpam: false,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    logger.info("Blog comment created / Blog şərhi yaradıldı", {
      commentId: comment.id,
      postId: post.id,
      userId,
    });

    return successResponse(comment, "Comment created successfully / Şərh uğurla yaradıldı");
  } catch (error) {
    return handleApiError(error, "create blog comment");
  }
}

