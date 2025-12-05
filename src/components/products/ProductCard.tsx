/**
 * Product Card Component / Məhsul Kartı Komponenti
 * This component displays a single product in card format
 * Bu komponent tək məhsulu kart formatında göstərir
 */

"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { useCart } from "@/store/CartContext";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Eye,
  Package,
  Truck,
  Check
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { parseProductImages } from "@/lib/utils/product-helpers";
import ProductQuickView from "./ProductQuickView";
import { useTranslations } from "next-intl";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    images: string | string[];
    averageRating?: number;
    reviewCount?: number;
    stock: number;
    seller?: {
      name: string;
      isVerified?: boolean;
    };
    category?: {
      name: string;
    };
  };
  onAddToCart?: (productId: string) => void;
  onAddToWishlist?: (productId: string) => void;
  onQuickView?: (productId: string) => void;
}

export function ProductCard({ 
  product, 
  onAddToCart, 
  onAddToWishlist, 
  onQuickView 
}: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const { addToCart, isInCart } = useCart();
  const t = useTranslations("products");
  const tCommon = useTranslations("common");

  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Parse images to handle string, array, or JSON string formats
  // Şəkilləri parse et - string, array və ya JSON string formatlarını idarə et
  const parsedImages = parseProductImages(product.images);
  const productImage = parsedImages[0] || '/placeholder-product.jpg';

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      await addToCart(product.id, 1);
      if (onAddToCart) {
        onAddToCart(product.id);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (onAddToWishlist) {
      setIsInWishlist(!isInWishlist);
      await onAddToWishlist(product.id);
    }
  };

  const handleQuickView = () => {
    if (onQuickView) {
      onQuickView(product.id);
    }
  };

  const isOutOfStock = product.stock === 0;
  // Support optional originalPrice field if provided by backend
  const discountPercentage = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Card className="group cursor-pointer hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-700 transform hover:-translate-y-2 bg-white dark:bg-gray-800">
      <div className="relative overflow-hidden bg-white dark:bg-gray-800">
        {/* Product Image / Məhsul Şəkli - Trendyol Style */}
        <Link href={`/products/${product.id}`}>
          <div className="aspect-square relative overflow-hidden">
            {/* Image with shimmer until loaded / Yüklənənə qədər shimmer */}
            {productImage && productImage !== '/placeholder-product.jpg' ? (
              <>
                <div className={`absolute inset-0 ${imgLoaded ? 'opacity-0' : ''}`}>
                  <div className="w-full h-full bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 animate-shimmer" />
                </div>
                <Image
                  src={productImage}
                  alt={product.name || "Product image"}
                  fill
                  onLoad={() => setImgLoaded(true)}
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              </>
            ) : (
              <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <Package className="h-12 w-12 text-gray-400 dark:text-gray-500" />
              </div>
            )}
            
            {/* Gradient Overlay on hover / Hover zamanı gradient örtük */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-black/0 to-black/0 group-hover:from-black/20 group-hover:via-black/10 group-hover:to-black/0 transition-all duration-500" />
          </div>
        </Link>

        {/* Badges / Nişanlar - Trendyol Style */}
        <div className="absolute top-3 left-3 flex flex-col space-y-2 z-10">
          {isOutOfStock && (
            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              {t("outOfStock")}
            </span>
          )}
          {discountPercentage > 0 && (
            <span className="bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse-slow">
              -{discountPercentage}%
            </span>
          )}
          {product.stock > 0 && product.stock < 10 && (
            <span className="bg-yellow-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              {t("limitedStock")}
            </span>
          )}
        </div>

        {/* Action Buttons / Əməliyyat Düymələri - Trendyol Style */}
        <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
          <Button
            size="icon"
            variant="secondary"
            className="h-10 w-10 bg-white/95 dark:bg-gray-800/95 hover:bg-white dark:hover:bg-gray-800 shadow-lg hover:shadow-xl rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110"
            onClick={handleAddToWishlist}
            aria-label={isInWishlist ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          >
            <Heart 
              className={`h-5 w-5 transition-all duration-300 ${isInWishlist ? 'text-red-500 fill-current animate-bounce-gentle' : 'text-gray-600 dark:text-gray-400 hover:text-red-500'}`} 
            />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-10 w-10 bg-white/95 dark:bg-gray-800/95 hover:bg-white dark:hover:bg-gray-800 shadow-lg hover:shadow-xl rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110"
            onClick={() => {
              if (onQuickView) return handleQuickView();
              setIsQuickViewOpen(true);
            }}
            aria-label={`Quick view ${product.name}`}
          >
            <Eye className="h-5 w-5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" />
          </Button>
        </div>
      </div>

      <CardContent className="p-5 bg-white dark:bg-gray-800">
        {/* Category / Kateqoriya - Trendyol Style */}
        {product.category && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">
            {product.category.name}
          </div>
        )}

        {/* Product Name / Məhsul Adı - Trendyol Style */}
        <Link href={`/products/${product.id}`}>
          <h3 className="font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-base leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400">
            {product.name}
          </h3>
        </Link>

        {/* Rating / Reytinq - Trendyol Style */}
        {product.averageRating && product.reviewCount && (
          <div className="flex items-center mb-3">
            <div className="flex items-center bg-yellow-50 dark:bg-yellow-900/30 px-2 py-1 rounded-md">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < Math.floor(product.averageRating!) ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400 ml-2 font-medium">
              ({product.reviewCount})
            </span>
          </div>
        )}

        {/* Seller Info / Satıcı Məlumatı */}
        {product.seller && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
            <Package className="h-4 w-4 mr-1" />
            <span className="mr-2">{product.seller.name}</span>
            {product.seller.isVerified && (
              <span className="flex items-center text-xs text-green-600 dark:text-green-400 font-medium" aria-hidden>
                <Check className="h-3 w-3 mr-1" /> {t("verified")}
              </span>
            )}
          </div>
        )}

        {/* Price / Qiymət - Trendyol Style */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(product.price)}
              </span>
              {discountPercentage > 0 && product.originalPrice && (
                <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>
            {discountPercentage > 0 && (
              <span className="text-xs text-green-600 dark:text-green-400 font-semibold mt-1">
                {discountPercentage}% {t("off")}
              </span>
            )}
          </div>
          
          {/* Stock Indicator / Stok Göstəricisi */}
          <div className="text-xs">
            {product.stock > 0 ? (
              <span className="text-green-600 dark:text-green-400 font-semibold bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
                {product.stock} {t("inStock")}
              </span>
            ) : (
              <span className="text-red-600 dark:text-red-400 font-semibold bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-full">
                {t("outOfStock")}
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button / Səbətə Əlavə Et Düyməsi - Trendyol Style */}
        <Button
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 shadow-md hover:shadow-lg transition-all duration-300"
          disabled={isOutOfStock || isLoading}
          onClick={handleAddToCart}
          aria-label={isOutOfStock ? `${product.name} is out of stock` : `Add ${product.name} to cart`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              {t("adding")}
            </div>
          ) : isOutOfStock ? (
            t("outOfStock")
          ) : isInCart(product.id) ? (
            <div className="flex items-center justify-center">
              <Check className="h-4 w-4 mr-2" />
              {t("inCart")}
            </div>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4 mr-2" />
              {t("addToCart")}
            </>
          )}
        </Button>

        {/* Delivery Info / Çatdırılma Məlumatı */}
        <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
          <Truck className="h-3 w-3 mr-1" />
          <span>{t("freeDelivery")}</span>
        </div>
      </CardContent>
      {/* Quick view modal fallback (client-side) */}
      {isQuickViewOpen && (
        <ProductQuickView productId={product.id} onClose={() => setIsQuickViewOpen(false)} />
      )}
    </Card>
  );
}
