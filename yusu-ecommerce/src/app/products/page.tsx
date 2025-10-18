/**
 * Products Page / Məhsullar Səhifəsi
 * This page displays all products with filtering and search
 * Bu səhifə bütün məhsulları filtr və axtarış ilə göstərir
 */

"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Layout } from "@/components/layout/Layout";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { 
  Search, 
  Filter, 
  Grid, 
  List,
  SlidersHorizontal,
  X
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string;
  averageRating?: number;
  reviewCount?: number;
  stock: number;
  seller?: {
    name: string;
  };
  category?: {
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
  _count: {
    products: number;
  };
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Filter states / Filtr vəziyyətləri
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "createdAt");
  const [sortOrder, setSortOrder] = useState(searchParams.get("sortOrder") || "desc");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  // Pagination states / Səhifələmə vəziyyətləri
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Fetch products / Məhsulları əldə et
  const fetchProducts = async (page = 1, reset = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        sortBy,
        sortOrder,
      });

      if (searchQuery) params.append("search", searchQuery);
      if (selectedCategory) params.append("category", selectedCategory);
      if (minPrice) params.append("minPrice", minPrice);
      if (maxPrice) params.append("maxPrice", maxPrice);

      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();

      if (data.success) {
        if (reset) {
          setProducts(data.data);
        } else {
          setProducts(prev => [...prev, ...data.data]);
        }
        setTotalPages(data.pagination.totalPages);
        setHasMore(page < data.pagination.totalPages);
        setCurrentPage(page);
      } else {
        setError(data.error || "Failed to fetch products / Məhsulları əldə etmək uğursuz");
      }
    } catch (err) {
      setError("An error occurred while fetching products / Məhsulları əldə etməkdə xəta baş verdi");
      console.error("Error fetching products:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch categories / Kateqoriyaları əldə et
  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();

      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // Load more products / Daha çox məhsul yüklə
  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      fetchProducts(currentPage + 1, false);
    }
  };

  // Search products / Məhsul axtar
  const handleSearch = () => {
    setCurrentPage(1);
    fetchProducts(1, true);
  };

  // Clear filters / Filtrləri təmizlə
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setCurrentPage(1);
    fetchProducts(1, true);
  };

  // Apply filters / Filtrləri tətbiq et
  const applyFilters = () => {
    setCurrentPage(1);
    fetchProducts(1, true);
    setShowFilters(false);
  };

  // Initial load / İlkin yükləmə
  useEffect(() => {
    fetchProducts(1, true);
    fetchCategories();
  }, []);

  // Handle search on Enter key / Enter düyməsi ilə axtarış
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header / Başlıq */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Products / Məhsullar
            </h1>
            <p className="text-gray-600">
              Discover our amazing collection of products / Heyrətamiz məhsul kolleksiyamızı kəşf edin
            </p>
          </div>

          {/* Search and Filters / Axtarış və Filtrlər */}
          <div className="mb-8">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Search Bar / Axtarış Səhifəsi */}
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        placeholder="Search products... / Məhsul axtar..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Filter Toggle / Filtr Açma */}
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="sm:hidden"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters / Filtrlər
                  </Button>

                  {/* View Mode Toggle / Görünüş Rejimi Açma */}
                  <div className="flex border rounded-md">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Filters Panel / Filtrlər Paneli */}
              {showFilters && (
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Category Filter / Kateqoriya Filtr */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category / Kateqoriya
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      >
                        <option value="">All Categories / Bütün Kateqoriyalar</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name} ({category._count.products})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Price Range / Qiymət Aralığı */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price Range / Qiymət Aralığı
                      </label>
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Min / Min"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          type="number"
                        />
                        <Input
                          placeholder="Max / Maks"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          type="number"
                        />
                      </div>
                    </div>

                    {/* Sort By / Sıralama */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sort By / Sıralama
                      </label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      >
                        <option value="createdAt">Newest / Ən Yeni</option>
                        <option value="price">Price / Qiymət</option>
                        <option value="name">Name / Ad</option>
                        <option value="averageRating">Rating / Reytinq</option>
                      </select>
                    </div>

                    {/* Sort Order / Sıralama Sırası */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Order / Sıra
                      </label>
                      <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      >
                        <option value="desc">Descending / Azalan</option>
                        <option value="asc">Ascending / Artan</option>
                      </select>
                    </div>
                  </div>

                  {/* Filter Actions / Filtr Əməliyyatları */}
                  <div className="flex justify-between items-center mt-4 pt-4 border-t">
                    <Button variant="outline" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-2" />
                      Clear Filters / Filtrləri Təmizlə
                    </Button>
                    <Button onClick={applyFilters}>
                      Apply Filters / Filtrləri Tətbiq Et
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>

          {/* Products Grid / Məhsullar Grid-i */}
          <ProductGrid
            products={products}
            isLoading={isLoading}
            error={error}
            showLoadMore={true}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            onAddToCart={(productId) => {
              console.log("Add to cart:", productId);
              // Implement add to cart logic / Səbətə əlavə etmə məntiqini tətbiq et
            }}
            onAddToWishlist={(productId) => {
              console.log("Add to wishlist:", productId);
              // Implement add to wishlist logic / İstək siyahısına əlavə etmə məntiqini tətbiq et
            }}
            onQuickView={(productId) => {
              console.log("Quick view:", productId);
              // Implement quick view logic / Sürətli baxış məntiqini tətbiq et
            }}
          />
        </div>
      </div>
    </Layout>
  );
}
