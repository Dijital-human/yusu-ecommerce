/**
 * Authentication Provider / Autentifikasiya Provayderi
 * This component wraps the app with NextAuth SessionProvider
 * Bu komponent tətbiqi NextAuth SessionProvider ilə sarıyır
 */

"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { ReactNode } from "react";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <NextAuthSessionProvider>
      {children}
    </NextAuthSessionProvider>
  );
}
