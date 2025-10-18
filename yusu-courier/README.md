# Yusu Courier Panel / Yusu Kuryer Paneli

## 📋 Təsvir / Description

Yusu Courier Panel - Kuryerlər üçün xüsusi idarəetmə paneli / Special management panel for couriers.

Bu panel kuryerlərin çatdırılma sifarişlərini idarə etməsi, müştərilərə xidmət göstərməsi və performans statistikalarını izləməsi üçün yaradılmışdır.

This panel is designed for couriers to manage delivery orders, serve customers, and track performance statistics.

## 🚀 Xüsusiyyətlər / Features

### Çatdırılma İdarəetməsi / Delivery Management
- ✅ Sifarişləri görüntüləmə / View orders
- ✅ Sifariş statusunu dəyişdirmə / Change order status
- ✅ Çatdırılma marşrutu / Delivery route
- ✅ Müştəri məlumatları / Customer information
- ✅ Çatdırılma tarixçəsi / Delivery history

### Performans İzləməsi / Performance Tracking
- ✅ Günlük çatdırılmalar / Daily deliveries
- ✅ Aylıq performans / Monthly performance
- ✅ Müştəri reytinqi / Customer rating
- ✅ Məsafə və vaxt statistikaları / Distance and time statistics

### Nəqliyyat İdarəetməsi / Vehicle Management
- ✅ Nəqliyyat növü / Vehicle type
- ✅ Lisenziya məlumatları / License information
- ✅ Nəqliyyat statusu / Vehicle status
- ✅ Texniki xidmət tarixçəsi / Maintenance history

## 🛠️ Texnologiyalar / Technologies

- **Frontend:** Next.js 15, React 19, TypeScript
- **Styling:** Tailwind CSS, Radix UI
- **Database:** Prisma ORM, SQLite
- **Authentication:** NextAuth.js
- **State Management:** React Context
- **Maps Integration:** Google Maps API (planned)

## 📁 Proyekt Strukturu / Project Structure

```
yusu-courier/
├── src/
│   ├── app/
│   │   ├── courier/          # Courier səhifələri / Courier pages
│   │   ├── api/courier/      # Courier API-ləri / Courier APIs
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

- **Ana səhifə / Home:** `http://localhost:3003/`
- **Courier Dashboard:** `http://localhost:3003/courier/dashboard`
- **Sifarişlər / Orders:** `http://localhost:3003/courier/orders`
- **Profil / Profile:** `http://localhost:3003/courier/profile`
- **Giriş / Login:** `http://localhost:3003/auth/signin`

## 🔐 Təhlükəsizlik / Security

- ✅ Rol əsaslı giriş nəzarəti / Role-based access control
- ✅ JWT token autentifikasi / JWT token authentication
- ✅ CSRF qorunması / CSRF protection
- ✅ XSS qorunması / XSS protection
- ✅ SQL injection qorunması / SQL injection protection
- ✅ GPS məlumatları şifrələmə / GPS data encryption

## 📚 API Sənədləşməsi / API Documentation

### Courier API Endpoints

#### Sifarişlər / Orders
- `GET /api/courier/orders` - Sifarişləri listələ / List orders
- `GET /api/courier/orders/[id]` - Sifariş detalları / Order details
- `PUT /api/courier/orders/[id]` - Sifariş statusunu yenilə / Update order status
- `POST /api/courier/orders/[id]/deliver` - Çatdırılma təsdiqi / Confirm delivery

#### Profil / Profile
- `GET /api/courier/profile` - Profil məlumatları / Profile information
- `PUT /api/courier/profile` - Profili yenilə / Update profile
- `PUT /api/courier/vehicle` - Nəqliyyat məlumatlarını yenilə / Update vehicle info

#### Statistika / Statistics
- `GET /api/courier/stats` - Performans statistikaları / Performance statistics
- `GET /api/courier/stats/daily` - Günlük çatdırılmalar / Daily deliveries
- `GET /api/courier/stats/monthly` - Aylıq performans / Monthly performance

#### Çatdırılma / Delivery
- `GET /api/courier/deliveries` - Çatdırılma tarixçəsi / Delivery history
- `POST /api/courier/deliveries` - Yeni çatdırılma əlavə et / Add new delivery
- `PUT /api/courier/deliveries/[id]` - Çatdırılma statusunu yenilə / Update delivery status

## 🗺️ Xəritə İnteqrasiyası / Maps Integration

### Google Maps API
- ✅ Real-time GPS izləmə / Real-time GPS tracking
- ✅ Optimal marşrut hesablama / Optimal route calculation
- ✅ Müştəri ünvanları / Customer addresses
- ✅ Trafik məlumatları / Traffic information

### GPS Funksiyaları / GPS Features
- ✅ Mövcud mövqe / Current location
- ✅ Çatdırılma marşrutu / Delivery route
- ✅ Məsafə hesablama / Distance calculation
- ✅ Təxmini vaxt / Estimated time

## 📱 Mobil Uyğunluq / Mobile Compatibility

- ✅ Responsive dizayn / Responsive design
- ✅ Touch-friendly interfeys / Touch-friendly interface
- ✅ Offline rejim / Offline mode
- ✅ Push bildirişlər / Push notifications

## 🤝 Töhfə Vermək / Contributing

1. Fork edin / Fork the project
2. Feature branch yaradın / Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit edin / Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push edin / Push to branch (`git push origin feature/AmazingFeature`)
5. Pull Request yaradın / Open Pull Request

## 📄 Lisenziya / License

Bu proyekt MIT lisenziyası altında paylaşılır / This project is licensed under the MIT License.

## 📞 Əlaqə / Contact

- **Email:** courier@yusu.com
- **Website:** https://courier.yusu.com
- **Support:** support@yusu.com

---

**Yusu Courier Panel** - Kuryerlər üçün ən yaxşı həll / The best solution for couriers