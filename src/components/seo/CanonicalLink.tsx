/**
 * Canonical Link Component / Canonical Link Komponenti
 * Renders canonical link tag
 * Canonical link tag-ini render edir
 */

import { getCanonicalUrl } from '@/lib/seo/canonical';

interface CanonicalLinkProps {
  path: string;
  baseUrl?: string;
  includeQueryParams?: boolean;
  queryParams?: Record<string, string>;
}

export function CanonicalLink(props: CanonicalLinkProps) {
  const canonicalUrl = getCanonicalUrl(props.path, {
    baseUrl: props.baseUrl,
    includeQueryParams: props.includeQueryParams,
    queryParams: props.queryParams,
  });

  return <link rel="canonical" href={canonicalUrl} />;
}

