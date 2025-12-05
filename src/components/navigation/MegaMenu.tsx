/**
 * Mega Menu Component / Mega Menyu Komponenti
 * Trendyol-style mega menu with categories and featured products
 * Trendyol stilində kateqoriyalar və tövsiyə edilən məhsullar ilə mega menyu
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { 
  ChevronRight, 
  Package, 
  ArrowRight,
  Sparkles,
  BookOpen,
  Smartphone,
  Laptop,
  Shirt,
  Footprints,
  Home,
  Dumbbell,
  Sparkles as SparklesIcon,
  Baby,
  Car,
  Utensils,
  Gamepad2,
  Heart,
  Gem,
  LucideIcon,
  X
} from "lucide-react";
import { useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  children?: Category[];
  _count?: {
    products: number;
  };
}

interface MegaMenuProps {
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  activeCategoryId?: string | null;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

// Icon mapping function / Icon mapping funksiyası
const getCategoryIcon = (categoryName: string, categoryId?: string): LucideIcon => {
  const name = categoryName.toLowerCase();
  const id = categoryId?.toLowerCase() || "";
  
  // Match by name or ID / Ad və ya ID-yə görə uyğunlaşdır
  if (name.includes("kitab") || name.includes("book") || id.includes("book")) {
    return BookOpen;
  }
  if (name.includes("elektron") || name.includes("electron") || id.includes("electron")) {
    return Smartphone;
  }
  if (name.includes("geyim") || name.includes("clothing") || name.includes("apparel") || name.includes("giyim") || name.includes("fashion")) {
    return Shirt;
  }
  if (name.includes("ayaqqabı") || name.includes("shoe") || name.includes("footwear") || name.includes("ayakkabı")) {
    return Footprints;
  }
  if (name.includes("ev") || name.includes("home") || name.includes("house") || name.includes("yaşayış")) {
    return Home;
  }
  if (name.includes("idman") || name.includes("sport")) {
    return Dumbbell;
  }
  if (name.includes("gözəllik") || name.includes("beauty") || name.includes("cosmetic") || name.includes("güzellik")) {
    return SparklesIcon;
  }
  if (name.includes("uşaq") || name.includes("child") || name.includes("toy") || name.includes("oyuncaq")) {
    return Baby;
  }
  if (name.includes("avtomobil") || name.includes("auto") || name.includes("car")) {
    return Car;
  }
  if (name.includes("qida") || name.includes("food")) {
    return Utensils;
  }
  if (name.includes("sağlamlıq") || name.includes("health")) {
    return Heart;
  }
  if (name.includes("zinət") || name.includes("jewelry") || name.includes("mücevher")) {
    return Gem;
  }
  
  return Package; // Default icon / Default icon
};

// Get category translation name / Kateqoriya tərcümə adını al
const getCategoryTranslationKey = (categoryName: string, categoryId?: string): string => {
  const name = categoryName.toLowerCase();
  const id = categoryId?.toLowerCase() || "";
  
  // Try to match category name to translation key / Kateqoriya adını tərcümə key-inə uyğunlaşdır
  if (name.includes("kitab") || name.includes("book") || id.includes("book")) {
    return "books";
  }
  if (name.includes("elektron") || name.includes("electron") || id.includes("electron")) {
    return "electronics";
  }
  if (name.includes("geyim") || name.includes("clothing") || name.includes("apparel") || name.includes("giyim") || name.includes("fashion")) {
    return "clothing";
  }
  if (name.includes("ayaqqabı") || name.includes("shoe") || name.includes("footwear") || name.includes("ayakkabı")) {
    return "shoes";
  }
  if (name.includes("ev") || name.includes("home") || name.includes("house") || name.includes("yaşayış")) {
    return "home";
  }
  if (name.includes("idman") || name.includes("sport") || name.includes("sports")) {
    return "sports";
  }
  if (name.includes("gözəllik") || name.includes("beauty") || name.includes("cosmetic") || name.includes("güzellik")) {
    return "beauty";
  }
  if (name.includes("uşaq") || name.includes("child") || name.includes("toy") || name.includes("oyuncaq")) {
    return "toys";
  }
  if (name.includes("avtomobil") || name.includes("auto") || name.includes("car")) {
    return "automotive";
  }
  if (name.includes("qida") || name.includes("food")) {
    return "food";
  }
  if (name.includes("sağlamlıq") || name.includes("health")) {
    return "health";
  }
  if (name.includes("zinət") || name.includes("jewelry") || name.includes("mücevher")) {
    return "jewelry";
  }
  
  return ""; // Return empty if no match / Uyğun olmadıqda boş qaytar
};

// Mock categories for development / Development üçün mock kateqoriyalar
const mockCategories: Category[] = [
  {
    id: "books",
    name: "Kitablar",
    image: "/categories/books.jpg",
    children: [
      { id: "fiction", name: "Bədii Ədəbiyyat", _count: { products: 150 } },
      { id: "non-fiction", name: "Qeyri-Bədii", _count: { products: 200 } },
      { id: "children", name: "Uşaq Kitabları", _count: { products: 100 } },
      { id: "textbooks", name: "Dərsliklər", _count: { products: 80 } },
      { id: "comics", name: "Komikslər", _count: { products: 60 } },
      { id: "reference", name: "İstinad", _count: { products: 40 } },
      { id: "sci-fi", name: "Elmi Fantastika", _count: { products: 90 } },
      { id: "biography", name: "Bioqrafiya", _count: { products: 70 } },
    ],
    _count: { products: 790 }
  },
  {
    id: "electronics",
    name: "Elektronika",
    image: "/categories/electronics.jpg",
    children: [
      { id: "smartphones", name: "Smartfonlar", _count: { products: 300 } },
      { id: "laptops", name: "Noutbuklar", _count: { products: 150 } },
      { id: "tablets", name: "Planşetlər", _count: { products: 80 } },
      { id: "accessories", name: "Aksesuarlar", _count: { products: 200 } },
      { id: "audio", name: "Audio", _count: { products: 120 } },
      { id: "cameras", name: "Fotoaparatlar", _count: { products: 95 } },
      { id: "gaming", name: "Oyun", _count: { products: 180 } },
      { id: "smart-home", name: "Ağıllı Ev", _count: { products: 75 } },
    ],
    _count: { products: 1200 }
  },
  {
    id: "clothing",
    name: "Geyim",
    image: "/categories/clothing.jpg",
    children: [
      { id: "men", name: "Kişi Geyimləri", _count: { products: 250 } },
      { id: "women", name: "Qadın Geyimləri", _count: { products: 300 } },
      { id: "children", name: "Uşaq Geyimləri", _count: { products: 150 } },
      { id: "accessories", name: "Aksesuarlar", _count: { products: 120 } },
      { id: "jewelry", name: "Zinət Əşyaları", _count: { products: 200 } },
      { id: "bags", name: "Çantalar", _count: { products: 180 } },
      { id: "watches", name: "Saatlar", _count: { products: 140 } },
    ],
    _count: { products: 1340 }
  },
  {
    id: "shoes",
    name: "Ayaqqabı",
    image: "/categories/shoes.jpg",
    children: [
      { id: "men", name: "Kişi Ayaqqabıları", _count: { products: 120 } },
      { id: "women", name: "Qadın Ayaqqabıları", _count: { products: 180 } },
      { id: "sports", name: "İdman Ayaqqabıları", _count: { products: 100 } },
      { id: "casual", name: "Gündəlik", _count: { products: 150 } },
      { id: "boots", name: "Çəkmələr", _count: { products: 90 } },
      { id: "sandals", name: "Sandaletlər", _count: { products: 80 } },
    ],
    _count: { products: 720 }
  },
  {
    id: "home",
    name: "Ev & Yaşayış",
    image: "/categories/home.jpg",
    children: [
      { id: "furniture", name: "Mebel", _count: { products: 150 } },
      { id: "decor", name: "Dekorasiya", _count: { products: 200 } },
      { id: "kitchen", name: "Mətbəx", _count: { products: 180 } },
      { id: "bedroom", name: "Yataq Otağı", _count: { products: 120 } },
      { id: "bathroom", name: "Hamam", _count: { products: 100 } },
      { id: "lighting", name: "İşıqlandırma", _count: { products: 90 } },
      { id: "storage", name: "Saxlama", _count: { products: 110 } },
    ],
    _count: { products: 950 }
  },
  {
    id: "sports",
    name: "İdman",
    image: "/categories/sports.jpg",
    children: [
      { id: "fitness", name: "Fitness", _count: { products: 100 } },
      { id: "outdoor", name: "Açıq Hava", _count: { products: 80 } },
      { id: "teamSports", name: "Komanda İdmanları", _count: { products: 60 } },
      { id: "waterSports", name: "Su İdmanları", _count: { products: 70 } },
      { id: "winterSports", name: "Qış İdmanları", _count: { products: 50 } },
      { id: "cycling", name: "Velosiped", _count: { products: 90 } },
    ],
    _count: { products: 450 }
  },
  {
    id: "beauty",
    name: "Gözəllik",
    image: "/categories/beauty.jpg",
    children: [
      { id: "skincare", name: "Dəri Qulluğu", _count: { products: 150 } },
      { id: "makeup", name: "Makiyaj", _count: { products: 200 } },
      { id: "fragrance", name: "Ətir", _count: { products: 100 } },
      { id: "haircare", name: "Saç Qulluğu", _count: { products: 120 } },
      { id: "nail-care", name: "Dırnaq Qulluğu", _count: { products: 80 } },
      { id: "tools", name: "Alətlər", _count: { products: 90 } },
    ],
    _count: { products: 740 }
  },
];

export function MegaMenu({ categories, isOpen, onClose, activeCategoryId, onMouseEnter, onMouseLeave }: MegaMenuProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const desktopMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("navigation");
  const tCommon = useTranslations("common");
  const tCategories = useTranslations("categories");
  
  // Use mock categories if API returns empty / API boş qaytarsa mock kateqoriyaları istifadə et
  const displayCategories = categories.length > 0 ? categories : mockCategories;
  
  // Get category name with translation / Tərcümə ilə kateqoriya adını al
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
  
  // Get subcategory name with translation / Tərcümə ilə alt kateqoriya adını al
  const getSubcategoryName = (subcategory: Category, parentKey: string): string => {
    const subKey = getCategoryTranslationKey(subcategory.name, subcategory.id);
    if (subKey && parentKey) {
      // If subKey equals parentKey, subcategories.${parentKey} is an object, not a string / Əgər subKey parentKey-ə bərabərdirsə, subcategories.${parentKey} obyektdir, string deyil
      // So we should return the subcategory name directly or use a nested key / Buna görə də subcategory adını birbaşa qaytarmalıyıq və ya nested key istifadə etməliyik
      if (subKey === parentKey) {
        // Return subcategory name directly since subcategories.books is an object / subcategories.books obyekt olduğu üçün subcategory adını birbaşa qaytar
        return subcategory.name;
      }
      
      // Use nested key for subcategories / Alt kateqoriyalar üçün nested key istifadə et
      const translationKey = `subcategories.${parentKey}.${subKey}`;
      
      try {
        const translated = tCategories(translationKey);
        // Check if translation exists and is not the key itself / Tərcümənin mövcud olduğunu və key-in özü olmadığını yoxla
        if (translated && typeof translated === 'string' && translated !== translationKey) {
          return translated;
        }
      } catch (error) {
        // Translation key not found, try fallback / Tərcümə key-i tapılmadı, fallback yoxla
      }
      
      // Try alternative matching / Alternativ uyğunlaşdırma
      const name = subcategory.name.toLowerCase();
      if (name.includes("fiction") || name.includes("bədii")) {
        try {
          return tCategories("subcategories.books.fiction");
        } catch {
          return subcategory.name;
        }
      }
      if (name.includes("non") || name.includes("qeyri")) {
        try {
          return tCategories("subcategories.books.nonFiction");
        } catch {
          return subcategory.name;
        }
      }
      if (name.includes("smartphone") || name.includes("telefon")) {
        try {
          return tCategories("subcategories.electronics.smartphones");
        } catch {
          return subcategory.name;
        }
      }
      if (name.includes("laptop") || name.includes("noutbuk")) {
        try {
          return tCategories("subcategories.electronics.laptops");
        } catch {
          return subcategory.name;
        }
      }
      if (name.includes("tablet") || name.includes("planşet")) {
        try {
          return tCategories("subcategories.electronics.tablets");
        } catch {
          return subcategory.name;
        }
      }
    }
    return subcategory.name;
  };

  // Fetch featured products for selected category
  useEffect(() => {
    if (selectedCategory) {
      fetch(`/api/products?category=${selectedCategory.id}&limit=4`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setFeaturedProducts(data.data || []);
          }
        })
        .catch(() => {
          // Error is handled silently - featured products will just not show
          // Xəta səssiz idarə olunur - tövsiyə edilən məhsullar sadəcə göstərilməyəcək
        });
    }
  }, [selectedCategory]);

  // Close menu when clicking outside (desktop only)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        desktopMenuRef.current && 
        !desktopMenuRef.current.contains(target) &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(target)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Set first category as selected when menu opens
  useEffect(() => {
    if (isOpen && displayCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(displayCategories[0]);
    }
  }, [isOpen, displayCategories, selectedCategory]);

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Backdrop / Mobil Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 z-[90] md:hidden"
        onClick={onClose}
      />

      {/* Desktop Menu / Desktop Menyu */}
      <div 
        ref={desktopMenuRef}
        className="hidden md:block fixed top-16 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-2xl"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{ 
          animation: 'slideDown 0.3s ease-out',
          transform: isOpen ? 'translateY(0)' : 'translateY(-100%)',
          opacity: isOpen ? 1 : 0,
          transition: 'all 0.3s ease-out'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Left Side - Main Categories / Sol Tərəf - Əsas Kateqoriyalar */}
            <div className="col-span-3 border-r border-gray-200 dark:border-gray-700 pr-6">
              <div className="space-y-1">
                {displayCategories.map((category) => {
                  const IconComponent = getCategoryIcon(category.name, category.id);
                  const categoryName = getCategoryName(category);
                  const parentKey = getCategoryTranslationKey(category.name, category.id);
                  
                  return (
                    <Link
                      key={category.id}
                      href={`/categories/${category.id}`}
                      onMouseEnter={() => setSelectedCategory(category)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                        selectedCategory?.id === category.id
                          ? "bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 text-primary-700 dark:text-primary-300 font-semibold shadow-sm"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary-600 dark:hover:text-primary-400"
                      }`}
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        selectedCategory?.id === category.id
                          ? "bg-gradient-to-br from-primary-500 to-primary-600 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                      }`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="font-medium text-sm truncate dark:text-gray-200">{categoryName}</div>
                        {category._count && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {category._count.products} {t("products")}
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronRight 
                      className={`h-4 w-4 flex-shrink-0 transition-transform ${
                        selectedCategory?.id === category.id ? "text-primary-600 dark:text-primary-400" : "text-gray-400 dark:text-gray-500"
                      }`} 
                    />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Middle - Subcategories / Orta - Alt Kateqoriyalar */}
            <div className="col-span-5 border-r border-gray-200 dark:border-gray-700 pr-6">
              {selectedCategory && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{getCategoryName(selectedCategory)}</h3>
                    <Link
                      href={`/categories/${selectedCategory.id}`}
                      onClick={onClose}
                      className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium flex items-center"
                  >
                    {t("viewAll")} <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
                
                {selectedCategory.children && selectedCategory.children.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {selectedCategory.children.map((subcategory) => {
                      const SubIconComponent = getCategoryIcon(subcategory.name, subcategory.id);
                      const parentKey = getCategoryTranslationKey(selectedCategory.name, selectedCategory.id);
                      const subcategoryName = getSubcategoryName(subcategory, parentKey);
                      
                      return (
                        <Link
                          key={subcategory.id}
                          href={`/categories/${subcategory.id}`}
                          onClick={onClose}
                          className="group flex items-center space-x-3 p-3 rounded-lg hover:bg-primary-50 dark:hover:bg-gray-800 transition-colors duration-200"
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-lg flex items-center justify-center group-hover:from-primary-200 group-hover:to-primary-300 dark:group-hover:from-primary-800/50 dark:group-hover:to-primary-700/50 transition-colors">
                            <SubIconComponent className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-gray-900 dark:text-gray-200 group-hover:text-primary-700 dark:group-hover:text-primary-400 truncate">
                              {subcategoryName}
                            </div>
                            {subcategory._count && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {subcategory._count.products} {t("products")}
                              </div>
                            )}
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Package className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm">{t("noSubcategories")}</p>
                  </div>
                )}
              </div>
            )}
            </div>

            {/* Right Side - Featured Products / Sağ Tərəf - Tövsiyə Edilən Məhsullar */}
            <div className="col-span-4">
              {selectedCategory && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Sparkles className="h-5 w-5 text-primary-500 dark:text-primary-400" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t("featuredProducts")}</h3>
                  </div>
                  
                  {featuredProducts.length > 0 ? (
                    <div className="space-y-3">
                      {featuredProducts.slice(0, 4).map((product) => (
                        <Link
                          key={product.id}
                          href={`/products/${product.id}`}
                          onClick={onClose}
                          className="group flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                        >
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={Array.isArray(product.images) ? product.images[0] : product.images || "/placeholder-product.jpg"}
                              alt={product.name}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-gray-900 dark:text-gray-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 line-clamp-2">
                              {product.name}
                            </div>
                            <div className="text-sm font-bold text-primary-600 dark:text-primary-400 mt-1">
                              {formatCurrency(product.price)}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">{t("noProducts")}</p>
                    </div>
                  )}
              </div>
            )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu / Mobil Menyu - Bottom Sheet */}
      <div
        ref={mobileMenuRef}
        className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col opacity-100"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{
          animation: 'slideUp 0.3s ease-out',
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          opacity: isOpen ? 1 : 0,
          transition: 'all 0.3s ease-out'
        }}
      >
        {/* Mobile Header / Mobil Başlıq */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {t("categories")}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label={tCommon("close")}
          >
            <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Mobile Drag Handle / Mobil Sürükləmə Tutacağı */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        </div>

        {/* Mobile Content / Mobil Məzmun */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {/* Categories List / Kateqoriyalar Siyahısı */}
          <div className="space-y-2 mb-4">
            {displayCategories.map((category) => {
              const IconComponent = getCategoryIcon(category.name, category.id);
              const categoryName = getCategoryName(category);
              const isSelected = selectedCategory?.id === category.id;
              
              return (
                <div key={category.id}>
                  <button
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full flex items-center justify-between px-4 py-4 rounded-lg transition-all duration-200 touch-manipulation min-h-[56px] ${
                      isSelected
                        ? "bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 text-primary-700 dark:text-primary-300 font-semibold shadow-sm"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700"
                    }`}
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? "bg-gradient-to-br from-primary-500 to-primary-600 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                      }`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="font-medium text-base truncate dark:text-gray-200">{categoryName}</div>
                        {category._count && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {category._count.products} {t("products")}
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronRight 
                      className={`h-5 w-5 flex-shrink-0 transition-transform ${
                        isSelected ? "text-primary-600 dark:text-primary-400" : "text-gray-400 dark:text-gray-500"
                      }`} 
                    />
                  </button>

                  {/* Subcategories for selected category / Seçilmiş kateqoriya üçün alt kateqoriyalar */}
                  {isSelected && selectedCategory && selectedCategory.children && selectedCategory.children.length > 0 && (
                    <div className="mt-2 ml-4 space-y-2 pl-4 border-l-2 border-primary-200 dark:border-primary-800">
                      {selectedCategory.children.map((subcategory) => {
                        const SubIconComponent = getCategoryIcon(subcategory.name, subcategory.id);
                        const parentKey = getCategoryTranslationKey(selectedCategory.name, selectedCategory.id);
                        const subcategoryName = getSubcategoryName(subcategory, parentKey);
                        
                        return (
                          <Link
                            key={subcategory.id}
                            href={`/categories/${subcategory.id}`}
                            onClick={onClose}
                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-primary-50 dark:hover:bg-gray-800 active:bg-primary-100 dark:active:bg-gray-700 transition-colors duration-200 touch-manipulation min-h-[48px]"
                          >
                              <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-lg flex items-center justify-center flex-shrink-0">
                              <SubIconComponent className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm text-gray-900 dark:text-gray-200 truncate">
                                {subcategoryName}
                              </div>
                              {subcategory._count && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {subcategory._count.products} {t("products")}
                                </div>
                              )}
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* View All Categories Link / Bütün Kateqoriyaları Gör */}
          <Link
            href="/categories"
            onClick={onClose}
            className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 touch-manipulation min-h-[48px] mb-4"
          >
            <span>{t("viewAll")} {t("categories")}</span>
            <ArrowRight className="h-5 w-5 ml-2" />
          </Link>
        </div>
      </div>
    </>
  );
}

