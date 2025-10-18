#!/bin/bash

# Automated Deployment Script / Avtomatik Yükləmə Scripti
# Bu script-i server-də işə salın
# Run this script on your server

echo "🚀 Deployment başladı / Deployment started"

# 1. Proyekti yenilə / Update project
echo "📥 Proyekt yenilənir / Updating project..."
git pull origin main

# 2. Dependencies yenilə / Update dependencies
echo "📦 Dependencies yenilənir / Updating dependencies..."
npm install

# 3. Build et / Build
echo "🔨 Build edilir / Building..."
npm run build

# 4. Database migration (əgər lazımsa) / Database migration (if needed)
echo "🗄️ Database migration..."
npx prisma migrate deploy

# 5. Nginx yenidən başlat / Restart Nginx
echo "🔄 Nginx yenidən başladılır / Restarting Nginx..."
sudo systemctl reload nginx

# 6. Status yoxla / Check status
echo "✅ Deployment tamamlandı / Deployment completed"
echo "🌐 Sayt yoxlanır / Checking website..."
curl -I https://yusu.com

echo "🎉 Deployment uğurlu / Deployment successful!"
