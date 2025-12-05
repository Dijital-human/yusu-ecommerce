/**
 * Open Graph Tags Service / Open Graph Tag-ləri Xidməti
 * Enhanced Open Graph tags generation
 * Təkmilləşdirilmiş Open Graph tag-ləri yaratma
 */

import { SEOMetadata } from './seo';

/**
 * Enhanced Open Graph tags interface / Təkmilləşdirilmiş Open Graph tag-ləri interfeysi
 */
export interface OpenGraphTags {
  'og:title': string;
  'og:description': string;
  'og:type': string;
  'og:url': string;
  'og:image': string;
  'og:image:width'?: number;
  'og:image:height'?: number;
  'og:image:alt'?: string;
  'og:site_name': string;
  'og:locale': string;
  'og:locale:alternate'?: string[];
  'article:published_time'?: string;
  'article:modified_time'?: string;
  'article:author'?: string;
  'article:section'?: string;
  'article:tag'?: string[];
  'product:price:amount'?: string;
  'product:price:currency'?: string;
  'product:availability'?: string;
}

/**
 * Generate enhanced Open Graph tags / Təkmilləşdirilmiş Open Graph tag-ləri yarat
 */
export function generateOGTags(seo: SEOMetadata & {
  imageWidth?: number;
  imageHeight?: number;
  imageAlt?: string;
  alternateLocales?: string[];
  productPrice?: number;
  productCurrency?: string;
  productAvailability?: 'in stock' | 'out of stock' | 'preorder';
}): OpenGraphTags {
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
    author,
    imageWidth,
    imageHeight,
    imageAlt,
    alternateLocales,
    productPrice,
    productCurrency,
    productAvailability,
  } = seo;

  const tags: OpenGraphTags = {
    'og:title': title.substring(0, 60), // Max 60 characters / Maksimum 60 simvol
    'og:description': description.substring(0, 200), // Max 200 characters / Maksimum 200 simvol
    'og:type': type,
    'og:url': url || '',
    'og:image': image || '',
    'og:site_name': siteName,
    'og:locale': locale,
  };

  // Image dimensions / Şəkil ölçüləri
  if (imageWidth) tags['og:image:width'] = imageWidth;
  if (imageHeight) tags['og:image:height'] = imageHeight;
  if (imageAlt) tags['og:image:alt'] = imageAlt;

  // Alternate locales / Alternativ locale-lər
  if (alternateLocales && alternateLocales.length > 0) {
    tags['og:locale:alternate'] = alternateLocales;
  }

  // Article-specific tags / Məqaləyə xas tag-lər
  if (type === 'article') {
    if (publishedTime) tags['article:published_time'] = publishedTime;
    if (modifiedTime) tags['article:modified_time'] = modifiedTime;
    if (author) tags['article:author'] = author;
  }

  // Product-specific tags / Məhsula xas tag-lər
  if (type === 'product') {
    if (productPrice !== undefined) {
      tags['product:price:amount'] = productPrice.toString();
      tags['product:price:currency'] = productCurrency || 'USD';
    }
    if (productAvailability) {
      tags['product:availability'] = productAvailability;
    }
  }

  return tags;
}

/**
 * Generate Open Graph image URL / Open Graph şəkil URL-i yarat
 */
export function generateOGImageUrl(
  baseUrl: string,
  imagePath: string,
  options?: {
    width?: number;
    height?: number;
  }
): string {
  const { width = 1200, height = 630 } = options || {};
  
  // If using an image optimization service, add parameters / Əgər şəkil optimallaşdırma xidməti istifadə edirsinizsə, parametrlər əlavə edin
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  return `${baseUrl}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
}

