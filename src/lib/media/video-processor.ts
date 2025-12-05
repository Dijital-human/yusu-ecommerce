/**
 * Video Processor / Video Emalçı
 * Helper functions for video processing / Video emalı üçün köməkçi funksiyalar
 */

/**
 * Validate video file / Video faylını yoxla
 */
export function validateVideoFile(file: File): { valid: boolean; error?: string } {
  // Check file size (100MB limit) / Fayl ölçüsünü yoxla (100MB limit)
  const maxSize = 100 * 1024 * 1024; // 100MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Video file size must be less than 100MB / Video fayl ölçüsü 100MB-dan kiçik olmalıdır',
    };
  }

  // Check file type / Fayl tipini yoxla
  const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Video format must be MP4, WebM, or QuickTime / Video formatı MP4, WebM və ya QuickTime olmalıdır',
    };
  }

  return { valid: true };
}

/**
 * Get video duration / Video müddətini al
 * Note: This requires browser API / Qeyd: Bu brauzer API tələb edir
 */
export function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };

    video.onerror = () => {
      window.URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video metadata / Video metadata yükləmək uğursuz oldu'));
    };

    video.src = URL.createObjectURL(file);
  });
}

/**
 * Generate video thumbnail / Video thumbnail yarat
 * Note: This requires browser API / Qeyd: Bu brauzer API tələb edir
 */
export function generateVideoThumbnail(file: File, time: number = 1): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available / Canvas context mövcud deyil'));
      return;
    }

    video.onloadedmetadata = () => {
      // Set canvas size / Canvas ölçüsünü təyin et
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Seek to specific time / Müəyyən zamana keç
      video.currentTime = Math.min(time, video.duration);
    };

    video.onseeked = () => {
      // Draw frame to canvas / Kadrı canvas-ə çək
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to data URL / Data URL-ə çevir
      const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
      window.URL.revokeObjectURL(video.src);
      resolve(thumbnailUrl);
    };

    video.onerror = () => {
      window.URL.revokeObjectURL(video.src);
      reject(new Error('Failed to generate thumbnail / Thumbnail yaratmaq uğursuz oldu'));
    };

    video.src = URL.createObjectURL(file);
  });
}

/**
 * Format video duration / Video müddətini formatla
 */
export function formatVideoDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get video file info / Video fayl məlumatını al
 */
export async function getVideoFileInfo(file: File): Promise<{
  duration: number;
  thumbnail: string;
  size: number;
  type: string;
}> {
  const duration = await getVideoDuration(file);
  const thumbnail = await generateVideoThumbnail(file);
  
  return {
    duration,
    thumbnail,
    size: file.size,
    type: file.type,
  };
}

