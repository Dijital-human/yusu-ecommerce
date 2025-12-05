/**
 * Main Layout Component / Əsas Layout Komponenti
 * This component wraps the entire application with header and footer
 * Bu komponent bütün tətbiqi başlıq və altlıqla sarıyır
 */

"use client";

import { ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CookieConsentBanner } from "@/components/cookies/CookieConsentBanner";
import { LiveChat } from "@/components/chat/LiveChat";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const pathname = usePathname();

  // Scroll to top when page changes / Səhifə dəyişəndə yuxarı scroll et
  useEffect(() => {
    // Scroll to top immediately / Dərhal yuxarı scroll et
    window.scrollTo(0, 0);
    
    // Also scroll to top after a short delay to ensure it works / Qısa gecikmədən sonra da scroll et ki işləsin
    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <CookieConsentBanner />
      {/* Live Chat Widget / Canlı Chat Widget */}
      <LiveChat />
    </div>
  );
}
