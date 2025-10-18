import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { CartProvider } from "@/store/CartContext";

export const metadata: Metadata = {
  title: "Yusu - Müştəri Platforması / Customer Platform",
  description: "Yusu - Müştərilər üçün etibarlı e-ticarət platforması. Keyfiyyətli məhsullar, sürətli çatdırılma və təhlükəsiz ödəniş. / Reliable e-commerce platform for customers with quality products, fast delivery and secure payment.",
  keywords: "ecommerce, online shopping, müştəri, customer, products, məhsullar, delivery, çatdırılma, secure payment, təhlükəsiz ödəniş",
  authors: [{ name: "Yusu Customer Team" }],
  openGraph: {
    title: "Yusu - Müştəri Platforması / Customer Platform",
    description: "Keyfiyyətli məhsullar, sürətli çatdırılma və təhlükəsiz ödəniş. / Quality products, fast delivery and secure payment.",
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
