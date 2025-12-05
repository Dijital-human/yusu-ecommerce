/**
 * SEO Service / SEO Xidməti
 * Provides SEO utilities for meta tags, structured data, and sitemap generation
 * Meta tag-lər, structured data və sitemap yaratma üçün SEO utility-ləri təmin edir
 */

import { Metadata } from 'next';

/**
 * SEO metadata interface / SEO metadata interfeysi
 */
export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product' | 'category';
  locale?: string;
  siteName?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  canonicalUrl?: string;
}

/**
 * Generate metadata for Next.js / Next.js üçün metadata yarat
 * Enhanced with better character limits and optimization / Daha yaxşı simvol limitləri və optimallaşdırma ilə təkmilləşdirilmiş
 */
export function generateMetadata(seo: SEOMetadata): Metadata {
  const {
    title,
    description,
    keywords,
    image,
    url,
    type = 'website',
    locale = 'en_US',
    siteName = 'Yusu E-commerce',
    author,
    publishedTime,
    modifiedTime,
    canonicalUrl,
  } = seo;

  // Optimize title (max 60 characters) / Başlığı optimallaşdır (maksimum 60 simvol)
  const optimizedTitle = title.length > 60 ? `${title.substring(0, 57)}...` : title;
  
  // Optimize description (max 160 characters) / Təsviri optimallaşdır (maksimum 160 simvol)
  const optimizedDescription = description.length > 160 
    ? `${description.substring(0, 157)}...` 
    : description;

  // Map custom types to OpenGraph supported types / Xüsusi tipləri OpenGraph dəstəklənən tiplərə map et
  const ogType = type === 'product' || type === 'category' ? 'website' : type;

  const metadata: Metadata = {
    title: optimizedTitle,
    description: optimizedDescription,
    keywords: keywords?.join(', '),
    authors: author ? [{ name: author }] : undefined,
    openGraph: {
      title: optimizedTitle,
      description: optimizedDescription,
      url,
      siteName,
      images: image ? [{ 
        url: image,
        width: 1200,
        height: 630,
        alt: title,
      }] : undefined,
      locale,
      type: ogType,
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      title: optimizedTitle,
      description: optimizedDescription,
      images: image ? [image] : undefined,
    },
    alternates: {
      canonical: canonicalUrl || url,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };

  return metadata;
}

/**
 * Generate structured data (JSON-LD) for products / Məhsullar üçün structured data (JSON-LD) yarat
 */
export function generateProductStructuredData(product: {
  id: string;
  name: string;
  description: string;
  price: number;
  currency?: string;
  images?: string[];
  category?: string;
  brand?: string;
  availability?: 'in stock' | 'out of stock' | 'preorder';
  rating?: number;
  reviewCount?: number;
  url?: string;
}): object {
  const {
    id,
    name,
    description,
    price,
    currency = 'USD',
    images = [],
    category,
    brand,
    availability = 'in stock',
    rating,
    reviewCount,
    url,
  } = product;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': id,
    name,
    description,
    image: images,
    category,
    brand: brand ? {
      '@type': 'Brand',
      name: brand,
    } : undefined,
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: currency,
      availability: `https://schema.org/${availability === 'in stock' ? 'InStock' : availability === 'out of stock' ? 'OutOfStock' : 'PreOrder'}`,
      url,
    },
    ...(rating && reviewCount && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: rating,
        reviewCount,
      },
    }),
  };
}

/**
 * Generate structured data (JSON-LD) for organization / Təşkilat üçün structured data (JSON-LD) yarat
 */
export function generateOrganizationStructuredData(org: {
  name: string;
  url: string;
  logo?: string;
  contactPoint?: {
    telephone?: string;
    contactType?: string;
    email?: string;
  };
  sameAs?: string[];
}): object {
  const { name, url, logo, contactPoint, sameAs } = org;

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo,
    ...(contactPoint && {
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: contactPoint.telephone,
        contactType: contactPoint.contactType,
        email: contactPoint.email,
      },
    }),
    ...(sameAs && { sameAs }),
  };
}

/**
 * Generate structured data (JSON-LD) for breadcrumbs / Breadcrumb-lər üçün structured data (JSON-LD) yarat
 */
export function generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate structured data (JSON-LD) for website / Vebsayt üçün structured data (JSON-LD) yarat
 */
export function generateWebsiteStructuredData(site: {
  name: string;
  url: string;
  potentialAction?: {
    target: string;
    queryInput: string;
  };
}): object {
  const { name, url, potentialAction } = site;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    ...(potentialAction && {
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: potentialAction.target,
        },
        'query-input': potentialAction.queryInput,
      },
    }),
  };
}

/**
 * Generate structured data (JSON-LD) for reviews / Rəylər üçün structured data (JSON-LD) yarat
 */
export function generateReviewStructuredData(review: {
  author: string;
  rating: number;
  reviewBody: string;
  datePublished: string;
  itemReviewed: {
    name: string;
    url?: string;
  };
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: review.author,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody: review.reviewBody,
    datePublished: review.datePublished,
    itemReviewed: {
      '@type': 'Product',
      name: review.itemReviewed.name,
      ...(review.itemReviewed.url && { url: review.itemReviewed.url }),
    },
  };
}

/**
 * Generate structured data (JSON-LD) for FAQ / FAQ üçün structured data (JSON-LD) yarat
 */
export function generateFAQStructuredData(faqs: Array<{ question: string; answer: string }>): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate robots.txt content / Robots.txt məzmunu yarat
 */
export function generateRobotsTxt(options?: {
  allow?: string[];
  disallow?: string[];
  sitemap?: string;
  crawlDelay?: number;
}): string {
  const {
    allow = ['/'],
    disallow = ['/api/', '/admin/', '/_next/'],
    sitemap,
    crawlDelay,
  } = options || {};

  let content = 'User-agent: *\n';

  allow.forEach(path => {
    content += `Allow: ${path}\n`;
  });

  disallow.forEach(path => {
    content += `Disallow: ${path}\n`;
  });

  if (crawlDelay) {
    content += `Crawl-delay: ${crawlDelay}\n`;
  }

  if (sitemap) {
    content += `\nSitemap: ${sitemap}\n`;
  }

  return content;
}

/**
 * Generate canonical URL / Canonical URL yarat
 */
export function generateCanonicalUrl(path: string, baseUrl?: string): string {
  const base = baseUrl || process.env.NEXTAUTH_URL || 'https://ulustore.com';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

/**
 * Generate Open Graph tags / Open Graph tag-ləri yarat
 */
export function generateOpenGraphTags(seo: SEOMetadata): Record<string, string> {
  const {
    title,
    description,
    image,
    url,
    type = 'website',
    locale = 'en_US',
    siteName = 'Yusu E-commerce',
    publishedTime,
    modifiedTime,
  } = seo;

  const tags: Record<string, string> = {
    'og:title': title,
    'og:description': description,
    'og:type': type,
    'og:locale': locale,
    'og:site_name': siteName,
  };

  if (url) tags['og:url'] = url;
  if (image) tags['og:image'] = image;
  if (publishedTime) tags['article:published_time'] = publishedTime;
  if (modifiedTime) tags['article:modified_time'] = modifiedTime;

  return tags;
}

/**
 * Generate Twitter Card tags / Twitter Card tag-ləri yarat
 */
export function generateTwitterCardTags(seo: SEOMetadata, cardType: 'summary' | 'summary_large_image' = 'summary_large_image'): Record<string, string> {
  const { title, description, image } = seo;

  const tags: Record<string, string> = {
    'twitter:card': cardType,
    'twitter:title': title,
    'twitter:description': description,
  };

  if (image) tags['twitter:image'] = image;

  return tags;
}

