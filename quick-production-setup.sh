#!/bin/bash

# Quick Production Setup / Sürətli Canlı Sayt Quraşdırması
# Bu script minimum setup üçündür / This script is for minimum setup

echo "🚀 Sürətli Production Setup başladı / Quick Production Setup started"

# 1. Vercel deployment / Vercel yükləmə
echo "📦 Vercel deployment..."
echo "Addımlar / Steps:"
echo "1. vercel.com-a gedin / Go to vercel.com"
echo "2. GitHub hesabınızla giriş edin / Login with GitHub"
echo "3. 'Import Project' basın / Click 'Import Project'"
echo "4. yusu-ecommerce repo-sunu seçin / Select yusu-ecommerce repo"
echo "5. Environment variables əlavə edin / Add environment variables:"
echo "   - DATABASE_URL"
echo "   - NEXTAUTH_SECRET"
echo "   - NEXTAUTH_URL"
echo ""

# 2. Custom domain əlavə etmə / Add custom domain
echo "🌐 Custom domain əlavə etmə / Adding custom domain..."
echo "Addımlar / Steps:"
echo "1. Vercel dashboard-da 'Domains' bölməsinə gedin / Go to 'Domains' section"
echo "2. 'Add Domain' basın / Click 'Add Domain'"
echo "3. Domain adınızı daxil edin / Enter your domain name"
echo "4. DNS qeydlərini domain registrar-də əlavə edin / Add DNS records at domain registrar"
echo ""

# 3. SSL aktivləşdirmə / Enable SSL
echo "🔒 SSL aktivləşdirmə / Enabling SSL..."
echo "Vercel avtomatik olaraq SSL verir / Vercel automatically provides SSL"
echo ""

# 4. Subdomain-lər üçün ayrı deployment / Separate deployment for subdomains
echo "🔗 Subdomain-lər üçün ayrı deployment / Separate deployment for subdomains..."
echo "Hər subdomain üçün ayrı Vercel proyekti yaradın / Create separate Vercel project for each subdomain:"
echo "1. yusu-admin"
echo "2. yusu-seller" 
echo "3. yusu-courier"
echo ""

# 5. Database setup / Database quraşdırma
echo "🗄️ Database setup / Database setup..."
echo "Vercel Postgres istifadə edin / Use Vercel Postgres:"
echo "1. Vercel dashboard-da 'Storage' bölməsinə gedin / Go to 'Storage' section"
echo "2. 'Create Database' basın / Click 'Create Database'"
echo "3. 'Postgres' seçin / Select 'Postgres'"
echo "4. Connection string-i environment variables-ə əlavə edin / Add connection string to env vars"
echo ""

# 6. Final test / Son test
echo "✅ Final test / Final test..."
echo "Test edin / Test:"
echo "1. https://yourdomain.com"
echo "2. https://admin.yourdomain.com"
echo "3. https://seller.yourdomain.com"
echo "4. https://courier.yourdomain.com"
echo ""

echo "🎉 Setup tamamlandı / Setup completed!"
echo "💰 Ümumi xərc / Total cost: ~$10-15/il (yalnız domain / only domain)"
echo "⏱️ Vaxt / Time: 1-2 saat / 1-2 hours"
