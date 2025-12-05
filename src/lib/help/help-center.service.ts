/**
 * Help Center Service / Yardım Mərkəzi Xidməti
 * Service functions for help center operations / Yardım mərkəzi əməliyyatları üçün xidmət funksiyaları
 */

import { getReadClient, getWriteClient } from "@/lib/db/query-client";
import { logger } from "@/lib/utils/logger";

export interface HelpArticleFilters {
  categoryId?: string;
  subcategoryId?: string;
  search?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  page?: number;
  limit?: number;
}

/**
 * Get help categories / Yardım kateqoriyalarını al
 */
export async function getHelpCategories() {
  try {
    const readClient = await getReadClient();

    const categories = await readClient.helpCategory.findMany({
      where: {
        isActive: true,
      },
      include: {
        subcategories: {
          where: {
            isActive: true,
          },
          orderBy: {
            order: "asc",
          },
        },
        _count: {
          select: {
            articles: {
              where: {
                isPublished: true,
              },
            },
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    });

    return categories;
  } catch (error) {
    logger.error("Error fetching help categories / Yardım kateqoriyalarını alma xətası", {
      error,
    });
    throw error;
  }
}

/**
 * Get help articles with filters / Filtrlərlə yardım məqalələrini al
 */
export async function getHelpArticles(filters: HelpArticleFilters = {}) {
  try {
    const readClient = await getReadClient();
    const {
      categoryId,
      subcategoryId,
      search,
      isPublished,
      isFeatured,
      page = 1,
      limit = 10,
    } = filters;

    const where: any = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (subcategoryId) {
      where.subcategoryId = subcategoryId;
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

    const [articles, total] = await Promise.all([
      readClient.helpArticle.findMany({
        where,
        include: {
          category: true,
          subcategory: true,
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: [
          { isFeatured: "desc" },
          { order: "asc" },
          { createdAt: "desc" },
        ],
        skip,
        take: limit,
      }),
      readClient.helpArticle.count({ where }),
    ]);

    return {
      articles,
      pagination: {
        totalItems: total,
        currentPage: page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error("Error fetching help articles / Yardım məqalələrini alma xətası", {
      error,
      filters,
    });
    throw error;
  }
}

/**
 * Get help article by slug / Slug ilə yardım məqaləsini al
 */
export async function getHelpArticleBySlug(slug: string) {
  try {
    const readClient = await getReadClient();

    const article = await readClient.helpArticle.findUnique({
      where: { slug },
      include: {
        category: true,
        subcategory: true,
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        relatedArticles: {
          include: {
            relatedArticle: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    return article;
  } catch (error) {
    logger.error("Error fetching help article / Yardım məqaləsini alma xətası", {
      error,
      slug,
    });
    throw error;
  }
}

/**
 * Track help article view / Yardım məqaləsi baxışını izlə
 */
export async function trackHelpArticleView(articleId: string) {
  try {
    const writeClient = await getWriteClient();

    await writeClient.helpArticle.update({
      where: { id: articleId },
      data: {
        viewCount: { increment: 1 },
      },
    });

    logger.info("Help article view tracked / Yardım məqaləsi baxışı izləndi", {
      articleId,
    });
  } catch (error) {
    logger.error(
      "Error tracking help article view / Yardım məqaləsi baxışını izləmə xətası",
      { error, articleId }
    );
  }
}

/**
 * Rate help article / Yardım məqaləsini reytinqlə
 */
export async function rateHelpArticle(
  articleId: string,
  userId: string | undefined,
  isHelpful: boolean
) {
  try {
    const writeClient = await getWriteClient();

    // Check if user already rated / İstifadəçi artıq reytinqləyib mi yoxla
    if (userId) {
      const existingRating = await writeClient.helpArticleRating.findUnique({
        where: {
          articleId_userId: {
            articleId,
            userId,
          },
        },
      });

      if (existingRating) {
        // Update existing rating / Mövcud reytinqi yenilə
        if (existingRating.isHelpful !== isHelpful) {
          await writeClient.helpArticleRating.update({
            where: { id: existingRating.id },
            data: { isHelpful },
          });

          // Update counts / Sayğacları yenilə
          await writeClient.helpArticle.update({
            where: { id: articleId },
            data: {
              helpfulCount: isHelpful
                ? { increment: 1 }
                : { decrement: 1 },
              notHelpfulCount: isHelpful
                ? { decrement: 1 }
                : { increment: 1 },
            },
          });
        }
        return;
      }
    }

    // Create new rating / Yeni reytinq yarat
    await writeClient.helpArticleRating.create({
      data: {
        articleId,
        userId,
        isHelpful,
      },
    });

    // Update counts / Sayğacları yenilə
    await writeClient.helpArticle.update({
      where: { id: articleId },
      data: {
        helpfulCount: isHelpful ? { increment: 1 } : undefined,
        notHelpfulCount: isHelpful ? undefined : { increment: 1 },
      },
    });

    logger.info("Help article rated / Yardım məqaləsi reytinqləndi", {
      articleId,
      userId,
      isHelpful,
    });
  } catch (error) {
    logger.error("Error rating help article / Yardım məqaləsini reytinqləmə xətası", {
      error,
      articleId,
    });
    throw error;
  }
}

/**
 * Submit help article feedback / Yardım məqaləsi rəyini göndər
 */
export async function submitHelpArticleFeedback(
  articleId: string,
  feedback: string,
  userId?: string,
  name?: string,
  email?: string
) {
  try {
    const writeClient = await getWriteClient();

    const feedbackRecord = await writeClient.helpArticleFeedback.create({
      data: {
        articleId,
        userId,
        name,
        email,
        feedback,
      },
    });

    logger.info("Help article feedback submitted / Yardım məqaləsi rəyi göndərildi", {
      feedbackId: feedbackRecord.id,
      articleId,
    });

    return feedbackRecord;
  } catch (error) {
    logger.error(
      "Error submitting help article feedback / Yardım məqaləsi rəyini göndərmə xətası",
      { error, articleId }
    );
    throw error;
  }
}

