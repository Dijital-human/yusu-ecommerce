/**
 * Categories Page / Kateqoriyalar Səhifəsi
 * This component displays all available categories
 * Bu komponent bütün mövcud kateqoriyaları göstərir
 */

"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
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
  productCount?: number; // Optional, might come from _count.products / İstəyə bağlı, _count.products-dan gələ bilər
  isActive: boolean;
  parentId?: string;
  children?: Category[];
  _count?: {
    products: number;
  };
}

// Helper function to get category translation key / Kateqoriya tərcümə key-ini almaq üçün helper funksiya
const getCategoryTranslationKey = (categoryName: string, categoryId?: string): string => {
  const name = categoryName.toLowerCase();
  const id = categoryId?.toLowerCase() || "";
  
  if (name.includes("kitab") || name.includes("book") || id.includes("book")) return "books";
  if (name.includes("elektron") || name.includes("electron") || id.includes("electron")) return "electronics";
  if (name.includes("geyim") || name.includes("clothing") || name.includes("apparel") || name.includes("giyim") || name.includes("fashion")) return "clothing";
  if (name.includes("ayaqqabı") || name.includes("shoe") || name.includes("footwear") || name.includes("ayakkabı")) return "shoes";
  if (name.includes("ev") || name.includes("home") || name.includes("house") || name.includes("yaşayış") || name.includes("garden")) return "home";
  if (name.includes("idman") || name.includes("sport")) return "sports";
  if (name.includes("gözəllik") || name.includes("beauty") || name.includes("cosmetic") || name.includes("güzellik")) return "beauty";
  if (name.includes("uşaq") || name.includes("child") || name.includes("toy") || name.includes("oyuncaq")) return "toys";
  if (name.includes("avtomobil") || name.includes("auto") || name.includes("car")) return "automotive";
  if (name.includes("qida") || name.includes("food")) return "food";
  if (name.includes("sağlamlıq") || name.includes("health")) return "health";
  if (name.includes("zinət") || name.includes("jewelry") || name.includes("mücevher")) return "jewelry";
  
  return "";
};

export default function CategoriesPage() {
  const tCategories = useTranslations("categories");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Get translated category name / Tərcümə olunmuş kateqoriya adını al
  const getCategoryName = (category: Category): string => {
    const translationKey = getCategoryTranslationKey(category.name, category.id);
    if (translationKey) {
      try {
        return tCategories(translationKey);
      } catch {
        return category.name;
      }
    }
    return category.name;
  };

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
      
      // Ensure data is an array / Data-nın array olduğundan əmin ol
      // API might return { data: [...] } or { success: true, data: [...] } or directly [...]
      // API { data: [...] } və ya { success: true, data: [...] } və ya birbaşa [...] qaytara bilər
      const categoriesArray = Array.isArray(data) 
        ? data 
        : (data.data && Array.isArray(data.data))
          ? data.data
          : (data.success && Array.isArray(data.data))
            ? data.data
            : [];
      
      setCategories(categoriesArray);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Failed to fetch categories");
      setCategories([]); // Set empty array on error / Xəta olduqda boş array set et
    } finally {
      setLoading(false);
    }
  };

  // Ensure categories is always an array before filtering / Filter etməzdən əvvəl categories-in həmişə array olduğundan əmin ol
  const filteredCategories = Array.isArray(categories) 
    ? categories.filter(category =>
        category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category?.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

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
            Error
          </h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={fetchCategories}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        {/* Hero banner with CTA */}
        <div className="relative mb-12 rounded-2xl overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-orange-100" />
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 items-center p-8">
            <div>
              <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
                Shop by Category
              </h1>
              <p className="text-lg text-gray-700 max-w-2xl mb-6">
                Explore curated categories and discover trending products from top sellers. Fast delivery, trusted sellers, and great deals every day.
              </p>
              <div className="flex items-center space-x-3">
                <a href="#categories-grid" className="inline-block bg-orange-500 text-white px-5 py-3 rounded-lg font-semibold hover:bg-orange-600">Browse Categories</a>
                <a href="/products" className="inline-block bg-white border border-gray-200 px-4 py-3 rounded-lg hover:shadow">Shop All Products</a>
              </div>
            </div>
            <div className="hidden md:block">
              <img src="/images/hero-categories.jpg" alt="Categories hero" className="rounded-xl w-full h-56 object-cover shadow-md" />
            </div>
          </div>
        </div>

        {/* Search and View Controls */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search categories"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode("grid")}
              aria-pressed={viewMode === "grid"}
              className={`p-2 rounded-lg ${
                viewMode === "grid" 
                  ? "bg-orange-600 text-white" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              aria-pressed={viewMode === "list"}
              className={`p-2 rounded-lg ${
                viewMode === "list" 
                  ? "bg-orange-600 text-white" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        {filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No categories found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search terms
            </p>
          </div>
        ) : (
          <div id="categories-grid" className={
            viewMode === "grid" 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              : "space-y-6"
          }>
            {filteredCategories.map((category) => {
              const translatedName = getCategoryName(category);
              return (
              <Link key={category.id} href={`/categories/${category.id}`} aria-label={`Explore ${translatedName}`}>
                <article className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1">
                  <div className="relative h-72">
                    <Image
                      src={category.image || "/placeholder-category.jpg"}
                      alt={translatedName}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent group-hover:from-black/40 transition-all duration-300" />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-white text-gray-800 font-semibold px-3 py-1 shadow">
                        {category.productCount ?? category._count?.products ?? 0}
                      </Badge>
                    </div>
                    <div className="absolute bottom-6 left-6">
                      <h3 className="text-white font-bold text-2xl leading-tight drop-shadow">{translatedName}</h3>
                      <p className="text-sm text-white/90 mt-1 max-w-xs line-clamp-2">{category.description}</p>
                      <div className="mt-3 inline-flex items-center bg-orange-500 text-white px-3 py-2 rounded-md text-sm font-medium">Explore <ArrowRight className="ml-2 h-4 w-4" /></div>
                    </div>
                  </div>
                </article>
              </Link>
            );
            })}
          </div>
        )}

        {/* Stats Section */}
        <div className="mt-20 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Category Statistics
            </h2>
            <p className="text-gray-600 text-lg">
              Overview of our comprehensive product catalog
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl font-bold text-orange-600 mb-2">
                {categories.length}
              </div>
              <div className="text-gray-600 font-medium">Total Categories</div>
            </div>
            <div className="text-center bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {categories.reduce((sum, cat) => sum + (cat.productCount ?? cat._count?.products ?? 0), 0)}
              </div>
              <div className="text-gray-600 font-medium">Total Products</div>
            </div>
            <div className="text-center bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {categories.length > 0 
                  ? Math.round(categories.reduce((sum, cat) => sum + (cat.productCount ?? cat._count?.products ?? 0), 0) / categories.length)
                  : 0
                }
              </div>
              <div className="text-gray-600 font-medium">Avg Products per Category</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
