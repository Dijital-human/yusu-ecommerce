/**
 * Trendyol-style Horizontal Scroll Carousel / Trendyol tipli Horizontal Karusel
 * 
 * Features / Xüsusiyyətlər:
 * - Touch/swipe support (mobile) / Toxunma/sürüşdürmə dəstəyi (mobil)
 * - Drag scroll (desktop) / Sürükləmə (kompüter)
 * - Left/Right arrow buttons / Sol/Sağ ox düymələri
 * - Snap effect / Yapışma effekti
 * - Dots indicator (optional) / Nöqtə indikatoru (istəyə bağlı)
 * - Auto-scroll option / Avtomatik sürüşmə seçimi
 * - Smooth animations / Hamar animasiyalar
 */

"use client";

import { useState, useRef, useEffect, useCallback, ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface HorizontalScrollCarouselProps {
  children: ReactNode[];
  /** Show navigation arrows / Naviqasiya oxlarını göstər */
  showArrows?: boolean;
  /** Show dot indicators / Nöqtə indikatorlarını göstər */
  showDots?: boolean;
  /** Enable auto scroll / Avtomatik sürüşməni aktiv et */
  autoScroll?: boolean;
  /** Auto scroll interval in ms / Avtomatik sürüşmə intervalı (ms) */
  autoScrollInterval?: number;
  /** Gap between items in px / Elementlər arasında boşluq (px) */
  gap?: number;
  /** Items to show per view (responsive) / Görünüşdə göstəriləcək element sayı */
  itemsPerView?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  /** Custom class for container / Konteyner üçün xüsusi sinif */
  className?: string;
  /** Custom class for items / Elementlər üçün xüsusi sinif */
  itemClassName?: string;
  /** Section title / Bölmə başlığı */
  title?: string;
  /** See all link / Hamısına bax linki */
  seeAllLink?: string;
  /** See all text / Hamısına bax mətni */
  seeAllText?: string;
  /** Enable loop / Dövr aktivləşdir */
  loop?: boolean;
  /** Pause on hover / Hover-də dayandır */
  pauseOnHover?: boolean;
}

export function HorizontalScrollCarousel({
  children,
  showArrows = true,
  showDots = false,
  autoScroll = false,
  autoScrollInterval = 4000,
  gap = 16,
  itemsPerView = { mobile: 2, tablet: 3, desktop: 5 },
  className,
  itemClassName,
  title,
  seeAllLink,
  seeAllText = "Hamısına bax",
  loop = false,
  pauseOnHover = true,
}: HorizontalScrollCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const itemCount = children.length;

  // Check scroll position / Sürüşmə mövqeyini yoxla
  const checkScrollPosition = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    // Calculate current index for dots / Nöqtələr üçün cari indeksi hesabla
    const itemWidth = container.firstElementChild?.clientWidth || 0;
    const newIndex = Math.round(scrollLeft / (itemWidth + gap));
    setCurrentIndex(newIndex);
  }, [gap]);

  // Scroll to direction / İstiqamətə sürüşdür
  const scroll = useCallback((direction: "left" | "right") => {
    const container = containerRef.current;
    if (!container) return;

    const itemWidth = container.firstElementChild?.clientWidth || 300;
    const scrollAmount = itemWidth + gap;
    
    const newScrollLeft = direction === "left" 
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    });
  }, [gap]);

  // Scroll to specific index / Müəyyən indeksə sürüşdür
  const scrollToIndex = useCallback((index: number) => {
    const container = containerRef.current;
    if (!container) return;

    const itemWidth = container.firstElementChild?.clientWidth || 300;
    const newScrollLeft = index * (itemWidth + gap);

    container.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    });
  }, [gap]);

  // Mouse/Touch drag handlers / Maus/Toxunma sürükləmə hadisələri
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;

    setIsDragging(true);
    setStartX(e.pageX - container.offsetLeft);
    setScrollLeft(container.scrollLeft);
    container.style.cursor = "grabbing";
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    const container = containerRef.current;
    if (container) {
      container.style.cursor = "grab";
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const container = containerRef.current;
    if (!container) return;

    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    container.scrollLeft = scrollLeft - walk;
  }, [isDragging, startX, scrollLeft]);

  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      const container = containerRef.current;
      if (container) {
        container.style.cursor = "grab";
      }
    }
  }, [isDragging]);

  // Touch handlers / Toxunma hadisələri
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const container = containerRef.current;
    if (!container) return;

    setIsDragging(true);
    setStartX(e.touches[0].pageX - container.offsetLeft);
    setScrollLeft(container.scrollLeft);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const container = containerRef.current;
    if (!container) return;

    const x = e.touches[0].pageX - container.offsetLeft;
    const walk = (x - startX) * 2;
    container.scrollLeft = scrollLeft - walk;
  }, [isDragging, startX, scrollLeft]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Auto scroll effect / Avtomatik sürüşmə effekti
  useEffect(() => {
    if (!autoScroll || isPaused) return;

    const interval = setInterval(() => {
      const container = containerRef.current;
      if (!container) return;

      if (canScrollRight) {
        scroll("right");
      } else if (loop) {
        container.scrollTo({ left: 0, behavior: "smooth" });
      }
    }, autoScrollInterval);

    return () => clearInterval(interval);
  }, [autoScroll, autoScrollInterval, canScrollRight, loop, isPaused, scroll]);

  // Listen for scroll events / Sürüşmə hadisələrini dinlə
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", checkScrollPosition);
    checkScrollPosition();

    // Check on window resize
    const handleResize = () => checkScrollPosition();
    window.addEventListener("resize", handleResize);

    return () => {
      container.removeEventListener("scroll", checkScrollPosition);
      window.removeEventListener("resize", handleResize);
    };
  }, [checkScrollPosition]);

  // Calculate visible dots / Görünən nöqtələri hesabla
  const visibleDots = Math.ceil(itemCount / (itemsPerView.desktop || 5));

  return (
    <div 
      className={cn("relative group", className)}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      {/* Header / Başlıq */}
      {title && (
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h2>
          {seeAllLink && (
            <a 
              href={seeAllLink}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors flex items-center gap-1"
            >
              {seeAllText}
              <ChevronRight className="h-4 w-4" />
            </a>
          )}
        </div>
      )}

      {/* Main Container / Əsas konteyner */}
      <div className="relative">
        {/* Left Arrow / Sol ox */}
        {showArrows && (
          <button
            onClick={() => scroll("left")}
            className={cn(
              "absolute left-0 top-1/2 -translate-y-1/2 z-10",
              "w-10 h-10 md:w-12 md:h-12 rounded-full",
              "bg-white/95 shadow-lg border border-gray-100",
              "flex items-center justify-center",
              "transition-all duration-300",
              "hover:bg-white hover:shadow-xl hover:scale-110",
              "focus:outline-none focus:ring-2 focus:ring-primary-500",
              "-translate-x-1/2 md:-translate-x-4",
              canScrollLeft 
                ? "opacity-100" 
                : "opacity-0 pointer-events-none"
            )}
            aria-label="Əvvəlki / Previous"
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 text-gray-700" />
          </button>
        )}

        {/* Right Arrow / Sağ ox */}
        {showArrows && (
          <button
            onClick={() => scroll("right")}
            className={cn(
              "absolute right-0 top-1/2 -translate-y-1/2 z-10",
              "w-10 h-10 md:w-12 md:h-12 rounded-full",
              "bg-white/95 shadow-lg border border-gray-100",
              "flex items-center justify-center",
              "transition-all duration-300",
              "hover:bg-white hover:shadow-xl hover:scale-110",
              "focus:outline-none focus:ring-2 focus:ring-primary-500",
              "translate-x-1/2 md:translate-x-4",
              canScrollRight 
                ? "opacity-100" 
                : "opacity-0 pointer-events-none"
            )}
            aria-label="Növbəti / Next"
          >
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6 text-gray-700" />
          </button>
        )}

        {/* Scroll Container / Sürüşmə konteyneri */}
        <div
          ref={containerRef}
          className={cn(
            "flex overflow-x-auto scrollbar-hide",
            "scroll-smooth snap-x snap-mandatory",
            "cursor-grab active:cursor-grabbing",
            "-mx-4 px-4 md:mx-0 md:px-0"
          )}
          style={{ 
            gap: `${gap}px`,
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            // CSS custom properties for responsive widths
            "--carousel-gap": `${gap}px`,
            "--items-mobile": itemsPerView.mobile || 2,
            "--items-tablet": itemsPerView.tablet || 3,
            "--items-desktop": itemsPerView.desktop || 5,
          } as React.CSSProperties}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {children.map((child, index) => (
            <div
              key={index}
              className={cn(
                "flex-shrink-0 snap-start",
                "transition-transform duration-300",
                isDragging ? "scale-[0.98]" : "hover:scale-[1.02]",
                "carousel-item",
                itemClassName
              )}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Dots Indicator / Nöqtə indikatoru */}
      {showDots && visibleDots > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {[...Array(visibleDots)].map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index * (itemsPerView.desktop || 5))}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === Math.floor(currentIndex / (itemsPerView.desktop || 5))
                  ? "w-8 bg-primary-600"
                  : "w-2 bg-gray-300 hover:bg-gray-400"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Hide scrollbar styles + Responsive carousel items / Sürüşmə panelini gizlət + Responsive karusel elementləri */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .carousel-item {
          width: calc((100% - (var(--carousel-gap, 16px) * (var(--items-mobile, 2) - 1))) / var(--items-mobile, 2));
        }
        @media (min-width: 768px) {
          .carousel-item {
            width: calc((100% - (var(--carousel-gap, 16px) * (var(--items-tablet, 3) - 1))) / var(--items-tablet, 3));
          }
        }
        @media (min-width: 1024px) {
          .carousel-item {
            width: calc((100% - (var(--carousel-gap, 16px) * (var(--items-desktop, 5) - 1))) / var(--items-desktop, 5));
          }
        }
      `}</style>
    </div>
  );
}

export default HorizontalScrollCarousel;

