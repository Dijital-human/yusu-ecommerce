/**
 * Robots.txt Generator / Robots.txt Generator
 * Generates robots.txt for SEO
 * SEO üçün robots.txt yaradır
 */

import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://ulustore.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: ['/api/', '/admin/', '/_next/', '/auth/', '/private/'],
      },
      {
        // Googlebot specific rules / Googlebot üçün xüsusi qaydalar
        userAgent: 'Googlebot',
        allow: ['/'],
        disallow: ['/api/', '/admin/', '/_next/', '/auth/', '/private/'],
        crawlDelay: 1,
      },
      {
        // Bingbot specific rules / Bingbot üçün xüsusi qaydalar
        userAgent: 'Bingbot',
        allow: ['/'],
        disallow: ['/api/', '/admin/', '/_next/', '/auth/', '/private/'],
        crawlDelay: 2,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

