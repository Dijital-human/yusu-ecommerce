/**
 * Blog Service / Blog Xidməti
 * Service functions for blog operations / Blog əməliyyatları üçün xidmət funksiyaları
 */

import { getReadClient, getWriteClient } from "@/lib/db/query-client";
import { logger } from "@/lib/utils/logger";

export interface BlogPostInput {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  authorId: string;
  categoryId?: string;
  tagIds?: string[];
  isPublished?: boolean;
  isFeatured?: boolean;
  readingTime?: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

export interface BlogPostFilters {
  categoryId?: string;
  tagId?: string;
  authorId?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Calculate reading time from content / Məzmundan oxuma vaxtını hesabla
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const text = content.replace(/<[^>]*>/g, ""); // Remove HTML tags / HTML teqlərini sil
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Generate slug from title / Başlıqdan slug yarat
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Create a blog post / Blog yazısı yarat
 */
export async function createBlogPost(data: BlogPostInput) {
  try {
    const writeClient = await getWriteClient();
    
    const readingTime = data.readingTime || calculateReadingTime(data.content);
    
    const post = await writeClient.blogPost.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        featuredImage: data.featuredImage,
        authorId: data.authorId,
        categoryId: data.categoryId,
        isPublished: data.isPublished || false,
        isFeatured: data.isFeatured || false,
        readingTime,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        seoKeywords: data.seoKeywords,
        publishedAt: data.isPublished ? new Date() : null,
        tags: data.tagIds && data.tagIds.length > 0
          ? {
              create: data.tagIds.map((tagId) => ({
                tagId,
              })),
            }
          : undefined,
        analytics: {
          create: {
            viewCount: 0,
            shareCount: 0,
          },
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
        analytics: true,
      },
    });

    logger.info("Blog post created / Blog yazısı yaradıldı", {
      postId: post.id,
      title: post.title,
    });

    return post;
  } catch (error) {
    logger.error("Error creating blog post / Blog yazısı yaratma xətası", {
      error,
      data,
    });
    throw error;
  }
}

/**
 * Get blog posts with filters / Filtrlərlə blog yazılarını al
 */
export async function getBlogPosts(filters: BlogPostFilters = {}) {
  try {
    const readClient = await getReadClient();
    const {
      categoryId,
      tagId,
      authorId,
      isPublished,
      isFeatured,
      search,
      page = 1,
      limit = 10,
    } = filters;

    const where: any = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (tagId) {
      where.tags = {
        some: {
          tagId,
        },
      };
    }

    if (authorId) {
      where.authorId = authorId;
    }

    if (isPublished !== undefined) {
      where.isPublished = isPublished;
    }

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      readClient.blogPost.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
          analytics: true,
          _count: {
            select: {
              comments: true,
              views: true,
            },
          },
        },
        orderBy: [
          { isFeatured: "desc" },
          { publishedAt: "desc" },
          { createdAt: "desc" },
        ],
        skip,
        take: limit,
      }),
      readClient.blogPost.count({ where }),
    ]);

    return {
      posts,
      pagination: {
        totalItems: total,
        currentPage: page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error("Error fetching blog posts / Blog yazılarını alma xətası", {
      error,
      filters,
    });
    throw error;
  }
}

/**
 * Get blog post by slug / Slug ilə blog yazısını al
 */
export async function getBlogPostBySlug(slug: string) {
  try {
    const readClient = await getReadClient();

    const post = await readClient.blogPost.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
        comments: {
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
              orderBy: {
                createdAt: "asc",
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        analytics: true,
        _count: {
          select: {
            comments: true,
            views: true,
          },
        },
      },
    });

    return post;
  } catch (error) {
    logger.error("Error fetching blog post / Blog yazısını alma xətası", {
      error,
      slug,
    });
    throw error;
  }
}

/**
 * Get related blog posts / Əlaqəli blog yazılarını al
 */
export async function getRelatedBlogPosts(
  postId: string,
  categoryId?: string,
  tagIds?: string[],
  limit: number = 3
) {
  try {
    const readClient = await getReadClient();

    const where: any = {
      id: { not: postId },
      isPublished: true,
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (tagIds && tagIds.length > 0) {
      where.tags = {
        some: {
          tagId: { in: tagIds },
        },
      };
    }

    const posts = await readClient.blogPost.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        category: true,
        analytics: true,
      },
      orderBy: {
        publishedAt: "desc",
      },
      take: limit,
    });

    return posts;
  } catch (error) {
    logger.error(
      "Error fetching related blog posts / Əlaqəli blog yazılarını alma xətası",
      { error, postId }
    );
    throw error;
  }
}

/**
 * Track blog post view / Blog yazısı baxışını izlə
 */
export async function trackBlogPostView(
  postId: string,
  userId?: string,
  ipAddress?: string,
  userAgent?: string
) {
  try {
    const writeClient = await getWriteClient();

    // Create view record / Baxış qeydini yarat
    await writeClient.blogView.create({
      data: {
        postId,
        userId,
        ipAddress,
        userAgent,
      },
    });

    // Update analytics / Analitikanı yenilə
    await writeClient.blogAnalytics.update({
      where: { postId },
      data: {
        viewCount: { increment: 1 },
      },
    });

    // Update post view count / Yazının baxış sayını yenilə
    await writeClient.blogPost.update({
      where: { id: postId },
      data: {
        viewCount: { increment: 1 },
      },
    });

    logger.info("Blog post view tracked / Blog yazısı baxışı izləndi", {
      postId,
      userId,
    });
  } catch (error) {
    logger.error(
      "Error tracking blog post view / Blog yazısı baxışını izləmə xətası",
      { error, postId }
    );
    // Don't throw error, just log it / Xəta atma, sadəcə logla
  }
}

/**
 * Track blog post share / Blog yazısı paylaşımını izlə
 */
export async function trackBlogPostShare(postId: string, platform: string) {
  try {
    const writeClient = await getWriteClient();

    await writeClient.blogAnalytics.update({
      where: { postId },
      data: {
        shareCount: { increment: 1 },
      },
    });

    await writeClient.blogPost.update({
      where: { id: postId },
      data: {
        shareCount: { increment: 1 },
      },
    });

    logger.info("Blog post share tracked / Blog yazısı paylaşımı izləndi", {
      postId,
      platform,
    });
  } catch (error) {
    logger.error(
      "Error tracking blog post share / Blog yazısı paylaşımını izləmə xətası",
      { error, postId }
    );
  }
}

/**
 * Get blog categories / Blog kateqoriyalarını al
 */
export async function getBlogCategories() {
  try {
    const readClient = await getReadClient();

    const categories = await readClient.blogCategory.findMany({
      where: {
        isActive: true,
      },
      include: {
        _count: {
          select: {
            posts: {
              where: {
                isPublished: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return categories;
  } catch (error) {
    logger.error(
      "Error fetching blog categories / Blog kateqoriyalarını alma xətası",
      { error }
    );
    throw error;
  }
}

/**
 * Get blog tags / Blog tag-lərini al
 */
export async function getBlogTags() {
  try {
    const readClient = await getReadClient();

    const tags = await readClient.blogTag.findMany({
      include: {
        _count: {
          select: {
            posts: {
              where: {
                isPublished: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return tags;
  } catch (error) {
    logger.error("Error fetching blog tags / Blog tag-lərini alma xətası", {
      error,
    });
    throw error;
  }
}

/**
 * Get popular blog posts / Məşhur blog yazılarını al
 */
export async function getPopularBlogPosts(limit: number = 5) {
  try {
    const readClient = await getReadClient();

    const posts = await readClient.blogPost.findMany({
      where: {
        isPublished: true,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        category: true,
        analytics: true,
      },
      orderBy: [
        { viewCount: "desc" },
        { shareCount: "desc" },
      ],
      take: limit,
    });

    return posts;
  } catch (error) {
    logger.error(
      "Error fetching popular blog posts / Məşhur blog yazılarını alma xətası",
      { error }
    );
    throw error;
  }
}

