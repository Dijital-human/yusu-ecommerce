/**
 * CMS Page Content Component / CMS Səhifə Məzmunu Komponenti
 * Renders CMS page content with proper styling
 * CMS səhifə məzmununu düzgün stil ilə render edir
 */

"use client";

interface CMSPageContentProps {
  page: {
    id: string;
    slug: string;
    title: string;
    content: string;
    metaTitle?: string;
    metaDescription?: string;
  };
}

export function CMSPageContent({ page }: CMSPageContentProps) {
  return (
    <div className="min-h-screen bg-white">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Page Header / Səhifə Başlığı */}
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {page.title}
          </h1>
        </header>

        {/* Page Content / Səhifə Məzmunu */}
        <div
          className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </article>
    </div>
  );
}

