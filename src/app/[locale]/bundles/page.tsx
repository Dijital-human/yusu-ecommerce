/**
 * Product Bundles Page / Məhsul Paketləri Səhifəsi
 * Displays all available product bundles / Bütün mövcud məhsul paketlərini göstərir
 */

"use client";

import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { ProductBundle } from "@/components/products/ProductBundle";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTranslations } from "next-intl";
import { Package } from "lucide-react";

interface Bundle {
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
}

export default function BundlesPage() {
  const t = useTranslations("products");
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBundles();
  }, []);

  const fetchBundles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/bundles?limit=20");
      const data = await response.json();

      if (data.bundles) {
        setBundles(data.bundles);
      } else {
        setError(data.error || "Failed to fetch bundles");
      }
    } catch (err) {
      setError("Failed to fetch bundles");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async (bundleId: string) => {
    try {
      const response = await fetch("/api/cart/bundle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bundleId }),
      });

      const data = await response.json();

      if (response.ok) {
        // Show success message / Uğur mesajı göstər
        alert(t("bundleAddedToCart") || "Bundle added to cart successfully");
        // Optionally refresh the page or update UI / İstəyə bağlı səhifəni yenilə və ya UI-ni yenilə
      } else {
        alert(data.error || t("failedToAddBundle") || "Failed to add bundle to cart");
      }
    } catch (error) {
      console.error("Error adding bundle to cart:", error);
      alert(t("errorOccurred") || "An error occurred");
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Package className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t("productBundles") || "Product Bundles"}
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {t("bundleDescription") || "Save more with our special product bundles"}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-96" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-600">{error}</p>
          </div>
        ) : bundles.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t("noBundles") || "No bundles available"}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t("noBundlesDesc") || "Check back later for special bundle offers"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bundles.map((bundle) => (
              <ProductBundle
                key={bundle.id}
                bundle={bundle}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

