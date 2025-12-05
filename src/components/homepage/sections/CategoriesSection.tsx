/**
 * Categories Section Component / Kateqoriyalar Bölməsi Komponenti
 * Displays product categories in a grid
 * Məhsul kateqoriyalarını şəbəkədə göstərir
 */

"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { Card, CardContent } from "@/components/ui/Card";
import { Package } from "lucide-react";

interface CategoriesSectionProps {
  title?: string;
  subtitle?: string;
  content?: any;
  config?: any;
}

export function CategoriesSection({
  title,
  subtitle,
  content,
  config,
}: CategoriesSectionProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setIsLoading(true);
        // Fetch categories from API / API-dən kateqoriyaları gətir
        const response = await fetch("/api/categories?limit=12");
        if (response.ok) {
          const data = await response.json();
          setCategories(data.data || data.categories || []);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCategories();
  }, []);

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50">
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

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {categories.slice(0, 12).map((category: any) => (
            <Link key={category.id} href={`/categories/${category.id}`}>
              <Card className="hover:shadow-lg transition-shadow duration-300 text-center">
                <CardContent className="p-6">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-24 object-cover rounded-lg mb-4"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder-image.png";
                      }}
                    />
                  ) : (
                    <div className="w-full h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg mb-4 flex items-center justify-center">
                      <Package className="h-12 w-12 text-white" />
                    </div>
                  )}
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {category.name}
                  </h3>
                  {category.productCount !== undefined && (
                    <p className="text-sm text-gray-500">
                      {category.productCount} {category.productCount === 1 ? "product" : "products"}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

