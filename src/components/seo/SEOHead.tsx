/**
 * SEO Head Component / SEO Head Komponenti
 * Provides SEO meta tags and structured data
 * SEO meta tag-ləri və structured data təmin edir
 */

"use client";

import { useEffect } from 'react';
import type { SEOMetadata } from '@/lib/seo/seo';
import {
  generateProductStructuredData,
  generateOrganizationStructuredData,
  generateBreadcrumbStructuredData,
  generateWebsiteStructuredData,
  generateOpenGraphTags,
  generateTwitterCardTags,
} from '@/lib/seo/seo';

interface SEOHeadProps {
  metadata: SEOMetadata;
  structuredData?: {
    type: 'product' | 'organization' | 'breadcrumb' | 'website';
    data: any;
  }[];
}

export function SEOHead({ metadata, structuredData }: SEOHeadProps) {
  useEffect(() => {
    // Update document title / Sənəd başlığını yenilə
    if (metadata.title) {
      document.title = metadata.title;
    }

    // Update meta description / Meta description-u yenilə
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', metadata.description);

    // Update keywords / Açar sözləri yenilə
    if (metadata.keywords && metadata.keywords.length > 0) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', metadata.keywords.join(', '));
    }

    // Update canonical URL / Canonical URL-i yenilə
    if (metadata.canonicalUrl) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', metadata.canonicalUrl);
    }

    // Update Open Graph tags / Open Graph tag-lərini yenilə
    const ogTags = generateOpenGraphTags(metadata);
    Object.entries(ogTags).forEach(([property, content]) => {
      let ogTag = document.querySelector(`meta[property="${property}"]`);
      if (!ogTag) {
        ogTag = document.createElement('meta');
        ogTag.setAttribute('property', property);
        document.head.appendChild(ogTag);
      }
      ogTag.setAttribute('content', content);
    });

    // Update Twitter Card tags / Twitter Card tag-lərini yenilə
    const twitterTags = generateTwitterCardTags(metadata);
    Object.entries(twitterTags).forEach(([name, content]) => {
      let twitterTag = document.querySelector(`meta[name="${name}"]`);
      if (!twitterTag) {
        twitterTag = document.createElement('meta');
        twitterTag.setAttribute('name', name);
        document.head.appendChild(twitterTag);
      }
      twitterTag.setAttribute('content', content);
    });
  }, [metadata]);

  // Render structured data / Structured data render et
  return (
    <>
      {structuredData?.map((item, index) => {
        let jsonLd: object;

        switch (item.type) {
          case 'product':
            jsonLd = generateProductStructuredData(item.data);
            break;
          case 'organization':
            jsonLd = generateOrganizationStructuredData(item.data);
            break;
          case 'breadcrumb':
            jsonLd = generateBreadcrumbStructuredData(item.data);
            break;
          case 'website':
            jsonLd = generateWebsiteStructuredData(item.data);
            break;
          default:
            jsonLd = item.data;
        }

        return (
          <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        );
      })}
    </>
  );
}

