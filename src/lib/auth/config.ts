/**
 * NextAuth.js Configuration / NextAuth.js Konfiqurasiyası
 * This file contains the NextAuth.js configuration with multiple providers
 * Bu fayl çoxlu provayderlər ilə NextAuth.js konfiqurasiyasını ehtiva edir
 */

import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import AppleProvider from "next-auth/providers/apple";
import { prisma } from "@/lib/db";
import { compare } from "bcryptjs";
import { loginSchema } from "@/lib/validations/auth";
import { UserRole } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  // Database adapter / Veritabanı adapter-i
  adapter: PrismaAdapter(prisma),
  
  // Session strategy / Sessiya strategiyası
  session: {
    strategy: "jwt",
  },
  
  // JWT configuration / JWT konfiqurasiyası
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days / 30 gün
  },
  
  // Pages configuration / Səhifələr konfiqurasiyası
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  
  // Providers configuration / Provayderlər konfiqurasiyası
  providers: [
    // Google Provider / Google Provayderi
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      },
      profile(profile) {
        console.log("Google profile received:", profile);
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "CUSTOMER", // Default role for OAuth users
        };
      }
    }),
    
    // Facebook Provider / Facebook Provayderi
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      profile(profile) {
        console.log("Facebook profile received:", profile);
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          image: profile.picture?.data?.url,
          role: "CUSTOMER", // Default role for OAuth users
        };
      }
    }),
    
    // Apple Provider / Apple Provayderi
    // AppleProvider({
    //   clientId: process.env.APPLE_CLIENT_ID!,
    //   clientSecret: process.env.APPLE_CLIENT_SECRET!,
    // }),
    
    // Credentials Provider (Email/Password) / Kimlik Bilgiləri Provayderi
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email) {
            return null;
          }
          
          const { email } = credentials;
          
          // Find user in database / Veritabanında istifadəçini tap
          const user = await prisma.user.findUnique({
            where: { email },
          });
          
          if (!user || !user.isActive) {
            return null;
          }
          
          // For test purposes, allow login with any email / Test məqsədləri üçün hər hansı email ilə girişə icazə ver
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  
  // Callbacks / Callback-lər
  callbacks: {
    // JWT callback / JWT callback-i
    async jwt({ token, user, account }) {
      console.log("JWT callback - token:", token);
      console.log("JWT callback - user:", user);
      console.log("JWT callback - account:", account);
      
      // Initial sign in / İlkin giriş
      if (account && user) {
        console.log("JWT callback - initial sign in, user role:", user.role);
        return {
          ...token,
          id: user.id,
          name: user.name,
          email: user.email,
          picture: user.image,
          role: user.role,
        };
      }
      
      // Return previous token if the access token has not expired yet / Əgər access token hələ bitməyibsə əvvəlki token-i qaytar
      console.log("JWT callback - returning existing token");
      return token;
    },
    
    // Session callback / Sessiya callback-i
    async session({ session, token }) {
      console.log("Session callback - session:", session);
      console.log("Session callback - token:", token);
      
      if (token) {
        // Ensure session.user exists / session.user-ın mövcud olduğundan əmin ol
        if (!session.user) {
          session.user = {} as any;
        }
        
        // Update session with token data / Token məlumatları ilə session-u yenilə
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.picture as string;
        
        console.log("Session callback - updated session.user:", session.user);
      }
      
      // Debug: Log session data / Debug: Sessiya məlumatlarını log et
      console.log("Session data:", session);
      
      return session;
    },
    
    // Redirect callback / Yönləndirmə callback-i
    async redirect({ url, baseUrl }) {
      console.log("Redirect callback - url:", url, "baseUrl:", baseUrl);
      // If url is relative, make it absolute / Əgər url nisbi-dirsə, onu mütləq edin
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // If url is on the same origin, allow it / Əgər url eyni mənbədə-dirsə, icazə verin
      else if (new URL(url).origin === baseUrl) return url;
      // Otherwise redirect to baseUrl / Əks halda baseUrl-ə yönləndirin
      return baseUrl;
    },
    
    // Sign in callback / Giriş callback-i
    async signIn({ user, account, profile }) {
      try {
        console.log("SignIn callback - user:", user);
        console.log("SignIn callback - account:", account);
        console.log("SignIn callback - profile:", profile);
        
        // Check if user has required fields / İstifadəçinin tələb olunan sahələri yoxla
        if (!user.email) {
          console.error("SignIn error: User email is missing");
          return false;
        }
        
        if (account?.provider === "credentials") {
          // For credentials provider, check if user exists and is active
          // Kimlik bilgiləri provayderi üçün istifadəçinin mövcudluğunu və aktivliyini yoxla
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });
          
          if (!existingUser || !existingUser.isActive) {
            console.log("Credentials: User not found or inactive");
            return false;
          }
          
          console.log("Credentials: User authenticated successfully");
          return true;
        }
        
        // For OAuth providers / OAuth provayderlər üçün
        if (account?.provider && profile) {
          console.log("OAuth provider:", account.provider);
          
          // Check database connection and get existing user / Veritabanı əlaqəsini yoxla və mövcud istifadəçini al
          let existingUser;
          try {
            existingUser = await prisma.user.findUnique({
              where: { email: user.email! },
            });
            console.log("Database query successful, existing user:", existingUser);
          } catch (dbError) {
            console.error("Database error:", dbError);
            return false;
          }
          
          // Determine role based on email / Email-ə görə rol təyin et
          let userRole = "CUSTOMER"; // Default role / Varsayılan rol
          
          if (user.email === "admin@yusu.com") {
            userRole = "ADMIN";
          } else if (user.email === "seller1@yusu.com" || user.email === "seller2@yusu.com") {
            userRole = "SELLER";
          } else if (user.email === "courier1@yusu.com" || user.email === "courier2@yusu.com") {
            userRole = "COURIER";
          } else if (user.email?.includes("test-seller")) {
            // Test üçün: email-də "test-seller" varsa SELLER rol ver
            userRole = "SELLER";
          } else if (user.email?.includes("test-admin")) {
            // Test üçün: email-də "test-admin" varsa ADMIN rol ver
            userRole = "ADMIN";
          } else if (user.email?.includes("test-courier")) {
            // Test üçün: email-də "test-courier" varsa COURIER rol ver
            userRole = "COURIER";
          }
          
          console.log("User role determined:", userRole);
          
          if (!existingUser) {
            // Create new user for OAuth / OAuth üçün yeni istifadəçi yarat
            console.log("Creating new user for OAuth");
            try {
              const newUser = await prisma.user.create({
                data: {
                  email: user.email!,
                  name: user.name,
                  image: user.image,
                  role: userRole as UserRole,
                  isActive: true,
                },
              });
              console.log("New user created successfully:", newUser);
              
              // Update user object with database data / User obyektini veritabanı məlumatları ilə yenilə
              user.id = newUser.id;
              user.role = newUser.role;
            } catch (createError) {
              console.error("User creation error:", createError);
              return false;
            }
          } else {
            // Update existing user role if needed / Mövcud istifadəçinin rolunu lazım olduqda yenilə
            console.log("User exists, updating if needed");
            try {
              if (existingUser.role !== userRole) {
                await prisma.user.update({
                  where: { email: user.email! },
                  data: { role: userRole as UserRole },
                });
                console.log("User role updated");
              }
              
              // Update user object with database data / User obyektini veritabanı məlumatları ilə yenilə
              user.id = existingUser.id;
              user.role = existingUser.role;
            } catch (updateError) {
              console.error("User update error:", updateError);
              return false;
            }
          }
        }
        
        console.log("SignIn callback returning true");
        return true;
      } catch (error) {
        console.error("Sign in error:", error);
        return false;
      }
    },
  },
  
  // Events / Hadisələr
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`User signed in: ${user.email} via ${account?.provider}`);
    },
    async signOut({ session, token }) {
      console.log(`User signed out: ${session?.user?.email}`);
    },
    async createUser({ user }) {
      console.log(`New user created: ${user.email}`);
    },
  },
  
  // Debug mode in development / Development-da debug rejimi
  debug: process.env.NODE_ENV === "development",
};
