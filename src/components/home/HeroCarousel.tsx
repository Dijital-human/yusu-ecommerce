/**
 * Hero Carousel Component / Hero Carousel Komponenti
 * Alibaba-style full-width carousel with smooth animations
 * Alibaba stilində tam genişlikdə carousel smooth animasiyalarla
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/Button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  gradient?: string;
}

interface HeroCarouselProps {
  slides: HeroSlide[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export function HeroCarousel({ 
  slides, 
  autoPlay = true, 
  autoPlayInterval = 5000 
}: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const t = useTranslations("home");

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && !isPaused && slides.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, autoPlayInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoPlay, isPaused, slides.length, autoPlayInterval]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 3000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 3000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 3000);
  };

  if (slides.length === 0) return null;

  return (
    <section className="relative h-[600px] md:h-[700px] overflow-hidden group dark:bg-gray-900">
      {/* Slides Container / Slaydlar Konteyneri */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === currentSlide
                ? "opacity-100 translate-x-0"
                : index < currentSlide
                ? "opacity-0 -translate-x-full"
                : "opacity-0 translate-x-full"
            }`}
          >
            {/* Background Image / Arxa Plan Şəkli */}
            <div className="absolute inset-0">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              {/* Gradient Overlay / Gradient Örtük - Orange-based / Orange əsaslı */}
              <div 
                className={`absolute inset-0 ${
                  slide.gradient || "bg-gradient-to-r from-primary-900/80 via-primary-800/60 to-primary-700/40"
                }`}
              />
            </div>

            {/* Content / Məzmun */}
            <div className="relative z-10 h-full flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-2xl animate-fade-in">
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 animate-slide-up">
                    {slide.title}
                  </h1>
                  <h2 className="text-xl md:text-2xl lg:text-3xl text-blue-200 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    {slide.subtitle}
                  </h2>
                  <p className="text-lg md:text-xl text-gray-200 mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    {slide.description}
                  </p>
                  <Link href={slide.buttonLink}>
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-8 py-6 text-lg font-semibold shadow-2xl hover:shadow-glow transition-all duration-300 animate-slide-up hover:scale-105"
                      style={{ animationDelay: '0.3s' }}
                    >
                      {slide.buttonText}
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows / Naviqasiya Oxları */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Slide Indicators / Sürüşdürmə Göstəriciləri */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide
                ? 'w-8 h-3 bg-white'
                : 'w-3 h-3 bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress Bar / Tərəqqi Çubuğu */}
      {autoPlay && !isPaused && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-100 ease-linear"
            style={{
              width: isPaused ? '0%' : '100%',
            }}
          />
        </div>
      )}
    </section>
  );
}

