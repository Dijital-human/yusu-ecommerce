/**
 * Product Videos Service / Məhsul Videoları Xidməti
 * Database operations for product videos / Məhsul videoları üçün veritabanı əməliyyatları
 */

import { getReadClient, getWriteClient } from "@/lib/db/query-client";

export interface ProductVideo {
  id: string;
  productId: string;
  videoUrl: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
  duration?: number;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get all videos for a product / Məhsul üçün bütün videoları al
 */
export async function getProductVideos(productId: string): Promise<ProductVideo[]> {
  try {
    const readClient = await getReadClient();
    const videos = await readClient.productVideo.findMany({
      where: {
        productId,
        isActive: true,
      },
      orderBy: {
        order: "asc",
      },
    });

    return videos.map((video) => ({
      id: video.id,
      productId: video.productId,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl || undefined,
      title: video.title || undefined,
      description: video.description || undefined,
      duration: video.duration || undefined,
      order: video.order,
      isActive: video.isActive,
      createdAt: video.createdAt,
      updatedAt: video.updatedAt,
    }));
  } catch (error) {
    console.error("Error fetching product videos:", error);
    throw error;
  }
}

/**
 * Get video by ID / ID ilə videonu al
 */
export async function getProductVideoById(videoId: string): Promise<ProductVideo | null> {
  try {
    const readClient = await getReadClient();
    const video = await readClient.productVideo.findUnique({
      where: {
        id: videoId,
      },
    });

    if (!video) {
      return null;
    }

    return {
      id: video.id,
      productId: video.productId,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl || undefined,
      title: video.title || undefined,
      description: video.description || undefined,
      duration: video.duration || undefined,
      order: video.order,
      isActive: video.isActive,
      createdAt: video.createdAt,
      updatedAt: video.updatedAt,
    };
  } catch (error) {
    console.error("Error fetching product video:", error);
    throw error;
  }
}

/**
 * Check if video URL is YouTube or Vimeo / Video URL-inin YouTube və ya Vimeo olub-olmadığını yoxla
 */
export function isExternalVideoUrl(url: string): boolean {
  return (
    url.includes("youtube.com") ||
    url.includes("youtu.be") ||
    url.includes("vimeo.com")
  );
}

/**
 * Extract YouTube video ID / YouTube video ID-ni çıxar
 */
export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * Extract Vimeo video ID / Vimeo video ID-ni çıxar
 */
export function extractVimeoVideoId(url: string): string | null {
  const pattern = /vimeo\.com\/(\d+)/;
  const match = url.match(pattern);
  return match ? match[1] : null;
}

/**
 * Get YouTube embed URL / YouTube embed URL-ini al
 */
export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

/**
 * Get Vimeo embed URL / Vimeo embed URL-ini al
 */
export function getVimeoEmbedUrl(videoId: string): string {
  return `https://player.vimeo.com/video/${videoId}`;
}

