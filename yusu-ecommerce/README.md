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

## 🛠️ Texnologiyalar / Technologies

- **Frontend:** Next.js 15, React 19, TypeScript
- **Styling:** Tailwind CSS, Radix UI
- **Database:** Prisma ORM, SQLite
- **Authentication:** NextAuth.js
- **Payment:** Stripe
- **State Management:** React Context

## 📁 Proyekt Strukturu / Project Structure

```
yusu-ecommerce/
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
```

## 🚀 Quraşdırma / Installation

### Tələblər / Requirements
- Node.js 18+
- npm və ya yarn
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
```bash
cp .env.example .env.local
# .env.local faylını redaktə edin / Edit .env.local file
```

4. **Proyekti işə salın / Start the project:**
```bash
npm run dev
```

## 🌐 URL Strukturu / URL Structure

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

## 🤝 Töhfə Vermək / Contributing

1. Fork edin / Fork the project
2. Feature branch yaradın / Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit edin / Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push edin / Push to branch (`git push origin feature/AmazingFeature`)
5. Pull Request yaradın / Open Pull Request

## 📄 Lisenziya / License

Bu proyekt MIT lisenziyası altında paylaşılır / This project is licensed under the MIT License.

## 📞 Əlaqə / Contact

- **Email:** customer@yusu.com
- **Website:** https://yusu.com
- **Support:** support@yusu.com

---

**Yusu Customer Platform** - Müştərilər üçün ən yaxşı həll / The best solution for customers
