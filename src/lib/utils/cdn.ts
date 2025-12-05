/**
 * CDN Utility / CDN Utility-si
 * Provides CDN URL generation and image optimization helpers
 * CDN URL generasiyası və şəkil optimizasiyası köməkçiləri təmin edir
 */

import { logger } from './logger';
import { createClient } from '@supabase/supabase-js';

/**
 * Get CDN URL for a given path / Verilmiş yol üçün CDN URL-i al
 * If CDN is not configured, returns the original path / Əgər CDN konfiqurasiya edilməyibsə, orijinal yolu qaytarır
 */
export function getCDNUrl(path: string): string {
  // Remove leading slash if present / Əgər varsa başlanğıc slash-i sil
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // Check if CDN URL is configured / CDN URL-in konfiqurasiya edilib-edilmədiyini yoxla
  const cdnUrl = process.env.CDN_URL;
  
  if (!cdnUrl) {
    // If CDN is not configured, return original path / Əgər CDN konfiqurasiya edilməyibsə, orijinal yolu qaytar
    return `/${cleanPath}`;
  }

  // Remove trailing slash from CDN URL if present / Əgər varsa CDN URL-dən son slash-i sil
  const cleanCdnUrl = cdnUrl.endsWith('/') ? cdnUrl.slice(0, -1) : cdnUrl;

  // Return CDN URL with path / CDN URL-i path ilə qaytar
  return `${cleanCdnUrl}/${cleanPath}`;
}

/**
 * Check if CDN is enabled / CDN-in aktiv olub-olmadığını yoxla
 */
export function isCDNEnabled(): boolean {
  return !!process.env.CDN_URL && process.env.CDN_ENABLED === 'true';
}

/**
 * Get optimized image URL / Optimizasiya edilmiş şəkil URL-i al
 * Supports different image sizes and formats / Müxtəlif şəkil ölçüləri və formatları dəstəkləyir
 */
export function getOptimizedImageUrl(
  path: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpeg' | 'png';
  }
): string {
  const baseUrl = getCDNUrl(path);

  // If no options provided, return base URL / Əgər seçimlər verilməyibsə, əsas URL-i qaytar
  if (!options) {
    return baseUrl;
  }

  // Build query parameters / Sorğu parametrlərini qur
  const params = new URLSearchParams();

  if (options.width) {
    params.append('w', options.width.toString());
  }

  if (options.height) {
    params.append('h', options.height.toString());
  }

  if (options.quality) {
    params.append('q', options.quality.toString());
  }

  if (options.format) {
    params.append('f', options.format);
  }

  // If CDN supports image optimization, append parameters / Əgər CDN şəkil optimizasiyasını dəstəkləyirsə, parametrləri əlavə et
  // Otherwise, return base URL / Əks halda, əsas URL-i qaytar
  if (params.toString()) {
    return `${baseUrl}?${params.toString()}`;
  }

  return baseUrl;
}

/**
 * Get thumbnail URL for an image / Şəkil üçün thumbnail URL-i al
 */
export function getThumbnailUrl(path: string, size: number = 200): string {
  return getOptimizedImageUrl(path, {
    width: size,
    height: size,
    quality: 80,
    format: 'webp',
  });
}

/**
 * Get product image URL / Məhsul şəkil URL-i al
 */
export function getProductImageUrl(path: string, size?: 'small' | 'medium' | 'large'): string {
  const sizes = {
    small: { width: 300, height: 300 },
    medium: { width: 600, height: 600 },
    large: { width: 1200, height: 1200 },
  };

  const sizeConfig = size ? sizes[size] : sizes.medium;

  return getOptimizedImageUrl(path, {
    ...sizeConfig,
    quality: 85,
    format: 'webp',
  });
}

/**
 * Get CDN provider type / CDN provider növünü al
 */
function getCDNProvider(): 'supabase' | 's3' | 'r2' | 'cloudinary' | 'none' {
  const provider = process.env.CDN_PROVIDER?.toLowerCase() || 'supabase';
  
  if (provider === 'supabase' && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return 'supabase';
  }
  if (provider === 's3' && process.env.AWS_S3_BUCKET) {
    return 's3';
  }
  if (provider === 'r2' && process.env.CLOUDFLARE_R2_BUCKET) {
    return 'r2';
  }
  if (provider === 'cloudinary' && process.env.CLOUDINARY_CLOUD_NAME) {
    return 'cloudinary';
  }
  
  return 'none';
}

/**
 * Upload file to Supabase Storage / Faylı Supabase Storage-a yüklə
 */
async function uploadToSupabase(
  file: Buffer | string,
  path: string,
  options?: {
    contentType?: string;
    public?: boolean;
  }
): Promise<string> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'product-media';

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration not found / Supabase konfiqurasiyası tapılmadı');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const fileBuffer = typeof file === 'string' ? Buffer.from(file) : file;

  // Remove leading slash from path / Path-dən başlanğıc slash-i sil
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(cleanPath, fileBuffer, {
      contentType: options?.contentType || 'application/octet-stream',
      upsert: false,
      cacheControl: '3600',
    });

  if (error) {
    logger.error('Supabase upload failed / Supabase yükləmə uğursuz oldu', error, { path });
    throw new Error(`Supabase upload failed: ${error.message} / Supabase yükləmə uğursuz oldu: ${error.message}`);
  }

  // Get public URL / Public URL al
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(cleanPath);

  return urlData.publicUrl;
}

/**
 * Upload file to AWS S3 / Faylı AWS S3-ə yüklə
 */
async function uploadToS3(
  file: Buffer | string,
  path: string,
  options?: {
    contentType?: string;
    public?: boolean;
  }
): Promise<string> {
  // AWS S3 SDK is not installed, return error / AWS S3 SDK quraşdırılmayıb, xəta qaytar
  logger.warn('AWS S3 SDK not installed. Install @aws-sdk/client-s3 to use S3 storage / AWS S3 SDK quraşdırılmayıb. S3 storage istifadə etmək üçün @aws-sdk/client-s3 quraşdırın', { path });
  throw new Error('AWS S3 SDK not installed / AWS S3 SDK quraşdırılmayıb');
}

/**
 * Upload file to Cloudflare R2 / Faylı Cloudflare R2-ə yüklə
 */
async function uploadToR2(
  file: Buffer | string,
  path: string,
  options?: {
    contentType?: string;
    public?: boolean;
  }
): Promise<string> {
  // Cloudflare R2 uses S3-compatible API / Cloudflare R2 S3-uyğun API istifadə edir
  logger.warn('Cloudflare R2 SDK not installed. Install @aws-sdk/client-s3 to use R2 storage / Cloudflare R2 SDK quraşdırılmayıb. R2 storage istifadə etmək üçün @aws-sdk/client-s3 quraşdırın', { path });
  throw new Error('Cloudflare R2 SDK not installed / Cloudflare R2 SDK quraşdırılmayıb');
}

/**
 * Upload file to CDN / Faylı CDN-ə yüklə
 * Supports Supabase Storage, AWS S3, Cloudflare R2, and Cloudinary
 * Supabase Storage, AWS S3, Cloudflare R2 və Cloudinary dəstəkləyir
 */
export async function uploadToCDN(
  file: Buffer | string,
  path: string,
  options?: {
    contentType?: string;
    public?: boolean;
  }
): Promise<string> {
  const provider = getCDNProvider();

  if (provider === 'none') {
    logger.warn('CDN provider not configured. File upload skipped / CDN provider konfiqurasiya edilməyib. Fayl yükləmə atlandı', { path });
    throw new Error('CDN provider not configured / CDN provider konfiqurasiya edilməyib');
  }

  try {
    switch (provider) {
      case 'supabase':
        return await uploadToSupabase(file, path, options);
      case 's3':
        return await uploadToS3(file, path, options);
      case 'r2':
        return await uploadToR2(file, path, options);
      case 'cloudinary':
        logger.warn('Cloudinary upload not implemented yet / Cloudinary yükləmə hələ tətbiq edilməyib', { path });
        throw new Error('Cloudinary upload not implemented / Cloudinary yükləmə tətbiq edilməyib');
      default:
        throw new Error(`Unsupported CDN provider: ${provider} / Dəstəklənməyən CDN provider: ${provider}`);
    }
  } catch (error) {
    logger.error('CDN upload failed / CDN yükləmə uğursuz oldu', error instanceof Error ? error : new Error(String(error)), { path, provider });
    throw error;
  }
}

/**
 * Delete file from Supabase Storage / Faylı Supabase Storage-dan sil
 */
async function deleteFromSupabase(path: string): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'product-media';

  if (!supabaseUrl || !supabaseKey) {
    logger.warn('Supabase configuration not found. File deletion skipped / Supabase konfiqurasiyası tapılmadı. Fayl silmə atlandı', { path });
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  const { error } = await supabase.storage
    .from(bucket)
    .remove([cleanPath]);

  if (error) {
    logger.error('Supabase deletion failed / Supabase silmə uğursuz oldu', error, { path });
    throw new Error(`Supabase deletion failed: ${error.message} / Supabase silmə uğursuz oldu: ${error.message}`);
  }
}

/**
 * Delete file from CDN / Faylı CDN-dən sil
 */
export async function deleteFromCDN(path: string): Promise<void> {
  const provider = getCDNProvider();

  if (provider === 'none') {
    logger.warn('CDN provider not configured. File deletion skipped / CDN provider konfiqurasiya edilməyib. Fayl silmə atlandı', { path });
    return;
  }

  try {
    switch (provider) {
      case 'supabase':
        await deleteFromSupabase(path);
        break;
      case 's3':
      case 'r2':
      case 'cloudinary':
        logger.warn(`Delete not implemented for provider: ${provider} / Provider üçün silmə tətbiq edilməyib: ${provider}`, { path });
        break;
      default:
        logger.warn(`Unsupported CDN provider: ${provider} / Dəstəklənməyən CDN provider: ${provider}`, { path });
    }
  } catch (error) {
    logger.error('CDN deletion failed / CDN silmə uğursuz oldu', error instanceof Error ? error : new Error(String(error)), { path, provider });
    throw error;
  }
}

/**
 * Check if file exists in Supabase Storage / Faylın Supabase Storage-da mövcud olub-olmadığını yoxla
 */
async function fileExistsInSupabase(path: string): Promise<boolean> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'product-media';

  if (!supabaseUrl || !supabaseKey) {
    return false;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  const { data, error } = await supabase.storage
    .from(bucket)
    .list(cleanPath.split('/').slice(0, -1).join('/') || '', {
      search: cleanPath.split('/').pop() || '',
    });

  if (error) {
    logger.error('Supabase file existence check failed / Supabase fayl mövcudluğu yoxlaması uğursuz oldu', error, { path });
    return false;
  }

  return (data || []).some(file => file.name === cleanPath.split('/').pop());
}

/**
 * Check if file exists in CDN / Faylın CDN-də mövcud olub-olmadığını yoxla
 */
export async function fileExistsInCDN(path: string): Promise<boolean> {
  const provider = getCDNProvider();

  if (provider === 'none') {
    return false;
  }

  try {
    switch (provider) {
      case 'supabase':
        return await fileExistsInSupabase(path);
      case 's3':
      case 'r2':
      case 'cloudinary':
        logger.warn(`File existence check not implemented for provider: ${provider} / Provider üçün fayl mövcudluğu yoxlaması tətbiq edilməyib: ${provider}`, { path });
        return false;
      default:
        return false;
    }
  } catch (error) {
    logger.error('CDN file existence check failed / CDN fayl mövcudluğu yoxlaması uğursuz oldu', error instanceof Error ? error : new Error(String(error)), { path, provider });
    return false;
  }
}

