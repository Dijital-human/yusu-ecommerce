/**
 * Product Recommendations Component / Məhsul Tövsiyələri Komponenti
 * Display product recommendations with different types / Müxtəlif tiplərlə məhsul tövsiyələrini göstər
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Star, ShoppingCart, Heart, TrendingUp, Users, Package, Eye } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCart } from '@/store/CartContext';
import { trackRecommendationClick, trackRecommendationImpression } from '@/lib/recommendations/performance';

export type RecommendationType = 
  | 'popular'
  | 'recently_viewed'
  | 'similar'
  | 'frequently_bought_together'
  | 'personalized'
  | 'trending'
  | 'customers_also_viewed';

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  images?: string[];
  category?: {
    id: string;
    name: string;
  };
  reviews?: Array<{ rating: number }>;
  averageRating?: number;
}

interface ProductRecommendationsProps {
  productId?: string;
  type?: RecommendationType;
  title?: string;
  limit?: number;
  layout?: 'carousel' | 'grid';
  showLoadMore?: boolean;
  className?: string;
}

export function ProductRecommendations({
  productId,
  type = 'similar',
  title,
  limit = 8,
  layout = 'carousel',
  showLoadMore = false,
  className = '',
}: ProductRecommendationsProps) {
  const t = useTranslations('products');
  const { data: session } = useSession();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchRecommendations();
  }, [productId, type, limit, currentPage]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        type,
        limit: limit.toString(),
        ...(productId && { productId }),
        ...(session?.user?.id && { userId: session.user.id }),
      });

      const response = await fetch(`/api/recommendations?${params}`);
      const data = await response.json();

      if (data.success) {
        const newProducts = data.data || [];
        if (currentPage === 1) {
          setProducts(newProducts);
          // Track impressions / Impression-ları izlə
          if (newProducts.length > 0) {
            trackRecommendationImpression(
              newProducts.map((p: Product) => p.id),
              type,
              productId,
              session?.user?.id
            );
          }
        } else {
          setProducts((prev) => [...prev, ...newProducts]);
        }
        setHasMore(newProducts.length === limit);
      } else {
        setError(data.error || 'Failed to fetch recommendations');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const handleProductClick = (product: Product) => {
    trackRecommendationClick(product.id, type, productId);
  };

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart(product.id, 1);
      trackRecommendationClick(product.id, type, productId, 'add_to_cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const getTitle = () => {
    if (title) return title;
    
    const titles: Record<RecommendationType, string> = {
      popular: t('recommendations.popular') || 'Popular Products',
      recently_viewed: t('recommendations.recentlyViewed') || 'Recently Viewed',
      similar: t('recommendations.similar') || 'Similar Products',
      frequently_bought_together: t('recommendations.frequentlyBoughtTogether') || 'Frequently Bought Together',
      personalized: t('recommendations.personalized') || 'You May Also Like',
      trending: t('recommendations.trending') || 'Trending Products',
      customers_also_viewed: t('recommendations.customersAlsoViewed') || 'Customers Who Viewed This Also Viewed',
    };
    
    return titles[type] || 'Recommended Products';
  };

  const getIcon = () => {
    const icons: Record<RecommendationType, React.ReactNode> = {
      popular: <Users className="h-5 w-5" />,
      recently_viewed: <Eye className="h-5 w-5" />,
      similar: <Package className="h-5 w-5" />,
      frequently_bought_together: <ShoppingCart className="h-5 w-5" />,
      personalized: <Heart className="h-5 w-5" />,
      trending: <TrendingUp className="h-5 w-5" />,
      customers_also_viewed: <Eye className="h-5 w-5" />,
    };
    
    return icons[type] || <Package className="h-5 w-5" />;
  };

  if (loading && products.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center gap-2">
          {getIcon()}
          <h2 className="text-2xl font-bold text-gray-900">{getTitle()}</h2>
        </div>
        <div className={layout === 'carousel' ? 'flex gap-4 overflow-x-auto' : 'grid grid-cols-2 md:grid-cols-4 gap-4'}>
          {[...Array(limit)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-48" />
          ))}
        </div>
      </div>
    );
  }

  if (error && products.length === 0) {
    return null; // Don't show error, just hide component
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2">
        {getIcon()}
        <h2 className="text-2xl font-bold text-gray-900">{getTitle()}</h2>
      </div>

      {layout === 'carousel' ? (
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onProductClick={() => handleProductClick(product)}
              onAddToCart={() => handleAddToCart(product)}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onProductClick={() => handleProductClick(product)}
              onAddToCart={() => handleAddToCart(product)}
            />
          ))}
        </div>
      )}

      {showLoadMore && hasMore && (
        <div className="text-center">
          <Button variant="outline" onClick={handleLoadMore} disabled={loading}>
            {loading ? 'Loading...' : t('loadMore') || 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  onProductClick: () => void;
  onAddToCart: () => void;
}

function ProductCard({ product, onProductClick, onAddToCart }: ProductCardProps) {
  const t = useTranslations('products');
  const imageUrl = product.images?.[0] || product.image || '/placeholder-product.png';
  const averageRating = product.reviews && product.reviews.length > 0
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
    : product.averageRating || 0;

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300 min-w-[200px]">
      <Link href={`/products/${product.id}`} onClick={onProductClick}>
        <CardContent className="p-4">
          <div className="relative aspect-square mb-3 rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">
            {product.name}
          </h3>
          {product.category && (
            <p className="text-xs text-gray-500 mb-2">{product.category.name}</p>
          )}
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < Math.floor(averageRating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
            {averageRating > 0 && (
              <span className="text-xs text-gray-600 ml-1">
                {averageRating.toFixed(1)}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
            <Button
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAddToCart();
              }}
              className="flex items-center gap-1"
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}

