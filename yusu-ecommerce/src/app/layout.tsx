import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { CartProvider } from "@/store/CartContext";

export const metadata: Metadata = {
  title: "Yusu - Your Trusted E-commerce Platform",
  description: "Discover amazing products with fast delivery and secure payment. Your trusted e-commerce platform for quality products and reliable service.",
  keywords: "ecommerce, online shopping, products, delivery, secure payment",
  authors: [{ name: "Yusu Team" }],
  openGraph: {
    title: "Yusu - Your Trusted E-commerce Platform",
    description: "Discover amazing products with fast delivery and secure payment.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <SessionProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
