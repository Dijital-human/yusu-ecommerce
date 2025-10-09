'use client';

import React from 'react';
import { ShoppingBag, Users, Package, TrendingUp } from 'lucide-react';

// Ana səhifə komponenti / Homepage component
export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header / Başlıq */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <ShoppingBag className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                E-commerce Platform
              </span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
                Ana səhifə / Home
              </a>
              <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
                Məhsullar / Products
              </a>
              <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
                Haqqımızda / About
              </a>
              <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
                Əlaqə / Contact
              </a>
            </nav>
            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Giriş / Login
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero section / Hero bölməsi */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Müasir E-ticarət Platforması
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Modern E-commerce Platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Məhsullara bax / Browse Products
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                Daha çox öyrən / Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features section / Xüsusiyyətlər bölməsi */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Xüsusiyyətlər / Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Güclü və istifadəçi dostu platforma / Powerful and user-friendly platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 / Xüsusiyyət 1 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
              <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                E-ticarət / E-commerce
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Tam funksional onlayn mağaza / Full-featured online store
              </p>
            </div>

            {/* Feature 2 / Xüsusiyyət 2 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
              <div className="bg-green-100 dark:bg-green-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                İstifadəçi İdarəetməsi / User Management
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                İstifadəçi rolları və icazələr / User roles and permissions
              </p>
            </div>

            {/* Feature 3 / Xüsusiyyət 3 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
              <div className="bg-purple-100 dark:bg-purple-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Məhsul İdarəetməsi / Product Management
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Məhsulları asanlıqla idarə edin / Manage products easily
              </p>
            </div>

            {/* Feature 4 / Xüsusiyyət 4 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
              <div className="bg-orange-100 dark:bg-orange-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Analitika / Analytics
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Detallı hesabatlar və statistikalar / Detailed reports and statistics
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Admin Panel section / Admin panel bölməsi */}
      <section className="bg-gray-100 dark:bg-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Admin Panel / Admin Panel
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Hər şeyi visual olaraq idarə edin / Manage everything visually
            </p>
          </div>

          <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Drag & Drop Builder / Sürüklə və Burax Builder
                </h3>
                <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                    Visual komponent idarəetməsi / Visual component management
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                    Real-time önizləmə / Real-time preview
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                    Responsive dizayn / Responsive design
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                    Kod yazmadan idarəetmə / Manage without coding
                  </li>
                </ul>
              </div>
              <div className="bg-gray-100 dark:bg-gray-600 rounded-lg p-4 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <span className="text-white font-bold">AB</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Admin Panel Preview / Admin Panel Önizləmə
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer / Alt hissə */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <ShoppingBag className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold">E-commerce Platform</span>
              </div>
              <p className="text-gray-400">
                Müasir e-ticarət həlli / Modern e-commerce solution
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Keçidlər / Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Ana səhifə / Home</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Məhsullar / Products</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Haqqımızda / About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Əlaqə / Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Dəstək / Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Yardım / Help</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Sənədlər / Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Əlaqə / Contact</h4>
              <ul className="space-y-2">
                <li className="text-gray-400">info@example.com</li>
                <li className="text-gray-400">+994 50 123 45 67</li>
                <li className="text-gray-400">Bakı, Azərbaycan</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 E-commerce Platform. Bütün hüquqlar qorunur / All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}