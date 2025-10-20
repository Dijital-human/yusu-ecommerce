/**
 * Header Component / Başlıq Komponenti
 * This component provides the main navigation header
 * Bu komponent əsas naviqasiya başlığını təmin edir
 */

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/store/CartContext";
import { usePermissions } from "@/hooks/usePermissions";
import { Button } from "@/components/ui/Button";
import { Cart } from "@/components/cart/Cart";
import { 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  Search,
  Heart,
  Package,
  Truck,
  Settings,
  ArrowRight
} from "lucide-react";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isCategoriesClosing, setIsCategoriesClosing] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const signInRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, handleSignOut } = useAuth();
  const { state: cartState } = useCart();
  const { canAccess } = usePermissions();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const toggleCategories = () => {
    if (isCategoriesOpen) {
      // Start closing animation / Bağlanma animasiyasını başlat
      setIsCategoriesClosing(true);
      // Close after animation completes / Animasiya bitdikdən sonra bağla
      setTimeout(() => {
        setIsCategoriesOpen(false);
        setIsCategoriesClosing(false);
      }, 300);
    } else {
      // Open immediately / Dərhal aç
      setIsCategoriesOpen(true);
    }
  };

  const toggleSignIn = () => {
    setIsSignInOpen(!isSignInOpen);
  };

  const handleSignOutClick = () => {
    handleSignOut();
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const handleLinkClick = () => {
    setIsUserMenuOpen(false);
  };

  const handleCategoryClick = () => {
    setIsCategoriesOpen(false);
  };

  const handleSignInClick = () => {
    setIsSignInOpen(false);
  };

  // Mock categories data for dropdown / Dropdown üçün test kateqoriya məlumatları
  const categoriesData = [
    {
      id: 1,
      name: "Electronics",
      icon: "📱",
      subcategories: [
        { name: "Smartphones", count: 150 },
        { name: "Laptops", count: 89 },
        { name: "Tablets", count: 45 },
        { name: "Headphones", count: 120 },
        { name: "Cameras", count: 67 }
      ]
    },
    {
      id: 2,
      name: "Fashion",
      icon: "👕",
      subcategories: [
        { name: "Men's Clothing", count: 200 },
        { name: "Women's Clothing", count: 300 },
        { name: "Shoes", count: 150 },
        { name: "Accessories", count: 89 },
        { name: "Jewelry", count: 45 }
      ]
    },
    {
      id: 3,
      name: "Home & Garden",
      icon: "🏠",
      subcategories: [
        { name: "Furniture", count: 120 },
        { name: "Kitchen", count: 95 },
        { name: "Garden", count: 67 },
        { name: "Decor", count: 134 },
        { name: "Tools", count: 78 }
      ]
    },
    {
      id: 4,
      name: "Sports",
      icon: "⚽",
      subcategories: [
        { name: "Fitness", count: 89 },
        { name: "Outdoor", count: 67 },
        { name: "Team Sports", count: 45 },
        { name: "Water Sports", count: 23 },
        { name: "Winter Sports", count: 34 }
      ]
    },
    {
      id: 5,
      name: "Beauty & Health",
      icon: "💄",
      subcategories: [
        { name: "Skincare", count: 156 },
        { name: "Makeup", count: 98 },
        { name: "Hair Care", count: 76 },
        { name: "Fragrance", count: 45 },
        { name: "Health", count: 67 }
      ]
    },
    {
      id: 6,
      name: "Books & Media",
      icon: "📚",
      subcategories: [
        { name: "Books", count: 234 },
        { name: "Movies", count: 89 },
        { name: "Music", count: 67 },
        { name: "Games", count: 123 },
        { name: "Magazines", count: 45 }
      ]
    }
  ];

  // Close dropdowns when clicking outside / Dropdown-ları kənardan kliklədikdə bağla
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (signInRef.current && !signInRef.current.contains(event.target as Node)) {
        setIsSignInOpen(false);
      }
    };

    if (isUserMenuOpen || isSignInOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen, isSignInOpen]);

  // Close categories dropdown when clicking outside / Kateqoriya dropdown-u kənardan kliklədikdə bağla
  useEffect(() => {
    const handleCategoriesClickOutside = (event: MouseEvent) => {
      if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setIsCategoriesOpen(false);
      }
    };

    if (isCategoriesOpen) {
      document.addEventListener('mousedown', handleCategoriesClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleCategoriesClickOutside);
    };
  }, [isCategoriesOpen]);

  // Close mobile menu when clicking outside / Mobil menyunu kənardan kliklədikdə bağla
  useEffect(() => {
    const handleMobileMenuClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleMobileMenuClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleMobileMenuClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Handle mobile categories dropdown footer click / Mobil kateqoriya dropdown footer kliklədikdə bağla
  const handleMobileCategoriesFooterClick = () => {
    toggleCategories();
  };


  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar / Üst Sətir */}
        <div className="flex items-center justify-between h-16">
          {/* Logo Section / Loqo Bölməsi */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center group">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shadow-lg">
                <span className="text-white font-bold text-lg">Y</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-200">
                Yusu
              </span>
            </Link>
          </div>

          {/* Desktop Navigation / Desktop Naviqasiya - Hide at 1000px and below / 1000px və aşağıda gizlə */}
          <nav className="hidden lg:flex items-center space-x-8">
            {/* Products Link / Məhsullar Linki */}
            <Link 
              href="/products" 
              className="text-gray-700 hover:text-orange-600 transition-colors duration-200 font-medium"
            >
              Products
            </Link>
            
            {/* Categories Dropdown / Kateqoriya Dropdown */}
            <div className="relative" ref={categoriesRef}>
              <button
                onClick={toggleCategories}
                className="flex items-center space-x-1 text-gray-700 hover:text-orange-600 transition-colors duration-200 font-medium"
              >
                <span>Categories</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
                     </div>

            {/* Search Bar / Axtarış Çubuğu */}
            <div className="relative">
              <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 w-80">
                <Search className="h-4 w-4 text-gray-400 mr-2" />
                     <input
                       type="text"
                  placeholder="Search for products..."
                  className="flex-1 bg-transparent border-none outline-none text-sm"
                     />
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1 rounded-full text-sm font-medium transition-colors duration-200">
                  Search
                </button>
              </div>
                 </div>
          </nav>

          {/* Right Side Actions / Sağ Tərəf Əməliyyatları */}
          <div className="flex items-center space-x-4">
            {/* Wishlist / İstək Siyahısı */}
            <button className="relative p-2 text-gray-700 hover:text-orange-600 transition-colors duration-200">
              <Heart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </button>

            {/* Cart / Səbət */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-gray-700 hover:text-orange-600 transition-colors duration-200"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartState.items.length}
                </span>
            </button>

            {/* Sign In Dropdown / Daxil Olma Dropdown */}
            <div className="relative" ref={signInRef}>
              <button
                onClick={toggleSignIn}
                className="flex items-center space-x-1 text-gray-700 hover:text-orange-600 transition-colors duration-200 font-medium"
                >
                  <User className="h-5 w-5" />
                <span>Sign In</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Sign In Dropdown Menu / Daxil Olma Dropdown Menyu */}
              {isSignInOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 py-4 z-50">
                  <div className="px-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Welcome to Yusu</h3>
                    <div className="space-y-3">
                      <input
                        type="email"
                        placeholder="Email address"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                      <input
                        type="password"
                        placeholder="Password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                      <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium transition-colors duration-200">
                        Sign In
                      </button>
                      <div className="text-center">
                        <span className="text-gray-600">Don't have an account? </span>
                        <Link href="/auth/signup" className="text-orange-600 hover:text-orange-700 font-medium">
                          Sign Up
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                )}
              </div>

            {/* Mobile Menu Button / Mobil Menyu Düyməsi - Show at 1000px and below / 1000px və aşağıda göstər */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 text-gray-700 hover:text-orange-600 transition-colors duration-200"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Menu / Mobil Menyu - Show at 1000px and below / 1000px və aşağıda göstər */}
        {isMobileMenuOpen && (
          <div ref={mobileMenuRef} className="lg:hidden border-t border-gray-200 py-4">
            <div className="space-y-4">
              {/* Mobile Search / Mobil Axtarış */}
              <div className="relative px-4">
                <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
                  <Search className="h-4 w-4 text-gray-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Search for products..."
                    className="flex-1 bg-transparent border-none outline-none text-sm"
                  />
                  <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1 rounded-full text-sm font-medium transition-colors duration-200">
                    Search
                  </button>
                </div>
              </div>

              {/* Mobile Wishlist & Cart / Mobil İstək Siyahısı və Səbət */}
              <div className="flex items-center justify-center px-4 py-3 border-t border-gray-200">
                <div className="flex items-center space-x-8">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-orange-600 transition-colors duration-200">
                    <Heart className="h-5 w-5" />
                    <span>Wishlist</span>
                    <span className="bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      0
                    </span>
                  </button>
                  <button
                    onClick={() => setIsCartOpen(true)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-orange-600 transition-colors duration-200"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span>Cart</span>
                    <span className="bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartState.items.length}
                    </span>
                  </button>
                </div>
              </div>

              {/* Mobile Categories / Mobil Kateqoriyalar */}
              <div className="relative px-4" ref={categoriesRef}>
                <button
                  onClick={toggleCategories}
                  className="flex items-center justify-between w-full text-left py-3 text-gray-700 hover:text-orange-600 transition-colors duration-200 font-medium"
                >
                  <span>Categories</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
              </div>
            )}

        {/* Desktop Categories Dropdown / Desktop Kateqoriya Dropdown */}
        {isCategoriesOpen && (
          <div className={`fixed inset-0 bg-white z-50 overflow-hidden transition-all duration-300 ${
            isCategoriesClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}>
            <div className="p-4 md:p-6 lg:p-8">
              {/* Header Section with Close Button / Bağlama Düyməsi ilə Başlıq Bölməsi */}
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <div className="text-center flex-1">
                  <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-2">Shop by Category</h3>
                  <p className="text-sm md:text-base text-orange-600">Discover amazing products in every category</p>
                </div>
                {/* Close Button / Bağlama Düyməsi */}
                <button
                  onClick={toggleCategories}
                  className="w-10 h-10 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>
              
              {/* Categories Grid / Kateqoriya Şəbəkəsi */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {categoriesData.map((category) => (
                  <div key={category.id} className="group">
                    <div className="bg-gradient-to-br from-orange-50 to-white p-3 md:p-4 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer border border-orange-100">
                      {/* Category Icon & Name / Kateqoriya İkonu və Adı */}
                      <div className="text-center mb-3 md:mb-4">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-2 md:mb-3 group-hover:scale-110 transition-transform duration-300 shadow-md">
                          <span className="text-xl md:text-3xl">{category.icon}</span>
          </div>
                        <h4 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors duration-300 text-xs md:text-sm">
                          {category.name}
                        </h4>
        </div>

                      {/* Subcategories / Alt Kateqoriyalar */}
                      <div className="space-y-1 md:space-y-2">
                        {category.subcategories.slice(0, 4).map((sub, index) => (
                          <div key={index} className="flex items-center justify-between py-1 px-1 md:px-2 rounded-md hover:bg-orange-50 transition-colors duration-200">
                            <span className="text-xs text-gray-700 hover:text-orange-600 transition-colors duration-200 font-medium truncate">
                              {sub.name}
                            </span>
                            <span className="text-xs bg-orange-100 text-orange-700 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full font-medium flex-shrink-0 ml-1">
                              {sub.count}
                            </span>
                          </div>
                        ))}
                        {category.subcategories.length > 4 && (
                          <div className="text-xs text-orange-600 font-semibold text-center pt-1 md:pt-2 border-t border-orange-200">
                            +{category.subcategories.length - 4} more
                          </div>
                        )}
                      </div>
                           </div>
                         </div>
                ))}
                     </div>

              {/* Footer Section / Alt Bölmə */}
              <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-orange-200">
                <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                  <div className="flex items-center space-x-2 md:space-x-4">
                    <div className="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-orange-500 rounded-full"></span>
                      <span>Live Products</span>
                    </div>
                    <div className="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-orange-400 rounded-full"></span>
                      <span>Fast Delivery</span>
                    </div>
                    <div className="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-orange-600 rounded-full"></span>
                      <span>24/7 Support</span>
                    </div>
                  </div>
              <Link
                href="/categories"
                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 text-sm md:text-base"
                    onClick={handleCategoryClick}
              >
                    View All Categories →
              </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Categories List - Full Screen Design with Animation / Tam Ekran Animasiyalı Mobil Kateqoriya Siyahısı */}
        {isCategoriesOpen && (
          <div 
            className={`fixed inset-0 z-50 bg-white overflow-hidden transition-all duration-300 ${
              isCategoriesClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}
          >
            {/* Header with Close Button - Sticky / Sticky Bağlama Düyməsi ilə Başlıq */}
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-4 md:p-6 lg:p-8 border-b border-gray-200">
              <div className="text-center flex-1">
                <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-2">Shop by Category</h3>
                <p className="text-sm md:text-base text-orange-600">Discover amazing products in every category</p>
              </div>
              {/* Close Button / Bağlama Düyməsi */}
              <button
                onClick={toggleCategories}
                className="w-10 h-10 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
            
            {/* Scrollable Content / Scroll Edilə Bilən Məzmun */}
            <div className="h-full overflow-y-auto">
              <div className="p-4 md:p-6 lg:p-8">
                {/* Categories Grid - Desktop Style / Desktop Stilində Kateqoriya Şəbəkəsi */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                  {categoriesData.map((category) => (
                    <div key={category.id} className="group">
                      <div className="bg-gradient-to-br from-orange-50 to-white p-3 md:p-4 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer border border-orange-100">
                        {/* Category Icon & Name / Kateqoriya İkonu və Adı */}
                        <div className="text-center mb-3 md:mb-4">
                          <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-2 md:mb-3 group-hover:scale-110 transition-transform duration-300 shadow-md">
                            <span className="text-xl md:text-3xl">{category.icon}</span>
                          </div>
                          <h4 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors duration-300 text-xs md:text-sm">
                            {category.name}
                          </h4>
                        </div>
                        
                        {/* Subcategories / Alt Kateqoriyalar */}
                        <div className="space-y-1 md:space-y-2">
                          {category.subcategories.slice(0, 4).map((sub, index) => (
                            <div key={index} className="flex items-center justify-between py-1 px-1 md:px-2 rounded-md hover:bg-orange-50 transition-colors duration-200">
                              <span className="text-xs text-gray-700 hover:text-orange-600 transition-colors duration-200 font-medium truncate">
                                {sub.name}
                              </span>
                              <span className="text-xs bg-orange-100 text-orange-700 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full font-medium flex-shrink-0 ml-1">
                                {sub.count}
                              </span>
                            </div>
                          ))}
                          {category.subcategories.length > 4 && (
                            <div className="text-xs text-orange-600 font-semibold text-center pt-1 md:pt-2 border-t border-orange-200">
                              +{category.subcategories.length - 4} more
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Footer Section - Desktop Style / Desktop Stilində Alt Bölmə */}
                <div 
                  className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-orange-200 cursor-pointer"
                  onClick={handleMobileCategoriesFooterClick}
                >
                  <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                    <div className="flex items-center space-x-2 md:space-x-4">
                      <div className="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm text-gray-600">
                        <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-orange-500 rounded-full"></span>
                        <span>Live Products</span>
                      </div>
                      <div className="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm text-gray-600">
                        <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-orange-400 rounded-full"></span>
                        <span>Fast Delivery</span>
                      </div>
                      <div className="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm text-gray-600">
                        <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-orange-600 rounded-full"></span>
                        <span>24/7 Support</span>
                      </div>
                    </div>
              <Link
                      href="/categories"
                      className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 text-sm md:text-base"
                      onClick={handleCategoryClick}
                    >
                      View All Categories →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cart Sidebar / Səbət Yan Paneli */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300" 
            onClick={() => setIsCartOpen(false)} 
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out">
            <div className="h-full overflow-y-auto">
              <Cart onClose={() => setIsCartOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
