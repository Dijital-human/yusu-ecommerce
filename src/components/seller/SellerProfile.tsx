/**
 * Seller Profile Component / Satıcı Profil Komponenti
 * Displays seller information header with stats
 */

"use client";

import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  Store, 
  Star, 
  Package, 
  ShoppingBag, 
  MessageCircle,
  Calendar,
  MapPin,
  Phone,
  CheckCircle
} from "lucide-react";
import { useTranslations } from "next-intl";

interface SellerProfileProps {
  seller: {
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
  };
  onContact?: () => void;
  onFollow?: () => void;
  isFollowing?: boolean;
}

export function SellerProfile({ 
  seller, 
  onContact, 
  onFollow,
  isFollowing = false 
}: SellerProfileProps) {
  const t = useTranslations("seller");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("az-AZ", {
      year: "numeric",
      month: "long"
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Banner / Banner */}
      <div className="relative h-48 md:h-64 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700">
        {seller.banner ? (
          <Image
            src={seller.banner}
            alt={seller.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700">
            <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      {/* Profile Content / Profil Məzmunu */}
      <div className="relative px-6 pb-6">
        {/* Logo / Logo */}
        <div className="absolute -top-16 left-6">
          <div className="relative w-32 h-32 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-white">
            {seller.logo ? (
              <Image
                src={seller.logo}
                alt={seller.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                <Store className="h-12 w-12 text-primary-600" />
              </div>
            )}
          </div>
        </div>

        {/* Actions / Əməliyyatlar */}
        <div className="flex justify-end pt-4 gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onContact}
            className="gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            {t("contact") || "Əlaqə"}
          </Button>
          <Button
            variant={isFollowing ? "outline" : "default"}
            size="sm"
            onClick={onFollow}
            className="gap-2"
          >
            {isFollowing ? (
              <>
                <CheckCircle className="h-4 w-4" />
                {t("following") || "İzləyirsiniz"}
              </>
            ) : (
              t("follow") || "İzlə"
            )}
          </Button>
        </div>

        {/* Info / Məlumat */}
        <div className="mt-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {seller.name}
            </h1>
            <Badge variant="success" className="gap-1">
              <CheckCircle className="h-3 w-3" />
              {t("verified") || "Təsdiqlənmiş"}
            </Badge>
          </div>

          {seller.description && (
            <p className="text-gray-600 mt-2 max-w-2xl">
              {seller.description}
            </p>
          )}

          {/* Meta Info / Meta Məlumat */}
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{t("memberSince") || "Üzv olduğu tarix"}: {formatDate(seller.memberSince)}</span>
            </div>
            {seller.contact?.address && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{seller.contact.address}</span>
              </div>
            )}
            {seller.contact?.phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                <span>{seller.contact.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats / Statistikalar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100/50">
            <div className="flex items-center justify-center gap-2 text-primary-600 mb-1">
              <Star className="h-5 w-5 fill-current" />
              <span className="text-2xl font-bold">
                {seller.stats.averageRating.toFixed(1)}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {seller.stats.reviewCount} {t("reviews") || "rəy"}
            </p>
          </div>

          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50">
            <div className="flex items-center justify-center gap-2 text-blue-600 mb-1">
              <Package className="h-5 w-5" />
              <span className="text-2xl font-bold">
                {seller.stats.productCount}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {t("products") || "məhsul"}
            </p>
          </div>

          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100/50">
            <div className="flex items-center justify-center gap-2 text-green-600 mb-1">
              <ShoppingBag className="h-5 w-5" />
              <span className="text-2xl font-bold">
                {seller.stats.salesCount}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {t("sales") || "satış"}
            </p>
          </div>

          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50">
            <div className="flex items-center justify-center gap-2 text-purple-600 mb-1">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-semibold">
                {t("trustedSeller") || "Etibarlı Satıcı"}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {t("fastShipping") || "Sürətli çatdırılma"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

