/**
 * Product Bundle Component / Məhsul Paketi Komponenti
 * Displays product bundle with discount and add to cart / Endirim və səbətə əlavə et ilə məhsul paketini göstərir
 */

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ShoppingCart, Percent } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { calculateBundleSavings } from "@/lib/db/product-bundles";

interface ProductBundleProps {
  bundle: {
    id: string;
    name: string;
    description?: string;
    bundlePrice: number;
    discount?: number;
    items: {
      id: string;
      productId: string;
      quantity: number;
      product: {
        id: string;
        name: string;
        price: number;
        images: string;
      };
    }[];
  };
  onAddToCart?: (bundleId: string) => void;
}

export function ProductBundle({ bundle, onAddToCart }: ProductBundleProps) {
  const t = useTranslations("products");
  const [isAdding, setIsAdding] = useState(false);

  const savings = calculateBundleSavings(bundle);

  const handleAddToCart = async () => {
    if (onAddToCart) {
      setIsAdding(true);
      try {
        await onAddToCart(bundle.id);
      } finally {
        setIsAdding(false);
      }
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{bundle.name}</CardTitle>
            {bundle.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {bundle.description}
              </p>
            )}
          </div>
          {bundle.discount && (
            <Badge variant="destructive" className="ml-2">
              <Percent className="h-3 w-3 mr-1" />
              {bundle.discount}% {t("off") || "OFF"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bundle items / Paket elementləri */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {bundle.items.map((item) => (
            <div key={item.id} className="text-center">
              <div className="relative aspect-square w-full mb-2">
                <Image
                  src={item.product.images || "/placeholder-product.jpg"}
                  alt={item.product.name}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <p className="text-sm font-medium line-clamp-2">
                {item.product.name}
              </p>
              <p className="text-xs text-gray-500">
                {formatCurrency(item.product.price)} × {item.quantity}
              </p>
            </div>
          ))}
        </div>

        {/* Price and savings / Qiymət və qənaət */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t("originalPrice") || "Original Price"}:
            </span>
            <span className="text-sm line-through text-gray-500">
              {formatCurrency(savings.originalPrice)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {t("bundlePrice") || "Bundle Price"}:
            </span>
            <span className="text-lg font-bold text-green-600">
              {formatCurrency(savings.bundlePrice)}
            </span>
          </div>
          {savings.savings > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t("youSave") || "You Save"}:
              </span>
              <span className="text-sm font-semibold text-green-600">
                {formatCurrency(savings.savings)} ({savings.savingsPercent.toFixed(0)}%)
              </span>
            </div>
          )}
        </div>

        {/* Add to cart button / Səbətə əlavə et düyməsi */}
        <Button
          className="w-full"
          onClick={handleAddToCart}
          disabled={isAdding}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {isAdding
            ? t("adding") || "Adding..."
            : t("addBundleToCart") || "Add Bundle to Cart"}
        </Button>
      </CardContent>
    </Card>
  );
}

