/**
 * Homepage Service / Ana Səhifə Xidməti
 * Business logic for homepage section operations
 * Ana səhifə bölməsi əməliyyatları üçün business logic
 * 
 * Supports multilingual content through error messages and data
 * Xəta mesajları və məlumatlar vasitəsilə çoxdilli məzmunu dəstəkləyir
 */

import { getReadClient, getWriteClient } from "@/lib/db/query-client";
import { logger } from "@/lib/utils/logger";

// SectionType enum / SectionType enum-u
export enum SectionType {
  HERO_CAROUSEL = "HERO_CAROUSEL",
  CATEGORIES = "CATEGORIES",
  FEATURED_PRODUCTS = "FEATURED_PRODUCTS",
  TRENDING_PRODUCTS = "TRENDING_PRODUCTS",
  NEW_ARRIVALS = "NEW_ARRIVALS",
  BEST_SELLERS = "BEST_SELLERS",
  TESTIMONIALS = "TESTIMONIALS",
  STATISTICS = "STATISTICS",
  NEWS = "NEWS",
  PROMOTIONS = "PROMOTIONS",
  CUSTOM_HTML = "CUSTOM_HTML",
}

export interface CreateHomepageSectionData {
  type: SectionType;
  title?: string;
  subtitle?: string;
  content?: any; // JSON object
  order?: number;
  config?: any; // JSON object
}

export interface UpdateHomepageSectionData {
  type?: SectionType;
  title?: string;
  subtitle?: string;
  content?: any; // JSON object
  order?: number;
  isActive?: boolean;
  config?: any; // JSON object
}

/**
 * Get all homepage sections / Bütün ana səhifə bölmələrini al
 */
export async function getHomepageSections(filters?: {
  type?: SectionType;
  isActive?: boolean;
}) {
  const prisma = await getReadClient();
  
  const where: any = {};
  
  if (filters?.type) {
    where.type = filters.type;
  }
  
  if (filters?.isActive !== undefined) {
    where.isActive = filters.isActive;
  }
  
  const sections = await prisma.homepageSection.findMany({
    where,
    orderBy: [
      { order: 'asc' },
      { createdAt: 'desc' },
    ],
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
  
  return sections;
}

/**
 * Get active homepage sections / Aktiv ana səhifə bölmələrini al
 * Used by customer-facing homepage / Customer-facing ana səhifə tərəfindən istifadə olunur
 */
export async function getActiveHomepageSections() {
  return getHomepageSections({ isActive: true });
}

/**
 * Get homepage section by ID / ID-yə görə ana səhifə bölməsini al
 */
export async function getHomepageSectionById(sectionId: string) {
  const prisma = await getReadClient();
  
  const section = await prisma.homepageSection.findUnique({
    where: { id: sectionId },
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
  
  if (!section) {
    throw new Error("Homepage section not found / Ana səhifə bölməsi tapılmadı");
  }
  
  return section;
}

/**
 * Create a new homepage section / Yeni ana səhifə bölməsi yarat
 */
export async function createHomepageSection(data: CreateHomepageSectionData, userId: string) {
  const prisma = await getWriteClient();
  
  // Create section / Bölmə yarat
  const section = await prisma.homepageSection.create({
    data: {
      type: data.type,
      title: data.title,
      subtitle: data.subtitle,
      content: data.content ? JSON.stringify(data.content) : null,
      order: data.order || 0,
      config: data.config ? JSON.stringify(data.config) : null,
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
  
  logger.info('Homepage section created / Ana səhifə bölməsi yaradıldı', { 
    sectionId: section.id, 
    userId, 
    type: section.type 
  });
  
  return section;
}

/**
 * Update homepage section / Ana səhifə bölməsini yenilə
 */
export async function updateHomepageSection(
  sectionId: string, 
  data: UpdateHomepageSectionData, 
  userId: string
) {
  const prisma = await getWriteClient();
  
  // Check if section exists / Bölmənin mövcud olduğunu yoxla
  const existingSection = await prisma.homepageSection.findUnique({
    where: { id: sectionId },
  });
  
  if (!existingSection) {
    throw new Error("Homepage section not found / Ana səhifə bölməsi tapılmadı");
  }
  
  // Update section / Bölməni yenilə
  const section = await prisma.homepageSection.update({
    where: { id: sectionId },
    data: {
      ...(data.type !== undefined && { type: data.type }),
      ...(data.title !== undefined && { title: data.title }),
      ...(data.subtitle !== undefined && { subtitle: data.subtitle }),
      ...(data.content !== undefined && { 
        content: data.content ? JSON.stringify(data.content) : null 
      }),
      ...(data.order !== undefined && { order: data.order }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.config !== undefined && { 
        config: data.config ? JSON.stringify(data.config) : null 
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
  
  logger.info('Homepage section updated / Ana səhifə bölməsi yeniləndi', { sectionId, userId });
  
  return section;
}

/**
 * Delete homepage section / Ana səhifə bölməsini sil
 */
export async function deleteHomepageSection(sectionId: string) {
  const prisma = await getWriteClient();
  
  // Check if section exists / Bölmənin mövcud olduğunu yoxla
  const existingSection = await prisma.homepageSection.findUnique({
    where: { id: sectionId },
  });
  
  if (!existingSection) {
    throw new Error("Homepage section not found / Ana səhifə bölməsi tapılmadı");
  }
  
  // Delete section / Bölməni sil
  await prisma.homepageSection.delete({
    where: { id: sectionId },
  });
  
  logger.info('Homepage section deleted / Ana səhifə bölməsi silindi', { sectionId });
}

/**
 * Reorder homepage sections / Ana səhifə bölmələrini yenidən sırala
 */
export async function reorderHomepageSections(sectionOrders: Array<{ id: string; order: number }>) {
  const prisma = await getWriteClient();
  
  // Update all sections in a transaction / Transaction-da bütün bölmələri yenilə
  await prisma.$transaction(
    sectionOrders.map(({ id, order }) =>
      prisma.homepageSection.update({
        where: { id },
        data: { order },
      })
    )
  );
  
  logger.info('Homepage sections reordered / Ana səhifə bölmələri yenidən sıralandı', {
    count: sectionOrders.length,
  });
}

/**
 * Activate homepage section / Ana səhifə bölməsini aktivləşdir
 */
export async function activateHomepageSection(sectionId: string, userId: string) {
  return updateHomepageSection(sectionId, { isActive: true }, userId);
}

/**
 * Deactivate homepage section / Ana səhifə bölməsini deaktivləşdir
 */
export async function deactivateHomepageSection(sectionId: string, userId: string) {
  return updateHomepageSection(sectionId, { isActive: false }, userId);
}

