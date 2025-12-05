/**
 * Custom HTML Section Component / Xüsusi HTML Bölməsi Komponenti
 * Renders custom HTML content
 * Xüsusi HTML məzmununu render edir
 */

"use client";

interface CustomHTMLSectionProps {
  title?: string;
  subtitle?: string;
  content?: any;
}

export function CustomHTMLSection({
  title,
  subtitle,
  content,
}: CustomHTMLSectionProps) {
  if (!content) return null;

  const htmlContent = typeof content === "string" ? content : content.html || "";

  if (!htmlContent) return null;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg text-gray-600">{subtitle}</p>
            )}
          </div>
        )}

        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    </section>
  );
}

