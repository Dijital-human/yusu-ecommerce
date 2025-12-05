import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // Enable experimental features / Eksperimental xüsusiyyətləri aktivləşdir
  serverExternalPackages: ['@prisma/client', '@tensorflow/tfjs-node', '@tensorflow-models/mobilenet'],
  
  // Edge runtime configuration / Edge runtime konfiqurasiyası
  experimental: {
    // Enable edge runtime for better performance / Daha yaxşı performans üçün edge runtime aktivləşdir
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  
  // Headers for edge caching / Edge caching üçün başlıqlar
  async headers() {
    const isProduction = process.env.NODE_ENV === 'production';
    
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          ...(isProduction ? [
            {
              key: 'Strict-Transport-Security',
              value: 'max-age=31536000; includeSubDomains; preload',
            },
            {
              key: 'Content-Security-Policy',
              value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://www.google-analytics.com https://api.stripe.com https://api.paypal.com; frame-src 'self' https://js.stripe.com https://www.paypal.com;",
            },
          ] : []),
        ],
      },
      {
        source: '/api/products/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=600',
          },
        ],
      },
      {
        source: '/api/categories/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=600, stale-while-revalidate=1200',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Transpile shared packages / Paylaşılan package-ləri transpile et
  transpilePackages: [
    '@yusu/shared-db',
    '@yusu/shared-utils',
    '@yusu/shared-types',
    '@yusu/ui-components',
  ],
  
  // ESLint configuration / ESLint konfiqurasiyası
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Webpack configuration for TensorFlow.js / TensorFlow.js üçün Webpack konfiqurasiyası
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude problematic modules from server bundle / Problematik modulları server bundle-dan çıxar
      config.externals = config.externals || [];
      config.externals.push({
        '@tensorflow/tfjs-node': 'commonjs @tensorflow/tfjs-node',
        '@tensorflow-models/mobilenet': 'commonjs @tensorflow-models/mobilenet',
      });
      
      // Ignore problematic files / Problematik faylları ignore et
      config.resolve = config.resolve || {};
      config.resolve.fallback = config.resolve.fallback || {};
      config.resolve.fallback.fs = false;
      config.resolve.fallback.path = false;
      config.resolve.fallback.crypto = false;
      
      // Ignore node-pre-gyp HTML files / node-pre-gyp HTML fayllarını ignore et
      config.module = config.module || {};
      config.module.rules = config.module.rules || [];
      config.module.rules.push({
        test: /\.html$/,
        include: /node_modules\/@mapbox\/node-pre-gyp/,
        use: 'ignore-loader',
      });
      
      // Ensure Prisma client is properly handled during build / Build zamanı Prisma client-in düzgün idarə olunduğundan əmin ol
      config.resolve.alias = config.resolve.alias || {};
      config.resolve.alias['@prisma/client'] = require.resolve('@prisma/client');
    }
    
    return config;
  },
  
  
  // Image optimization configuration / Şəkil optimizasiyası konfiqurasiyası
  images: {
    domains: [
      'localhost',
      'images.unsplash.com',
      'via.placeholder.com',
      'lh3.googleusercontent.com',
      'platform-lookaside.fbsbx.com',
      's.gravatar.com',
    ],
    formats: ['image/webp', 'image/avif'],
    // Allow local uploads directory / Lokal uploads qovluğuna icazə ver
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        pathname: '/uploads/**',
      },
    ],
    // Unoptimized for local uploads during development / İnkişaf zamanı lokal uploads üçün optimizasiya olmadan
    unoptimized: process.env.NODE_ENV === 'development',
  },
  
  // Environment variables configuration / Mühit dəyişənləri konfiqurasiyası
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Redirects configuration / Yönləndirmələr konfiqurasiyası
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: true,
      },
    ];
  },
  
  // Headers configuration / Başlıqlar konfiqurasiyası
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
