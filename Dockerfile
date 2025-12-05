# Multi-stage Dockerfile for Yusu E-commerce / Yusu E-ticarət üçün Multi-stage Dockerfile
# This Dockerfile creates an optimized production image / Bu Dockerfile optimallaşdırılmış production image yaradır

# Stage 1: Dependencies / Mərhələ 1: Asılılıqlar
FROM node:22-alpine AS deps
WORKDIR /app

# Install dependencies only when needed / Asılılıqları yalnız lazım olduqda quraşdır
COPY package.json package-lock.json ./
RUN npm ci --only=production && npm cache clean --force

# Stage 2: Builder / Mərhələ 2: Builder
FROM node:22-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage / Asılılıqları deps mərhələsindən kopyala
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application / Tətbiqi build et
RUN npm run build

# Stage 3: Runner / Mərhələ 3: Runner
FROM node:22-alpine AS runner
WORKDIR /app

# Create non-root user / Root olmayan istifadəçi yarat
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application / Build edilmiş tətbiqi kopyala
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set correct permissions / Düzgün icazələri təyin et
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port / Port aç
EXPOSE 3000

# Set environment / Mühit təyin et
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check / Sağlamlıq yoxlaması
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application / Tətbiqi başlat
CMD ["node", "server.js"]