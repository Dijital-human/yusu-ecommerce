/**
 * Search Page / Axtarış Səhifəsi
 * This component handles product search functionality
 * Bu komponent məhsul axtarış funksiyasını idarə edir
 */

"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Eye,
  Search,
  Filter,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Package,
  X
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
  };
  stock: number;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: string;
}

interface SearchFilters {
  category: string;
  minPrice: number;
  maxPrice: number;
  rating: number;
  inStock: boolean;
}

type SortOption = "relevance" | "name" | "price" | "rating" | "createdAt";
type SortOrder = "asc" | "desc";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    category: "",
    minPrice: 0,
    maxPrice: 1000,
    rating: 0,
    inStock: false,
  });
  const [categories, setCategories] = useState<Array<{id: string; name: string}>>([]);

  const itemsPerPage = 12;

  useEffect(() => {
    if (searchTerm) {
      fetchProducts();
    }
    fetchCategories();
  }, [searchTerm, currentPage, sortBy, sortOrder, filters]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.map((cat: any) => ({ id: cat.id, name: cat.name })));
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams({
        q: searchTerm,
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sortBy,
        sortOrder,
        category: filters.category,
        minPrice: filters.minPrice.toString(),
        maxPrice: filters.maxPrice.toString(),
        rating: filters.rating.toString(),
        inStock: filters.inStock.toString(),
      });

      const response = await fetch(`/api/search?${queryParams}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch search results");
      }

      const data = await response.json();
      setProducts(data.products);
      setTotalPages(data.pagination.totalPages);
      setTotalResults(data.pagination.totalCount);
    } catch (error) {
      console.error("Error fetching search results:", error);
      setError("Failed to fetch search results / Axtarış nəticələri alına bilmədi");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
    
    // Update URL with search term
    const params = new URLSearchParams(searchParams);
    if (searchTerm) {
      params.set("q", searchTerm);
    } else {
      params.delete("q");
    }
    router.push(`/search?${params.toString()}`);
  };

  const handleSort = (newSortBy: SortOption) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      minPrice: 0,
      maxPrice: 1000,
      rating: 0,
      inStock: false,
    });
    setCurrentPage(1);
  };

  const handleAddToCart = async (productId: string) => {
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity: 1,
        }),
      });

      if (response.ok) {
        console.log("Product added to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        {/* Search Header / Axtarış Başlığı */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Search Results / Axtarış Nəticələri
          </h1>
          
          {/* Search Bar / Axtarış Səhifəsi */}
          <form onSubmit={handleSearch} className="flex gap-4 mb-4">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for products... / Məhsul axtar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              />
            </div>
            <Button type="submit" size="lg">
              Search / Axtar
            </Button>
          </form>

          {/* Results Summary / Nəticələr Xülasəsi */}
          {searchTerm && (
            <div className="flex items-center justify-between">
              <p className="text-gray-600">
                {loading ? "Searching..." : `${totalResults} results for "${searchTerm}"`}
              </p>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters / Filtrlər
              </Button>
            </div>
          )}
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar / Filtrlər Yan Paneli */}
          {showFilters && (
            <div className="w-64 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Filters / Filtrlər</h3>
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear / Təmizlə
                    </Button>
                  </div>

                  {/* Category Filter / Kateqoriya Filtri */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category / Kateqoriya</label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange("category", e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">All Categories / Bütün Kateqoriyalar</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price Range Filter / Qiymət Aralığı Filtri */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Price Range / Qiymət Aralığı</label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={filters.minPrice}
                          onChange={(e) => handleFilterChange("minPrice", Number(e.target.value))}
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                        />
                        <span className="text-gray-500">-</span>
                        <input
                          type="number"
                          placeholder="Max"
                          value={filters.maxPrice}
                          onChange={(e) => handleFilterChange("maxPrice", Number(e.target.value))}
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Rating Filter / Reytinq Filtri */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Minimum Rating / Minimum Reytinq</label>
                    <div className="space-y-1">
                      {[4, 3, 2, 1].map((rating) => (
                        <label key={rating} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="rating"
                            value={rating}
                            checked={filters.rating === rating}
                            onChange={(e) => handleFilterChange("rating", Number(e.target.value))}
                            className="text-blue-600"
                          />
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < rating ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                                fill={i < rating ? 'currentColor' : 'none'}
                              />
                            ))}
                            <span className="ml-1 text-sm text-gray-600">& up</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* In Stock Filter / Stokda Filtri */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.inStock}
                        onChange={(e) => handleFilterChange("inStock", e.target.checked)}
                        className="text-blue-600"
                      />
                      <span className="text-sm">In Stock Only / Yalnız Stokda</span>
                    </label>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Content / Əsas Məzmun */}
          <div className="flex-1">
            {/* Sort and View Controls / Sıralama və Görünüş Nəzarəti */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Sort by / Sırala:</span>
                <div className="flex space-x-1">
                  {[
                    { key: "relevance", label: "Relevance / Uyğunluq" },
                    { key: "name", label: "Name / Ad" },
                    { key: "price", label: "Price / Qiymət" },
                    { key: "rating", label: "Rating / Reytinq" },
                    { key: "createdAt", label: "Newest / Ən Yeni" },
                  ].map((option) => (
                    <button
                      key={option.key}
                      onClick={() => handleSort(option.key as SortOption)}
                      className={`px-3 py-1 text-sm rounded-lg ${
                        sortBy === option.key
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {option.label}
                      {sortBy === option.key && (
                        sortOrder === "asc" ? <SortAsc className="inline h-3 w-3 ml-1" /> : <SortDesc className="inline h-3 w-3 ml-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">View / Görünüş:</span>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg ${
                    viewMode === "grid" 
                      ? "bg-blue-600 text-white" 
                      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg ${
                    viewMode === "list" 
                      ? "bg-blue-600 text-white" 
                      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Products Grid / Məhsullar Şəbəkəsi */}
            {loading ? (
              <div className={
                viewMode === "grid" 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <Card key={i}>
                    <Skeleton className="h-48 w-full rounded-t-lg" />
                    <CardContent className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : !searchTerm ? (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Start your search / Axtarışınıza başlayın
                </h3>
                <p className="text-gray-600">
                  Enter a search term to find products / Məhsul tapmaq üçün axtarış sözü daxil edin
                </p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No products found / Məhsul tapılmadı
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search terms or filters / Axtarış şərtlərinizi və ya filtrləri dəyişdirin
                </p>
                <Button onClick={clearFilters}>
                  Clear Filters / Filtrləri Təmizlə
                </Button>
              </div>
            ) : (
              <>
                <div className={
                  viewMode === "grid" 
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "space-y-4"
                }>
                  {products.map((product) => (
                    <Card key={product.id} className="group cursor-pointer hover:shadow-lg transition-shadow">
                      <div className="relative overflow-hidden rounded-t-lg">
                        <Image
                          src={product.images[0] || "/placeholder-product.jpg"}
                          alt={product.name}
                          width={300}
                          height={200}
                          className={`w-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                            viewMode === "grid" ? "h-48" : "h-32"
                          }`}
                        />
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-red-500 text-white">
                            {product.originalPrice && product.price < product.originalPrice
                              ? `-${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%`
                              : "New"
                            }
                          </Badge>
                        </div>
                        <div className="absolute top-2 right-2 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="secondary" className="h-8 w-8">
                            <Heart className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="secondary" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {product.name}
                        </h3>
                        <div className="flex items-center mb-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                                fill={i < Math.floor(product.rating) ? 'currentColor' : 'none'}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500 ml-2">({product.reviewCount})</span>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-gray-900">
                              ${product.price.toFixed(2)}
                            </span>
                            {product.originalPrice && product.price < product.originalPrice && (
                              <span className="text-sm text-gray-500 line-through">
                                ${product.originalPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          onClick={() => handleAddToCart(product.id)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Add to Cart
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination / Səhifələmə */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous / Əvvəlki
                      </Button>
                      
                      {[...Array(totalPages)].map((_, i) => (
                        <Button
                          key={i + 1}
                          variant={currentPage === i + 1 ? "default" : "outline"}
                          onClick={() => setCurrentPage(i + 1)}
                          className="w-10"
                        >
                          {i + 1}
                        </Button>
                      ))}
                      
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next / Növbəti
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
