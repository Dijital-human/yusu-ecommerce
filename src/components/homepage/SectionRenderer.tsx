/**
 * Section Renderer Component / Bölmə Renderer Komponenti
 * Renders different types of homepage sections dynamically
 * Müxtəlif tipli ana səhifə bölmələrini dinamik şəkildə render edir
 */

"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { FeaturedProductsSection } from "./sections/FeaturedProductsSection";
import { CategoriesSection } from "./sections/CategoriesSection";
import { TrendingProductsSection } from "./sections/TrendingProductsSection";
import { CustomHTMLSection } from "./sections/CustomHTMLSection";

interface HomepageSection {
  id: string;
  type: string;
  title?: string;
  subtitle?: string;
  content?: any;
  order: number;
  config?: any;
}

interface SectionRendererProps {
  section: HomepageSection;
}

export function SectionRenderer({ section }: SectionRendererProps) {
  const t = useTranslations("home");

  // Parse content if it's a string / Əgər content string-dirsə parse et
  const parsedContent = typeof section.content === "string" 
    ? (() => {
        try {
          return JSON.parse(section.content);
        } catch {
          return section.content;
        }
      })()
    : section.content;

  const parsedConfig = typeof section.config === "string"
    ? (() => {
        try {
          return JSON.parse(section.config);
        } catch {
          return section.config;
        }
      })()
    : section.config;

  switch (section.type) {
    case "HERO_CAROUSEL":
      // Hero carousel is handled separately / Hero carousel ayrıca idarə olunur
      return null;

    case "CATEGORIES":
      return (
        <CategoriesSection
          title={section.title}
          subtitle={section.subtitle}
          content={parsedContent}
          config={parsedConfig}
        />
      );

    case "FEATURED_PRODUCTS":
      return (
        <FeaturedProductsSection
          title={section.title}
          subtitle={section.subtitle}
          content={parsedContent}
          config={parsedConfig}
        />
      );

    case "TRENDING_PRODUCTS":
      return (
        <TrendingProductsSection
          title={section.title}
          subtitle={section.subtitle}
          content={parsedContent}
          config={parsedConfig}
        />
      );

    case "NEW_ARRIVALS":
    case "BEST_SELLERS":
      // Similar to featured products / Tövsiyə edilən məhsullara bənzər
      return (
        <FeaturedProductsSection
          title={section.title || t(`sections.${section.type.toLowerCase()}`)}
          subtitle={section.subtitle}
          content={parsedContent}
          config={parsedConfig}
        />
      );

    case "CUSTOM_HTML":
      return (
        <CustomHTMLSection
          title={section.title}
          subtitle={section.subtitle}
          content={parsedContent}
        />
      );

    default:
      return null;
  }
}

