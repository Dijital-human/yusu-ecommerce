/**
 * useRecentlyViewed Hook / Son Baxılanlar Hook
 * Manages recently viewed products with database integration
 * Veritabanı inteqrasiyası ilə son baxılan məhsulları idarə edir
 */

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string | string[];
  stock: number;
  viewedAt: Date | number;
  category?: {
    name: string;
  };
}

const MAX_ITEMS = 20;

export function useRecentlyViewed() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load from database if user is authenticated / İstifadəçi autentifikasiya olunubsa veritabanından yüklə
    if (session?.user?.id) {
      fetchRecentlyViewed();
    } else {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  const fetchRecentlyViewed = async () => {
    try {
      const response = await fetch(`/api/recently-viewed?limit=${MAX_ITEMS}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(
          data.products.map((p: any) => ({
            ...p.product,
            viewedAt: new Date(p.viewedAt).getTime(),
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching recently viewed products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addProduct = async (product: Omit<Product, "viewedAt">) => {
    if (!session?.user?.id) {
      // Fallback to localStorage if not authenticated / Autentifikasiya olunmayıbsa localStorage-a keç
      const STORAGE_KEY = "recentlyViewedProducts";
      const stored = localStorage.getItem(STORAGE_KEY);
      const existing = stored ? JSON.parse(stored) : [];
      const filtered = existing.filter((p: Product) => p.id !== product.id);
      const updated = [
        { ...product, viewedAt: Date.now() },
        ...filtered,
      ].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setProducts(updated);
      return;
    }

    try {
      const response = await fetch("/api/recently-viewed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId: product.id }),
      });

      if (response.ok) {
        // Refresh the list / Siyahını yenilə
        await fetchRecentlyViewed();
      }
    } catch (error) {
      console.error("Error adding recently viewed product:", error);
    }
  };

  const removeProduct = async (productId: string) => {
    if (!session?.user?.id) {
      // Fallback to localStorage / localStorage-a keç
      const STORAGE_KEY = "recentlyViewedProducts";
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const existing = JSON.parse(stored);
        const updated = existing.filter((p: Product) => p.id !== productId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setProducts(updated);
      }
      return;
    }

    try {
      const response = await fetch(
        `/api/recently-viewed?productId=${productId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
      }
    } catch (error) {
      console.error("Error removing recently viewed product:", error);
    }
  };

  const clearAll = async () => {
    if (!session?.user?.id) {
      // Fallback to localStorage / localStorage-a keç
      const STORAGE_KEY = "recentlyViewedProducts";
      localStorage.removeItem(STORAGE_KEY);
      setProducts([]);
      return;
    }

    try {
      const response = await fetch("/api/recently-viewed", {
        method: "DELETE",
      });

      if (response.ok) {
        setProducts([]);
      }
    } catch (error) {
      console.error("Error clearing recently viewed products:", error);
    }
  };

  return {
    products,
    addProduct,
    removeProduct,
    clearAll,
    isLoading,
  };
}

