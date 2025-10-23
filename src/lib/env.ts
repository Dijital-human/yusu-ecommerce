/**
 * Environment Variables Validation / Mühit Dəyişənləri Doğrulama
 * This utility validates and provides type-safe access to environment variables
 * Bu utility environment variables-ları doğrulayır və type-safe giriş təmin edir
 */

import { z } from "zod";

// Environment schema definition / Mühit şeması tərifi
const envSchema = z.object({
  // Database / Veritabanı
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required / DATABASE_URL tələb olunur"),
  
  // NextAuth / NextAuth
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL / NEXTAUTH_URL etibarlı URL olmalıdır"),
  NEXTAUTH_SECRET: z.string().min(32, "NEXTAUTH_SECRET must be at least 32 characters / NEXTAUTH_SECRET ən azı 32 simvol olmalıdır"),
  
  // OAuth Providers / OAuth Provider-lər
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  FACEBOOK_CLIENT_ID: z.string().optional(),
  FACEBOOK_CLIENT_SECRET: z.string().optional(),
  APPLE_CLIENT_ID: z.string().optional(),
  APPLE_CLIENT_SECRET: z.string().optional(),
  
  // Payment Gateway / Ödəniş Gateway-i
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  
  // External APIs / Xarici API-lər
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional(),
  
  // Email Configuration / Email Konfiqurasiyası
  EMAIL_SERVER_HOST: z.string().optional(),
  EMAIL_SERVER_PORT: z.string().optional(),
  EMAIL_SERVER_USER: z.string().optional(),
  EMAIL_SERVER_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
  
  // Redis Configuration / Redis Konfiqurasiyası
  REDIS_URL: z.string().optional(),
  
  // Application Settings / Tətbiq Tənzimləri
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("3000"),
  
  // Security Settings / Təhlükəsizlik Tənzimləri
  CORS_ORIGIN: z.string().optional(),
  RATE_LIMIT_MAX: z.string().optional(),
  RATE_LIMIT_WINDOW_MS: z.string().optional(),
  
  // Logging Configuration / Logging Konfiqurasiyası
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  
  // File Upload Configuration / Fayl Yükləmə Konfiqurasiyası
  UPLOAD_DIR: z.string().default("./uploads"),
  MAX_FILE_SIZE: z.string().optional(),
  ALLOWED_FILE_TYPES: z.string().optional(),
});

// Environment validation function / Mühit doğrulama funksiyası
export function validateEnv() {
  try {
    const env = envSchema.parse(process.env);
    console.log("✅ Environment variables validated successfully / Mühit dəyişənləri uğurla doğrulandı");
    return env;
  } catch (error: any) {
    console.error("❌ Environment validation failed / Mühit doğrulaması uğursuz oldu:");
    if (error && error.errors && Array.isArray(error.errors)) {
      error.errors.forEach((err: any) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
    } else {
      console.error(`  - ${error?.message || error}`);
    }
    process.exit(1);
  }
}

// Type-safe environment variables / Type-safe mühit dəyişənləri
export type Env = z.infer<typeof envSchema>;

// Get environment variables with validation / Doğrulama ilə mühit dəyişənlərini əldə et
export const env = validateEnv();

// Helper functions / Köməkçi funksiyalar
export const isDevelopment = env.NODE_ENV === "development";
export const isProduction = env.NODE_ENV === "production";
export const isTest = env.NODE_ENV === "test";

// Database URL helper / Veritabanı URL köməkçisi
export const getDatabaseUrl = () => {
  if (isDevelopment) {
    return env.DATABASE_URL;
  }
  return env.DATABASE_URL;
};

// CORS origins helper / CORS mənbələri köməkçisi
export const getCorsOrigins = () => {
  if (!env.CORS_ORIGIN) return [];
  return env.CORS_ORIGIN.split(",").map(origin => origin.trim());
};

// Rate limiting helper / Rate limiting köməkçisi
export const getRateLimitConfig = () => {
  return {
    max: env.RATE_LIMIT_MAX ? parseInt(env.RATE_LIMIT_MAX) : 100,
    windowMs: env.RATE_LIMIT_WINDOW_MS ? parseInt(env.RATE_LIMIT_WINDOW_MS) : 900000,
  };
};

// File upload helper / Fayl yükləmə köməkçisi
export const getFileUploadConfig = () => {
  return {
    uploadDir: env.UPLOAD_DIR,
    maxFileSize: env.MAX_FILE_SIZE ? parseInt(env.MAX_FILE_SIZE) : 10485760, // 10MB default
    allowedTypes: env.ALLOWED_FILE_TYPES ? env.ALLOWED_FILE_TYPES.split(",") : [
      "image/jpeg",
      "image/png", 
      "image/gif",
      "image/webp"
    ],
  };
};

// Logging helper / Logging köməkçisi
export const getLogConfig = () => {
  return {
    level: env.LOG_LEVEL,
    isDevelopment,
    isProduction,
  };
};

// Email configuration helper / Email konfiqurasiya köməkçisi
export const getEmailConfig = () => {
  if (!env.EMAIL_SERVER_HOST || !env.EMAIL_SERVER_PORT || !env.EMAIL_SERVER_USER || !env.EMAIL_SERVER_PASSWORD) {
    return null;
  }
  
  return {
    host: env.EMAIL_SERVER_HOST,
    port: parseInt(env.EMAIL_SERVER_PORT),
    user: env.EMAIL_SERVER_USER,
    password: env.EMAIL_SERVER_PASSWORD,
    from: env.EMAIL_FROM || "noreply@azliner.info",
  };
};

// OAuth configuration helper / OAuth konfiqurasiya köməkçisi
export const getOAuthConfig = () => {
  const config: Record<string, any> = {};
  
  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    config.google = {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    };
  }
  
  if (env.FACEBOOK_CLIENT_ID && env.FACEBOOK_CLIENT_SECRET) {
    config.facebook = {
      clientId: env.FACEBOOK_CLIENT_ID,
      clientSecret: env.FACEBOOK_CLIENT_SECRET,
    };
  }
  
  if (env.APPLE_CLIENT_ID && env.APPLE_CLIENT_SECRET) {
    config.apple = {
      clientId: env.APPLE_CLIENT_ID,
      clientSecret: env.APPLE_CLIENT_SECRET,
    };
  }
  
  return config;
};

// Stripe configuration helper / Stripe konfiqurasiya köməkçisi
export const getStripeConfig = () => {
  if (!env.STRIPE_SECRET_KEY) {
    return null;
  }
  
  return {
    secretKey: env.STRIPE_SECRET_KEY,
    publishableKey: env.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET,
  };
};

// Redis configuration helper / Redis konfiqurasiya köməkçisi
export const getRedisConfig = () => {
  if (!env.REDIS_URL) {
    return null;
  }
  
  return {
    url: env.REDIS_URL,
  };
};

// All helper functions are already exported above / Bütün köməkçi funksiyalar yuxarıda artıq export edilib
