#!/bin/bash

# Platform Adı Dəyişdirmə Scripti / Platform Name Change Script
# İstifadə: ./change-platform-name.sh old-name new-name
# Usage: ./change-platform-name.sh old-name new-name

OLD_NAME=$1
NEW_NAME=$2

if [ -z "$OLD_NAME" ] || [ -z "$NEW_NAME" ]; then
    echo "❌ Xəta: Platform adları tələb olunur"
    echo "İstifadə: ./change-platform-name.sh old-name new-name"
    echo "Usage: ./change-platform-name.sh old-name new-name"
    exit 1
fi

echo "🔄 Platform adı dəyişdirilir: $OLD_NAME → $NEW_NAME"
echo "Changing platform name: $OLD_NAME → $NEW_NAME"

# 1. Bütün fayllarda platform adını dəyişdir / Change platform name in all files
echo "📝 Platform adı dəyişdirilir / Changing platform name..."
find . -name "*.tsx" -o -name "*.ts" -o -name "*.js" -o -name "*.json" -o -name "*.md" | xargs sed -i.bak "s/$OLD_NAME/$NEW_NAME/g"

# 2. README fayllarını yenilə / Update README files
echo "📝 README faylları yenilənir / Updating README files..."
find . -name "README.md" | xargs sed -i.bak "s/$OLD_NAME/$NEW_NAME/g"

# 3. Package.json fayllarını yenilə / Update package.json files
echo "📝 Package.json faylları yenilənir / Updating package.json files..."
find . -name "package.json" | xargs sed -i.bak "s/$OLD_NAME/$NEW_NAME/g"

# 4. Title və meta tag-ləri yenilə / Update title and meta tags
echo "📝 Title və meta tag-ləri yenilənir / Updating title and meta tags..."
find . -name "*.tsx" | xargs sed -i.bak "s/title.*$OLD_NAME/title.*$NEW_NAME/g"

echo "✅ Platform adı dəyişdirildi: $NEW_NAME"
echo "✅ Platform name changed to: $NEW_NAME"
echo ""
echo "🔗 Yeni platform adı / New platform name: $NEW_NAME"
