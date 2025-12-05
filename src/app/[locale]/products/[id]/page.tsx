/**
 * Product Details Page / Məhsul Detalları Səhifəsi
 * This component displays detailed information about a specific product
 * Bu komponent müəyyən məhsul haqqında ətraflı məlumat göstərir
 */

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Share2,
  Truck,
  Shield,
  RotateCcw,
  ArrowLeft,
  Minus,
  Plus,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useSession } from "next-auth/react";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { useCart } from "@/store/CartContext";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useProductCompare } from "@/hooks/useProductCompare";
import { useTranslations } from "next-intl";
import { GitCompare } from "lucide-react";
import { ShareProductModal } from "@/components/social/ShareProductModal";
import { ProductMediaCarousel } from "@/components/products/ProductMediaCarousel";
import { ProductQASection } from "@/components/qa/ProductQASection";
import { SizeGuideModal } from "@/components/products/SizeGuideModal";
import { Product360Viewer } from "@/components/products/Product360Viewer";
import { ProductVariantSelector } from "@/components/products/ProductVariantSelector";
import { ReviewAnalytics } from "@/components/products/ReviewAnalytics";
import { ReviewHelpfulButton } from "@/components/reviews/ReviewHelpfulButton";
import { ProductRecommendations } from "@/components/products/ProductRecommendations";
import { Ruler, RotateCw, CheckCircle2, Flag } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string | string[]; // Can be string or array / String və ya array ola bilər
  category?: {
    id: string;
    name: string;
  };
  seller?: {
    id: string;
    name: string;
    email: string;
  };
  stock: number;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  isVerifiedPurchase?: boolean;
  helpfulCount?: number;
  notHelpfulCount?: number;
  images?: Array<{ id: string; imageUrl: string; order: number }>;
  video?: { id: string; videoUrl: string; thumbnailUrl?: string };
  user: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { addToCart, isInCart } = useCart();
  const { addProduct: addToRecentlyViewed } = useRecentlyViewed();
  const { addProduct: addToCompare, isInCompare, canAddMore } = useProductCompare();
  const t = useTranslations("products");
  const tCommon = useTranslations("common");
  const tReviews = useTranslations("reviews");
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCount, setShareCount] = useState(0);
  const [videos, setVideos] = useState<any[]>([]);
  const [showSizeGuideModal, setShowSizeGuideModal] = useState(false);
  const [view360, setView360] = useState<any | null>(null);
  const [show360Viewer, setShow360Viewer] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchProduct();
      fetchReviews();
      checkWishlistStatus();
      fetchShareCount();
      fetchVideos();
      fetch360View();
    }
  }, [params.id, session]);

  const fetchVideos = async () => {
    if (!params.id) return;
    
    try {
      const response = await fetch(`/api/products/${params.id}/videos`);
      const data = await response.json();
      if (data.success && data.data) {
        setVideos(data.data);
      }
    } catch (error) {
      console.error('Error fetching videos', error);
    }
  };

  const fetch360View = async () => {
    if (!params.id) return;
    
    try {
      const response = await fetch(`/api/products/${params.id}/360`);
      const data = await response.json();
      if (data.success && data.data) {
        setView360(data.data);
      }
    } catch (error) {
      console.error('Error fetching 360° view', error);
    }
  };

  const fetchShareCount = async () => {
    if (!params.id) return;
    
    try {
      const response = await fetch(`/api/social/share?productId=${params.id}`);
      const data = await response.json();
      if (data.success && data.data) {
        setShareCount(data.data.totalShares || 0);
      }
    } catch (error) {
      console.error('Error fetching share count', error);
    }
  };

  const checkWishlistStatus = async () => {
    if (!session?.user) return;
    
    try {
      const response = await fetch("/api/wishlist");
      const data = await response.json();
      if (data.success) {
        const isInList = data.data.some((item: any) => item.productId === params.id);
        setIsInWishlist(isInList);
      }
    } catch (error) {
      console.error("Error checking wishlist:", error);
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${params.id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError(tCommon("notFound"));
        } else {
          setError(tCommon("error"));
        }
        return;
      }

      const data = await response.json();
      
      // Normalize images field - ensure it's always an array
      // Images field-ini normallaşdır - həmişə array olduğundan əmin ol
      const normalizedProduct = {
        ...data,
        images: Array.isArray(data.images) 
          ? data.images 
          : typeof data.images === 'string' 
            ? (data.images.startsWith('[') ? JSON.parse(data.images) : [data.images])
            : data.images ? [data.images] : ['/placeholder-product.jpg'],
      };
      
      setProduct(normalizedProduct);
      
      // Add to recently viewed / Son baxılanlara əlavə et
      if (normalizedProduct) {
        addToRecentlyViewed({
          id: normalizedProduct.id,
          name: normalizedProduct.name,
          price: normalizedProduct.price,
          images: normalizedProduct.images,
        });
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setError(tCommon("error"));
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/products/${params.id}/reviews`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      await addToCart(product.id, quantity);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const handleAddToWishlist = async () => {
    if (!product || !session?.user) {
      router.push("/auth/signin");
      return;
    }

    try {
      if (isInWishlist) {
        // Remove from wishlist
        const response = await fetch(`/api/wishlist?productId=${product.id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setIsInWishlist(false);
        }
      } else {
        // Add to wishlist
        const response = await fetch("/api/wishlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: product.id,
          }),
        });
        if (response.ok) {
          setIsInWishlist(true);
        }
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
    }
  };

  const handleReviewSuccess = () => {
    fetchReviews();
    setShowReviewForm(false);
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleAddToCompare = () => {
    if (!product) return;
    
    const success = addToCompare({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      images: Array.isArray(product.images) ? product.images : [product.images],
      averageRating: product.rating,
      reviewCount: product.reviewCount,
      stock: product.stock,
      description: product.description,
      category: product.category,
      seller: product.seller,
    });

    if (!success) {
      if (isInCompare(product.id)) {
        alert(t("alreadyInCompare") || "Product is already in compare list");
      } else if (!canAddMore()) {
        alert(t("maxCompareReached") || "Maximum 4 products can be compared");
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Skeleton className="h-96 w-full" />
              <div className="flex space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-20 w-20" />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-12 w-1/3" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4 text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || tCommon("notFound")}
          </h1>
          <p className="text-gray-600 mb-8">
            {tCommon("error")}
          </p>
          <Link href="/products">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("backToProducts")}
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        {/* Breadcrumb / Yol Göstərici */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8 bg-gray-50 rounded-lg p-4">
          <Link href="/" className="hover:text-orange-600 transition-colors">{t("breadcrumbHome")}</Link>
          <span className="text-gray-400">/</span>
          <Link href="/products" className="hover:text-orange-600 transition-colors">{t("breadcrumbProducts")}</Link>
          {product.category && (
            <>
              <span className="text-gray-400">/</span>
              <Link href={`/categories/${product.category.id}`} className="hover:text-orange-600 transition-colors">
                {product.category.name}
              </Link>
            </>
          )}
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Media Carousel / Məhsul Media Karusel */}
          <div className="space-y-4">
            {(() => {
              const productImages = Array.isArray(product.images) 
                ? product.images 
                : typeof product.images === 'string'
                  ? (product.images.startsWith('[') ? JSON.parse(product.images) : [product.images])
                  : ['/placeholder-product.jpg'];
              
              return (
                <div className="relative">
                  <ProductMediaCarousel
                    images={productImages}
                    videos={videos.map((v) => ({
                      id: v.id,
                      videoUrl: v.videoUrl,
                      thumbnailUrl: v.thumbnailUrl,
                    }))}
                    className="w-full"
                  />
                  {view360 && (
                    <Button
                      onClick={() => setShow360Viewer(true)}
                      className="absolute top-4 right-4 bg-black bg-opacity-50 text-white hover:bg-opacity-70 z-10"
                      size="sm"
                    >
                      <RotateCw className="h-4 w-4 mr-2" />
                      {t('view360') || '360° View'}
                    </Button>
                  )}
                </div>
              );
            })()}
            
            {discountPercentage > 0 && (
              <Badge className="bg-red-500 text-white font-bold text-lg px-3 py-1">
                -{discountPercentage}% OFF
              </Badge>
            )}
          </div>

          {/* Product Info / Məhsul Məlumatları */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      fill={i < Math.floor(product.rating) ? 'currentColor' : 'none'}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {product.rating} ({product.reviewCount} {tReviews("title")})
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAddToWishlist}
                  className={isInWishlist ? 'text-red-500' : 'text-gray-500'}
                >
                  <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleAddToCompare}
                  className={isInCompare(product.id) ? 'text-blue-600 bg-blue-50' : ''}
                  title={isInCompare(product.id) ? (t("inCompare") || "In Compare") : (t("addToCompare") || "Add to Compare")}
                >
                  <GitCompare className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleShare} title={t("share") || "Share"}>
                  <Share2 className="h-5 w-5" />
                </Button>
                {shareCount > 0 && (
                  <span className="text-xs text-gray-500">
                    {shareCount} {t("shares") || "shares"}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <span className="text-4xl font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="text-2xl text-gray-500 line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
                {discountPercentage > 0 && (
                  <Badge className="bg-green-500 text-white font-bold">
                    {tCommon("save")} ${(product.originalPrice! - product.price).toFixed(2)}
                  </Badge>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-600">{t("stock")}:</span>
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                  product.stock > 10 ? 'text-green-700 bg-green-100' : 
                  product.stock > 0 ? 'text-yellow-700 bg-yellow-100' : 'text-red-700 bg-red-100'
                }`}>
                  {product.stock > 0 ? `${product.stock} ${t("available")}` : t("outOfStock")}
                </span>
              </div>

              {/* Variant Selector / Variant Seçici */}
              <ProductVariantSelector
                productId={product.id}
                basePrice={product.price}
                productImages={Array.isArray(product.images) ? product.images : [product.images]}
                onVariantSelect={(variantId, variant) => {
                  setSelectedVariantId(variantId);
                }}
              />

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{t("description")}</h3>
                  <p className="text-gray-700 text-lg leading-relaxed">{product.description}</p>
                </div>

                {/* Detailed Product Information / Ətraflı Məhsul Məlumatları */}
                <div className="bg-gradient-to-br from-gray-50 to-orange-50 rounded-xl p-6 space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{t("details")}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.category && (
                      <div className="flex items-center justify-between py-2 border-b border-gray-200">
                        <span className="text-sm font-medium text-gray-600">{t("category")}:</span>
                        <Link href={`/categories/${product.category.id}`} className="text-orange-600 hover:text-orange-700 font-medium">
                          {product.category.name}
                        </Link>
                      </div>
                    )}
                    {product.seller && (
                      <div className="flex items-center justify-between py-2 border-b border-gray-200">
                        <span className="text-sm font-medium text-gray-600">{t("seller")}:</span>
                        <span className="text-gray-900 font-medium">{product.seller.name}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-600">{t("productId")}:</span>
                      <span className="text-gray-900 font-mono text-sm">{product.id}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-600">{t("addedDate")}:</span>
                      <span className="text-gray-900 font-medium">{new Date(product.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-600">{t("lastUpdated")}:</span>
                      <span className="text-gray-900 font-medium">{new Date(product.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-600">{t("status")}:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.isActive ? t("active") : t("inactive")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Product Specifications / Məhsul Spesifikasiyaları */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{t("specifications")}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Brand / Marka:</span>
                        <span className="font-medium">Ulustore Premium</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Model / Model:</span>
                        <span className="font-medium">{product.name.split(' ')[0]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Warranty / Zəmanət:</span>
                        <span className="font-medium">2 Years / 2 İl</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Origin / Mənbə:</span>
                        <span className="font-medium">International / Beynəlxalq</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Weight / Çəki:</span>
                        <span className="font-medium">1.2 kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dimensions / Ölçülər:</span>
                        <span className="font-medium">25 x 15 x 10 cm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Color / Rəng:</span>
                        <span className="font-medium">Various / Müxtəlif</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Material / Material:</span>
                        <span className="font-medium">Premium Quality / Premium Keyfiyyət</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Size Guide Button / Ölçü Bələdçisi Düyməsi */}
            {product.category && (
              <div className="mb-4">
                <Button
                  variant="outline"
                  onClick={() => setShowSizeGuideModal(true)}
                  className="w-full"
                >
                  <Ruler className="h-4 w-4 mr-2" />
                  {t("sizeGuide") || "Size Guide"}
                </Button>
              </div>
            )}

            {/* Quantity and Add to Cart / Miqdar və Səbətə Əlavə Et */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <span className="text-lg font-medium text-gray-900">{t("quantity")}:</span>
                <div className="flex items-center border-2 border-gray-300 rounded-xl overflow-hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="px-4 py-2 hover:bg-gray-100"
                  >
                    <Minus className="h-5 w-5" />
                  </Button>
                  <span className="px-6 py-2 text-lg font-bold bg-gray-50 min-w-[60px] text-center">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="px-4 py-2 hover:bg-gray-100"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button
                  size="lg"
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="h-6 w-6 mr-3" />
                  {product && isInCart(product.id) ? t("addedToCart") : t("addToCart")}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="px-6 py-4 border-2 border-orange-600 text-orange-600 hover:bg-orange-50 rounded-xl font-bold"
                  onClick={handleAddToWishlist}
                >
                  <Heart className={`h-6 w-6 ${isInWishlist ? 'fill-current text-red-500' : ''}`} />
                </Button>
              </div>

              {product && isInCart(product.id) && (
                <div className="flex items-center text-green-600 text-lg font-medium bg-green-50 p-4 rounded-xl">
                  <CheckCircle className="h-5 w-5 mr-3" />
                  {t("addedToCart")}
                </div>
              )}
            </div>

            {/* Features / Xüsusiyyətlər */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-gray-200">
              <div className="flex items-center space-x-3 bg-blue-50 p-4 rounded-xl">
                <Truck className="h-6 w-6 text-blue-600" />
                <div>
                  <span className="text-sm font-bold text-gray-900">{t("freeShipping")}</span>
                  <p className="text-xs text-gray-600">{t("freeShippingDesc")}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 bg-green-50 p-4 rounded-xl">
                <Shield className="h-6 w-6 text-green-600" />
                <div>
                  <span className="text-sm font-bold text-gray-900">{t("securePayment")}</span>
                  <p className="text-xs text-gray-600">{t("securePaymentDesc")}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 bg-purple-50 p-4 rounded-xl">
                <RotateCcw className="h-6 w-6 text-purple-600" />
                <div>
                  <span className="text-sm font-bold text-gray-900">{t("returns")}</span>
                  <p className="text-xs text-gray-600">{t("returnsDesc")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section / Rəylər Bölməsi */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {tReviews("title")}
            </h2>
            <p className="text-gray-600 text-lg mb-6">
              {tReviews("description")}
            </p>
            {session?.user && !showReviewForm && (
              <Button onClick={() => setShowReviewForm(true)}>
                {tReviews("writeReview")}
              </Button>
            )}
          </div>

          {/* Review Analytics / Rəy Analitikası */}
          {product && (
            <div className="mb-12">
              <ReviewAnalytics productId={product.id} />
            </div>
          )}

          {/* Review Form / Rəy Formu */}
          {showReviewForm && session?.user && (
            <div className="mb-12">
              <ReviewForm
                productId={product?.id || ""}
                onSuccess={handleReviewSuccess}
                onCancel={() => setShowReviewForm(false)}
              />
            </div>
          )}

          {/* Reviews List / Rəylər Siyahısı */}
          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reviews.map((review) => (
                <Card key={review.id} className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900 text-lg">{review.user.name}</h4>
                          {review.isVerifiedPurchase && (
                            <Badge className="bg-green-100 text-green-800 text-xs flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              {tReviews("verifiedPurchase") || "Verified Purchase"}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 ${
                                i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                              fill={i < review.rating ? 'currentColor' : 'none'}
                            />
                          ))}
                          <span className="ml-2 text-sm text-gray-600">({review.rating}/5)</span>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-gray-700 leading-relaxed mb-3">{review.comment}</p>
                    )}
                    {/* Review Images / Rəy Şəkilləri */}
                    {review.images && review.images.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {review.images.map((img) => (
                          <Image
                            key={img.id}
                            src={img.imageUrl}
                            alt="Review image"
                            width={100}
                            height={100}
                            className="rounded-lg object-cover"
                          />
                        ))}
                      </div>
                    )}
                    {/* Review Helpful Button / Rəy Faydalı Düyməsi */}
                    <ReviewHelpfulButton
                      reviewId={review.id}
                      productId={product.id}
                      initialHelpfulCount={review.helpfulCount || 0}
                      initialNotHelpfulCount={review.notHelpfulCount || 0}
                    />
                    {/* Report Button / Şikayət Düyməsi */}
                    {session?.user && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          try {
                            const response = await fetch(`/api/products/${product.id}/reviews/${review.id}/report`, {
                              method: 'POST',
                            });
                            const data = await response.json();
                            if (data.success) {
                              alert(tReviews("reviewReported") || "Review reported successfully");
                            }
                          } catch (error) {
                            console.error("Error reporting review:", error);
                          }
                        }}
                        className="mt-2 text-red-600 hover:text-red-700"
                      >
                        <Flag className="h-4 w-4 mr-1" />
                        {tReviews("report") || "Report"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">
                {tReviews("noReviews")}
              </p>
              {session?.user && !showReviewForm && (
                <Button onClick={() => setShowReviewForm(true)}>
                  {tReviews("beFirst")}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Q&A Section / Sual-Cavab Bölməsi */}
        {product && (
          <div className="mt-20">
            <ProductQASection productId={product.id} />
          </div>
          )}
        </div>

        {/* Product Recommendations / Məhsul Tövsiyələri */}
        {product && (
          <div className="mt-20 space-y-12">
            <ProductRecommendations
              productId={product.id}
              type="similar"
              limit={8}
              layout="carousel"
            />
            <ProductRecommendations
              productId={product.id}
              type="frequently_bought_together"
              limit={5}
              layout="grid"
            />
            {session?.user && (
              <ProductRecommendations
                productId={product.id}
                type="personalized"
                limit={8}
                layout="carousel"
              />
            )}
          </div>
        )}

      {/* Share Product Modal / Məhsul Paylaşım Modal */}
      {product && (
        <ShareProductModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          product={{
            id: product.id,
            name: product.name,
            description: product.description,
            images: Array.isArray(product.images) ? product.images : [product.images],
            price: product.price,
          }}
          shareCount={shareCount}
        />
      )}

      {/* Size Guide Modal / Ölçü Bələdçisi Modal */}
      {product && (
        <SizeGuideModal
          isOpen={showSizeGuideModal}
          onClose={() => setShowSizeGuideModal(false)}
          categoryId={product.category?.id}
        />
      )}

      {/* 360° Viewer Modal / 360° Görüntüləyici Modal */}
      {show360Viewer && view360 && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
          <div className="w-full h-full max-w-7xl max-h-[90vh] relative">
            <Product360Viewer
              imageUrls={view360.imageUrls}
              thumbnailUrl={view360.thumbnailUrl}
              onClose={() => setShow360Viewer(false)}
              className="w-full h-full"
            />
          </div>
        </div>
      )}
    </Layout>
  );
}
