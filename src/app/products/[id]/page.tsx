/**
 * Product Details Page / Məhsul Detalları Səhifəsi
 * This component displays detailed information about a specific product
 * Bu komponent müəyyən məhsul haqqında ətraflı məlumat göstərir
 */

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
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

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: {
    id: string;
    name: string;
  };
  seller: {
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
  user: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isInCart, setIsInCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchProduct();
      fetchReviews();
    }
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${params.id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError("Product not found / Məhsul tapılmadı");
        } else {
          setError("Failed to fetch product / Məhsul məlumatları alına bilmədi");
        }
        return;
      }

      const data = await response.json();
      setProduct(data);
    } catch (error) {
      console.error("Error fetching product:", error);
      setError("Failed to fetch product / Məhsul məlumatları alına bilmədi");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/products/${params.id}/reviews`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: quantity,
        }),
      });

      if (response.ok) {
        setIsInCart(true);
        // Show success message
        setTimeout(() => setIsInCart(false), 3000);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const handleAddToWishlist = async () => {
    if (!product) return;

    try {
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
        setIsInWishlist(!isInWishlist);
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
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
            {error || "Product not found / Məhsul tapılmadı"}
          </h1>
          <p className="text-gray-600 mb-8">
            The product you're looking for doesn't exist or has been removed.
            / Axtardığınız məhsul mövcud deyil və ya silinib.
          </p>
          <Link href="/products">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products / Məhsullara Qayıt
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
          <Link href="/" className="hover:text-orange-600 transition-colors">Home / Ana Səhifə</Link>
          <span className="text-gray-400">/</span>
          <Link href="/products" className="hover:text-orange-600 transition-colors">Products / Məhsullar</Link>
          <span className="text-gray-400">/</span>
          <Link href={`/categories/${product.category.id}`} className="hover:text-orange-600 transition-colors">
            {product.category.name}
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images / Məhsul Şəkilləri */}
          <div className="space-y-4">
            <div className="relative group">
              <Image
                src={product.images[selectedImage] || "/placeholder-product.jpg"}
                alt={product.name}
                width={600}
                height={600}
                className="w-full h-96 object-cover rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300"
              />
              {discountPercentage > 0 && (
                <Badge className="absolute top-4 left-4 bg-red-500 text-white font-bold text-lg px-3 py-1">
                  -{discountPercentage}% OFF
                </Badge>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-xl" />
            </div>
            
            {product.images.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-24 h-24 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      selectedImage === index 
                        ? 'border-orange-500 shadow-lg scale-105' 
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
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
                    {product.rating} ({product.reviewCount} reviews)
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
                <Button variant="ghost" size="sm" onClick={handleShare}>
                  <Share2 className="h-5 w-5" />
                </Button>
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
                    Save ${(product.originalPrice! - product.price).toFixed(2)}
                  </Badge>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-600">Stock / Stok:</span>
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                  product.stock > 10 ? 'text-green-700 bg-green-100' : 
                  product.stock > 0 ? 'text-yellow-700 bg-yellow-100' : 'text-red-700 bg-red-100'
                }`}>
                  {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                </span>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Product Description / Məhsul Təsviri</h3>
                  <p className="text-gray-700 text-lg leading-relaxed">{product.description}</p>
                </div>

                {/* Detailed Product Information / Ətraflı Məhsul Məlumatları */}
                <div className="bg-gradient-to-br from-gray-50 to-orange-50 rounded-xl p-6 space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Product Details / Məhsul Detalları</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-600">Category / Kateqoriya:</span>
                      <Link href={`/categories/${product.category.id}`} className="text-orange-600 hover:text-orange-700 font-medium">
                        {product.category.name}
                      </Link>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-600">Seller / Satıcı:</span>
                      <span className="text-gray-900 font-medium">{product.seller.name}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-600">Product ID / Məhsul ID:</span>
                      <span className="text-gray-900 font-mono text-sm">{product.id}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-600">Added Date / Əlavə Tarixi:</span>
                      <span className="text-gray-900 font-medium">{new Date(product.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-600">Last Updated / Son Yenilənmə:</span>
                      <span className="text-gray-900 font-medium">{new Date(product.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-600">Status / Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.isActive ? 'Active / Aktiv' : 'Inactive / Qeyri-aktiv'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Product Specifications / Məhsul Spesifikasiyaları */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Specifications / Spesifikasiyalar</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Brand / Marka:</span>
                        <span className="font-medium">Yusu Premium</span>
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

            {/* Quantity and Add to Cart / Miqdar və Səbətə Əlavə Et */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <span className="text-lg font-medium text-gray-900">Quantity / Miqdar:</span>
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
                  {isInCart ? 'Added to Cart / Səbətə Əlavə Edildi' : 'Add to Cart / Səbətə Əlavə Et'}
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

              {isInCart && (
                <div className="flex items-center text-green-600 text-lg font-medium bg-green-50 p-4 rounded-xl">
                  <CheckCircle className="h-5 w-5 mr-3" />
                  Product added to cart successfully / Məhsul səbətə uğurla əlavə edildi
                </div>
              )}
            </div>

            {/* Features / Xüsusiyyətlər */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-gray-200">
              <div className="flex items-center space-x-3 bg-blue-50 p-4 rounded-xl">
                <Truck className="h-6 w-6 text-blue-600" />
                <div>
                  <span className="text-sm font-bold text-gray-900">Free Shipping</span>
                  <p className="text-xs text-gray-600">Pulsuz Çatdırılma</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 bg-green-50 p-4 rounded-xl">
                <Shield className="h-6 w-6 text-green-600" />
                <div>
                  <span className="text-sm font-bold text-gray-900">Secure Payment</span>
                  <p className="text-xs text-gray-600">Təhlükəsiz Ödəniş</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 bg-purple-50 p-4 rounded-xl">
                <RotateCcw className="h-6 w-6 text-purple-600" />
                <div>
                  <span className="text-sm font-bold text-gray-900">30-Day Returns</span>
                  <p className="text-xs text-gray-600">30 Günlük Qaytarma</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section / Rəylər Bölməsi */}
        {reviews.length > 0 && (
          <div className="mt-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Customer Reviews / Müştəri Rəyləri
              </h2>
              <p className="text-gray-600 text-lg">
                What our customers say about this product / Müştərilərimizin bu məhsul haqqında fikirləri
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reviews.map((review) => (
                <Card key={review.id} className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">{review.user.name}</h4>
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
                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
