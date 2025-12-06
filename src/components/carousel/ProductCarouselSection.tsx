/**
 * Product Carousel Section / Məhsul Karusel Bölməsi
 * 
 * Trendyol/Alibaba style product carousel for homepage
 * Uses HorizontalScrollCarousel with product cards
 */

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { HorizontalScrollCarousel } from "./HorizontalScrollCarousel";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Star, Heart, ShoppingCart } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCart } from "@/store/CartContext";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating?: number;
  reviewCount?: number;
  badge?: string;
  badgeColor?: "red" | "green" | "orange" | "blue" | "purple";
  sellerId?: string;
  sellerName?: string;
}

interface ProductCarouselSectionProps {
  /** Section title / Bölmə başlığı */
  title: string;
  /** Products to display / Göstəriləcək məhsullar */
  products?: Product[];
  /** API endpoint to fetch products / Məhsulları almaq üçün API endpoint */
  apiEndpoint?: string;
  /** See all link / Hamısına bax linki */
  seeAllLink?: string;
  /** Enable auto scroll / Avtomatik sürüşmə */
  autoScroll?: boolean;
  /** Show dots indicator / Nöqtə indikatoru göstər */
  showDots?: boolean;
  /** Custom class / Xüsusi sinif */
  className?: string;
  /** Background color / Arxa plan rəngi */
  backgroundColor?: "white" | "gray" | "gradient";
  /** Card style / Kart stili */
  cardStyle?: "default" | "compact" | "detailed";
}

export function ProductCarouselSection({
  title,
  products: initialProducts,
  apiEndpoint,
  seeAllLink,
  autoScroll = false,
  showDots = false,
  className,
  backgroundColor = "white",
  cardStyle = "default",
}: ProductCarouselSectionProps) {
  const t = useTranslations("products");
  const tCommon = useTranslations("common");
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [loading, setLoading] = useState(!initialProducts && !!apiEndpoint);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  // Fetch products if API endpoint provided / API endpoint verilibsə məhsulları al
  useEffect(() => {
    if (!apiEndpoint || initialProducts) return;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(apiEndpoint);
        const data = await response.json();
        
        if (data.products) {
          setProducts(data.products);
        } else if (Array.isArray(data)) {
          setProducts(data);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [apiEndpoint, initialProducts]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("az-AZ", {
      style: "currency",
      currency: "AZN",
      minimumFractionDigits: 2,
    }).format(price);
  };

  const calculateDiscount = (price: number, originalPrice?: number) => {
    if (!originalPrice || originalPrice <= price) return 0;
    return Math.round((1 - price / originalPrice) * 100);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
  };

  const getBadgeColorClass = (color?: string) => {
    switch (color) {
      case "red": return "bg-red-500 text-white";
      case "green": return "bg-green-500 text-white";
      case "orange": return "bg-orange-500 text-white";
      case "blue": return "bg-blue-500 text-white";
      case "purple": return "bg-purple-500 text-white";
      default: return "bg-red-500 text-white";
    }
  };

  const bgClass = {
    white: "bg-white",
    gray: "bg-gray-50",
    gradient: "bg-gradient-to-r from-primary-50 via-white to-primary-50",
  }[backgroundColor];

  // Loading skeleton / Yüklənmə skeleti
  if (loading) {
    return (
      <section className={cn("py-6 md:py-8", bgClass, className)}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="flex gap-4 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-48 md:w-56">
                <Card>
                  <Skeleton className="aspect-square w-full" />
                  <CardContent className="p-3">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-2" />
                    <Skeleton className="h-6 w-1/2" />
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className={cn("py-6 md:py-8", bgClass, className)}>
      <div className="max-w-7xl mx-auto px-4">
        <HorizontalScrollCarousel
          title={title}
          seeAllLink={seeAllLink}
          seeAllText={tCommon("seeAll") || "Hamısına bax"}
          showArrows={true}
          showDots={showDots}
          autoScroll={autoScroll}
          autoScrollInterval={5000}
          gap={16}
          itemsPerView={{ mobile: 2, tablet: 3, desktop: 5 }}
          loop={autoScroll}
          pauseOnHover={true}
        >
          {products.map((product) => {
            const discount = calculateDiscount(product.price, product.originalPrice);
            const isWishlisted = wishlist.has(product.id);

            return (
              <Card 
                key={product.id} 
                className={cn(
                  "group overflow-hidden border border-gray-100",
                  "hover:shadow-lg hover:border-primary-200",
                  "transition-all duration-300"
                )}
              >
                {/* Product Image / Məhsul şəkli */}
                <Link href={`/products/${product.id}`}>
                  <div className="relative aspect-square overflow-hidden bg-gray-50">
                    <Image
                      src={product.image || "/placeholder.png"}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    />
                    
                    {/* Discount Badge / Endirim nişanı */}
                    {discount > 0 && (
                      <Badge 
                        className={cn(
                          "absolute top-2 left-2 font-bold",
                          "bg-red-500 text-white border-0"
                        )}
                      >
                        -{discount}%
                      </Badge>
                    )}

                    {/* Custom Badge / Xüsusi nişan */}
                    {product.badge && !discount && (
                      <Badge 
                        className={cn(
                          "absolute top-2 left-2 font-semibold",
                          getBadgeColorClass(product.badgeColor)
                        )}
                      >
                        {product.badge}
                      </Badge>
                    )}

                    {/* Wishlist Button / Sevimlilər düyməsi */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleWishlist(product.id);
                      }}
                      className={cn(
                        "absolute top-2 right-2",
                        "w-8 h-8 rounded-full",
                        "bg-white/90 shadow-md",
                        "flex items-center justify-center",
                        "opacity-0 group-hover:opacity-100",
                        "transition-all duration-300",
                        "hover:bg-white hover:scale-110"
                      )}
                    >
                      <Heart 
                        className={cn(
                          "h-4 w-4 transition-colors",
                          isWishlisted 
                            ? "fill-red-500 text-red-500" 
                            : "text-gray-600"
                        )} 
                      />
                    </button>

                    {/* Quick Add Button / Sürətli əlavə düyməsi */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart(product);
                      }}
                      className={cn(
                        "absolute bottom-2 right-2",
                        "w-9 h-9 rounded-full",
                        "bg-primary-600 text-white shadow-lg",
                        "flex items-center justify-center",
                        "opacity-0 group-hover:opacity-100",
                        "transition-all duration-300",
                        "hover:bg-primary-700 hover:scale-110"
                      )}
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </button>
                  </div>
                </Link>

                {/* Product Info / Məhsul məlumatı */}
                <CardContent className={cn(
                  "p-3",
                  cardStyle === "compact" && "p-2"
                )}>
                  <Link href={`/products/${product.id}`}>
                    <h3 className={cn(
                      "font-medium text-gray-900 line-clamp-2",
                      "hover:text-primary-600 transition-colors",
                      "text-sm",
                      cardStyle === "compact" && "text-xs"
                    )}>
                      {product.name}
                    </h3>
                  </Link>

                  {/* Seller Info / Satıcı məlumatı */}
                  {product.sellerName && cardStyle === "detailed" && (
                    <Link 
                      href={`/sellers/${product.sellerId}`}
                      className="text-xs text-gray-500 hover:text-primary-600 mt-1 block"
                    >
                      {product.sellerName}
                    </Link>
                  )}

                  {/* Rating / Reytinq */}
                  {product.rating !== undefined && (
                    <div className="flex items-center gap-1 mt-1.5">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium text-gray-700">
                        {product.rating.toFixed(1)}
                      </span>
                      {product.reviewCount !== undefined && (
                        <span className="text-xs text-gray-400">
                          ({product.reviewCount})
                        </span>
                      )}
                    </div>
                  )}

                  {/* Price / Qiymət */}
                  <div className="mt-2">
                    <p className={cn(
                      "font-bold text-primary-600",
                      cardStyle === "compact" ? "text-sm" : "text-base"
                    )}>
                      {formatPrice(product.price)}
                    </p>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <p className="text-xs text-gray-400 line-through">
                        {formatPrice(product.originalPrice)}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </HorizontalScrollCarousel>
      </div>
    </section>
  );
}

export default ProductCarouselSection;

