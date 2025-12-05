/**
 * 360° Viewer Utilities / 360° Görüntüləyici Yardımçı Funksiyaları
 * Helper functions for 360° image viewer / 360° şəkil görüntüləyici üçün yardımçı funksiyalar
 */

/**
 * Calculate frame index based on rotation angle / Fırlanma bucağına görə kadr indeksini hesabla
 */
export function calculateFrameIndex(
  angle: number,
  frameCount: number
): number {
  // Normalize angle to 0-360 range / Bucağı 0-360 diapazonuna normallaşdır
  const normalizedAngle = ((angle % 360) + 360) % 360;
  
  // Calculate frame index / Kadr indeksini hesabla
  const frameIndex = Math.floor((normalizedAngle / 360) * frameCount);
  
  // Ensure index is within bounds / İndeksin hədlər daxilində olduğunu təmin et
  return Math.min(frameIndex, frameCount - 1);
}

/**
 * Calculate rotation angle from mouse/touch position / Mouse/touch mövqeyindən fırlanma bucağını hesabla
 */
export function calculateAngleFromPosition(
  startX: number,
  currentX: number,
  width: number
): number {
  const deltaX = currentX - startX;
  const rotationAngle = (deltaX / width) * 360;
  return rotationAngle;
}

/**
 * Preload images for smooth rotation / Smooth fırlanma üçün şəkilləri ön-yüklə
 */
export function preloadImages(imageUrls: string[]): Promise<void[]> {
  return Promise.all(
    imageUrls.map((url) => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        img.src = url;
      });
    })
  );
}

/**
 * Generate thumbnail from first image / İlk şəkilə görə thumbnail yarat
 */
export function generateThumbnail(imageUrl: string): string {
  // For now, return the first image URL / İndilik, ilk şəkil URL-ini qaytar
  // In production, you might want to generate a smaller thumbnail / Production-da daha kiçik thumbnail yaratmaq istəyə bilərsiniz
  return imageUrl;
}

/**
 * Validate 360° view data / 360° görünüş məlumatlarını yoxla
 */
export function validate360ViewData(imageUrls: string[]): {
  valid: boolean;
  error?: string;
} {
  if (!imageUrls || imageUrls.length === 0) {
    return {
      valid: false,
      error: "At least one image is required / Ən azı bir şəkil tələb olunur",
    };
  }

  if (imageUrls.length < 8) {
    return {
      valid: false,
      error: "At least 8 images are recommended for smooth rotation / Smooth fırlanma üçün ən azı 8 şəkil tövsiyə olunur",
    };
  }

  // Validate URLs / URL-ləri yoxla
  for (const url of imageUrls) {
    try {
      new URL(url);
    } catch {
      return {
        valid: false,
        error: `Invalid image URL: ${url} / Etibarsız şəkil URL-i: ${url}`,
      };
    }
  }

  return { valid: true };
}

