-- Database Initialization Script / Veritabanı İnitializasiya Scripti
-- Production database setup with optimizations / Optimallaşdırmalarla production veritabanı quraşdırması

-- Create database if not exists / Veritabanı yoxdursa yarat
CREATE DATABASE yusu_production;

-- Connect to the database / Veritabanına qoşul
\c yusu_production;

-- Create extensions / Extension-ları yarat
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- Create custom types / Xüsusi tiplər yarat
CREATE TYPE user_role AS ENUM ('admin', 'seller', 'courier', 'customer');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE delivery_status AS ENUM ('pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed');

-- Create users table with optimizations / Optimallaşdırmalarla istifadəçilər cədvəli yarat
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'customer',
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    email_verification_token_expiry TIMESTAMP,
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMP,
    avatar_url VARCHAR(500),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10),
    preferences JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table with optimizations / Optimallaşdırmalarla məhsullar cədvəli yarat
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    name_az VARCHAR(255),
    description TEXT,
    description_az TEXT,
    price DECIMAL(10,2) NOT NULL,
    compare_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(100),
    weight DECIMAL(8,2),
    dimensions JSONB,
    images JSONB DEFAULT '[]',
    category_id UUID,
    brand_id UUID,
    seller_id UUID,
    stock_quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 10,
    track_quantity BOOLEAN DEFAULT TRUE,
    allow_backorder BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    seo_title VARCHAR(255),
    seo_description TEXT,
    tags TEXT[],
    attributes JSONB DEFAULT '{}',
    variants JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create categories table / Kateqoriyalar cədvəli yarat
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    name_az VARCHAR(255),
    description TEXT,
    description_az TEXT,
    slug VARCHAR(255) UNIQUE NOT NULL,
    parent_id UUID REFERENCES categories(id),
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    seo_title VARCHAR(255),
    seo_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table with optimizations / Optimallaşdırmalarla sifarişlər cədvəli yarat
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id),
    status order_status DEFAULT 'pending',
    payment_status payment_status DEFAULT 'pending',
    delivery_status delivery_status DEFAULT 'pending',
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    shipping_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    shipping_address JSONB NOT NULL,
    billing_address JSONB,
    notes TEXT,
    internal_notes TEXT,
    tracking_number VARCHAR(100),
    estimated_delivery_date DATE,
    delivered_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create order_items table / Sifariş elementləri cədvəli yarat
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    variant_id UUID,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    product_snapshot JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create deliveries table / Çatdırılmalar cədvəli yarat
CREATE TABLE deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    courier_id UUID REFERENCES users(id),
    status delivery_status DEFAULT 'pending',
    pickup_address JSONB,
    delivery_address JSONB,
    pickup_time TIMESTAMP,
    delivery_time TIMESTAMP,
    estimated_delivery_time TIMESTAMP,
    actual_delivery_time TIMESTAMP,
    distance_km DECIMAL(8,2),
    delivery_fee DECIMAL(10,2),
    notes TEXT,
    customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
    customer_feedback TEXT,
    courier_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create notifications table / Bildirişlər cədvəli yarat
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    title_az VARCHAR(255),
    message TEXT NOT NULL,
    message_az TEXT,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    priority VARCHAR(20) DEFAULT 'medium',
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create analytics table / Analitika cədvəli yarat
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    event_category VARCHAR(50),
    user_id UUID REFERENCES users(id),
    session_id VARCHAR(255),
    properties JSONB DEFAULT '{}',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    referrer VARCHAR(500)
);

-- Create indexes for performance / Performans üçün indekslər yarat

-- Users table indexes / İstifadəçilər cədvəli indeksləri
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Products table indexes / Məhsullar cədvəli indeksləri
CREATE INDEX idx_products_name ON products USING gin(to_tsvector('english', name));
CREATE INDEX idx_products_name_az ON products USING gin(to_tsvector('simple', name_az));
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_tags ON products USING gin(tags);

-- Categories table indexes / Kateqoriyalar cədvəli indeksləri
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_active ON categories(is_active);

-- Orders table indexes / Sifarişlər cədvəli indeksləri
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_delivery_status ON orders(delivery_status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_total_amount ON orders(total_amount);

-- Order items table indexes / Sifariş elementləri cədvəli indeksləri
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- Deliveries table indexes / Çatdırılmalar cədvəli indeksləri
CREATE INDEX idx_deliveries_order ON deliveries(order_id);
CREATE INDEX idx_deliveries_courier ON deliveries(courier_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_deliveries_created_at ON deliveries(created_at);

-- Notifications table indexes / Bildirişlər cədvəli indeksləri
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Analytics table indexes / Analitika cədvəli indeksləri
CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_timestamp ON analytics_events(timestamp);
CREATE INDEX idx_analytics_category ON analytics_events(event_category);

-- Create partial indexes for better performance / Daha yaxşı performans üçün qismən indekslər yarat
CREATE INDEX idx_orders_active ON orders(status) WHERE status IN ('pending', 'confirmed', 'processing');
CREATE INDEX idx_products_low_stock ON products(id) WHERE stock_quantity <= low_stock_threshold;
CREATE INDEX idx_notifications_unread ON notifications(user_id, created_at) WHERE is_read = FALSE;

-- Create composite indexes / Kompozit indekslər yarat
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_products_category_active ON products(category_id, is_active);
CREATE INDEX idx_analytics_user_timestamp ON analytics_events(user_id, timestamp);

-- Create functions for automatic timestamp updates / Avtomatik timestamp yeniləmələri üçün funksiyalar yarat
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates / Avtomatik timestamp yeniləmələri üçün trigger-lər yarat
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deliveries_updated_at BEFORE UPDATE ON deliveries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create views for common queries / Ümumi sorğular üçün view-lər yarat
CREATE VIEW active_products AS
SELECT p.*, c.name as category_name, c.name_az as category_name_az
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.is_active = TRUE;

CREATE VIEW order_summary AS
SELECT 
    o.id,
    o.order_number,
    o.status,
    o.total_amount,
    o.created_at,
    u.name as customer_name,
    u.email as customer_email,
    COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN users u ON o.user_id = u.id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.order_number, o.status, o.total_amount, o.created_at, u.name, u.email;

CREATE VIEW delivery_performance AS
SELECT 
    d.courier_id,
    u.name as courier_name,
    COUNT(d.id) as total_deliveries,
    COUNT(CASE WHEN d.status = 'delivered' THEN 1 END) as successful_deliveries,
    AVG(CASE WHEN d.status = 'delivered' THEN d.customer_rating END) as avg_rating,
    AVG(EXTRACT(EPOCH FROM (d.actual_delivery_time - d.pickup_time))/3600) as avg_delivery_hours
FROM deliveries d
LEFT JOIN users u ON d.courier_id = u.id
GROUP BY d.courier_id, u.name;

-- Create stored procedures for common operations / Ümumi əməliyyatlar üçün stored procedure-lər yarat
CREATE OR REPLACE FUNCTION get_user_orders(p_user_id UUID, p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
    order_id UUID,
    order_number VARCHAR(50),
    status order_status,
    total_amount DECIMAL(10,2),
    created_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT o.id, o.order_number, o.status, o.total_amount, o.created_at
    FROM orders o
    WHERE o.user_id = p_user_id
    ORDER BY o.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_product_stock(p_product_id UUID, p_quantity_change INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    current_stock INTEGER;
BEGIN
    SELECT stock_quantity INTO current_stock
    FROM products
    WHERE id = p_product_id;
    
    IF current_stock IS NULL THEN
        RETURN FALSE;
    END IF;
    
    IF current_stock + p_quantity_change < 0 THEN
        RETURN FALSE;
    END IF;
    
    UPDATE products
    SET stock_quantity = stock_quantity + p_quantity_change,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_product_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create database statistics collection / Veritabanı statistikaları toplama
CREATE OR REPLACE FUNCTION collect_database_stats()
RETURNS TABLE (
    table_name TEXT,
    row_count BIGINT,
    table_size TEXT,
    index_size TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname||'.'||tablename as table_name,
        n_tup_ins - n_tup_del as row_count,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as table_size,
        pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as index_size
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
END;
$$ LANGUAGE plpgsql;

-- Set up database monitoring / Veritabanı monitorinqini quraşdır
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 1000;
ALTER SYSTEM SET log_checkpoints = on;
ALTER SYSTEM SET log_connections = on;
ALTER SYSTEM SET log_disconnections = on;
ALTER SYSTEM SET log_lock_waits = on;

-- Create monitoring user / Monitorinq istifadəçisi yarat
CREATE USER monitoring_user WITH PASSWORD 'monitoring_password';
GRANT CONNECT ON DATABASE yusu_production TO monitoring_user;
GRANT USAGE ON SCHEMA public TO monitoring_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO monitoring_user;

-- Create backup user / Backup istifadəçisi yarat
CREATE USER backup_user WITH PASSWORD 'backup_password';
GRANT CONNECT ON DATABASE yusu_production TO backup_user;
GRANT USAGE ON SCHEMA public TO backup_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO backup_user;

-- Final optimizations / Son optimallaşdırmalar
ANALYZE;
VACUUM;

-- Log completion / Tamamlanmanı logla
INSERT INTO analytics_events (event_type, event_category, properties)
VALUES ('database_initialized', 'system', '{"version": "1.0", "environment": "production"}');
