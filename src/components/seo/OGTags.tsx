/**
 * Open Graph Tags Component / Open Graph Tag-ləri Komponenti
 * Renders Open Graph meta tags
 * Open Graph meta tag-lərini render edir
 */

import { generateOGTags } from '@/lib/seo/og-tags';
import { SEOMetadata } from '@/lib/seo/seo';

interface OGTagsProps extends SEOMetadata {
  imageWidth?: number;
  imageHeight?: number;
  imageAlt?: string;
  alternateLocales?: string[];
  productPrice?: number;
  productCurrency?: string;
  productAvailability?: 'in stock' | 'out of stock' | 'preorder';
}

export function OGTags(props: OGTagsProps) {
  const tags = generateOGTags(props);

  return (
    <>
      {Object.entries(tags).map(([key, value]) => {
        if (Array.isArray(value)) {
          return value.map((item, index) => (
            <meta key={`${key}-${index}`} property={key} content={item} />
          ));
        }
        return <meta key={key} property={key} content={String(value)} />;
      })}
    </>
  );
}

