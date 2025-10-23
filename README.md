<<<<<<< HEAD
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
=======
# Yusu - Müştəri Platforması / Customer Platform

## 📋 Təsvir / Description

Yusu - müştərilər üçün müasir e-ticarət platforması. Keyfiyyətli məhsullar, sürətli çatdırılma və təhlükəsiz ödəniş təmin edir.

Yusu is a modern e-commerce platform for customers, providing quality products, fast delivery, and secure payment solutions.

Bu platforma müştərilər üçün tam onlayn alış-veriş təcrübəsi təmin edir, məhsul axtarışından sifariş verilməsinə qədər bütün prosesləri əhatə edir.

This platform provides a complete online shopping experience for customers, covering all processes from product search to order placement.

## 🚀 Xüsusiyyətlər / Features

### Müştəri Xüsusiyyətləri / Customer Features
- ✅ Məhsul axtarışı və səhifələmə / Product browsing and search
- ✅ Alış səbəti idarəetməsi / Shopping cart management
- ✅ Təhlükəsiz ödəniş prosesi / Secure checkout process
- ✅ Sifariş izləmə / Order tracking
- ✅ Profil idarəetməsi / Profile management
- ✅ Məhsul rəyləri və reytinqlər / Product reviews and ratings
- ✅ Kateqoriya əsaslı axtarış / Category-based search
- ✅ Favorit məhsullar / Favorite products
- ✅ Sifariş tarixçəsi / Order history



### Alış-veriş Təcrübəsi / Shopping Experience
- ✅ Responsive dizayn / Responsive design
- ✅ Sürətli yükləmə / Fast loading
- ✅ İntuitiv interfeys / Intuitive interface
- ✅ Mobil uyğunluq / Mobile compatibility
- ✅ Çoxdilli dəstək / Multi-language support
>>>>>>> 723d73e (Initial commit: yusu-ecommerce with Vercel configuration)

## 🛠️ Texnologiyalar / Technologies

- **Frontend:** Next.js 15, React 19, TypeScript
- **Styling:** Tailwind CSS, Radix UI
<<<<<<< HEAD
- **Database:** Prisma ORM, PostgreSQL
- **Authentication:** NextAuth.js
- **Payment:** Stripe
- **Deployment:** Vercel
- **Reverse Proxy:** Nginx
=======
- **Database:** Prisma ORM, SQLite
- **Authentication:** NextAuth.js
- **Payment:** Stripe
- **State Management:** React Context
>>>>>>> 723d73e (Initial commit: yusu-ecommerce with Vercel configuration)

## 📁 Proyekt Strukturu / Project Structure

```
yusu-ecommerce/
<<<<<<< HEAD
├── yusu-ecommerce/          # Müştəri platforması / Customer platform
├── yusu-admin/              # Admin paneli / Admin panel
├── yusu-seller/             # Satıcı paneli / Seller panel
├── yusu-courier/            # Kuryer paneli / Courier panel
├── nginx-complete.conf      # Nginx konfiqurasiyası / Nginx config
├── docker-compose.yml       # Docker orchestration
└── README.md               # Bu fayl / This file
=======
├── src/
│   ├── app/
│   │   ├── products/         # Məhsul səhifələri / Product pages
│   │   ├── categories/       # Kateqoriya səhifələri / Category pages
│   │   ├── search/           # Axtarış səhifəsi / Search page
│   │   ├── checkout/         # Ödəniş səhifəsi / Checkout page
│   │   ├── orders/           # Sifariş səhifələri / Order pages
│   │   ├── profile/          # Profil səhifəsi / Profile page
│   │   ├── dashboard/        # Müştəri paneli / Customer dashboard
│   │   ├── api/              # API route-ları / API routes
│   │   └── auth/             # Giriş səhifələri / Auth pages
│   ├── components/           # Komponentlər / Components
│   ├── lib/                  # Yardımçı funksiyalar / Helper functions
│   └── types/                # TypeScript tipləri / TypeScript types
├── prisma/                   # Veritabanı şeması / Database schema
└── public/                   # Statik fayllar / Static files
>>>>>>> 723d73e (Initial commit: yusu-ecommerce with Vercel configuration)
```

## 🚀 Quraşdırma / Installation

### Tələblər / Requirements
- Node.js 18+
- npm və ya yarn
<<<<<<< HEAD
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
=======
- SQLite veritabanı / SQLite database


### Addımlar / Steps

1. **Bağımlılıqları yükləyin / Install dependencies:**
```bash
npm install
```

2. **Veritabanını quraşdırın / Setup database:**
```bash
npx prisma migrate dev
npx prisma db:seed
```

3. **Mühit dəyişənlərini təyin edin / Set environment variables:**
>>>>>>> 723d73e (Initial commit: yusu-ecommerce with Vercel configuration)
```bash
cp .env.example .env.local
# .env.local faylını redaktə edin / Edit .env.local file
```

<<<<<<< HEAD
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
=======
4. **Proyekti işə salın / Start the project:**
```bash
npm run dev
>>>>>>> 723d73e (Initial commit: yusu-ecommerce with Vercel configuration)
```

## 🌐 URL Strukturu / URL Structure

<<<<<<< HEAD
### Local Development / Lokal İnkişaf
- **Ana sayt / Main site:** http://localhost:3000
- **Admin paneli / Admin panel:** http://localhost:3001
- **Satıcı paneli / Seller panel:** http://localhost:3002
- **Kuryer paneli / Courier panel:** http://localhost:3003

### Production / Canlı
- **Ana sayt / Main site:** https://azliner.info
- **Admin paneli / Admin panel:** https://admin.azliner.info
- **Satıcı paneli / Seller panel:** https://seller.azliner.info
- **Kuryer paneli / Courier panel:** https://courier.azliner.info

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
=======
- **Ana səhifə / Home:** `http://localhost:3000/`
- **Məhsullar / Products:** `http://localhost:3000/products`
- **Kateqoriyalar / Categories:** `http://localhost:3000/categories`
- **Axtarış / Search:** `http://localhost:3000/search`
- **Səbət / Cart:** `http://localhost:3000/cart`
- **Ödəniş / Checkout:** `http://localhost:3000/checkout`
- **Sifarişlər / Orders:** `http://localhost:3000/orders`
- **Profil / Profile:** `http://localhost:3000/profile`
- **Giriş / Login:** `http://localhost:3000/auth/signin`

## 🔐 Təhlükəsizlik / Security

- ✅ Rol əsaslı giriş nəzarəti / Role-based access control
- ✅ JWT token autentifikasi / JWT token authentication
- ✅ CSRF qorunması / CSRF protection
- ✅ XSS qorunması / XSS protection
- ✅ SQL injection qorunması / SQL injection protection
- ✅ Ödəniş məlumatları şifrələmə / Payment data encryption

## 📚 API Sənədləşməsi / API Documentation

### Customer API Endpoints

#### Məhsullar / Products
- `GET /api/products` - Məhsulları listələ / List products
- `GET /api/products/[id]` - Məhsul detalları / Product details
- `GET /api/products/search` - Məhsul axtarışı / Product search

#### Kateqoriyalar / Categories
- `GET /api/categories` - Kateqoriyaları listələ / List categories
- `GET /api/categories/[id]` - Kateqoriya detalları / Category details
- `GET /api/categories/[id]/products` - Kateqoriya məhsulları / Category products

#### Səbət / Cart
- `GET /api/cart` - Səbəti görüntülə / View cart
- `POST /api/cart` - Səbətə əlavə et / Add to cart
- `PUT /api/cart/[id]` - Səbət məhsulunu yenilə / Update cart item
- `DELETE /api/cart/[id]` - Səbətdən sil / Remove from cart

#### Sifarişlər / Orders
- `GET /api/orders` - Sifarişləri listələ / List orders
- `POST /api/orders` - Yeni sifariş yarat / Create new order
- `GET /api/orders/[id]` - Sifariş detalları / Order details
- `PUT /api/orders/[id]` - Sifariş statusunu yenilə / Update order status

#### Ödəniş / Payment
- `POST /api/payment/create-intent` - Ödəniş niyyəti yarat / Create payment intent
- `POST /api/payment/webhook` - Stripe webhook / Stripe webhook

## 🛒 Alış-veriş Prosesi / Shopping Process

### 1. Məhsul Axtarışı / Product Search
- Kateqoriya əsaslı axtarış / Category-based search
- Açar söz axtarışı / Keyword search
- Filtrləmə və sıralama / Filtering and sorting
- Favorit məhsullar / Favorite products

### 2. Səbət İdarəetməsi / Cart Management
- Məhsul əlavə etmə / Add products
- Miqdar dəyişdirmə / Change quantity
- Məhsul silmə / Remove products
- Səbət hesablaması / Cart calculation

### 3. Ödəniş Prosesi / Checkout Process
- Ünvan seçimi / Address selection
- Ödəniş üsulu seçimi / Payment method selection
- Sifariş təsdiqi / Order confirmation
- Ödəniş emalı / Payment processing

### 4. Sifariş İzləmə / Order Tracking
- Sifariş statusu / Order status
- Çatdırılma məlumatları / Delivery information
- Sifariş tarixçəsi / Order history

## 📱 Mobil Uyğunluq / Mobile Compatibility

- ✅ Responsive dizayn / Responsive design
- ✅ Touch-friendly interfeys / Touch-friendly interface
- ✅ PWA dəstəyi / PWA support
- ✅ Offline rejim / Offline mode
- ✅ Push bildirişlər / Push notifications

## 🌍 Çoxdilli Dəstək / Multi-language Support

- ✅ Azərbaycan dili / Azerbaijani language
- ✅ İngilis dili / English language
- ✅ Dil dəyişdirmə / Language switching
- ✅ Lokallaşdırma / Localization
>>>>>>> 723d73e (Initial commit: yusu-ecommerce with Vercel configuration)

## 🤝 Töhfə Vermək / Contributing

1. Fork edin / Fork the project
2. Feature branch yaradın / Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit edin / Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push edin / Push to branch (`git push origin feature/AmazingFeature`)
5. Pull Request yaradın / Open Pull Request

## 📄 Lisenziya / License

Bu proyekt MIT lisenziyası altında paylaşılır / This project is licensed under the MIT License.

## 📞 Əlaqə / Contact

<<<<<<< HEAD
- **Email:** info@azliner.info
- **Website:** https://azliner.info
- **GitHub:** https://github.com/Dijital-human/yusu-ecommerce

---

**Yusu E-commerce Platform** - Multi-role subdomain architecture ilə ən yaxşı e-ticarət həlli / The best e-commerce solution with multi-role subdomain architecture

---
*Last updated: $(date) - Trigger deployment*
*Deployment test - Vercel integration*
*Force deployment - Environment variables updated*
=======
- **Email:** customer@azliner.info
- **Website:** https://azliner.info
- **Support:** support@azliner.info

---

**Yusu Customer Platform** - Müştərilər üçün ən yaxşı həll / The best solution for customers
>>>>>>> 723d73e (Initial commit: yusu-ecommerce with Vercel configuration)
