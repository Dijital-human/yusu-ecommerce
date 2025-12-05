/**
 * Product Compare Component / Məhsul Müqayisəsi Komponenti
 * Allows users to compare multiple products side by side
 * İstifadəçilərə bir neçə məhsulu yan-yana müqayisə etmə imkanı verir
 */

"use client";

import { useState, useEffect } from "react";
import { X, Trash2, ShoppingCart, Heart, Table, Grid, Share2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ProductComparisonTable } from "./ProductComparisonTable";
import { ComparisonExport } from "./ComparisonExport";
import { ComparisonCharts } from "./ComparisonCharts";
import { ComparisonShare } from "./ComparisonShare";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string | string[];
  averageRating?: number;
  reviewCount?: number;
  stock: number;
  description?: string;
  category?: {
    name: string;
  };
  seller?: {
    name: string;
  };
}

interface ProductCompareProps {
  products: Product[];
  onRemove: (productId: string) => void;
  onClear: () => void;
}

export function ProductCompare({ products, onRemove, onClear }: ProductCompareProps) {
  const t = useTranslations("products");
  const tCommon = useTranslations("common");
  const { addToCart } = useCart();
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart(productId, 1);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  if (products.length === 0) {
    return (
      <Card className="p-8 text-center">
        <CardContent>
          <p className="text-gray-500 text-lg">{t("noProductsToCompare") || "No products to compare"}</p>
          <Link href="/products">
            <Button className="mt-4">
              {t("browseProducts") || "Browse Products"}
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const getImage = (product: Product): string => {
    if (Array.isArray(product.images)) {
      return product.images[0] || "/placeholder-product.jpg";
    }
    return product.images || "/placeholder-product.jpg";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t("compareProducts") || "Compare Products"} ({products.length})
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-8"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="h-8"
            >
              <Table className="h-4 w-4" />
            </Button>
          </div>
          <ComparisonShare products={products} />
          <ComparisonExport products={products} />
          <Button
            variant="outline"
            onClick={onClear}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {t("clearAll") || "Clear All"}
          </Button>
        </div>
      </div>

      {/* Comparison Charts / Müqayisə Qrafikləri */}
      <ComparisonCharts products={products} />

      {viewMode === "table" ? (
        <ProductComparisonTable products={products} onRemove={onRemove} />
      ) : (

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${products.length}, minmax(280px, 1fr))` }}>
            {products.map((product) => (
              <Card key={product.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemove(product.id)}
                      className="h-8 w-8 text-gray-500 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Image */}
                  <div className="relative aspect-square w-full">
                    <Image
                      src={getImage(product)}
                      alt={product.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>

                  {/* Price */}
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t("price")}</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(product.price)}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatCurrency(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Rating */}
                  {product.averageRating && (
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t("rating")}</p>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{product.averageRating.toFixed(1)}</span>
                        {product.reviewCount && (
                          <span className="text-sm text-gray-500">({product.reviewCount})</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Stock */}
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t("stock")}</p>
                    <p className={`font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.stock > 0 ? `${product.stock} ${t("inStock")}` : t("outOfStock")}
                    </p>
                  </div>

                  {/* Category */}
                  {product.category && (
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t("category")}</p>
                      <p className="font-medium">{product.category.name}</p>
                    </div>
                  )}

                  {/* Seller */}
                  {product.seller && (
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t("seller")}</p>
                      <p className="font-medium">{product.seller.name}</p>
                    </div>
                  )}

                  {/* Description */}
                  {product.description && (
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t("description")}</p>
                      <p className="text-sm line-clamp-3">{product.description}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2 pt-4">
                    <Link href={`/products/${product.id}`} className="flex-1">
                      <Button className="w-full" size="sm">
                        {t("viewDetails")}
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddToCart(product.id)}
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

