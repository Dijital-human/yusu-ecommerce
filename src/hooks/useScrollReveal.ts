/**
 * Scroll Reveal Hook / Scroll Görünmə Hook-u
 * Detects when elements enter viewport and adds reveal animation
 * Elementlərin viewport-a daxil olduğunu aşkar edir və görünmə animasiyası əlavə edir
 */

"use client";

import { useEffect, useRef, useState } from "react";

interface UseScrollRevealOptions {
  threshold?: number; // Intersection threshold / Kəsişmə həddi
  rootMargin?: string; // Root margin / Root margin
  once?: boolean; // Only animate once / Yalnız bir dəfə animasiya et
}

export function useScrollReveal(options: UseScrollRevealOptions = {}) {
  const { threshold = 0.1, rootMargin = "0px", once = true } = options;
  const elementRef = useRef<HTMLElement | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // If already revealed and once is true, don't observe again / Əgər artıq görünübsə və once true-dursa, yenidən observe etmə
    if (isRevealed && once) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsRevealed(true);
            element.classList.add("revealed");
            
            // If once is true, stop observing / Əgər once true-dursa, observe etməyi dayandır
            if (once) {
              observer.unobserve(element);
            }
          } else if (!once) {
            setIsRevealed(false);
            element.classList.remove("revealed");
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, once, isRevealed]);

  return { ref: elementRef, isRevealed };
}

