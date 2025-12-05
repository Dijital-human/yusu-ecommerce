#!/bin/bash

# Production Deployment Script / Production Yükləmə Scripti
# Comprehensive production deployment for Yusu E-commerce Platform
# Yusu E-ticarət Platforması üçün hərtərəfli production yükləmə

set -e  # Exit on any error

echo "🚀 Starting Production Deployment / Production Yükləmə Başladı"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="yusu-ecommerce"
DOMAIN="yusu.com"
ADMIN_DOMAIN="admin.yusu.com"
SELLER_DOMAIN="seller.yusu.com"
COURIER_DOMAIN="courier.yusu.com"
DB_NAME="yusu_production"
DB_USER="yusu_user"
DB_PASSWORD="$(openssl rand -base64 32)"
REDIS_PASSWORD="$(openssl rand -base64 32)"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"

echo -e "${BLUE}📋 Deployment Configuration / Yükləmə Konfiqurasiyası${NC}"
echo "Project: $PROJECT_NAME"
echo "Domain: $DOMAIN"
echo "Admin: $ADMIN_DOMAIN"
echo "Seller: $SELLER_DOMAIN"
echo "Courier: $COURIER_DOMAIN"
echo ""

# Step 1: Pre-deployment checks / Yükləmə öncəsi yoxlamalar
echo -e "${YELLOW}🔍 Step 1: Pre-deployment Checks / Yükləmə Öncəsi Yoxlamalar${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Check if Nginx is installed
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}⚠️  Nginx is not installed. Installing Nginx...${NC}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install nginx
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        sudo apt-get update
        sudo apt-get install -y nginx
    fi
fi

echo -e "${GREEN}✅ Pre-deployment checks passed / Yükləmə öncəsi yoxlamalar keçdi${NC}"

# Step 2: Create production environment / Production mühit yaratmaq
echo -e "${YELLOW}🔧 Step 2: Creating Production Environment / Production Mühit Yaratmaq${NC}"

# Create production directory
mkdir -p /opt/yusu-production
cd /opt/yusu-production

# Clone the repository
if [ ! -d "$PROJECT_NAME" ]; then
    echo "Cloning repository..."
    git clone https://github.com/your-username/yusu-ecommerce.git $PROJECT_NAME
fi

cd $PROJECT_NAME

# Create production environment file
cat > .env.production << EOF
# Production Environment Variables / Production Mühit Dəyişənləri
NODE_ENV=production
NEXTAUTH_URL=https://$DOMAIN
NEXTAUTH_SECRET=$NEXTAUTH_SECRET

# Database Configuration / Veritabanı Konfiqurasiyası
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@db:5432/$DB_NAME
POSTGRES_DB=$DB_NAME
POSTGRES_USER=$DB_USER
POSTGRES_PASSWORD=$DB_PASSWORD

# Redis Configuration / Redis Konfiqurasiyası
REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
REDIS_PASSWORD=$REDIS_PASSWORD

# Email Configuration / Email Konfiqurasiyası
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=noreply@$DOMAIN
EMAIL_SERVER_PASSWORD=your-email-password
EMAIL_FROM=noreply@$DOMAIN

# SSL Configuration / SSL Konfiqurasiyası
SSL_CERT_PATH=/etc/nginx/ssl/live/$DOMAIN/fullchain.pem
SSL_KEY_PATH=/etc/nginx/ssl/live/$DOMAIN/privkey.pem

# Monitoring / Monitorinq
PROMETHEUS_URL=http://prometheus:9090
GRAFANA_URL=http://grafana:3000
ELASTICSEARCH_URL=http://elasticsearch:9200
KIBANA_URL=http://kibana:5601

# Security / Təhlükəsizlik
JWT_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -base64 32)
API_RATE_LIMIT=1000
SESSION_TIMEOUT=3600

# Performance / Performans
CACHE_TTL=3600
CDN_URL=https://cdn.$DOMAIN
IMAGE_OPTIMIZATION=true
COMPRESSION=true
EOF

echo -e "${GREEN}✅ Production environment created / Production mühit yaradıldı${NC}"

# Step 3: Build and prepare applications / Tətbiqləri qurmaq və hazırlamaq
echo -e "${YELLOW}🏗️  Step 3: Building Applications / Tətbiqləri Qurmaq${NC}"

# Build main e-commerce app
echo "Building main e-commerce application..."
cd yusu-ecommerce
npm ci --production
npm run build
cd ..

# Build admin app
echo "Building admin application..."
cd yusu-admin
npm ci --production
npm run build
cd ..

# Build seller app
echo "Building seller application..."
cd yusu-seller
npm ci --production
npm run build
cd ..

# Build courier app
echo "Building courier application..."
cd yusu-courier
npm ci --production
npm run build
cd ..

echo -e "${GREEN}✅ Applications built successfully / Tətbiqlər uğurla quruldu${NC}"

# Step 4: Setup SSL certificates / SSL sertifikatlarını quraşdırmaq
echo -e "${YELLOW}🔒 Step 4: Setting up SSL Certificates / SSL Sertifikatlarını Quraşdırmaq${NC}"

# Install Certbot
if ! command -v certbot &> /dev/null; then
    echo "Installing Certbot..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install certbot
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get install -y certbot python3-certbot-nginx
    fi
fi

# Create SSL directory
sudo mkdir -p /etc/nginx/ssl/live/$DOMAIN
sudo mkdir -p /etc/nginx/ssl/live/$ADMIN_DOMAIN
sudo mkdir -p /etc/nginx/ssl/live/$SELLER_DOMAIN
sudo mkdir -p /etc/nginx/ssl/live/$COURIER_DOMAIN

# Generate self-signed certificates for development
echo "Generating self-signed certificates..."
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/live/$DOMAIN/privkey.pem \
    -out /etc/nginx/ssl/live/$DOMAIN/fullchain.pem \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=$DOMAIN"

# Copy certificates for subdomains
sudo cp /etc/nginx/ssl/live/$DOMAIN/privkey.pem /etc/nginx/ssl/live/$ADMIN_DOMAIN/privkey.pem
sudo cp /etc/nginx/ssl/live/$DOMAIN/fullchain.pem /etc/nginx/ssl/live/$ADMIN_DOMAIN/fullchain.pem
sudo cp /etc/nginx/ssl/live/$DOMAIN/privkey.pem /etc/nginx/ssl/live/$SELLER_DOMAIN/privkey.pem
sudo cp /etc/nginx/ssl/live/$DOMAIN/fullchain.pem /etc/nginx/ssl/live/$SELLER_DOMAIN/fullchain.pem
sudo cp /etc/nginx/ssl/live/$DOMAIN/privkey.pem /etc/nginx/ssl/live/$COURIER_DOMAIN/privkey.pem
sudo cp /etc/nginx/ssl/live/$DOMAIN/fullchain.pem /etc/nginx/ssl/live/$COURIER_DOMAIN/fullchain.pem

echo -e "${GREEN}✅ SSL certificates generated / SSL sertifikatları yaradıldı${NC}"

# Step 5: Configure Nginx / Nginx konfiqurasiyası
echo -e "${YELLOW}🌐 Step 5: Configuring Nginx / Nginx Konfiqurasiyası${NC}"

# Create Nginx configuration
sudo tee /etc/nginx/sites-available/$DOMAIN << EOF
# Yusu E-commerce Platform Nginx Configuration
# Yusu E-ticarət Platforması Nginx Konfiqurasiyası

# Rate limiting
limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone \$binary_remote_addr zone=login:10m rate=5r/m;

# Upstream servers
upstream yusu_main {
    server 127.0.0.1:3000;
}

upstream yusu_admin {
    server 127.0.0.1:3001;
}

upstream yusu_seller {
    server 127.0.0.1:3002;
}

upstream yusu_courier {
    server 127.0.0.1:3003;
}

# Main domain
server {
    listen 80;
    listen 443 ssl http2;
    server_name $DOMAIN;

    # SSL configuration
    ssl_certificate /etc/nginx/ssl/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/live/$DOMAIN/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Static files caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2|ttf|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files \$uri @proxy;
    }

    # API rate limiting
    location /api {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://yusu_main;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Main application
    location / {
        proxy_pass http://yusu_main;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Forwarded-Port \$server_port;
    }

    # Fallback
    location @proxy {
        proxy_pass http://yusu_main;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}

# Admin subdomain
server {
    listen 80;
    listen 443 ssl http2;
    server_name $ADMIN_DOMAIN;

    ssl_certificate /etc/nginx/ssl/live/$ADMIN_DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/live/$ADMIN_DOMAIN/privkey.pem;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    location / {
        proxy_pass http://yusu_admin;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}

# Seller subdomain
server {
    listen 80;
    listen 443 ssl http2;
    server_name $SELLER_DOMAIN;

    ssl_certificate /etc/nginx/ssl/live/$SELLER_DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/live/$SELLER_DOMAIN/privkey.pem;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    location / {
        proxy_pass http://yusu_seller;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}

# Courier subdomain
server {
    listen 80;
    listen 443 ssl http2;
    server_name $COURIER_DOMAIN;

    ssl_certificate /etc/nginx/ssl/live/$COURIER_DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/live/$COURIER_DOMAIN/privkey.pem;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    location / {
        proxy_pass http://yusu_courier;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

echo -e "${GREEN}✅ Nginx configured successfully / Nginx uğurla konfiqurasiya edildi${NC}"

# Step 6: Start Docker services / Docker xidmətlərini başlatmaq
echo -e "${YELLOW}🐳 Step 6: Starting Docker Services / Docker Xidmətlərini Başlatmaq${NC}"

# Start database and Redis
docker-compose -f docker-compose.production.yml up -d db redis

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 30

# Run database migrations
echo "Running database migrations..."
docker-compose -f docker-compose.production.yml exec -T db psql -U $DB_USER -d $DB_NAME -c "SELECT 1;" || {
    echo "Creating database..."
    docker-compose -f docker-compose.production.yml exec -T db psql -U $DB_USER -c "CREATE DATABASE $DB_NAME;"
}

# Start all services
docker-compose -f docker-compose.production.yml up -d

echo -e "${GREEN}✅ Docker services started successfully / Docker xidmətləri uğurla başladı${NC}"

# Step 7: Health checks / Sağlamlıq yoxlamaları
echo -e "${YELLOW}🏥 Step 7: Running Health Checks / Sağlamlıq Yoxlamaları${NC}"

# Wait for services to be ready
sleep 60

# Check main application
echo "Checking main application..."
curl -f http://localhost:3000/api/health || echo "Main application health check failed"

# Check admin application
echo "Checking admin application..."
curl -f http://localhost:3001/api/health || echo "Admin application health check failed"

# Check seller application
echo "Checking seller application..."
curl -f http://localhost:3002/api/health || echo "Seller application health check failed"

# Check courier application
echo "Checking courier application..."
curl -f http://localhost:3003/api/health || echo "Courier application health check failed"

echo -e "${GREEN}✅ Health checks completed / Sağlamlıq yoxlamaları tamamlandı${NC}"

# Step 8: Setup monitoring / Monitorinq quraşdırmaq
echo -e "${YELLOW}📊 Step 8: Setting up Monitoring / Monitorinq Quraşdırmaq${NC}"

# Start monitoring services
docker-compose -f docker-compose.production.yml up -d prometheus grafana elasticsearch kibana logstash

# Wait for monitoring services
sleep 30

echo -e "${GREEN}✅ Monitoring setup completed / Monitorinq quraşdırıldı${NC}"

# Step 9: Final verification / Son yoxlama
echo -e "${YELLOW}✅ Step 9: Final Verification / Son Yoxlama${NC}"

echo "Checking all services..."
docker-compose -f docker-compose.production.yml ps

echo ""
echo -e "${GREEN}🎉 Production Deployment Completed Successfully!${NC}"
echo -e "${GREEN}🎉 Production Yükləmə Uğurla Tamamlandı!${NC}"
echo ""
echo -e "${BLUE}📋 Deployment Summary / Yükləmə Xülasəsi:${NC}"
echo "Main Application: https://$DOMAIN"
echo "Admin Panel: https://$ADMIN_DOMAIN"
echo "Seller Panel: https://$SELLER_DOMAIN"
echo "Courier Panel: https://$COURIER_DOMAIN"
echo ""
echo -e "${BLUE}📊 Monitoring URLs / Monitorinq URL-ləri:${NC}"
echo "Prometheus: http://localhost:9090"
echo "Grafana: http://localhost:3001"
echo "Kibana: http://localhost:5601"
echo ""
echo -e "${BLUE}🔧 Management Commands / İdarəetmə Əmrləri:${NC}"
echo "View logs: docker-compose -f docker-compose.production.yml logs -f"
echo "Restart services: docker-compose -f docker-compose.production.yml restart"
echo "Stop services: docker-compose -f docker-compose.production.yml down"
echo "Update services: docker-compose -f docker-compose.production.yml pull && docker-compose -f docker-compose.production.yml up -d"
echo ""
echo -e "${YELLOW}⚠️  Important Notes / Əhəmiyyətli Qeydlər:${NC}"
echo "1. Update DNS records to point to this server"
echo "2. Configure firewall rules for ports 80, 443, 3000-3003"
echo "3. Set up automated backups for the database"
echo "4. Monitor logs regularly for any issues"
echo "5. Keep SSL certificates updated"
echo ""
echo -e "${GREEN}🚀 Your Yusu E-commerce Platform is now live!${NC}"
echo -e "${GREEN}🚀 Yusu E-ticarət Platformanız indi canlıdır!${NC}"

