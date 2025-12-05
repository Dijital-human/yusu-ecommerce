/**
 * Banner Service / Banner Xidməti
 * Business logic for banner operations
 * Banner əməliyyatları üçün business logic
 * 
 * Supports multilingual content through error messages and data
 * Xəta mesajları və məlumatlar vasitəsilə çoxdilli məzmunu dəstəkləyir
 */

import { getReadClient, getWriteClient } from "@/lib/db/query-client";
import { logger } from "@/lib/utils/logger";

// BannerPosition enum / BannerPosition enum-u
export enum BannerPosition {
  HERO = "HERO",
  TOP = "TOP",
  MIDDLE = "MIDDLE",
  BOTTOM = "BOTTOM",
  SIDEBAR = "SIDEBAR",
  FOOTER = "FOOTER",
}

export interface CreateBannerData {
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  position: BannerPosition;
  priority?: number;
  startDate?: Date | string;
  endDate?: Date | string;
  targetAudience?: {
    roles?: string[];
    countries?: string[];
    [key: string]: any;
  };
}

export interface UpdateBannerData {
  title?: string;
  subtitle?: string;
  image?: string;
  link?: string;
  position?: BannerPosition;
  isActive?: boolean;
  priority?: number;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  targetAudience?: {
    roles?: string[];
    countries?: string[];
    [key: string]: any;
  } | null;
}

/**
 * Get all banners / Bütün banner-ləri al
 */
export async function getBanners(filters?: {
  position?: BannerPosition;
  isActive?: boolean;
  includeExpired?: boolean;
}) {
  const prisma = await getReadClient();
  
  const where: any = {};
  
  if (filters?.position) {
    where.position = filters.position;
  }
  
  if (filters?.isActive !== undefined) {
    where.isActive = filters.isActive;
  }
  
  // Filter by date range if not including expired / Əgər expired daxil edilmirsə tarix aralığına görə filtrlə
  if (!filters?.includeExpired) {
    const now = new Date();
    where.OR = [
      { startDate: null },
      { startDate: { lte: now } },
    ];
    where.AND = [
      {
        OR: [
          { endDate: null },
          { endDate: { gte: now } },
        ],
      },
    ];
  }
  
  const banners = await prisma.banner.findMany({
    where,
    orderBy: [
      { priority: 'desc' },
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
  
  return banners;
}

/**
 * Get banner by ID / ID-yə görə banner al
 */
export async function getBannerById(bannerId: string) {
  const prisma = await getReadClient();
  
  const banner = await prisma.banner.findUnique({
    where: { id: bannerId },
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
  
  if (!banner) {
    throw new Error("Banner not found / Banner tapılmadı");
  }
  
  return banner;
}

/**
 * Get active banners by position / Position-a görə aktiv banner-ləri al
 * Used by customer-facing pages / Customer-facing səhifələr tərəfindən istifadə olunur
 */
export async function getActiveBannersByPosition(position: BannerPosition) {
  const prisma = await getReadClient();
  const now = new Date();
  
  const banners = await prisma.banner.findMany({
    where: {
      position,
      isActive: true,
      OR: [
        { startDate: null },
        { startDate: { lte: now } },
      ],
      AND: [
        {
          OR: [
            { endDate: null },
            { endDate: { gte: now } },
          ],
        },
      ],
    },
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'desc' },
    ],
  });
  
  return banners;
}

/**
 * Create a new banner / Yeni banner yarat
 */
export async function createBanner(data: CreateBannerData, userId: string) {
  const prisma = await getWriteClient();
  
  // Validate dates / Tarixləri yoxla
  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    
    if (start >= end) {
      throw new Error("Start date must be before end date / Başlanğıc tarixi bitiş tarixindən əvvəl olmalıdır");
    }
  }
  
  // Create banner / Banner yarat
  const banner = await prisma.banner.create({
    data: {
      title: data.title,
      subtitle: data.subtitle,
      image: data.image,
      link: data.link,
      position: data.position,
      priority: data.priority || 0,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      targetAudience: data.targetAudience ? JSON.stringify(data.targetAudience) : null,
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
  
  logger.info('Banner created / Banner yaradıldı', { bannerId: banner.id, userId, position: banner.position });
  
  return banner;
}

/**
 * Update banner / Banner yenilə
 */
export async function updateBanner(bannerId: string, data: UpdateBannerData, userId: string) {
  const prisma = await getWriteClient();
  
  // Check if banner exists / Banner-in mövcud olduğunu yoxla
  const existingBanner = await prisma.banner.findUnique({
    where: { id: bannerId },
  });
  
  if (!existingBanner) {
    throw new Error("Banner not found / Banner tapılmadı");
  }
  
  // Validate dates / Tarixləri yoxla
  const startDate = data.startDate !== undefined 
    ? (data.startDate ? new Date(data.startDate) : null)
    : existingBanner.startDate;
  const endDate = data.endDate !== undefined
    ? (data.endDate ? new Date(data.endDate) : null)
    : existingBanner.endDate;
  
  if (startDate && endDate && startDate >= endDate) {
    throw new Error("Start date must be before end date / Başlanğıc tarixi bitiş tarixindən əvvəl olmalıdır");
  }
  
  // Update banner / Banner yenilə
  const banner = await prisma.banner.update({
    where: { id: bannerId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.subtitle !== undefined && { subtitle: data.subtitle }),
      ...(data.image !== undefined && { image: data.image }),
      ...(data.link !== undefined && { link: data.link }),
      ...(data.position !== undefined && { position: data.position }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.startDate !== undefined && { startDate: startDate }),
      ...(data.endDate !== undefined && { endDate: endDate }),
      ...(data.targetAudience !== undefined && { 
        targetAudience: data.targetAudience ? JSON.stringify(data.targetAudience) : null 
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
  
  logger.info('Banner updated / Banner yeniləndi', { bannerId, userId });
  
  return banner;
}

/**
 * Delete banner / Banner sil
 */
export async function deleteBanner(bannerId: string) {
  const prisma = await getWriteClient();
  
  // Check if banner exists / Banner-in mövcud olduğunu yoxla
  const existingBanner = await prisma.banner.findUnique({
    where: { id: bannerId },
  });
  
  if (!existingBanner) {
    throw new Error("Banner not found / Banner tapılmadı");
  }
  
  // Delete banner / Banner sil
  await prisma.banner.delete({
    where: { id: bannerId },
  });
  
  logger.info('Banner deleted / Banner silindi', { bannerId });
}

/**
 * Activate banner / Banner aktivləşdir
 */
export async function activateBanner(bannerId: string, userId: string) {
  return updateBanner(bannerId, { isActive: true }, userId);
}

/**
 * Deactivate banner / Banner deaktivləşdir
 */
export async function deactivateBanner(bannerId: string, userId: string) {
  return updateBanner(bannerId, { isActive: false }, userId);
}

/**
 * Track banner click / Banner klikini izlə
 */
export async function trackBannerClick(bannerId: string) {
  const prisma = await getWriteClient();
  
  await prisma.banner.update({
    where: { id: bannerId },
    data: {
      clicks: {
        increment: 1,
      },
    },
  });
}

/**
 * Track banner impression / Banner görüntülənməsini izlə
 */
export async function trackBannerImpression(bannerId: string) {
  const prisma = await getWriteClient();
  
  await prisma.banner.update({
    where: { id: bannerId },
    data: {
      impressions: {
        increment: 1,
      },
    },
  });
}

