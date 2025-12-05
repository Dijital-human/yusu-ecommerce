/**
 * Performance Monitor Component / Performans Monitor Komponenti
 * Client-side component for initializing performance monitoring
 * Performans izləməsini başlatmaq üçün client-side komponent
 */

"use client";

import { useEffect } from "react";
import { initializePerformanceMonitoring } from "@/lib/performance/performance-monitor";

export function PerformanceMonitor() {
  useEffect(() => {
    initializePerformanceMonitoring();
  }, []);

  return null; // This component doesn't render anything / Bu komponent heç nə render etmir
}

