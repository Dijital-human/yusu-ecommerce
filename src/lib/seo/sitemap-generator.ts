/**
 * Sitemap Generator Service / Sitemap Generator Xidməti
 * Enhanced sitemap generation with multiple sitemaps support
 * Çoxlu sitemap dəstəyi ilə təkmilləşdirilmiş sitemap yaratma
 */

import { prisma } from '@/lib/db';

export interface SitemapEntry {
  url: string;
  lastModified: Date;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

export interface SitemapConfig {
  baseUrl: string;
  maxEntriesPerSitemap?: number;
  includeProducts?: boolean;
  includeCategories?: boolean;
  includeBlogPosts?: boolean;
  includeStaticPages?: boolean;
}

/**
 * Generate sitemap entries for products / Məhsullar üçün sitemap qeydləri yarat
 */
export async function generateProductSitemapEntries(
  baseUrl: string,
  limit?: number
): Promise<SitemapEntry[]> {
  const products = await prisma.products.findMany({
    where: {
      isActive: true,
      isPublished: true,
      isApproved: true,
    },
    select: {
      id: true,
      updatedAt: true,
    },
    take: limit || 50000,
    orderBy: {
      updatedAt: 'desc',
    },
  });

  return products.map((product) => ({
    url: `${baseUrl}/products/${product.id}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));
}

/**
 * Generate sitemap entries for categories / Kateqoriyalar üçün sitemap qeydləri yarat
 */
export async function generateCategorySitemapEntries(
  baseUrl: string
): Promise<SitemapEntry[]> {
  const categories = await prisma.categories.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      updatedAt: true,
    },
  });

  return categories.map((category) => ({
    url: `${baseUrl}/categories/${category.id}`,
    lastModified: category.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));
}

/**
 * Generate static pages sitemap entries / Statik səhifələr üçün sitemap qeydləri yarat
 */
export function generateStaticPagesSitemapEntries(baseUrl: string): SitemapEntry[] {
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];
}

/**
 * Generate sitemap index / Sitemap index yarat
 */
export function generateSitemapIndex(
  baseUrl: string,
  sitemapUrls: string[]
): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  sitemapUrls.forEach((url) => {
    xml += '  <sitemap>\n';
    xml += `    <loc>${url}</loc>\n`;
    xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
    xml += '  </sitemap>\n';
  });

  xml += '</sitemapindex>';
  return xml;
}

/**
 * Generate complete sitemap / Tam sitemap yarat
 */
export async function generateCompleteSitemap(
  config: SitemapConfig
): Promise<SitemapEntry[]> {
  const {
    baseUrl,
    includeProducts = true,
    includeCategories = true,
    includeStaticPages = true,
  } = config;

  const entries: SitemapEntry[] = [];

  if (includeStaticPages) {
    entries.push(...generateStaticPagesSitemapEntries(baseUrl));
  }

  if (includeCategories) {
    entries.push(...(await generateCategorySitemapEntries(baseUrl)));
  }

  if (includeProducts) {
    entries.push(...(await generateProductSitemapEntries(baseUrl, config.maxEntriesPerSitemap)));
  }

  return entries;
}

/**
 * Split sitemap into multiple sitemaps if needed / Lazım olsa sitemap-i çoxlu sitemap-lərə böl
 */
export function splitSitemap(
  entries: SitemapEntry[],
  maxEntriesPerSitemap: number = 50000
): SitemapEntry[][] {
  const sitemaps: SitemapEntry[][] = [];

  for (let i = 0; i < entries.length; i += maxEntriesPerSitemap) {
    sitemaps.push(entries.slice(i, i + maxEntriesPerSitemap));
  }

  return sitemaps;
}

