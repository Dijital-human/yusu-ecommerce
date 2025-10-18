#!/bin/bash

# Yusu Subdomain Test Script / Yusu Subdomain Test Script
# Bu script bütün subdomain-ləri test edir / This script tests all subdomains

echo "🚀 Yusu Subdomain Test Başlayır / Starting Yusu Subdomain Test"
echo "=================================================="

# Rəng kodları / Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test funksiyası / Test function
test_url() {
    local url=$1
    local name=$2
    local port=$3
    
    echo -n "Testing $name ($url) on port $port... "
    
    local status_code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$port")
    if [[ "$status_code" =~ ^(200|307|302)$ ]]; then
        echo -e "${GREEN}✅ OK (HTTP $status_code)${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED (HTTP $status_code)${NC}"
        return 1
    fi
}

# Bütün proyektləri test et / Test all projects
echo "📋 Proyektləri test edirəm / Testing projects..."
echo ""

# Ana proyekt / Main project
test_url "http://localhost:3000" "Yusu E-commerce (Main)" "3000"

# Admin proyekt / Admin project
test_url "http://localhost:3001" "Yusu Admin Panel" "3001"

# Seller proyekt / Seller project
test_url "http://localhost:3002" "Yusu Seller Panel" "3002"

# Courier proyekt / Courier project
test_url "http://localhost:3003" "Yusu Courier Panel" "3003"

echo ""
echo "=================================================="

# Nginx test / Nginx test
echo "🌐 Nginx konfiqurasiyasını test edirəm / Testing Nginx configuration..."
if command -v nginx &> /dev/null; then
    echo -n "Nginx syntax check... "
    if nginx -t 2>/dev/null; then
        echo -e "${GREEN}✅ OK${NC}"
    else
        echo -e "${RED}❌ FAILED${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Nginx quraşdırılmayıb / Nginx not installed${NC}"
fi

echo ""
echo "🎯 Test tamamlandı / Test completed!"
echo ""
echo "📝 Manual test üçün / For manual testing:"
echo "  - Ana sayt / Main site: http://localhost:3000"
echo "  - Admin paneli / Admin panel: http://localhost:3001"
echo "  - Seller paneli / Seller panel: http://localhost:3002"
echo "  - Courier paneli / Courier panel: http://localhost:3003"
echo ""
echo "🐳 Docker ilə işə salmaq üçün / To run with Docker:"
echo "  docker-compose up -d"
echo ""
echo "🌐 Subdomain test üçün / For subdomain testing:"
echo "  /etc/hosts faylına əlavə edin / Add to /etc/hosts file:"
echo "  127.0.0.1 yusu.com"
echo "  127.0.0.1 admin.yusu.com"
echo "  127.0.0.1 seller.yusu.com"
echo "  127.0.0.1 courier.yusu.com"