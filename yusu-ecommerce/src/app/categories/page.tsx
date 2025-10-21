/**
 * Categories Page / Kateqoriyalar Səhifəsi
 * This component displays all available categories
 * Bu komponent bütün mövcud kateqoriyaları göstərir
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { 
  Package, 
  ArrowRight,
  Grid,
  List,
  Search,
  Filter
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
  isActive: boolean;
  parentId?: string;
  children?: Category[];
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/categories");
      
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Failed to fetch categories / Kateqoriyalar alına bilmədi");
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-4 w-96" />
          </div>
          
          <div className="mb-6">
            <Skeleton className="h-10 w-full max-w-md" />
          </div>
          
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

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Error / Xəta
          </h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={fetchCategories}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again / Yenidən Cəhd Et
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        {/* Header / Başlıq */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Shop by Category / Kateqoriyaya Görə Alış-veriş
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover amazing products organized by category. Find exactly what you're looking for with our comprehensive product catalog.
            / Kateqoriyaya görə təşkil edilmiş möhtəşəm məhsulları kəşf edin. Hərtərəfli məhsul kataloqumuzla axtardığınızı tapın.
          </p>
        </div>

        {/* Search and View Controls / Axtarış və Görünüş Nəzarəti */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories... / Kateqoriya axtar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg ${
                viewMode === "grid" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg ${
                viewMode === "list" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Categories Grid / Kateqoriyalar Şəbəkəsi */}
        {filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No categories found / Kateqoriya tapılmadı
            </h3>
            <p className="text-gray-600">
              Try adjusting your search terms / Axtarış şərtlərini dəyişdirin
            </p>
          </div>
        ) : (
          <div className={
            viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              : "space-y-6"
          }>
            {filteredCategories.map((category) => (
              <Link key={category.id} href={`/categories/${category.id}`}>
                <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 shadow-lg">
                  <div className="relative overflow-hidden rounded-t-xl">
                    <Image
                      src={category.image || "/placeholder-category.jpg"}
                      alt={category.name}
                      width={300}
                      height={200}
                      className={`w-full object-cover group-hover:scale-110 transition-transform duration-500 ${
                        viewMode === "grid" ? "h-56" : "h-40"
                      }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent group-hover:from-black/40 transition-all duration-300" />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-orange-500 text-white font-semibold px-3 py-1">
                        {category.productCount} products
                      </Badge>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <h3 className="text-white font-bold text-xl group-hover:text-orange-300 transition-colors">
                        {category.name}
                      </h3>
                    </div>
                  </div>
                  <CardContent className="p-6 bg-gradient-to-br from-white to-gray-50">
                    <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                      {category.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 font-medium">
                        {category.productCount} products available
                      </span>
                      <div className="flex items-center text-orange-500 group-hover:text-orange-600 transition-colors">
                        <span className="text-sm font-medium mr-2">Explore</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Stats Section / Statistika Bölməsi */}
        <div className="mt-20 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Category Statistics / Kateqoriya Statistikaları
            </h2>
            <p className="text-gray-600 text-lg">
              Overview of our comprehensive product catalog / Hərtərəfli məhsul kataloqumuzun ümumi baxışı
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl font-bold text-orange-600 mb-2">
                {categories.length}
              </div>
              <div className="text-gray-600 font-medium">Total Categories / Ümumi Kateqoriyalar</div>
            </div>
            <div className="text-center bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {categories.reduce((sum, cat) => sum + cat.productCount, 0)}
              </div>
              <div className="text-gray-600 font-medium">Total Products / Ümumi Məhsullar</div>
            </div>
            <div className="text-center bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {Math.round(categories.reduce((sum, cat) => sum + cat.productCount, 0) / categories.length)}
              </div>
              <div className="text-gray-600 font-medium">Avg Products per Category / Kateqoriya üzrə Orta Məhsul</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
