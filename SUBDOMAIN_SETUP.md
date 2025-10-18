# Yusu Subdomain Konfiqurasiyası / Yusu Subdomain Configuration

## 📋 Təsvir / Description

Bu sənəd Yusu platformasının subdomain arxitekturasını və konfiqurasiyasını izah edir.

This document explains the subdomain architecture and configuration of the Yusu platform.

## 🏗️ Arxitektura / Architecture

### Subdomain Strukturu / Subdomain Structure
```
yusu.com              → Müştəri platforması / Customer platform (Port 3000)
admin.yusu.com        → Admin paneli / Admin panel (Port 3001)
seller.yusu.com       → Seller paneli / Seller panel (Port 3002)
courier.yusu.com      → Courier paneli / Courier panel (Port 3003)
```

### Proyekt Strukturu / Project Structure
```
Yusu.com/
├── yusu-ecommerce/     # Müştəri platforması / Customer platform
├── yusu-admin/         # Admin paneli / Admin panel
├── yusu-seller/        # Seller paneli / Seller panel
├── yusu-courier/       # Courier paneli / Courier panel
├── nginx.conf          # Nginx konfiqurasiyası / Nginx configuration
├── docker-compose.yml  # Docker orkestrasiyası / Docker orchestration
└── test-subdomains.sh  # Test script / Test script
```

## 🚀 Quraşdırma / Installation

### Tələblər / Requirements
- Docker və Docker Compose
- Node.js 18+ (development üçün / for development)
- Nginx (production üçün / for production)

### Addımlar / Steps

#### 1. Proyektləri Klonlayın / Clone Projects
```bash
git clone <repository-url>
cd Yusu.com
```

#### 2. Bağımlılıqları Quraşdırın / Install Dependencies
```bash
# Hər proyekt üçün / For each project
cd yusu-ecommerce && npm install
cd ../yusu-admin && npm install
cd ../yusu-seller && npm install
cd ../yusu-courier && npm install
```

#### 3. Mühit Dəyişənlərini Təyin Edin / Set Environment Variables
```bash
# Hər proyekt üçün .env.local faylını yaradın / Create .env.local file for each project
cp yusu-ecommerce/.env.example yusu-ecommerce/.env.local
cp yusu-admin/.env.example yusu-admin/.env.local
cp yusu-seller/.env.example yusu-seller/.env.local
cp yusu-courier/.env.example yusu-courier/.env.local
```

#### 4. Veritabanını Quraşdırın / Setup Database
```bash
# Hər proyekt üçün / For each project
cd yusu-ecommerce && npx prisma migrate dev && npx prisma db:seed
cd ../yusu-admin && npx prisma migrate dev && npx prisma db:seed
cd ../yusu-seller && npx prisma migrate dev && npx prisma db:seed
cd ../yusu-courier && npx prisma migrate dev && npx prisma db:seed
```

## 🐳 Docker ilə İşə Salma / Running with Docker

### Development Mode / İnkişaf Rejimi
```bash
# Bütün servisləri işə sal / Start all services
docker-compose up -d

# Logları izlə / Watch logs
docker-compose logs -f

# Servisləri dayandır / Stop services
docker-compose down
```

### Production Mode / Production Rejimi
```bash
# Production build / Production build
docker-compose -f docker-compose.prod.yml up -d
```

## 🌐 Nginx Konfiqurasiyası / Nginx Configuration

### Local Development / Lokal İnkişaf
```bash
# Nginx quraşdır / Install Nginx
# macOS: brew install nginx
# Ubuntu: sudo apt install nginx

# Konfiqurasiya faylını kopyala / Copy configuration file
sudo cp nginx.conf /etc/nginx/nginx.conf

# Nginx-i yenidən başlat / Restart Nginx
sudo nginx -s reload
```

### /etc/hosts Faylını Yeniləyin / Update /etc/hosts File
```bash
# macOS və Linux üçün / For macOS and Linux
sudo nano /etc/hosts

# Aşağıdakı sətirləri əlavə edin / Add the following lines:
127.0.0.1 yusu.com
127.0.0.1 admin.yusu.com
127.0.0.1 seller.yusu.com
127.0.0.1 courier.yusu.com
```

## 🧪 Test Etmə / Testing

### Avtomatik Test / Automatic Test
```bash
# Test scriptini işə sal / Run test script
./test-subdomains.sh
```

### Manual Test / Manual Test
```bash
# Hər proyekti ayrıca test et / Test each project separately
curl http://localhost:3000  # Ana sayt / Main site
curl http://localhost:3001  # Admin paneli / Admin panel
curl http://localhost:3002  # Seller paneli / Seller panel
curl http://localhost:3003  # Courier paneli / Courier panel
```

### Subdomain Test / Subdomain Test
```bash
# Subdomain-ləri test et / Test subdomains
curl http://yusu.com
curl http://admin.yusu.com
curl http://seller.yusu.com
curl http://courier.yusu.com
```

## 🔧 Konfiqurasiya / Configuration

### Port Konfiqurasiyası / Port Configuration
- **Ana sayt / Main site:** 3000
- **Admin paneli / Admin panel:** 3001
- **Seller paneli / Seller panel:** 3002
- **Courier paneli / Courier panel:** 3003

### Nginx Upstream Konfiqurasiyası / Nginx Upstream Configuration
```nginx
upstream yusu_main {
    server localhost:3000;
}

upstream yusu_admin {
    server localhost:3001;
}

upstream yusu_seller {
    server localhost:3002;
}

upstream yusu_courier {
    server localhost:3003;
}
```

### SSL/HTTPS Konfiqurasiyası / SSL/HTTPS Configuration
```nginx
# SSL sertifikatları üçün / For SSL certificates
ssl_certificate /path/to/ssl/cert.pem;
ssl_certificate_key /path/to/ssl/private.key;
```

## 🚀 Deployment / Deploy

### Vercel Deployment / Vercel Deploy
```bash
# Hər proyekti ayrıca deploy et / Deploy each project separately
cd yusu-ecommerce && vercel --prod
cd ../yusu-admin && vercel --prod
cd ../yusu-seller && vercel --prod
cd ../yusu-courier && vercel --prod
```

### Custom Domain Konfiqurasiyası / Custom Domain Configuration
1. DNS provider-də subdomain-ləri təyin edin / Set subdomains in DNS provider
2. Vercel-də custom domain-ləri əlavə edin / Add custom domains in Vercel
3. SSL sertifikatlarını aktivləşdirin / Activate SSL certificates

## 🔍 Troubleshooting / Problemlərin Həlli

### Ümumi Problemlər / Common Issues

#### Port Conflict / Port Konflikti
```bash
# Port istifadəsini yoxla / Check port usage
lsof -i :3000
lsof -i :3001
lsof -i :3002
lsof -i :3003

# Prosesi dayandır / Kill process
kill -9 <PID>
```

#### Nginx Konfiqurasiya Xətası / Nginx Configuration Error
```bash
# Nginx syntax yoxla / Check Nginx syntax
nginx -t

# Nginx loglarını yoxla / Check Nginx logs
tail -f /var/log/nginx/error.log
```

#### Docker Container Problemləri / Docker Container Issues
```bash
# Container statusunu yoxla / Check container status
docker-compose ps

# Container loglarını yoxla / Check container logs
docker-compose logs <service-name>

# Container-ləri yenidən başlat / Restart containers
docker-compose restart
```

## 📚 Əlavə Məlumat / Additional Information

### Faydalı Linklər / Useful Links
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

### Dəstək / Support
- **Email:** support@yusu.com
- **Documentation:** https://docs.yusu.com
- **Issues:** https://github.com/yusu-ecommerce/issues

---

**Yusu Subdomain Platform** - Professional e-ticarət həlli / Professional e-commerce solution
