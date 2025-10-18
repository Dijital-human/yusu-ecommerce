import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { CartProvider } from "@/store/CartContext";

export const metadata: Metadata = {
  title: "Yusu Admin Panel - Admin Dashboard",
  description: "Yusu Admin Panel - Manage your e-commerce platform with powerful admin tools.",
  keywords: "admin, dashboard, ecommerce management, admin panel",
  authors: [{ name: "Yusu Admin Team" }],
  openGraph: {
    title: "Yusu Admin Panel - Admin Dashboard",
    description: "Manage your e-commerce platform with powerful admin tools.",
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
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
