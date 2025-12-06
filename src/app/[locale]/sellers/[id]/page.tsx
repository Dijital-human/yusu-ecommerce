/**
 * Seller Store Page / Satıcı Mağaza Səhifəsi
 * Displays seller profile and products - Trendyol/Alibaba style
 */

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Layout } from "@/components/layout/Layout";
import { SellerProfile } from "@/components/seller/SellerProfile";
import { SellerProductGrid } from "@/components/seller/SellerProductGrid";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTranslations } from "next-intl";
import { AlertCircle } from "lucide-react";

interface SellerData {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  banner?: string;
  memberSince: string;
  stats: {
    productCount: number;
    averageRating: number;
    reviewCount: number;
    salesCount: number;
  };
  contact?: {
    address?: string;
    phone?: string;
  };
}

export default function SellerStorePage() {
  const params = useParams();
  const sellerId = params.id as string;
  const t = useTranslations("seller");

  const [seller, setSeller] = useState<SellerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchSeller = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/sellers/${sellerId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.errorAz || data.error || "Seller not found");
        }

        if (data.success && data.seller) {
          setSeller(data.seller);
        } else {
          throw new Error("Invalid response");
        }
      } catch (err: any) {
        setError(err.message || "Error loading seller");
        console.error("Error fetching seller:", err);
      } finally {
        setLoading(false);
      }
    };

    if (sellerId) {
      fetchSeller();
    }
  }, [sellerId]);

  const handleContact = () => {
    // Open chat or contact modal
    console.log("Contact seller:", sellerId);
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    // TODO: Implement follow API call
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Profile Skeleton */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
            <Skeleton className="h-64 w-full" />
            <div className="p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="w-32 h-32 rounded-2xl" />
                <div className="flex-1">
                  <Skeleton className="h-8 w-64 mb-2" />
                  <Skeleton className="h-4 w-96" />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 mt-6">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
              </div>
            </div>
          </div>
          
          {/* Products Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !seller) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {t("sellerNotFound") || "Satıcı tapılmadı"}
            </h1>
            <p className="text-gray-600">
              {error || t("sellerNotFoundDesc") || "Axtardığınız satıcı mövcud deyil və ya silinnib."}
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Seller Profile / Satıcı Profili */}
          <div className="mb-8">
            <SellerProfile
              seller={seller}
              onContact={handleContact}
              onFollow={handleFollow}
              isFollowing={isFollowing}
            />
          </div>

          {/* Products Section / Məhsullar Bölməsi */}
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {t("sellerProducts") || "Satıcının Məhsulları"} 
              <span className="text-gray-500 font-normal ml-2">
                ({seller.stats.productCount})
              </span>
            </h2>
          </div>

          <SellerProductGrid sellerId={sellerId} />
        </div>
      </div>
    </Layout>
  );
}

