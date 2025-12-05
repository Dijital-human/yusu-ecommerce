/**
 * Canonical URL Service / Canonical URL Xidməti
 * Provides canonical URL generation and duplicate content detection
 * Canonical URL yaratma və dublikat məzmun aşkarlaması təmin edir
 */

/**
 * Generate canonical URL / Canonical URL yarat
 */
export function generateCanonicalUrl(path: string, baseUrl?: string): string {
  const base = baseUrl || process.env.NEXTAUTH_URL || 'https://ulustore.com';
  
  // Normalize path / Path-i normallaşdır
  const normalizedPath = path
    .replace(/\/+/g, '/') // Remove multiple slashes / Çoxlu slash-ləri sil
    .replace(/\/$/, '') // Remove trailing slash / Son slash-i sil
    || '/';
  
  // Remove query parameters for canonical / Canonical üçün query parametrlərini sil
  const cleanPath = normalizedPath.split('?')[0];
  
  return `${base}${cleanPath}`;
}

/**
 * Detect duplicate content URLs / Dublikat məzmun URL-lərini aşkar et
 */
export function detectDuplicateUrls(urls: string[]): Map<string, string[]> {
  const duplicates = new Map<string, string[]>();
  
  // Group URLs by normalized path / URL-ləri normallaşdırılmış path-ə görə qruplaşdır
  const urlGroups = new Map<string, string[]>();
  
  urls.forEach(url => {
    const normalized = normalizeUrl(url);
    if (!urlGroups.has(normalized)) {
      urlGroups.set(normalized, []);
    }
    urlGroups.get(normalized)!.push(url);
  });
  
  // Find groups with multiple URLs / Çoxlu URL-ləri olan qrupları tap
  urlGroups.forEach((group, normalized) => {
    if (group.length > 1) {
      duplicates.set(normalized, group);
    }
  });
  
  return duplicates;
}

/**
 * Normalize URL for comparison / Müqayisə üçün URL-i normallaşdır
 */
function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    
    // Remove query parameters / Query parametrlərini sil
    urlObj.search = '';
    
    // Remove hash / Hash-i sil
    urlObj.hash = '';
    
    // Normalize path / Path-i normallaşdır
    urlObj.pathname = urlObj.pathname
      .replace(/\/+/g, '/')
      .replace(/\/$/, '') || '/';
    
    return urlObj.toString().toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

/**
 * Get canonical URL for a page / Səhifə üçün canonical URL al
 */
export function getCanonicalUrl(
  path: string,
  options?: {
    baseUrl?: string;
    includeQueryParams?: boolean;
    queryParams?: Record<string, string>;
  }
): string {
  const { baseUrl, includeQueryParams = false, queryParams } = options || {};
  
  let canonical = generateCanonicalUrl(path, baseUrl);
  
  // Add query parameters if needed / Lazım olsa query parametrləri əlavə et
  if (includeQueryParams && queryParams) {
    const params = new URLSearchParams(queryParams);
    canonical = `${canonical}?${params.toString()}`;
  }
  
  return canonical;
}

