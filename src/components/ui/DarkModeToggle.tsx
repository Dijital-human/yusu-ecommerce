/**
 * Dark Mode Toggle Component / Dark Mode Dəyişdirici Komponent
 * Allows users to toggle between light and dark mode
 * İstifadəçilərə light və dark mode arasında keçid imkanı verir
 */

"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "next-intl";

interface DarkModeToggleProps {
  variant?: "default" | "footer";
}

export function DarkModeToggle({ variant = "default" }: DarkModeToggleProps) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("common");

  useEffect(() => {
    setMounted(true);
    // Check localStorage and system preference / localStorage və sistem seçimini yoxla
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDark(shouldBeDark);
    
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const buttonClassName = variant === "footer"
    ? "h-10 w-10 text-gray-300 hover:text-white hover:bg-gray-800 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 transition-colors duration-200"
    : "h-10 w-10 text-gray-700 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-gray-800 transition-colors duration-200";

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={buttonClassName}
        aria-label={t("toggleDarkMode") || "Toggle dark mode"}
      >
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleDarkMode}
      className={buttonClassName}
      aria-label={isDark ? (t("toggleLightMode") || "Switch to light mode") : (t("toggleDarkMode") || "Switch to dark mode")}
    >
      {isDark ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
}

