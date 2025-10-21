/**
 * Category Details Page / Kateqoriya Detalları Səhifəsi
 * This component displays products within a specific category
 * Bu komponent müəyyən kateqoriya daxilindəki məhsulları göstərir
 */

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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
  ArrowLeft,
  Grid,
  List,
  Search,
  SortAsc,
  SortDesc,
  Package
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

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
  isActive: boolean;
  parentId?: string;
}

type SortOption = "name" | "price" | "rating" | "createdAt";
type SortOrder = "asc" | "desc";

export default function CategoryDetailsPage() {
  const params = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<SortOption>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [selectedPriceRange, setSelectedPriceRange] = useState({ min: 0, max: 1000 });

  const itemsPerPage = 12;

  useEffect(() => {
    if (params.id) {
      fetchCategory();
      fetchProducts();
    }
  }, [params.id, currentPage, sortBy, sortOrder, selectedPriceRange]);

  const fetchCategory = async () => {
    try {
      const response = await fetch(`/api/categories/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setCategory(data);
        setPriceRange({ min: 0, max: data.maxPrice || 1000 });
        setSelectedPriceRange({ min: 0, max: data.maxPrice || 1000 });
      }
    } catch (error) {
      console.error("Error fetching category:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sortBy,
        sortOrder,
        minPrice: selectedPriceRange.min.toString(),
        maxPrice: selectedPriceRange.max.toString(),
        search: searchTerm,
      });

      const response = await fetch(`/api/categories/${params.id}/products?${queryParams}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError("Category not found / Kateqoriya tapılmadı");
        } else {
          setError("Failed to fetch products / Məhsullar alına bilmədi");
        }
        return;
      }

      const data = await response.json();
      setProducts(data.products);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to fetch products / Məhsullar alına bilmədi");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
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

  const handlePriceRangeChange = () => {
    setSelectedPriceRange(priceRange);
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
        // Show success message or update UI
        console.log("Product added to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  if (loading && !category) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-4 w-96 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
        </div>
      </Layout>
    );
  }

  if (error || !category) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4 text-center">
          <Package className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || "Category not found / Kateqoriya tapılmadı"}
          </h1>
          <p className="text-gray-600 mb-8">
            The category you're looking for doesn't exist or has been removed.
            / Axtardığınız kateqoriya mövcud deyil və ya silinib.
          </p>
          <Link href="/categories">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Categories / Kateqoriyalara Qayıt
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        {/* Breadcrumb / Yol Göstərici */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-blue-600">Home / Ana Səhifə</Link>
          <span>/</span>
          <Link href="/categories" className="hover:text-blue-600">Categories / Kateqoriyalar</Link>
          <span>/</span>
          <span className="text-gray-900">{category.name}</span>
        </nav>

        {/* Category Header / Kateqoriya Başlığı */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
            <Badge className="bg-blue-100 text-blue-800">
              {category.productCount} products
            </Badge>
          </div>
          <p className="text-lg text-gray-600">{category.description}</p>
        </div>

        {/* Filters and Search / Filtrlər və Axtarış */}
        <div className="mb-8 space-y-4">
          {/* Search Bar / Axtarış Səhifəsi */}
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products... / Məhsul axtar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <Button type="submit">Search / Axtar</Button>
          </form>

          {/* Controls / Nəzarət */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Sort Options / Sıralama Seçimləri */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Sort by / Sırala:</span>
              <div className="flex space-x-1">
                {[
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

            {/* View Mode / Görünüş Rejimi */}
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

          {/* Price Range Filter / Qiymət Aralığı Filtri */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Price Range / Qiymət Aralığı</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Min / Min:</label>
                <input
                  type="number"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Max / Maks:</label>
                <input
                  type="number"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <Button size="sm" onClick={handlePriceRangeChange}>
                Apply / Tətbiq Et
              </Button>
            </div>
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
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No products found / Məhsul tapılmadı
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search or filter criteria / Axtarış və ya filtr meyarlarınızı dəyişdirin
            </p>
            <Button onClick={() => {
              setSearchTerm("");
              setSelectedPriceRange({ min: 0, max: 1000 });
              setCurrentPage(1);
            }}>
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
    </Layout>
  );
}
