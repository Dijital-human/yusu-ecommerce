# Yusu E-commerce Platform / Yusu E-ticarət Platforması

## 📋 Təsvir / Description

Yusu E-commerce Platform - Multi-role subdomain architecture ilə qurulmuş tam funksional e-ticarət platforması.

Yusu E-commerce Platform - A fully functional e-commerce platform built with multi-role subdomain architecture.

## 🏗️ Arxitektura / Architecture

Bu platform 4 ayrı Next.js proyektindən ibarətdir:

This platform consists of 4 separate Next.js projects:

- **yusu-ecommerce** - Müştəri platforması / Customer platform
- **yusu-admin** - Admin paneli / Admin panel  
- **yusu-seller** - Satıcı paneli / Seller panel
- **yusu-courier** - Kuryer paneli / Courier panel

## 🚀 Xüsusiyyətlər / Features

### Müştəri Platforması / Customer Platform
- ✅ Məhsul axtarışı / Product search
- ✅ Kateqoriya filtri / Category filter
- ✅ Səbət idarəetməsi / Cart management
- ✅ Sifariş vermə / Order placement
- ✅ Profil idarəetməsi / Profile management

### Admin Paneli / Admin Panel
- ✅ İstifadəçi idarəetməsi / User management
- ✅ Məhsul təsdiqi / Product approval
- ✅ Sifariş nəzarəti / Order oversight
- ✅ Statistika və hesabatlar / Statistics and reports

### Satıcı Paneli / Seller Panel
- ✅ Məhsul əlavə etmə / Product addition
- ✅ Sifariş idarəetməsi / Order management
- ✅ Satış statistikaları / Sales statistics
- ✅ Məhsul redaktəsi / Product editing

### Kuryer Paneli / Courier Panel
- ✅ Çatdırılma sifarişləri / Delivery orders
- ✅ Route planlaşdırma / Route planning
- ✅ Status yeniləməsi / Status updates
- ✅ Müştəri əlaqəsi / Customer contact

## 🛠️ Texnologiyalar / Technologies

- **Frontend:** Next.js 15, React 19, TypeScript
- **Styling:** Tailwind CSS, Radix UI
- **Database:** Prisma ORM, PostgreSQL
- **Authentication:** NextAuth.js
- **Payment:** Stripe
- **Deployment:** Vercel
- **Reverse Proxy:** Nginx

## 📁 Proyekt Strukturu / Project Structure

```
yusu-ecommerce/
├── yusu-ecommerce/          # Müştəri platforması / Customer platform
├── yusu-admin/              # Admin paneli / Admin panel
├── yusu-seller/             # Satıcı paneli / Seller panel
├── yusu-courier/            # Kuryer paneli / Courier panel
├── nginx-complete.conf      # Nginx konfiqurasiyası / Nginx config
├── docker-compose.yml       # Docker orchestration
└── README.md               # Bu fayl / This file
```

## 🚀 Quraşdırma / Installation

### Tələblər / Requirements
- Node.js 18+
- npm və ya yarn
- PostgreSQL veritabanı / PostgreSQL database

### Local Development / Lokal İnkişaf

1. **Repository-ni klonlayın / Clone repository:**
```bash
git clone https://github.com/Dijital-human/yusu-ecommerce.git
cd yusu-ecommerce
```

2. **Dependencies yükləyin / Install dependencies:**
```bash
# Ana proyekt / Main project
cd yusu-ecommerce && npm install

# Admin paneli / Admin panel
cd ../yusu-admin && npm install

# Satıcı paneli / Seller panel
cd ../yusu-seller && npm install

# Kuryer paneli / Courier panel
cd ../yusu-courier && npm install
```

3. **Environment variables təyin edin / Set environment variables:**
```bash
cp .env.example .env.local
# .env.local faylını redaktə edin / Edit .env.local file
```

4. **Veritabanını quraşdırın / Setup database:**
```bash
cd yusu-ecommerce
npx prisma migrate dev
npx prisma db:seed
```

5. **Proyektləri işə salın / Start projects:**
```bash
# Terminal 1 - Ana sayt / Main site
cd yusu-ecommerce && npm run dev

# Terminal 2 - Admin paneli / Admin panel
cd yusu-admin && npm run dev

# Terminal 3 - Satıcı paneli / Seller panel
cd yusu-seller && npm run dev

# Terminal 4 - Kuryer paneli / Courier panel
cd yusu-courier && npm run dev
```

## 🌐 URL Strukturu / URL Structure

### Local Development / Lokal İnkişaf
- **Ana sayt / Main site:** http://localhost:3000
- **Admin paneli / Admin panel:** http://localhost:3001
- **Satıcı paneli / Seller panel:** http://localhost:3002
- **Kuryer paneli / Courier panel:** http://localhost:3003

### Production / Canlı
- **Ana sayt / Main site:** https://yusu.com
- **Admin paneli / Admin panel:** https://admin.yusu.com
- **Satıcı paneli / Seller panel:** https://seller.yusu.com
- **Kuryer paneli / Courier panel:** https://courier.yusu.com

## 🔧 Deployment / Yükləmə

### Vercel (Tövsiyə Edilən)

1. **Vercel hesabı yaradın / Create Vercel account**
2. **GitHub repo-nu bağlayın / Connect GitHub repo**
3. **Environment variables əlavə edin / Add environment variables**
4. **Custom domain əlavə edin / Add custom domain**

### Docker

```bash
docker-compose up -d
```

## 📚 API Sənədləşməsi / API Documentation

### Müştəri API / Customer API
- `GET /api/products` - Məhsulları listələ / List products
- `GET /api/categories` - Kateqoriyaları listələ / List categories
- `POST /api/cart` - Səbətə əlavə et / Add to cart
- `POST /api/orders` - Sifariş yarat / Create order

### Admin API
- `GET /api/admin/users` - İstifadəçiləri listələ / List users
- `GET /api/admin/products` - Məhsulları listələ / List products
- `PUT /api/admin/products/[id]/approve` - Məhsulu təsdiq et / Approve product

### Satıcı API / Seller API
- `GET /api/seller/products` - Məhsullarımı listələ / List my products
- `POST /api/seller/products` - Məhsul əlavə et / Add product
- `GET /api/seller/orders` - Sifarişlərimi listələ / List my orders

### Kuryer API / Courier API
- `GET /api/courier/deliveries` - Çatdırılma sifarişləri / Delivery orders
- `PUT /api/courier/deliveries/[id]/status` - Status yenilə / Update status

## 🤝 Töhfə Vermək / Contributing

1. Fork edin / Fork the project
2. Feature branch yaradın / Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit edin / Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push edin / Push to branch (`git push origin feature/AmazingFeature`)
5. Pull Request yaradın / Open Pull Request

## 📄 Lisenziya / License

Bu proyekt MIT lisenziyası altında paylaşılır / This project is licensed under the MIT License.

## 📞 Əlaqə / Contact

- **Email:** info@yusu.com
- **Website:** https://yusu.com
- **GitHub:** https://github.com/Dijital-human/yusu-ecommerce

---

**Yusu E-commerce Platform** - Multi-role subdomain architecture ilə ən yaxşı e-ticarət həlli / The best e-commerce solution with multi-role subdomain architecture
