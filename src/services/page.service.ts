/**
 * Page Service (CMS) / Səhifə Xidməti (CMS)
 * Business logic for CMS page operations
 * CMS səhifə əməliyyatları üçün business logic
 * 
 * Supports multilingual content through error messages and data
 * Xəta mesajları və məlumatlar vasitəsilə çoxdilli məzmunu dəstəkləyir
 */

import { getReadClient, getWriteClient } from "@/lib/db/query-client";
import { logger } from "@/lib/utils/logger";

export interface CreatePageData {
  slug: string;
  title: string;
  content: string; // HTML or Markdown
  metaTitle?: string;
  metaDescription?: string;
}

export interface UpdatePageData {
  slug?: string;
  title?: string;
  content?: string;
  metaTitle?: string;
  metaDescription?: string;
  isPublished?: boolean;
}

/**
 * Generate slug from title / Başlıqdan slug yarat
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters / Xüsusi simvolları sil
    .replace(/[\s_-]+/g, '-') // Replace spaces with hyphens / Boşluqları tire ilə əvəz et
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens / Başlanğıc/bitiş tire-lərini sil
}

/**
 * Get all pages / Bütün səhifələri al
 */
export async function getPages(filters?: {
  isPublished?: boolean;
  search?: string;
}) {
  const prisma = await getReadClient();
  
  const where: any = {};
  
  if (filters?.isPublished !== undefined) {
    where.isPublished = filters.isPublished;
  }
  
  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { slug: { contains: filters.search, mode: 'insensitive' } },
      { content: { contains: filters.search, mode: 'insensitive' } },
    ];
  }
  
  const pages = await prisma.page.findMany({
    where,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      updater: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
  
  return pages;
}

/**
 * Get page by ID / ID-yə görə səhifə al
 */
export async function getPageById(pageId: string) {
  const prisma = await getReadClient();
  
  const page = await prisma.page.findUnique({
    where: { id: pageId },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      updater: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
  
  if (!page) {
    throw new Error("Page not found / Səhifə tapılmadı");
  }
  
  return page;
}

/**
 * Get page by slug / Slug-a görə səhifə al
 * Used by customer-facing pages / Customer-facing səhifələr tərəfindən istifadə olunur
 */
export async function getPageBySlug(slug: string) {
  const prisma = await getReadClient();
  
  const page = await prisma.page.findUnique({
    where: { slug },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      updater: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
  
  if (!page) {
    throw new Error("Page not found / Səhifə tapılmadı");
  }
  
  // Only return published pages for customer-facing / Customer-facing üçün yalnız published səhifələri qaytar
  if (!page.isPublished) {
    throw new Error("Page not found / Səhifə tapılmadı");
  }
  
  return page;
}

/**
 * Create a new page / Yeni səhifə yarat
 */
export async function createPage(data: CreatePageData, userId: string) {
  const prisma = await getWriteClient();
  
  // Generate slug if not provided / Əgər verilməyibsə slug yarat
  const slug = data.slug || generateSlug(data.title);
  
  // Check if slug already exists / Slug-un artıq mövcud olub-olmadığını yoxla
  const existingPage = await prisma.page.findUnique({
    where: { slug },
  });
  
  if (existingPage) {
    throw new Error(`Page with slug "${slug}" already exists / "${slug}" slug-u ilə səhifə artıq mövcuddur`);
  }
  
  // Create page / Səhifə yarat
  const page = await prisma.page.create({
    data: {
      slug,
      title: data.title,
      content: data.content,
      metaTitle: data.metaTitle || data.title,
      metaDescription: data.metaDescription,
      createdBy: userId,
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
  
  logger.info('Page created / Səhifə yaradıldı', { pageId: page.id, userId, slug: page.slug });
  
  return page;
}

/**
 * Update page / Səhifə yenilə
 */
export async function updatePage(pageId: string, data: UpdatePageData, userId: string) {
  const prisma = await getWriteClient();
  
  // Check if page exists / Səhifənin mövcud olduğunu yoxla
  const existingPage = await prisma.page.findUnique({
    where: { id: pageId },
  });
  
  if (!existingPage) {
    throw new Error("Page not found / Səhifə tapılmadı");
  }
  
  // Generate slug if title changed / Əgər başlıq dəyişibsə slug yarat
  let slug = data.slug || existingPage.slug;
  if (data.title && data.title !== existingPage.title && !data.slug) {
    slug = generateSlug(data.title);
    
    // Check if new slug already exists / Yeni slug-un artıq mövcud olub-olmadığını yoxla
    const slugExists = await prisma.page.findUnique({
      where: { slug },
    });
    
    if (slugExists && slugExists.id !== pageId) {
      throw new Error(`Page with slug "${slug}" already exists / "${slug}" slug-u ilə səhifə artıq mövcuddur`);
    }
  }
  
  // Update page / Səhifəni yenilə
  const page = await prisma.page.update({
    where: { id: pageId },
    data: {
      ...(data.slug !== undefined && { slug }),
      ...(data.title !== undefined && { title: data.title }),
      ...(data.content !== undefined && { content: data.content }),
      ...(data.metaTitle !== undefined && { metaTitle: data.metaTitle }),
      ...(data.metaDescription !== undefined && { metaDescription: data.metaDescription }),
      ...(data.isPublished !== undefined && { 
        isPublished: data.isPublished,
        publishedAt: data.isPublished ? new Date() : null,
      }),
      updatedBy: userId,
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      updater: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
  
  logger.info('Page updated / Səhifə yeniləndi', { pageId, userId });
  
  return page;
}

/**
 * Delete page / Səhifə sil
 */
export async function deletePage(pageId: string) {
  const prisma = await getWriteClient();
  
  // Check if page exists / Səhifənin mövcud olduğunu yoxla
  const existingPage = await prisma.page.findUnique({
    where: { id: pageId },
  });
  
  if (!existingPage) {
    throw new Error("Page not found / Səhifə tapılmadı");
  }
  
  // Delete page / Səhifəni sil
  await prisma.page.delete({
    where: { id: pageId },
  });
  
  logger.info('Page deleted / Səhifə silindi', { pageId });
}

/**
 * Publish page / Səhifəni publish et
 */
export async function publishPage(pageId: string, userId: string) {
  return updatePage(pageId, { isPublished: true }, userId);
}

/**
 * Unpublish page / Səhifəni unpublish et
 */
export async function unpublishPage(pageId: string, userId: string) {
  return updatePage(pageId, { isPublished: false }, userId);
}

