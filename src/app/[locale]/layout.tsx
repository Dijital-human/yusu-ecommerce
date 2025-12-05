/**
 * Locale Layout / Dil Layout-u
 * This layout provides locale-specific content and styling
 * Bu layout locale-ə xas məzmun və styling təmin edir
 */

import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
// CSS is imported in root layout.tsx / CSS root layout.tsx-də import edilib
import { AuthProvider } from "@/components/providers/AuthProvider";
import { CartProvider } from "@/store/CartContext";
import { PWARegister } from "@/components/pwa/PWARegister";
import { PWAInstaller } from "@/components/pwa/PWAInstaller";
import { FacebookPixel } from "@/components/marketing/FacebookPixel";
import { GoogleAds } from "@/components/marketing/GoogleAds";
import { PerformanceMonitor } from "@/components/performance/PerformanceMonitor";

export const metadata: Metadata = {
  title: "Yusu E-commerce - Customer Platform",
  description: "Reliable e-commerce platform for customers with quality products, fast delivery and secure payment.",
  keywords: "ecommerce, online shopping, customer, products, delivery, secure payment",
  authors: [{ name: "Yusu Customer Team" }],
  verification: {
    google: "4-KWiHdjRIvPfaqySQQcJqtdECwwbEmsP0QRoSg3cM0",
  },
  openGraph: {
    title: "Yusu E-commerce - Customer Platform",
    description: "Quality products, fast delivery and secure payment.",
    type: "website",
    locale: "en_US",
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  // Gələn `locale`-in etibarlı olduğundan əmin ol
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // Bütün mesajları client-ə təmin etmək
  const messages = await getMessages();

  // Note: <html> and <body> tags are in root layout.tsx for Next.js 15 compatibility
  // Qeyd: <html> və <body> tag-ləri Next.js 15 uyğunluğu üçün root layout.tsx-dədir
  // This layout provides locale-specific content and styling
  // Bu layout locale-ə xas məzmun və styling təmin edir
  return (
    <div lang={locale} data-scroll-behavior="smooth" className="font-sans antialiased h-full bg-white">
      <NextIntlClientProvider messages={messages}>
        <AuthProvider>
          <CartProvider>
            <PWARegister />
            <PWAInstaller />
            <FacebookPixel 
              pixelId={process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID}
              enabled={process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ENABLED === 'true'}
            />
            <GoogleAds 
              conversionId={process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID}
              enabled={process.env.NEXT_PUBLIC_GOOGLE_ADS_ENABLED === 'true'}
            />
            <PerformanceMonitor />
            {children}
          </CartProvider>
        </AuthProvider>
      </NextIntlClientProvider>
    </div>
  );
}


