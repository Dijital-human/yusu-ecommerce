/**
 * Recently Viewed Products Page / Son Baxılan Məhsullar Səhifəsi
 * Displays all recently viewed products
 * Bütün son baxılan məhsulları göstərir
 */

"use client";

import { Layout } from "@/components/layout/Layout";
import { RecentlyViewed } from "@/components/products/RecentlyViewed";
import { useTranslations } from "next-intl";

export default function RecentlyViewedPage() {
  const tNav = useTranslations("navigation");

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <RecentlyViewed limit={20} showFilters={true} showClearAll={true} />
      </div>
    </Layout>
  );
}

