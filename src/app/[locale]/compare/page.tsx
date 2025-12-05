/**
 * Compare Products Page / Məhsulları Müqayisə Et Səhifəsi
 * Allows users to compare multiple products side by side
 * İstifadəçilərə bir neçə məhsulu yan-yana müqayisə etmə imkanı verir
 */

"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Layout } from "@/components/layout/Layout";
import { ProductCompare } from "@/components/products/ProductCompare";
import { useProductCompare } from "@/hooks/useProductCompare";
import { useTranslations } from "next-intl";

export default function ComparePage() {
  const { products: compareProducts, removeProduct, clearAll, addProduct } = useProductCompare();
  const searchParams = useSearchParams();
  const t = useTranslations("products");
  const [products, setProducts] = useState(compareProducts);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if product IDs are provided in URL / URL-də məhsul ID-ləri verilib-yetmədiyini yoxla
    const ids = searchParams.get("ids");
    if (ids) {
      const productIds = ids.split(",").filter((id) => id.trim());
      if (productIds.length > 0 && productIds.length <= 4) {
        fetchProductsForComparison(productIds);
      } else {
        setProducts(compareProducts);
      }
    } else {
      setProducts(compareProducts);
    }
  }, [searchParams, compareProducts]);

  const fetchProductsForComparison = async (productIds: string[]) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/products/compare?ids=${productIds.join(",")}`);
      const data = await response.json();
      if (data.products) {
        setProducts(data.products);
        // Add to compare list if not already there / Əgər artıq yoxdursa müqayisə siyahısına əlavə et
        data.products.forEach((product: any) => {
          if (!compareProducts.some((p) => p.id === product.id)) {
            addProduct(product);
          }
        });
      }
    } catch (error) {
      console.error("Error fetching products for comparison:", error);
      setProducts(compareProducts);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="text-center py-12">
            <p className="text-gray-600">{t("loading") || "Loading..."}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t("compareProducts") || "Compare Products"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t("compareDescription") || "Compare up to 4 products side by side"}
          </p>
        </div>

        <ProductCompare
          products={products}
          onRemove={removeProduct}
          onClear={clearAll}
        />
      </div>
    </Layout>
  );
}

