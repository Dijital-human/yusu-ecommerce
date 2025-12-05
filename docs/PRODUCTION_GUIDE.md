# Yusu E-commerce Platform - Production Guide
# Yusu E-ticarət Platforması - Production Təlimatı

## 🚀 **PRODUCTION DEPLOYMENT OVERVIEW**

This guide provides comprehensive instructions for deploying the Yusu E-commerce Platform to production environment.

Bu təlimat Yusu E-ticarət Platformasını production mühitində yükləmək üçün hərtərəfli təlimatlar təqdim edir.

## 📋 **PREREQUISITES / TƏLƏBLƏR**

### **System Requirements / Sistem Tələbləri**
- **OS:** Ubuntu 20.04+ / CentOS 8+ / macOS 10.15+
- **RAM:** Minimum 8GB, Recommended 16GB+
- **CPU:** Minimum 4 cores, Recommended 8 cores+
- **Storage:** Minimum 100GB SSD
- **Network:** Stable internet connection with static IP

### **Software Requirements / Proqram Tələbləri**
- **Docker:** 20.10+
- **Docker Compose:** 2.0+
- **Nginx:** 1.18+
- **Node.js:** 18.0+ (for development)
- **Git:** 2.30+

## 🔧 **INSTALLATION STEPS / QURAŞDIRMA ADDIMLARI**

### **Step 1: Server Preparation / Server Hazırlığı**

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### **Step 2: Clone Repository / Repository Klonlama**

```bash
# Create production directory
sudo mkdir -p /opt/yusu-production
cd /opt/yusu-production

# Clone the repository
git clone https://github.com/your-username/yusu-ecommerce.git
cd yusu-ecommerce
```

### **Step 3: Environment Configuration / Mühit Konfiqurasiyası**

```bash
# Copy production environment template
cp env.production.example .env.production

# Edit environment variables
nano .env.production
```

**Required Environment Variables / Tələb Olunan Mühit Dəyişənləri:**

```env
# Application Configuration
NODE_ENV=production
NEXTAUTH_URL=https://yusu.com
NEXTAUTH_SECRET=your-secret-key

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/yusu_production
POSTGRES_DB=yusu_production
POSTGRES_USER=yusu_user
POSTGRES_PASSWORD=secure-password

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=redis-password

# Email Configuration
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=noreply@yusu.com
EMAIL_SERVER_PASSWORD=your-email-password
EMAIL_FROM=noreply@yusu.com

# SSL Configuration
SSL_CERT_PATH=/etc/nginx/ssl/live/yusu.com/fullchain.pem
SSL_KEY_PATH=/etc/nginx/ssl/live/yusu.com/privkey.pem
```

### **Step 4: SSL Certificate Setup / SSL Sertifikat Quraşdırması**

```bash
# Generate SSL certificates using Certbot
sudo certbot --nginx -d yusu.com -d admin.yusu.com -d seller.yusu.com -d courier.yusu.com

# Or generate self-signed certificates for testing
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/live/yusu.com/privkey.pem \
    -out /etc/nginx/ssl/live/yusu.com/fullchain.pem \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=yusu.com"
```

### **Step 5: Nginx Configuration / Nginx Konfiqurasiyası**

```bash
# Copy Nginx configuration
sudo cp nginx/nginx.prod.conf /etc/nginx/sites-available/yusu.com

# Enable the site
sudo ln -s /etc/nginx/sites-available/yusu.com /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### **Step 6: Database Setup / Veritabanı Quraşdırması**

```bash
# Start database services
docker-compose -f docker-compose.production.yml up -d db redis

# Wait for database to be ready
sleep 30

# Run database migrations
docker-compose -f docker-compose.production.yml exec db psql -U yusu_user -d yusu_production -c "SELECT 1;"

# If database doesn't exist, create it
docker-compose -f docker-compose.production.yml exec db psql -U yusu_user -c "CREATE DATABASE yusu_production;"
```

### **Step 7: Application Deployment / Tətbiq Yükləməsi**

```bash
# Build and start all services
docker-compose -f docker-compose.production.yml up -d

# Check service status
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs -f
```

## 🔍 **VERIFICATION / YOXLAMA**

### **Health Checks / Sağlamlıq Yoxlamaları**

```bash
# Check main application
curl -f https://yusu.com/api/health

# Check admin panel
curl -f https://admin.yusu.com/api/health

# Check seller panel
curl -f https://seller.yusu.com/api/health

# Check courier panel
curl -f https://courier.yusu.com/api/health
```

### **Performance Testing / Performans Testi**

```bash
# Install Apache Bench
sudo apt install -y apache2-utils

# Test main application
ab -n 1000 -c 10 https://yusu.com/

# Test admin panel
ab -n 1000 -c 10 https://admin.yusu.com/

# Test seller panel
ab -n 1000 -c 10 https://seller.yusu.com/

# Test courier panel
ab -n 1000 -c 10 https://courier.yusu.com/
```

## 📊 **MONITORING SETUP / MONITORİNQ QURAŞDIRMASI**

### **Prometheus Configuration**

```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'yusu-main'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: /api/metrics

  - job_name: 'yusu-admin'
    static_configs:
      - targets: ['localhost:3001']
    metrics_path: /api/metrics

  - job_name: 'yusu-seller'
    static_configs:
      - targets: ['localhost:3002']
    metrics_path: /api/metrics

  - job_name: 'yusu-courier'
    static_configs:
      - targets: ['localhost:3003']
    metrics_path: /api/metrics
```

### **Grafana Dashboard**

```bash
# Access Grafana
open http://localhost:3001

# Default credentials
Username: admin
Password: admin

# Import dashboard
# Use the provided grafana-dashboard.json file
```

## 🔒 **SECURITY CONFIGURATION / TƏHLÜKƏSİZLİK KONFİQURASİYASI**

### **Firewall Setup / Firewall Quraşdırması**

```bash
# Install UFW
sudo apt install -y ufw

# Configure firewall rules
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000:3003/tcp
sudo ufw allow 9090/tcp  # Prometheus
sudo ufw allow 3001/tcp  # Grafana
sudo ufw allow 5601/tcp  # Kibana

# Enable firewall
sudo ufw enable
```

### **SSL/TLS Configuration / SSL/TLS Konfiqurasiyası**

```nginx
# Add to Nginx configuration
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
```

## 🚨 **TROUBLESHOOTING / PROBLEM HƏLLİ**

### **Common Issues / Ümumi Problemlər**

#### **1. Database Connection Issues / Veritabanı Bağlantı Problemləri**

```bash
# Check database status
docker-compose -f docker-compose.production.yml ps db

# Check database logs
docker-compose -f docker-compose.production.yml logs db

# Restart database
docker-compose -f docker-compose.production.yml restart db
```

#### **2. SSL Certificate Issues / SSL Sertifikat Problemləri**

```bash
# Check certificate validity
sudo certbot certificates

# Renew certificates
sudo certbot renew

# Test SSL configuration
openssl s_client -connect yusu.com:443 -servername yusu.com
```

#### **3. Application Not Starting / Tətbiq Başlamır**

```bash
# Check application logs
docker-compose -f docker-compose.production.yml logs yusu-main

# Check environment variables
docker-compose -f docker-compose.production.yml config

# Restart application
docker-compose -f docker-compose.production.yml restart yusu-main
```

#### **4. High Memory Usage / Yüksək Yaddaş İstifadəsi**

```bash
# Check memory usage
docker stats

# Restart services
docker-compose -f docker-compose.production.yml restart

# Scale services if needed
docker-compose -f docker-compose.production.yml up -d --scale yusu-main=2
```

### **Performance Optimization / Performans Optimallaşdırması**

#### **1. Database Optimization / Veritabanı Optimallaşdırması**

```sql
-- Add indexes for better performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM products WHERE category = 'electronics';
```

#### **2. Caching Configuration / Keş Konfiqurasiyası**

```bash
# Redis configuration
# Add to .env.production
REDIS_TTL=3600
CACHE_ENABLED=true
CACHE_STRATEGY=redis

# Nginx caching
# Add to Nginx configuration
location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2|ttf|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

#### **3. CDN Configuration / CDN Konfiqurasiyası**

```bash
# Configure CDN for static assets
# Add to .env.production
CDN_URL=https://cdn.yusu.com
CDN_ENABLED=true

# Update Nginx configuration
location /static/ {
    proxy_pass https://cdn.yusu.com/static/;
}
```

## 📈 **SCALING / MİQYASLANDIRMA**

### **Horizontal Scaling / Üfüqi Miqyaslandırma**

```yaml
# docker-compose.production.yml
services:
  yusu-main:
    deploy:
      replicas: 3
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/yusu_production
      - REDIS_URL=redis://redis:6379

  yusu-admin:
    deploy:
      replicas: 2
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/yusu_production
      - REDIS_URL=redis://redis:6379
```

### **Load Balancer Configuration / Load Balancer Konfiqurasiyası**

```nginx
# Nginx load balancer configuration
upstream yusu_main {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
}

upstream yusu_admin {
    server 127.0.0.1:3003;
    server 127.0.0.1:3004;
}
```

## 🔄 **BACKUP & RECOVERY / BACKUP VƏ BƏRPA**

### **Database Backup / Veritabanı Backup**

```bash
# Create backup script
cat > backup-database.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="yusu_production_$DATE.sql"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create database backup
docker-compose -f docker-compose.production.yml exec -T db pg_dump -U yusu_user yusu_production > $BACKUP_DIR/$BACKUP_FILE

# Compress backup
gzip $BACKUP_DIR/$BACKUP_FILE

# Remove old backups (keep last 7 days)
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Database backup created: $BACKUP_DIR/$BACKUP_FILE.gz"
EOF

chmod +x backup-database.sh

# Schedule daily backups
echo "0 2 * * * /opt/yusu-production/backup-database.sh" | crontab -
```

### **Application Backup / Tətbiq Backup**

```bash
# Create application backup script
cat > backup-application.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
APP_BACKUP="yusu_application_$DATE.tar.gz"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/$APP_BACKUP /opt/yusu-production

# Remove old backups (keep last 7 days)
find $BACKUP_DIR -name "yusu_application_*.tar.gz" -mtime +7 -delete

echo "Application backup created: $BACKUP_DIR/$APP_BACKUP"
EOF

chmod +x backup-application.sh
```

## 📞 **SUPPORT & MAINTENANCE / DƏSTƏK VƏ TƏMİR**

### **Regular Maintenance Tasks / Müntəzəm Təmir İşləri**

#### **Daily Tasks / Günlük İşlər**
- Monitor application logs
- Check system resources
- Verify backup completion
- Review security alerts

#### **Weekly Tasks / Həftəlik İşlər**
- Update system packages
- Review performance metrics
- Check SSL certificate validity
- Analyze error logs

#### **Monthly Tasks / Aylıq İşlər**
- Security audit
- Performance optimization
- Database maintenance
- Update dependencies

### **Contact Information / Əlaqə Məlumatları**

- **Technical Support:** support@yusu.com
- **Security Issues:** security@yusu.com
- **Documentation:** docs.yusu.com
- **Status Page:** status.yusu.com

## 🎯 **SUCCESS METRICS / UĞUR METRİKLƏRİ**

### **Key Performance Indicators / Əsas Performans Göstəriciləri**

- **Uptime:** 99.9%+
- **Response Time:** <200ms
- **Error Rate:** <0.1%
- **Security Score:** A+
- **Performance Score:** 90+

### **Monitoring Alerts / Monitorinq Xəbərdarlıqları**

- **High CPU Usage:** >80%
- **High Memory Usage:** >85%
- **High Disk Usage:** >90%
- **High Error Rate:** >1%
- **SSL Certificate Expiry:** <30 days

---

## 🎉 **CONCLUSION / NƏTİCƏ**

This production guide provides comprehensive instructions for deploying and maintaining the Yusu E-commerce Platform. Follow these steps carefully to ensure a successful production deployment.

Bu production təlimatı Yusu E-ticarət Platformasını yükləmək və idarə etmək üçün hərtərəfli təlimatlar təqdim edir. Uğurlu production yükləməsi üçün bu addımları diqqətlə izləyin.

**Good luck with your deployment! / Yükləmənizdə uğurlar!**

