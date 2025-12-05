/**
 * Product Helper Functions / Məhsul Köməkçi Funksiyaları
 * Utility functions for product-related operations
 * Məhsulla əlaqəli əməliyyatlar üçün faydalı funksiyalar
 */

/**
 * Parse product images from various formats
 * Müxtəlif formatlardan məhsul şəkillərini parse et
 * 
 * Handles:
 * - Array format: ["url1", "url2"]
 * - JSON string: '["url1", "url2"]'
 * - Single string: "url1"
 * 
 * Returns array of image URLs with fallback to placeholder
 * Placeholder ilə şəkil URL-ləri massivi qaytarır
 */
export function parseProductImages(images: any): string[] {
  let parsedImages: string[] = [];
  
  if (!images) {
    return ['/placeholder-product.jpg'];
  }
  
  if (Array.isArray(images)) {
    parsedImages = images.filter((img) => typeof img === 'string' && img.length > 0);
  } else if (typeof images === 'string') {
    try {
      // Try to parse as JSON string / JSON string kimi parse etməyə çalış
      if (images.startsWith('[') || images.startsWith('"')) {
        const parsed = JSON.parse(images);
        parsedImages = Array.isArray(parsed) ? parsed : [parsed];
      } else {
        // Single image URL / Tək şəkil URL-i
        parsedImages = [images];
      }
    } catch {
      // If parsing fails, treat as single image URL / Parse uğursuz olarsa, tək şəkil URL-i kimi qəbul et
      parsedImages = [images];
    }
  }
  
  // Filter out empty strings and ensure we have at least one image
  // Boş sətirləri filtrlə və ən azı bir şəkil olduğundan əmin ol
  parsedImages = parsedImages.filter((img) => img && img.trim().length > 0);
  
  return parsedImages.length > 0 ? parsedImages : ['/placeholder-product.jpg'];
}

/**
 * Calculate average rating from reviews
 * Rəylərdən orta reytinqi hesabla
 */
export function calculateAverageRating(reviews: Array<{ rating: number }>): number {
  if (!reviews || reviews.length === 0) {
    return 0;
  }
  
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  const average = sum / reviews.length;
  
  // Round to 1 decimal place / 1 onluq yerə yuvarla
  return Math.round(average * 10) / 10;
}

