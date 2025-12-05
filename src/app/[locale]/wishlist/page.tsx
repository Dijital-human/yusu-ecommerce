/**
 * Wishlist Page / İstək Siyahısı Səhifəsi
 * This page displays the user's wishlist
 * Bu səhifə istifadəçinin istək siyahısını göstərir
 */

"use client";

import { Layout } from "@/components/layout/Layout";
import { Wishlist } from "@/components/wishlist/Wishlist";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function WishlistPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <Wishlist />
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

