/**
 * Size Guides Service / Ölçü Bələdçiləri Xidməti
 * Database operations for size guides / Ölçü bələdçiləri üçün veritabanı əməliyyatları
 */

import { getReadClient, getWriteClient } from "@/lib/db/query-client";

export interface SizeGuide {
  id: string;
  categoryId?: string;
  title: string;
  content: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  category?: {
    id: string;
    name: string;
  };
}

/**
 * Get all active size guides / Bütün aktiv ölçü bələdçilərini al
 */
export async function getAllSizeGuides(): Promise<SizeGuide[]> {
  try {
    const readClient = await getReadClient();
    const sizeGuides = await readClient.sizeGuide.findMany({
      where: {
        isActive: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return sizeGuides.map((guide) => ({
      id: guide.id,
      categoryId: guide.categoryId || undefined,
      title: guide.title,
      content: guide.content,
      imageUrl: guide.imageUrl || undefined,
      isActive: guide.isActive,
      createdAt: guide.createdAt,
      updatedAt: guide.updatedAt,
      category: guide.category
        ? {
            id: guide.category.id,
            name: guide.category.name,
          }
        : undefined,
    }));
  } catch (error) {
    console.error("Error fetching size guides:", error);
    throw error;
  }
}

/**
 * Get size guide by ID / ID ilə ölçü bələdçisini al
 */
export async function getSizeGuideById(guideId: string): Promise<SizeGuide | null> {
  try {
    const readClient = await getReadClient();
    const sizeGuide = await readClient.sizeGuide.findUnique({
      where: {
        id: guideId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!sizeGuide) {
      return null;
    }

    return {
      id: sizeGuide.id,
      categoryId: sizeGuide.categoryId || undefined,
      title: sizeGuide.title,
      content: sizeGuide.content,
      imageUrl: sizeGuide.imageUrl || undefined,
      isActive: sizeGuide.isActive,
      createdAt: sizeGuide.createdAt,
      updatedAt: sizeGuide.updatedAt,
      category: sizeGuide.category
        ? {
            id: sizeGuide.category.id,
            name: sizeGuide.category.name,
          }
        : undefined,
    };
  } catch (error) {
    console.error("Error fetching size guide:", error);
    throw error;
  }
}

/**
 * Get size guide by category ID / Kateqoriya ID ilə ölçü bələdçisini al
 */
export async function getSizeGuideByCategory(categoryId: string): Promise<SizeGuide | null> {
  try {
    const readClient = await getReadClient();
    const sizeGuide = await readClient.sizeGuide.findFirst({
      where: {
        categoryId,
        isActive: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!sizeGuide) {
      return null;
    }

    return {
      id: sizeGuide.id,
      categoryId: sizeGuide.categoryId || undefined,
      title: sizeGuide.title,
      content: sizeGuide.content,
      imageUrl: sizeGuide.imageUrl || undefined,
      isActive: sizeGuide.isActive,
      createdAt: sizeGuide.createdAt,
      updatedAt: sizeGuide.updatedAt,
      category: sizeGuide.category
        ? {
            id: sizeGuide.category.id,
            name: sizeGuide.category.name,
          }
        : undefined,
    };
  } catch (error) {
    console.error("Error fetching size guide by category:", error);
    throw error;
  }
}

