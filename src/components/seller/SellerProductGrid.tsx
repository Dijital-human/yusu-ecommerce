/**
 * Seller Product Grid Component / Satıcı Məhsul Grid Komponenti
 * Displays seller's products with filters
 */

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Star,
  Search,
  SlidersHorizontal,
  Grid,
  List,
  ChevronDown,
  ShoppingCart,
  Heart,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useCart } from "@/store/CartContext";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  stock: number;
  rating: number;
  reviewCount: number;
  category?: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
  count: number;
}

interface SellerProductGridProps {
  sellerId: string;
  initialProducts?: Product[];
}

export function SellerProductGrid({ sellerId, initialProducts = [] }: SellerProductGridProps) {
  const t = useTranslations("products");
  const tCommon = useTranslations("common");
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(!initialProducts.length);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);

  const fetchProducts = async (resetPage = false) => {
    try {
      setLoading(true);
      const currentPage = resetPage ? 1 : page;
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "12",
        sortBy,
        sortOrder,
        ...(search && { search }),
        ...(selectedCategory && { category: selectedCategory }),
      });

      const response = await fetch(`/api/sellers/${sellerId}/products?${params}`);
      const data = await response.json();

      if (data.success) {
        if (resetPage) {
          setProducts(data.products);
          setPage(1);
        } else if (currentPage === 1) {
          setProducts(data.products);
        } else {
          setProducts(prev => [...prev, ...data.products]);
        }
        
        setCategories(data.filters?.categories || []);
        setHasMore(data.pagination?.hasMore || false);
        setTotalProducts(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(true);
  }, [sellerId, selectedCategory, sortBy, sortOrder]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== "") {
        fetchProducts(true);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const loadMore = () => {
    setPage(prev => prev + 1);
    fetchProducts();
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("az-AZ", {
      style: "currency",
      currency: "AZN",
    }).format(price);
  };

  const sortOptions = [
    { value: "createdAt-desc", label: t("newest") || "Ən yeni" },
    { value: "createdAt-asc", label: t("oldest") || "Ən köhnə" },
    { value: "price-asc", label: t("priceLowToHigh") || "Qiymət: Aşağıdan Yuxarıya" },
    { value: "price-desc", label: t("priceHighToLow") || "Qiymət: Yuxarıdan Aşağıya" },
    { value: "rating-desc", label: t("highestRated") || "Ən yüksək reytinq" },
  ];

  return (
    <div className="space-y-6">
      {/* Toolbar / Alətlər paneli */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search / Axtarış */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder={t("searchProducts") || "Məhsul axtar..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Filter Toggle / Filtr açma */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {tCommon("filter") || "Filtr"}
            </Button>

            {/* Sort / Sıralama */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sort, order] = e.target.value.split("-");
                setSortBy(sort);
                setSortOrder(order);
              }}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* View Mode / Görünüş rejimi */}
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${viewMode === "grid" ? "bg-primary-100 text-primary-600" : "bg-white text-gray-500"}`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${viewMode === "list" ? "bg-primary-100 text-primary-600" : "bg-white text-gray-500"}`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filters / Kateqoriya filtrləri */}
        {showFilters && categories.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-2">
              {t("categories") || "Kateqoriyalar"}:
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedCategory === null ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(null)}
              >
                {tCommon("all") || "Hamısı"} ({totalProducts})
              </Badge>
              {categories.map((cat) => (
                <Badge
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.name} ({cat.count})
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Products Grid / Məhsullar Grid */}
      {loading && products.length === 0 ? (
        <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"}`}>
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <p className="text-gray-500">{t("noProducts") || "Məhsul tapılmadı"}</p>
        </div>
      ) : (
        <>
          <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"}`}>
            {products.map((product) => (
              <Card
                key={product.id}
                className="group overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <Link href={`/products/${product.id}`}>
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <Image
                      src={product.image || "/placeholder.png"}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.originalPrice && product.originalPrice > product.price && (
                      <Badge className="absolute top-2 left-2 bg-red-500">
                        -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                      </Badge>
                    )}
                    <button
                      className="absolute top-2 right-2 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.preventDefault();
                        // Add to wishlist
                      }}
                    >
                      <Heart className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </Link>
                
                <CardContent className="p-4">
                  <Link href={`/products/${product.id}`}>
                    <h3 className="font-medium text-gray-900 line-clamp-2 hover:text-primary-600 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  
                  {product.category && (
                    <p className="text-xs text-gray-500 mt-1">{product.category.name}</p>
                  )}
                  
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
                    <span className="text-xs text-gray-400">({product.reviewCount})</span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <p className="text-lg font-bold text-primary-600">
                        {formatPrice(product.price)}
                      </p>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <p className="text-sm text-gray-400 line-through">
                          {formatPrice(product.originalPrice)}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart(product);
                      }}
                      disabled={product.stock === 0}
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More / Daha çox yüklə */}
          {hasMore && (
            <div className="text-center pt-6">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={loading}
                className="gap-2"
              >
                {loading ? (
                  tCommon("loading") || "Yüklənir..."
                ) : (
                  <>
                    {t("loadMore") || "Daha çox"}
                    <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

