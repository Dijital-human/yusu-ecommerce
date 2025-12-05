/**
 * Structured Data Component / Structured Data Komponenti
 * Renders JSON-LD structured data
 * JSON-LD structured data-nı render edir
 */

import {
  generateProductStructuredData,
  generateOrganizationStructuredData,
  generateBreadcrumbStructuredData,
  generateWebsiteStructuredData,
} from '@/lib/seo/seo';

interface StructuredDataProps {
  type: 'product' | 'organization' | 'breadcrumb' | 'website';
  data: any;
}

export function StructuredData({ type, data }: StructuredDataProps) {
  let structuredData: object;

  switch (type) {
    case 'product':
      structuredData = generateProductStructuredData(data);
      break;
    case 'organization':
      structuredData = generateOrganizationStructuredData(data);
      break;
    case 'breadcrumb':
      structuredData = generateBreadcrumbStructuredData(data);
      break;
    case 'website':
      structuredData = generateWebsiteStructuredData(data);
      break;
    default:
      return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

