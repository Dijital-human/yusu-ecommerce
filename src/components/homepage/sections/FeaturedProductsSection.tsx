/**
 * Featured Products Section Component / Tövsiyə Edilən Məhsullar Bölməsi Komponenti
 * Displays featured products in a grid
 * Tövsiyə edilən məhsulları şəbəkədə göstərir
 */

"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { Card, CardContent } from "@/components/ui/Card";
import { Star, ShoppingCart, Heart } from "lucide-react";
import { formatCurrency } from "@yusu/shared-utils";

interface FeaturedProductsSectionProps {
  title?: string;
  subtitle?: string;
  content?: any;
  config?: any;
}

export function FeaturedProductsSection({
  title,
  subtitle,
  content,
  config,
}: FeaturedProductsSectionProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setIsLoading(true);
        // Fetch featured products from API / API-dən tövsiyə edilən məhsulları gətir
        const response = await fetch("/api/products?featured=true&limit=8");
        if (response.ok) {
          const data = await response.json();
          setProducts(data.data || data.products || []);
        }
      } catch (error) {
        console.error("Error fetching featured products:", error);
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
                    {/* Overlay on hover / Hover zamanı overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            // Add to cart logic / Səbətə əlavə etmə məntiqi
                          }}
                          className="flex-1 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100"
                        >
                          <ShoppingCart className="h-4 w-4 inline mr-2" />
                          Add to Cart
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            // Wishlist logic / İstək siyahısı məntiqi
                          }}
                          className="bg-white/90 hover:bg-white text-primary-600 p-2 rounded-lg transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100"
                        >
                          <Heart className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg animate-pulse-slow">
                        -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </span>
                    )}
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
                          {product.reviewCount && (
                            <span className="text-sm text-gray-500">
                              ({product.reviewCount})
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-primary-600 group-hover:text-primary-700 transition-colors">
                          {formatCurrency(product.price)}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            {formatCurrency(product.originalPrice)}
                          </span>
                        )}
                      </div>
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

