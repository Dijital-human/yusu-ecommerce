-- Add performance indexes for better query performance / Daha yaxşı sorğu performansı üçün performans index-ləri əlavə et
-- Migration: add_performance_indexes
-- Date: 2025-01-27

-- User indexes / İstifadəçi index-ləri
CREATE INDEX IF NOT EXISTS "users_role_idx" ON "users"("role");
CREATE INDEX IF NOT EXISTS "users_isActive_idx" ON "users"("isActive");
CREATE INDEX IF NOT EXISTS "users_createdAt_idx" ON "users"("createdAt");

-- Category indexes / Kateqoriya index-ləri
CREATE INDEX IF NOT EXISTS "categories_parentId_idx" ON "categories"("parentId");
CREATE INDEX IF NOT EXISTS "categories_isActive_idx" ON "categories"("isActive");
CREATE INDEX IF NOT EXISTS "categories_name_idx" ON "categories"("name");

-- Product indexes / Məhsul index-ləri
CREATE INDEX IF NOT EXISTS "products_categoryId_idx" ON "products"("categoryId");
CREATE INDEX IF NOT EXISTS "products_sellerId_idx" ON "products"("sellerId");
CREATE INDEX IF NOT EXISTS "products_isActive_idx" ON "products"("isActive");
CREATE INDEX IF NOT EXISTS "products_isPublished_idx" ON "products"("isPublished");
CREATE INDEX IF NOT EXISTS "products_stock_idx" ON "products"("stock");
CREATE INDEX IF NOT EXISTS "products_price_idx" ON "products"("price");
CREATE INDEX IF NOT EXISTS "products_createdAt_idx" ON "products"("createdAt");
CREATE INDEX IF NOT EXISTS "products_name_idx" ON "products"("name");

-- Order indexes / Sifariş index-ləri
CREATE INDEX IF NOT EXISTS "orders_customerId_idx" ON "orders"("customerId");
CREATE INDEX IF NOT EXISTS "orders_sellerId_idx" ON "orders"("sellerId");
CREATE INDEX IF NOT EXISTS "orders_courierId_idx" ON "orders"("courierId");
CREATE INDEX IF NOT EXISTS "orders_status_idx" ON "orders"("status");
CREATE INDEX IF NOT EXISTS "orders_paymentStatus_idx" ON "orders"("paymentStatus");
CREATE INDEX IF NOT EXISTS "orders_createdAt_idx" ON "orders"("createdAt");
CREATE INDEX IF NOT EXISTS "orders_paymentIntentId_idx" ON "orders"("paymentIntentId");

-- Order Item indexes / Sifariş Elementi index-ləri
CREATE INDEX IF NOT EXISTS "order_items_orderId_idx" ON "order_items"("orderId");
CREATE INDEX IF NOT EXISTS "order_items_productId_idx" ON "order_items"("productId");

-- Cart Item indexes / Səbət Elementi index-ləri
CREATE INDEX IF NOT EXISTS "cart_items_userId_idx" ON "cart_items"("userId");
CREATE INDEX IF NOT EXISTS "cart_items_productId_idx" ON "cart_items"("productId");

-- Review indexes / Rəy index-ləri
CREATE INDEX IF NOT EXISTS "reviews_userId_idx" ON "reviews"("userId");
CREATE INDEX IF NOT EXISTS "reviews_productId_idx" ON "reviews"("productId");
CREATE INDEX IF NOT EXISTS "reviews_rating_idx" ON "reviews"("rating");
CREATE INDEX IF NOT EXISTS "reviews_createdAt_idx" ON "reviews"("createdAt");

-- Wishlist Item indexes / İstək Siyahısı Elementi index-ləri
CREATE INDEX IF NOT EXISTS "wishlist_items_userId_idx" ON "wishlist_items"("userId");
CREATE INDEX IF NOT EXISTS "wishlist_items_productId_idx" ON "wishlist_items"("productId");

-- Address indexes / Ünvan index-ləri
CREATE INDEX IF NOT EXISTS "addresses_userId_idx" ON "addresses"("userId");
CREATE INDEX IF NOT EXISTS "addresses_isDefault_idx" ON "addresses"("isDefault");

-- Courier indexes / Kuryer index-ləri
CREATE INDEX IF NOT EXISTS "couriers_isAvailable_idx" ON "couriers"("isAvailable");
CREATE INDEX IF NOT EXISTS "couriers_rating_idx" ON "couriers"("rating");

-- Audit Log indexes / Audit Log index-ləri
CREATE INDEX IF NOT EXISTS "audit_logs_userId_idx" ON "audit_logs"("userId");
CREATE INDEX IF NOT EXISTS "audit_logs_action_idx" ON "audit_logs"("action");
CREATE INDEX IF NOT EXISTS "audit_logs_resourceType_idx" ON "audit_logs"("resourceType");
CREATE INDEX IF NOT EXISTS "audit_logs_resourceId_idx" ON "audit_logs"("resourceId");
CREATE INDEX IF NOT EXISTS "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

