/**
 * Image Zoom Helper / Şəkil Zoom Köməkçisi
 * Helper functions for image zoom functionality / Şəkil zoom funksionallığı üçün köməkçi funksiyalar
 */

/**
 * Calculate zoom transform / Zoom transform hesabla
 */
export function calculateZoomTransform(
  imageRect: DOMRect,
  containerRect: DOMRect,
  scale: number,
  x: number,
  y: number
): { transform: string; origin: string } {
  const maxScale = 5; // Maximum zoom level / Maksimum zoom səviyyəsi
  const minScale = 1; // Minimum zoom level / Minimum zoom səviyyəsi
  
  const clampedScale = Math.max(minScale, Math.min(maxScale, scale));
  
  // Calculate bounds / Hədləri hesabla
  const scaledWidth = imageRect.width * clampedScale;
  const scaledHeight = imageRect.height * clampedScale;
  
  const maxX = Math.max(0, (scaledWidth - containerRect.width) / 2);
  const maxY = Math.max(0, (scaledHeight - containerRect.height) / 2);
  
  const clampedX = Math.max(-maxX, Math.min(maxX, x));
  const clampedY = Math.max(-maxY, Math.min(maxY, y));
  
  return {
    transform: `scale(${clampedScale}) translate(${clampedX / clampedScale}px, ${clampedY / clampedScale}px)`,
    origin: 'center center',
  };
}

/**
 * Get zoom level from wheel event / Wheel hadisəsindən zoom səviyyəsini al
 */
export function getZoomFromWheel(deltaY: number, currentScale: number): number {
  const zoomSpeed = 0.1;
  const newScale = currentScale - (deltaY * zoomSpeed) / 100;
  return Math.max(1, Math.min(5, newScale));
}

/**
 * Get image position from mouse / Siçandan şəkil mövqeyini al
 */
export function getImagePositionFromMouse(
  event: MouseEvent,
  containerRect: DOMRect,
  imageRect: DOMRect,
  currentX: number,
  currentY: number,
  scale: number
): { x: number; y: number } {
  const mouseX = event.clientX - containerRect.left;
  const mouseY = event.clientY - containerRect.top;
  
  const imageX = (mouseX - containerRect.width / 2) / scale;
  const imageY = (mouseY - containerRect.height / 2) / scale;
  
  return {
    x: currentX - imageX,
    y: currentY - imageY,
  };
}

