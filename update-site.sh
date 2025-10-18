#!/bin/bash

# Site Update Script / Sayt Yeniləmə Scripti
# Bu script-i hər dəfə yeniliklər etdikdə işə salın
# Run this script whenever you make updates

echo "🔄 Sayt yenilənir / Updating site..."

# 1. Git pull / Kod yenilə
echo "📥 Kod yenilənir / Updating code..."
git pull origin main

# 2. Dependencies yenilə / Update dependencies
echo "📦 Dependencies yenilənir / Updating dependencies..."
npm install

# 3. Database migration / Database yenilə
echo "🗄️ Database yenilənir / Updating database..."
npx prisma migrate deploy

# 4. Build et / Build
echo "🔨 Build edilir / Building..."
npm run build

# 5. Docker containers yenilə / Update Docker containers
echo "🐳 Docker containers yenilənir / Updating Docker containers..."
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build

# 6. Nginx yenidən başlat / Restart Nginx
echo "🔄 Nginx yenidən başladılır / Restarting Nginx..."
docker-compose -f docker-compose.prod.yml restart nginx

# 7. Status yoxla / Check status
echo "✅ Yeniləmə tamamlandı / Update completed"
echo "🌐 Sayt yoxlanır / Checking website..."

# Test all subdomains / Bütün subdomain-ləri test et
echo "🔗 Test edilir / Testing:"
curl -I https://yusu.com
curl -I https://admin.yusu.com
curl -I https://seller.yusu.com
curl -I https://courier.yusu.com

echo "🎉 Sayt uğurla yeniləndi / Site updated successfully!"
