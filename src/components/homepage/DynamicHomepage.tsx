/**
 * Dynamic Homepage Component / Dinamik Ana Səhifə Komponenti
 * Fetches and displays dynamic homepage content from API
 * API-dən dinamik ana səhifə məzmununu gətirir və göstərir
 */

"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/Button";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { SectionRenderer } from "./SectionRenderer";
import { BannerCarousel } from "./BannerCarousel";
import { ArrowRight } from "lucide-react";

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  position: string;
  priority: number;
}

interface HomepageSection {
  id: string;
  type: string;
  title?: string;
  subtitle?: string;
  content?: any;
  order: number;
  config?: any;
}

interface HomepageData {
  sections: HomepageSection[];
  banners: {
    hero: Banner[];
    top: Banner[];
  };
}

export function DynamicHomepage() {
  const t = useTranslations("home");
  const [homepageData, setHomepageData] = useState<HomepageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHomepageData() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/homepage");
        if (!response.ok) {
          throw new Error("Failed to fetch homepage data");
        }

        const data = await response.json();
        setHomepageData(data.data || data);
      } catch (err: any) {
        console.error("Error fetching homepage data:", err);
        setError(err.message || t("failedToLoadHomepage"));
      } finally {
        setIsLoading(false);
      }
    }

    fetchHomepageData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error || !homepageData) {
    // Fallback to static content if API fails / Əgər API uğursuz olarsa statik məzmuna keç
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4 animate-fade-in-up">
            {t("welcomeToYusu")}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {t("discoverAmazingProducts")}
          </p>
          <Link href="/products">
            <Button className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-glow transition-all duration-300 hover:scale-105 animate-fade-in-up group" style={{ animationDelay: '0.2s' }}>
              {t("shopNow")}
              <ArrowRight className="ml-2 h-5 w-5 inline group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Transform banners to hero slides / Banner-ləri hero slide-lərə çevir
  const heroSlides = homepageData.banners.hero.map((banner) => ({
    id: banner.id,
    title: banner.title,
    subtitle: banner.subtitle || "",
    description: banner.subtitle || "",
    image: banner.image,
    buttonText: t("shopNow"),
    buttonLink: banner.link || "/",
  }));

  // Sort sections by order / Bölmələri sıraya görə sırala
  const sortedSections = [...homepageData.sections].sort((a, b) => a.order - b.order);

  return (
    <div>
      {/* Hero Carousel from Banners / Banner-lərdən Hero Carousel */}
      {heroSlides.length > 0 ? (
        <HeroCarousel slides={heroSlides} autoPlay={true} autoPlayInterval={5000} />
      ) : (
        // Fallback hero section if no banners / Əgər banner yoxdursa fallback hero bölməsi - Animated modern design / Hərəkətli müasir dizayn
        <section className="relative h-[500px] md:h-[600px] overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center">
          {/* Animated Background / Hərəkətli Arxa Plan */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Floating circles / Üzən dairələr - Yuxarı-aşağı animasiya (3 dairə) - Purple rənglər / Purple colors */}
            <div className="absolute top-20 left-20 w-32 h-32 bg-red-400/60 rounded-full animate-float-up-down"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-red-400/55 rounded-full animate-float-up-down" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-20 right-20 w-48 h-48 bg-red-400/60 rounded-full  animate-float-up-down" style={{ animationDelay: '2s' }}></div>
            
            {/* Gradient overlay / Gradient örtük */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-primary-900/30 via-transparent to-primary-800/30 animate-pulse-slow"></div>
          </div>
          
          {/* Content / Məzmun */}
          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 animate-fade-in-up drop-shadow-2xl">
              {t("welcomeToYusu")}
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-white/90 mb-8 animate-fade-in-up drop-shadow-lg" style={{ animationDelay: '0.1s' }}>
              {t("discoverAmazingProducts")}
            </p>
            <Link href="/products">
              <Button className="bg-white text-primary-600 hover:bg-primary-50 px-8 py-6 text-lg font-semibold shadow-2xl hover:shadow-glow transition-all duration-300 hover:scale-105 animate-fade-in-up group" style={{ animationDelay: '0.2s' }}>
                {t("shopNow")}
                <ArrowRight className="ml-2 h-5 w-5 inline group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* Top Banners / Üst Banner-lər */}
      {homepageData.banners.top.length > 0 && (
        <BannerCarousel banners={homepageData.banners.top} position="top" />
      )}

      {/* Dynamic Sections / Dinamik Bölmələr */}
      {sortedSections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}
    </div>
  );
}

