/**
 * useProductCompare Hook / Məhsul Müqayisəsi Hook
 * Manages product comparison in localStorage
 * localStorage-da məhsul müqayisəsini idarə edir
 */

"use client";

import { useState, useEffect } from "react";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string | string[];
  averageRating?: number;
  reviewCount?: number;
  stock: number;
  description?: string;
  category?: {
    name: string;
  };
  seller?: {
    name: string;
  };
}

const STORAGE_KEY = "compareProducts";
const MAX_COMPARE = 4; // Maximum products to compare / Müqayisə edilə biləcək maksimum məhsul sayı

export function useProductCompare() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Load from localStorage on mount / Mount zamanı localStorage-dan yüklə
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setProducts(JSON.parse(stored));
        } catch (error) {
          console.error("Error loading compare products:", error);
        }
      }
    }
  }, []);

  const addProduct = (product: Product): boolean => {
    if (typeof window === "undefined") return false;

    // Check if already in compare / Artıq müqayisədə olub-olmadığını yoxla
    if (products.some((p) => p.id === product.id)) {
      return false; // Already in compare / Artıq müqayisədədir
    }

    // Check if max limit reached / Maksimum limitə çatıb-yetmədiyini yoxla
    if (products.length >= MAX_COMPARE) {
      return false; // Max limit reached / Maksimum limitə çatıb
    }

    setProducts((prev) => {
      const updated = [...prev, product];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    return true;
  };

  const removeProduct = (productId: string) => {
    if (typeof window === "undefined") return;

    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== productId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearAll = () => {
    if (typeof window === "undefined") return;

    setProducts([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const isInCompare = (productId: string): boolean => {
    return products.some((p) => p.id === productId);
  };

  const canAddMore = (): boolean => {
    return products.length < MAX_COMPARE;
  };

  return {
    products,
    addProduct,
    removeProduct,
    clearAll,
    isInCompare,
    canAddMore,
    count: products.length,
  };
}

