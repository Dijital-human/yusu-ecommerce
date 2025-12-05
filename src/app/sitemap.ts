/**
 * Sitemap Generator / Sitemap Generator
 * Generates sitemap.xml for SEO
 * SEO üçün sitemap.xml yaradır
 */

import { MetadataRoute } from 'next';
import { generateCompleteSitemap } from '@/lib/seo/sitemap-generator';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://ulustore.com';

  // Generate complete sitemap using enhanced generator / Təkmilləşdirilmiş generator istifadə edərək tam sitemap yarat
  const entries = await generateCompleteSitemap({
    baseUrl,
    includeProducts: true,
    includeCategories: true,
    includeStaticPages: true,
    maxEntriesPerSitemap: 50000, // Max entries per sitemap / Sitemap başına maksimum qeyd
  });

  // Convert to Next.js MetadataRoute.Sitemap format / Next.js MetadataRoute.Sitemap formatına çevir
  return entries.map((entry) => ({
    url: entry.url,
    lastModified: entry.lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}

