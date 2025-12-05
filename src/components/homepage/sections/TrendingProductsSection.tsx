/**
 * Trending Products Section Component / Trend Məhsullar Bölməsi Komponenti
 * Displays trending products in a grid
 * Trend məhsulları şəbəkədə göstərir
 */

"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { Card, CardContent } from "@/components/ui/Card";
import { Star, TrendingUp } from "lucide-react";
import { formatCurrency } from "@yusu/shared-utils";

interface TrendingProductsSectionProps {
  title?: string;
  subtitle?: string;
  content?: any;
  config?: any;
}

export function TrendingProductsSection({
  title,
  subtitle,
  content,
  config,
}: TrendingProductsSectionProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setIsLoading(true);
        // Fetch trending products from API / API-dən trend məhsulları gətir
        const response = await fetch("/api/products?trending=true&limit=8");
        if (response.ok) {
          const data = await response.json();
          setProducts(data.data || data.products || []);
        }
      } catch (error) {
        console.error("Error fetching trending products:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(title || subtitle) && (
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <TrendingUp className="h-6 w-6 text-primary-500" />
              {title && (
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  {title}
                </h2>
              )}
            </div>
            {subtitle && (
              <p className="text-lg text-gray-600">{subtitle}</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
          {products.slice(0, 8).map((product: any, index: number) => (
            <Link 
              key={product.id} 
              href={`/products/${product.id}`}
              className="scroll-reveal"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Card className="group hover-lift bg-white border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 hover:border-primary-500">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden">
                    <img
                      src={Array.isArray(product.images) ? product.images[0] : product.images}
                      alt={product.name}
                      className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder-image.png";
                      }}
                    />
                    <span className="absolute top-2 left-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg flex items-center gap-1 animate-pulse-slow">
                      <TrendingUp className="h-3 w-3" />
                      Trending
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      {product.averageRating && (
                        <>
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-gray-600">
                            {product.averageRating.toFixed(1)}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary-600 group-hover:text-primary-700 transition-colors">
                        {formatCurrency(product.price)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

