/**
 * Product Comparison Component / Məhsul Müqayisəsi Komponenti
 * Side-by-side product comparison view
 * Yan-yana məhsul müqayisəsi görünüşü
 */

"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { 
  X, 
  ShoppingCart, 
  Heart, 
  Star, 
  Check, 
  Minus,
  Award,
  TrendingUp,
  Sparkles,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { formatPrice } from "@/lib/utils/format";
import { 
  ComparisonResult, 
  ComparisonProduct, 
  ComparisonRecommendation 
} from "@/lib/comparison/product-comparison";

interface ProductComparisonProps {
  comparisonResult: ComparisonResult;
  onRemoveProduct?: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
  onAddToWishlist?: (productId: string) => void;
  currency?: string;
  locale?: string;
}

export function ProductComparison({
  comparisonResult,
  onRemoveProduct,
  onAddToCart,
  onAddToWishlist,
  currency = "AZN",
  locale = "az-AZ",
}: ProductComparisonProps) {
  const t = useTranslations("comparison");
  const { products, recommendations, priceAnalysis, ratingAnalysis, differingAttributes } = comparisonResult;
  
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    specifications: true,
    proscons: true,
    attributes: false,
  });

  // Toggle section / Bölməni aç/bağla
  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Get badge color / Badge rəngini al
  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case "best_value":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "top_rated":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "cheapest":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "most_popular":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "out_of_stock":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  // Get badge label / Badge etiketini al
  const getBadgeLabel = (badge: string) => {
    const labels: Record<string, string> = {
      best_value: t("badges.bestValue") || "Best Value",
      top_rated: t("badges.topRated") || "Top Rated",
      cheapest: t("badges.cheapest") || "Best Price",
      most_popular: t("badges.mostPopular") || "Most Popular",
      out_of_stock: t("badges.outOfStock") || "Out of Stock",
    };
    return labels[badge] || badge;
  };

  // Get recommendation for product / Məhsul üçün tövsiyəni al
  const getRecommendation = (productId: string): ComparisonRecommendation | undefined => {
    return recommendations.find((r) => r.productId === productId);
  };

  // Render star rating / Ulduz reytinqini render et
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= Math.round(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-max">
        {/* Header Row / Başlıq Sırası */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {/* Label Column / Etiket Sütunu */}
          <div className="w-48 flex-shrink-0 p-4 bg-gray-50 dark:bg-gray-800">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {t("compareProducts") || "Compare Products"}
            </span>
          </div>

          {/* Product Columns / Məhsul Sütunları */}
          {products.map((product) => {
            const recommendation = getRecommendation(product.id);
            const isWinner = recommendation?.badges.includes("best_value");
            
            return (
              <div
                key={product.id}
                className={`w-72 flex-shrink-0 p-4 relative ${
                  isWinner ? "bg-green-50/50 dark:bg-green-900/10" : "bg-white dark:bg-gray-900"
                }`}
              >
                {/* Winner indicator / Qalib göstəricisi */}
                {isWinner && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-green-500" />
                )}

                {/* Remove button / Sil düyməsi */}
                {onRemoveProduct && (
                  <button
                    onClick={() => onRemoveProduct(product.id)}
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    aria-label={t("remove") || "Remove"}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                {/* Product Image / Məhsul Şəkli */}
                <div className="relative w-full aspect-square mb-4 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                  {product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-contain p-4"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ShoppingCart className="w-12 h-12" />
                    </div>
                  )}
                </div>

                {/* Badges / Badge-lər */}
                {recommendation && recommendation.badges.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {recommendation.badges.map((badge) => (
                      <span
                        key={badge}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getBadgeColor(badge)}`}
                      >
                        {badge === "best_value" && <Award className="w-3 h-3" />}
                        {badge === "top_rated" && <Star className="w-3 h-3" />}
                        {badge === "most_popular" && <TrendingUp className="w-3 h-3" />}
                        {getBadgeLabel(badge)}
                      </span>
                    ))}
                  </div>
                )}

                {/* Product Name / Məhsul Adı */}
                <Link
                  href={`/product/${product.id}`}
                  className="text-sm font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 line-clamp-2"
                >
                  {product.name}
                </Link>

                {/* Seller / Satıcı */}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t("soldBy") || "Sold by"}: {product.sellerName}
                </p>
              </div>
            );
          })}
        </div>

        {/* Price Row / Qiymət Sırası */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <div className="w-48 flex-shrink-0 p-4 bg-gray-50 dark:bg-gray-800 flex items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("price") || "Price"}
            </span>
          </div>
          {products.map((product) => {
            const isCheapest = product.id === priceAnalysis.cheapestId;
            return (
              <div key={product.id} className="w-72 flex-shrink-0 p-4">
                <div className="flex items-baseline gap-2">
                  <span className={`text-xl font-bold ${
                    isCheapest ? "text-green-600 dark:text-green-400" : "text-gray-900 dark:text-white"
                  }`}>
                    {formatPrice(product.price, currency, locale)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm text-gray-400 line-through">
                      {formatPrice(product.originalPrice, currency, locale)}
                    </span>
                  )}
                </div>
                {isCheapest && (
                  <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
                    <Check className="w-3 h-3" />
                    {t("lowestPrice") || "Lowest Price"}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Rating Row / Reytinq Sırası */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <div className="w-48 flex-shrink-0 p-4 bg-gray-50 dark:bg-gray-800 flex items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("rating") || "Rating"}
            </span>
          </div>
          {products.map((product) => {
            const isTopRated = product.id === ratingAnalysis.highestRatedId;
            return (
              <div key={product.id} className="w-72 flex-shrink-0 p-4">
                <div className="flex flex-col gap-1">
                  {renderStars(product.rating)}
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {product.reviewCount} {t("reviews") || "reviews"}
                  </span>
                  {isTopRated && (
                    <span className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      {t("topRated") || "Top Rated"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Stock Row / Stok Sırası */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <div className="w-48 flex-shrink-0 p-4 bg-gray-50 dark:bg-gray-800 flex items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("availability") || "Availability"}
            </span>
          </div>
          {products.map((product) => (
            <div key={product.id} className="w-72 flex-shrink-0 p-4">
              {product.stock > 0 ? (
                <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  {t("inStock") || "In Stock"} ({product.stock})
                </span>
              ) : (
                <span className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {t("outOfStock") || "Out of Stock"}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Pros & Cons Section / Müsbət və Mənfi Cəhətlər Bölməsi */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toggleSection("proscons")}
            className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("prosAndCons") || "Pros & Cons"}
            </span>
            {expandedSections.proscons ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>
          
          {expandedSections.proscons && (
            <div className="flex">
              <div className="w-48 flex-shrink-0" />
              {products.map((product) => (
                <div key={product.id} className="w-72 flex-shrink-0 p-4">
                  {/* Pros / Müsbət */}
                  <div className="mb-3">
                    <span className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wider">
                      {t("pros") || "Pros"}
                    </span>
                    <ul className="mt-2 space-y-1">
                      {product.pros.length > 0 ? (
                        product.pros.map((pro, idx) => (
                          <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>{pro}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-sm text-gray-400">-</li>
                      )}
                    </ul>
                  </div>
                  
                  {/* Cons / Mənfi */}
                  <div>
                    <span className="text-xs font-medium text-red-600 dark:text-red-400 uppercase tracking-wider">
                      {t("cons") || "Cons"}
                    </span>
                    <ul className="mt-2 space-y-1">
                      {product.cons.length > 0 ? (
                        product.cons.map((con, idx) => (
                          <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                            <Minus className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                            <span>{con}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-sm text-gray-400">-</li>
                      )}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Differing Attributes / Fərqli Atributlar */}
        {differingAttributes.length > 0 && (
          <div className="border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => toggleSection("attributes")}
              className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("specifications") || "Specifications"} ({differingAttributes.length})
              </span>
              {expandedSections.attributes ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>
            
            {expandedSections.attributes && (
              <>
                {differingAttributes.slice(0, 10).map((attr) => (
                  <div key={attr} className="flex border-t border-gray-100 dark:border-gray-800">
                    <div className="w-48 flex-shrink-0 p-4 bg-gray-50 dark:bg-gray-800">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{attr}</span>
                    </div>
                    {products.map((product) => {
                      const value = product.attributes[attr] || product.specifications.find((s) => s.name === attr)?.value;
                      return (
                        <div key={product.id} className="w-72 flex-shrink-0 p-4">
                          <span className="text-sm text-gray-900 dark:text-white">
                            {value !== undefined ? String(value) : "-"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* Action Row / Hərəkət Sırası */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <div className="w-48 flex-shrink-0 p-4 bg-gray-50 dark:bg-gray-800" />
          {products.map((product) => (
            <div key={product.id} className="w-72 flex-shrink-0 p-4 flex gap-2">
              <button
                onClick={() => onAddToCart?.(product.id)}
                disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-xl font-medium transition-colors disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-4 h-4" />
                {t("addToCart") || "Add to Cart"}
              </button>
              <button
                onClick={() => onAddToWishlist?.(product.id)}
                className="p-2.5 border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-600 dark:text-gray-400 hover:text-red-500 rounded-xl transition-colors"
                aria-label={t("addToWishlist") || "Add to Wishlist"}
              >
                <Heart className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Recommendation Score / Tövsiyə Balı */}
        <div className="flex">
          <div className="w-48 flex-shrink-0 p-4 bg-gray-50 dark:bg-gray-800">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              {t("ourRecommendation") || "Our Score"}
            </span>
          </div>
          {products.map((product) => {
            const recommendation = getRecommendation(product.id);
            const score = recommendation?.score || 0;
            
            return (
              <div key={product.id} className="w-72 flex-shrink-0 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        score >= 80 ? "bg-green-500" :
                        score >= 60 ? "bg-yellow-500" :
                        "bg-red-500"
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <span className={`text-lg font-bold ${
                    score >= 80 ? "text-green-600 dark:text-green-400" :
                    score >= 60 ? "text-yellow-600 dark:text-yellow-400" :
                    "text-red-600 dark:text-red-400"
                  }`}>
                    {score}
                  </span>
                </div>
                {recommendation?.reason && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {recommendation.reason}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ProductComparison;

