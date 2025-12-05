#!/bin/bash

# Domain Dəyişdirmə Scripti / Domain Change Script
# İstifadə: ./change-domain.sh old-domain.com new-domain.com
# Usage: ./change-domain.sh old-domain.com new-domain.com

OLD_DOMAIN=$1
NEW_DOMAIN=$2

if [ -z "$OLD_DOMAIN" ] || [ -z "$NEW_DOMAIN" ]; then
    echo "❌ Xəta: Domain adları tələb olunur"
    echo "İstifadə: ./change-domain.sh old-domain.com new-domain.com"
    echo "Usage: ./change-domain.sh old-domain.com new-domain.com"
    exit 1
fi

echo "🔄 Domain dəyişdirilir: $OLD_DOMAIN → $NEW_DOMAIN"
echo "Changing domain: $OLD_DOMAIN → $NEW_DOMAIN"

# 1. Nginx konfiqurasiyasını yenilə / Update Nginx configuration
echo "📝 Nginx konfiqurasiyası yenilənir..."
sed -i.bak "s/$OLD_DOMAIN/$NEW_DOMAIN/g" nginx-https-template.conf
cp nginx-https-template.conf nginx-https.conf

# 2. Environment fayllarını yenilə / Update environment files
echo "📝 Environment faylları yenilənir..."
find . -name ".env*" -type f -exec sed -i.bak "s/$OLD_DOMAIN/$NEW_DOMAIN/g" {} \;

# 3. Next.js konfiqurasiyasını yenilə / Update Next.js configuration
echo "📝 Next.js konfiqurasiyası yenilənir..."
find . -name "next.config.*" -type f -exec sed -i.bak "s/$OLD_DOMAIN/$NEW_DOMAIN/g" {} \;

# 4. Cloudflare DNS yenilə / Update Cloudflare DNS
echo "🌐 Cloudflare DNS yenilənir..."
echo "Cloudflare dashboard-da aşağıdakı DNS qeydlərini əlavə edin:"
echo "Add the following DNS records in Cloudflare dashboard:"
echo ""
echo "Type: A, Name: @, Content: YOUR_SERVER_IP"
echo "Type: A, Name: admin, Content: YOUR_SERVER_IP"
echo "Type: A, Name: seller, Content: YOUR_SERVER_IP"
echo "Type: A, Name: courier, Content: YOUR_SERVER_IP"
echo ""

# 5. SSL sertifikatı yenilə / Update SSL certificate
echo "🔒 SSL sertifikatı yenilənir..."
echo "Let's Encrypt ilə yeni sertifikat əldə edin:"
echo "Get new certificate with Let's Encrypt:"
echo "sudo certbot certonly --standalone -d $NEW_DOMAIN -d www.$NEW_DOMAIN -d admin.$NEW_DOMAIN -d seller.$NEW_DOMAIN -d courier.$NEW_DOMAIN"
echo ""

# 6. Nginx-i yenidən başlat / Restart Nginx
echo "🔄 Nginx yenidən başladılır..."
sudo nginx -t -c $(pwd)/nginx-https.conf
if [ $? -eq 0 ]; then
    sudo systemctl reload nginx
    echo "✅ Nginx uğurla yenidən başladıldı"
else
    echo "❌ Nginx konfiqurasiyasında xəta var"
fi

echo ""
echo "✅ Domain dəyişdirildi: $NEW_DOMAIN"
echo "✅ Domain changed to: $NEW_DOMAIN"
echo ""
echo "🔗 Yeni linklər / New links:"
echo "https://$NEW_DOMAIN"
echo "https://admin.$NEW_DOMAIN"
echo "https://seller.$NEW_DOMAIN"
echo "https://courier.$NEW_DOMAIN"
