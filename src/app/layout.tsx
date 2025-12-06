/**
 * Root Layout - Minimal wrapper for Next.js 15
 * Next.js 15 requires <html> and <body> tags in root layout
 * Next.js 15 root layout-da <html> və <body> tag-ləri tələb edir
 * Note: Actual styling and locale-specific content is in [locale]/layout.tsx
 * Qeyd: Faktiki styling və locale-ə xas məzmun [locale]/layout.tsx-dədir
 */
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { ErrorBoundary } from "@/components/error-boundary";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Yusu E-commerce",
  },
};

// Viewport and themeColor must be exported separately in Next.js 15
// Viewport və themeColor Next.js 15-də ayrıca export edilməlidir
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Next.js 15 requires html and body tags in root layout
  // Next.js 15 root layout-da html və body tag-ləri tələb edir
  // The actual locale-specific layout is in [locale]/layout.tsx
  // Faktiki locale-ə xas layout [locale]/layout.tsx-dədir
  // Default lang="en" - will be overridden by [locale]/layout.tsx
  // Default lang="en" - [locale]/layout.tsx tərəfindən override ediləcək
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Yusu" />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning data-scroll-behavior="smooth">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <SpeedInsights />
      </body>
    </html>
  );
}
