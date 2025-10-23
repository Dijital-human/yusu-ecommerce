import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { CartProvider } from "@/store/CartContext";

export const metadata: Metadata = {
  title: "Yusu - Customer Platform",
  description: "Reliable e-commerce platform for customers with quality products, fast delivery and secure payment.",
  keywords: "ecommerce, online shopping, customer, products, delivery, secure payment",
  authors: [{ name: "Yusu Customer Team" }],
  openGraph: {
    title: "Yusu - Customer Platform",
    description: "Quality products, fast delivery and secure payment.",
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
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
