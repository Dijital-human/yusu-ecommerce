/**
 * Wishlist Component / İstək Siyahısı Komponenti
 * This component displays the user's wishlist items
 * Bu komponent istifadəçinin istək siyahısı elementlərini göstərir
 */

"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { useCart } from "@/store/CartContext";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { 
  Heart, 
  ShoppingCart, 
  Trash2,
  Package
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface WishlistItem {
  id: string;
  productId: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    images: string;
    stock: number;
    seller?: {
      name: string;
    };
    category?: {
      name: string;
    };
  };
}

export function Wishlist() {
  const t = useTranslations("wishlist");
  const tCommon = useTranslations("common");
  const { addToCart } = useCart();
  
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/wishlist");
      const data = await response.json();

      if (data.success) {
        setItems(data.data);
      } else {
        setError(data.error || "Failed to fetch wishlist");
      }
    } catch (error) {
      setError("Failed to fetch wishlist");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      setRemoving(productId);
      const response = await fetch(`/api/wishlist?productId=${productId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setItems(items.filter(item => item.productId !== productId));
      } else {
        setError(data.error || "Failed to remove item");
      }
    } catch (error) {
      setError("Failed to remove item");
    } finally {
      setRemoving(null);
    }
  };

  const handleAddToCart = async (productId: string) => {
    try {
      setAddingToCart(productId);
      await addToCart(productId, 1);
      // Optionally remove from wishlist after adding to cart
      // await handleRemove(productId);
    } catch (error) {
      console.error("Error adding to cart:", error);
      setError("Failed to add to cart");
    } finally {
      setAddingToCart(null);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-48 w-full mb-4" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchWishlist}>{tCommon("retry") || "Retry"}</Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <Heart className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t("empty")}
        </h3>
        <p className="text-gray-600 mb-4">
          {t("emptyDesc")}
        </p>
        <Link href="/products">
          <Button>
            {tCommon("view")} {tCommon("products") || "Products"}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {t("title")}
        </h2>
        <span className="text-gray-600">
          {items.length} {items.length === 1 ? t("item") : t("items")}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => {
          const product = item.product;
          const isOutOfStock = product.stock === 0;
          const discountPercentage = product.originalPrice && product.originalPrice > product.price
            ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
            : 0;

          return (
            <Card key={item.id} className="group hover:shadow-lg transition-all duration-300">
              <CardContent className="p-4">
                <div className="relative mb-4">
                  <Link href={`/products/${product.id}`}>
                    <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={product.images || "/placeholder-product.jpg"}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                      {discountPercentage > 0 && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                          -{discountPercentage}%
                        </div>
                      )}
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <span className="text-white font-semibold">Out of Stock</span>
                        </div>
                      )}
                    </div>
                  </Link>
                </div>

                <Link href={`/products/${product.id}`}>
                  <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                </Link>

                {product.seller && (
                  <p className="text-sm text-gray-500 mb-2">
                    by {product.seller.name}
                  </p>
                )}

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-lg font-semibold text-gray-900">
                      {formatCurrency(product.price)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-gray-500 line-through ml-2">
                        {formatCurrency(product.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleAddToCart(product.id)}
                    disabled={isOutOfStock || addingToCart === product.id}
                  >
                    {addingToCart === product.id ? (
                      <span className="flex items-center">
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
                        {tCommon("loading")}
                      </span>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {t("addToCart")}
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(product.id)}
                    disabled={removing === product.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {removing === product.id ? (
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

