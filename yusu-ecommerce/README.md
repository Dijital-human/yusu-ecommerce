# Yusu E-commerce Platform / Yusu E-ticarət Platforması

A modern, full-featured e-commerce platform built with Next.js, TypeScript, and Prisma.
Next.js, TypeScript və Prisma ilə qurulmuş müasir, tam funksiyalı e-ticarət platforması.

## Features / Xüsusiyyətlər

### 🛍️ **Customer Features / Müştəri Xüsusiyyətləri**
- Browse products with advanced filtering / Təkmilləşdirilmiş filtrlə məhsullara bax
- Shopping cart and wishlist / Alış səbəti və istək siyahısı
- Secure checkout with multiple payment methods / Çoxlu ödəniş üsulları ilə təhlükəsiz ödəniş
- Order tracking and history / Sifariş izləmə və tarixçə
- Product reviews and ratings / Məhsul rəyləri və reytinqlər

### 🏪 **Seller Features / Satıcı Xüsusiyyətləri**
- Product management dashboard / Məhsul idarəetmə paneli
- Inventory management / İnventar idarəetməsi
- Order processing and fulfillment / Sifariş emalı və yerinə yetirmə
- Sales analytics and reporting / Satış analitikası və hesabatlar
- Multi-vendor support / Çox satıcı dəstəyi

### 🚚 **Courier Features / Kuryer Xüsusiyyətləri**
- Delivery assignment system / Çatdırılma təyin sistemi
- Route optimization / Marşrut optimallaşdırması
- Real-time status updates / Real-vaxt status yeniləmələri
- Customer communication / Müştəri əlaqəsi
- Performance tracking / Performans izləmə

### 👑 **Admin Features / Admin Xüsusiyyətləri**
- Complete platform control / Platforma tam nəzarət
- User management (all roles) / İstifadəçi idarəetməsi (bütün rollar)
- Product and category management / Məhsul və kateqoriya idarəetməsi
- Order and payment oversight / Sifariş və ödəniş nəzarəti
- Analytics and reporting / Analitika və hesabatlar
- System monitoring / Sistem monitorinqi

## Tech Stack / Texnologiya Yığını

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Backend**: Next.js API Routes, tRPC
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js (OAuth + Credentials)
- **Payments**: Stripe
- **Deployment**: Vercel
- **State Management**: React Context API
- **Form Handling**: React Hook Form + Zod

## Quick Start / Sürətli Başlanğıc

### Prerequisites / Tələblər

- Node.js 18+ / Node.js 18+
- npm or yarn / npm və ya yarn
- PostgreSQL database / PostgreSQL veritabanı

### Installation / Quraşdırma

1. **Clone the repository / Repository-ni klonlayın:**
```bash
git clone https://github.com/yourusername/yusu-ecommerce.git
cd yusu-ecommerce
```

2. **Install dependencies / Asılılıqları quraşdırın:**
```bash
npm install
```

3. **Set up environment variables / Mühit dəyişənlərini quraşdırın:**
```bash
cp env.example .env.local
# Edit .env.local with your values / .env.local-i dəyərlərinizlə redaktə edin
```

4. **Set up the database / Veritabanını quraşdırın:**
```bash
npx prisma migrate dev
npm run db:seed
```

5. **Start the development server / İnkişaf serverini başladın:**
```bash
npm run dev
```

6. **Open your browser / Brauzerinizi açın:**
```
http://localhost:3000
```

## Project Structure / Layihə Strukturu

```
yusu-ecommerce/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API Routes
│   │   ├── admin/          # Admin pages
│   │   ├── seller/         # Seller pages
│   │   ├── courier/        # Courier pages
│   │   └── auth/           # Authentication pages
│   ├── components/         # React components
│   │   ├── ui/             # UI components
│   │   ├── layout/         # Layout components
│   │   ├── forms/          # Form components
│   │   └── pages/          # Page components
│   ├── lib/                # Utility libraries
│   │   ├── auth/           # Authentication config
│   │   ├── db/             # Database connection
│   │   └── validations/    # Zod schemas
│   ├── hooks/              # Custom React hooks
│   ├── store/              # State management
│   └── types/              # TypeScript types
├── prisma/                 # Database schema and migrations
├── docs/                   # Documentation
└── public/                 # Static assets
```

## Available Scripts / Mövcud Scriptlər

- `npm run dev` - Start development server / İnkişaf serverini başlat
- `npm run build` - Build for production / Production üçün build et
- `npm run start` - Start production server / Production serverini başlat
- `npm run lint` - Run ESLint / ESLint çalışdır
- `npm run db:seed` - Seed database with sample data / Veritabanını nümunə məlumatlarla doldur
- `npm run db:reset` - Reset and seed database / Veritabanını sıfırla və doldur

## Environment Variables / Mühit Dəyişənləri

See `env.example` for all required environment variables.
Bütün tələb olunan mühit dəyişənləri üçün `env.example`-a baxın.

### Required / Tələb olunan
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - NextAuth.js secret key
- `NEXTAUTH_URL` - Application URL

### Optional / İstəyə bağlı
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - Google OAuth
- `FACEBOOK_CLIENT_ID` & `FACEBOOK_CLIENT_SECRET` - Facebook OAuth
- `APPLE_CLIENT_ID` & `APPLE_CLIENT_SECRET` - Apple OAuth
- `STRIPE_SECRET_KEY` & `STRIPE_WEBHOOK_SECRET` - Stripe payments

## User Roles / İstifadəçi Rolları

### Test Accounts / Test Hesabları

After running `npm run db:seed`, you can use these test accounts:
`npm run db:seed` çalışdırdıqdan sonra bu test hesablarını istifadə edə bilərsiniz:

- **Admin**: admin@yusu.com
- **Seller 1**: seller1@yusu.com
- **Seller 2**: seller2@yusu.com
- **Courier 1**: courier1@yusu.com
- **Courier 2**: courier2@yusu.com

*Note: Use OAuth providers for authentication / Qeyd: Autentifikasiya üçün OAuth provider-ləri istifadə edin*

## API Documentation / API Sənədləşməsi

Comprehensive API documentation is available in `/docs/API_DOCUMENTATION.md`
Hərtərəfli API sənədləşməsi `/docs/API_DOCUMENTATION.md`-də mövcuddur

## Deployment / Deploy

### Vercel (Recommended) / Vercel (Tövsiyə edilir)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

See `/docs/DEPLOYMENT_GUIDE.md` for detailed instructions.
Ətraflı təlimatlar üçün `/docs/DEPLOYMENT_GUIDE.md`-ə baxın.

## Contributing / Töhfə Vermək

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Documentation / Sənədləşmə

- [API Documentation](./docs/API_DOCUMENTATION.md)
- [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)
- [User Manual](./docs/USER_MANUAL.md)

## License / Lisenziya

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
Bu layihə MIT Lisenziyası altında lisenziyalaşdırılıb - ətraflar üçün [LICENSE](LICENSE) faylına baxın.

## Support / Dəstək

- **Email**: support@yusu.com
- **Documentation**: https://docs.yusu.com
- **Issues**: https://github.com/yusu-ecommerce/issues

## Acknowledgments / Təşəkkürlər

- Next.js team for the amazing framework
- Vercel for hosting and deployment
- Prisma team for the excellent ORM
- All contributors and users

---

**Made with ❤️ by Yusu Team / Yusu Komandası tərəfindən ❤️ ilə hazırlanıb**