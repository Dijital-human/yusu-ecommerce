#!/bin/bash

# Yusu E-commerce Deployment Script / Yusu E-ticarət Yükləmə Scripti
# Bu script bütün deployment proseslərini idarə edir
# This script manages all deployment processes

set -e  # Xəta halında dayandır / Stop on error

# Rənglər / Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funksiyalar / Functions
print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Deployment növünü seç / Choose deployment type
echo "🚀 Yusu E-commerce Deployment Script"
echo "Choose deployment type / Deployment növünü seçin:"
echo "1) Vercel (Recommended / Tövsiyə edilir)"
echo "2) Docker (Self-hosted / Öz hostinq)"
echo "3) Update existing / Mövcud yenilə"
echo "4) Quick setup / Sürətli quraşdırma"
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        print_header "Vercel Deployment / Vercel Yükləmə"
        vercel_deployment
        ;;
    2)
        print_header "Docker Deployment / Docker Yükləmə"
        docker_deployment
        ;;
    3)
        print_header "Update Existing / Mövcud Yenilə"
        update_existing
        ;;
    4)
        print_header "Quick Setup / Sürətli Quraşdırma"
        quick_setup
        ;;
    *)
        print_error "Invalid choice / Yanlış seçim"
        exit 1
        ;;
esac

# Vercel deployment funksiyası / Vercel deployment function
vercel_deployment() {
    print_header "Vercel Deployment Steps / Vercel Yükləmə Addımları"
    
    echo "📦 Vercel deployment addımları / Vercel deployment steps:"
    echo "1. vercel.com-a gedin / Go to vercel.com"
    echo "2. GitHub hesabınızla giriş edin / Login with GitHub"
    echo "3. 'Import Project' basın / Click 'Import Project'"
    echo "4. yusu-ecommerce repo-sunu seçin / Select yusu-ecommerce repo"
    echo ""
    
    echo "🔧 Environment variables əlavə edin / Add environment variables:"
    echo "   - DATABASE_URL"
    echo "   - NEXTAUTH_SECRET"
    echo "   - NEXTAUTH_URL"
    echo "   - STRIPE_SECRET_KEY"
    echo "   - STRIPE_WEBHOOK_SECRET"
    echo ""
    
    echo "🌐 Custom domain əlavə etmə / Adding custom domain..."
    echo "1. Vercel dashboard-da 'Domains' bölməsinə gedin / Go to 'Domains' section"
    echo "2. 'Add Domain' basın / Click 'Add Domain'"
    echo "3. Domain adınızı daxil edin / Enter your domain name"
    echo ""
    
    print_success "Vercel deployment təlimatları tamamlandı / Vercel deployment instructions completed"
}

# Docker deployment funksiyası / Docker deployment function
docker_deployment() {
    print_header "Docker Deployment / Docker Yükləmə"
    
    echo "📥 Proyekt yenilənir / Updating project..."
    git pull origin main
    
    echo "📦 Dependencies yenilənir / Updating dependencies..."
    npm install
    
    echo "🔨 Build edilir / Building..."
    npm run build
    
    echo "🗄️ Database migration..."
    npx prisma migrate deploy
    
    echo "🐳 Docker containers yenilənir / Updating Docker containers..."
    docker-compose -f docker-compose.prod.yml down
    docker-compose -f docker-compose.prod.yml up -d --build
    
    echo "🔄 Nginx yenidən başladılır / Restarting Nginx..."
    docker-compose -f docker-compose.prod.yml restart nginx
    
    print_success "Docker deployment tamamlandı / Docker deployment completed"
}

# Mövcud yeniləmə funksiyası / Update existing function
update_existing() {
    print_header "Update Existing Deployment / Mövcud Yükləməni Yenilə"
    
    echo "📥 Kod yenilənir / Updating code..."
    git pull origin main
    
    echo "📦 Dependencies yenilənir / Updating dependencies..."
    npm install
    
    echo "🗄️ Database migration / Database yenilə"
    npx prisma migrate deploy
    
    echo "🔨 Build edilir / Building..."
    npm run build
    
    echo "🔄 Nginx yenidən başladılır / Restarting Nginx..."
    sudo systemctl reload nginx
    
    echo "✅ Yeniləmə tamamlandı / Update completed"
    echo "🌐 Sayt yoxlanır / Checking website..."
    
    # Test all subdomains / Bütün subdomain-ləri test et
    echo "🔗 Test edilir / Testing:"
    curl -I https://azliner.info || print_warning "Ana sayt testi uğursuz / Main site test failed"
    curl -I https://admin.azliner.info || print_warning "Admin testi uğursuz / Admin test failed"
    curl -I https://seller.azliner.info || print_warning "Seller testi uğursuz / Seller test failed"
    curl -I https://courier.azliner.info || print_warning "Courier testi uğursuz / Courier test failed"
    
    print_success "Sayt uğurla yeniləndi / Site updated successfully"
}

# Sürətli quraşdırma funksiyası / Quick setup function
quick_setup() {
    print_header "Quick Production Setup / Sürətli Canlı Sayt Quraşdırması"
    
    echo "🚀 Minimum setup üçün addımlar / Steps for minimum setup:"
    echo ""
    
    echo "1. Vercel deployment / Vercel yükləmə:"
    echo "   - vercel.com-a gedin / Go to vercel.com"
    echo "   - GitHub ilə giriş edin / Login with GitHub"
    echo "   - Repo-nu import edin / Import repository"
    echo ""
    
    echo "2. Environment variables / Mühit dəyişənləri:"
    echo "   - DATABASE_URL (Vercel Postgres)"
    echo "   - NEXTAUTH_SECRET"
    echo "   - NEXTAUTH_URL"
    echo ""
    
    echo "3. Custom domain / Xüsusi domain:"
    echo "   - Domain əlavə edin / Add domain"
    echo "   - DNS qeydlərini təyin edin / Set DNS records"
    echo ""
    
    echo "4. Subdomain-lər / Subdomains:"
    echo "   - admin.yourdomain.com"
    echo "   - seller.yourdomain.com"
    echo "   - courier.yourdomain.com"
    echo ""
    
    print_success "Setup təlimatları tamamlandı / Setup instructions completed"
    echo "💰 Ümumi xərc / Total cost: ~$10-15/il (yalnız domain / only domain)"
    echo "⏱️ Vaxt / Time: 1-2 saat / 1-2 hours"
}

print_success "Deployment script tamamlandı / Deployment script completed"
