# 🗄️ PRODUCTION DATABASE SETUP GUIDE
# 🗄️ PRODUCTION VERİTABANI QURULUMU TƏLİMATI

**Tarix / Date:** 2025-01-28  
**Status:** ✅ Hazır / Ready  
**Domain:** `ulustore.com` (Production)

---

## 📋 MƏQSƏD / GOAL

Production database-in düzgün qurulması və migration-ların tətbiq edilməsi.

---

## 🔧 ADDIMLAR / STEPS

### 1. Production Database Yaratmaq / Creating Production Database

#### Seçim 1: Vercel Postgres
```bash
# Vercel Dashboard-da:
# 1. Project Settings → Storage → Create Database
# 2. PostgreSQL seçin
# 3. Database adını verin: "ulustore-production"
# 4. Region seçin: "US East (iad1)"
# 5. Connection string-i kopyalayın
```

#### Seçim 2: Supabase
```bash
# Supabase Dashboard-da:
# 1. New Project yaradın
# 2. Project adı: "ulustore-production"
# 3. Database password təyin edin
# 4. Region seçin: "US East (iad1)"
# 5. Connection string-i kopyalayın
```

#### Seçim 3: AWS RDS / DigitalOcean / Digər
```bash
# Provider-in dashboard-unda:
# 1. PostgreSQL instance yaradın
# 2. Database adı: "ulustore_production"
# 3. Connection string-i kopyalayın
```

---

### 2. Environment Variable Əlavə Etmək / Adding Environment Variable

```bash
# Vercel Dashboard-da:
# Project Settings → Environment Variables → Add New

# Variable adı:
DATABASE_URL

# Variable dəyəri:
postgresql://username:password@host:port/database?connection_limit=20&pool_timeout=20&connect_timeout=10

# Environment:
Production, Preview, Development (hamısı)
```

**Qeyd:** Connection pool parametrləri:
- `connection_limit=20` - Maksimum connection sayı
- `pool_timeout=20` - Pool timeout (saniyə)
- `connect_timeout=10` - Connection timeout (saniyə)

---

### 3. Database Migration-ları Tətbiq Etmək / Applying Database Migrations

#### Vercel-də avtomatik (build zamanı):
```json
// package.json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

Vercel build zamanı avtomatik olaraq migration-ları tətbiq edəcək.

#### Manual (local-dən):
```bash
# Production database URL-i təyin edin
export DATABASE_URL="postgresql://username:password@host:port/database"

# Migration-ları tətbiq edin
npx prisma migrate deploy

# Prisma client-i generate edin
npx prisma generate
```

---

### 4. Database Seed (İstəyə bağlı) / Database Seed (Optional)

**Qeyd:** Production-da seed yalnız ilk dəfə və ya test məlumatları üçün istifadə edilməlidir.

```bash
# Production database URL-i təyin edin
export DATABASE_URL="postgresql://username:password@host:port/database"

# Seed script-i işə salın
npm run db:seed
```

**Seed script nə yaradır:**
- Admin istifadəçi: `admin@ulustore.com` (Password: `admin123`)
- Test satıcılar: `seller1@ulustore.com`, `seller2@ulustore.com`
- Test kuryerlər: `courier1@ulustore.com`, `courier2@ulustore.com`
- Test müştərilər: `customer1@ulustore.com`, `customer2@ulustore.com`
- Test kateqoriyalar və məhsullar

**⚠️ XƏBƏRDARLIQ:** Production-da seed yalnız ilk dəfə və ya test məlumatları üçün istifadə edilməlidir. Real məlumatlar üçün istifadə etməyin!

---

### 5. Database Connection Test / Veritabanı Bağlantı Testi

```bash
# Production database URL-i təyin edin
export DATABASE_URL="postgresql://username:password@host:port/database"

# Prisma Studio ilə test edin (yalnız development üçün)
npx prisma studio

# Və ya SQL query ilə test edin
psql $DATABASE_URL -c "SELECT version();"
```

---

### 6. Database Backup Konfiqurasiyası / Database Backup Configuration

Backup avtomatik olaraq Vercel Cron Jobs ilə işləyir:

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/backup/schedule?type=daily",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/backup/schedule?type=weekly",
      "schedule": "0 3 * * 0"
    },
    {
      "path": "/api/backup/schedule?type=monthly",
      "schedule": "0 4 1 * *"
    }
  ]
}
```

**Backup cədvəli:**
- **Daily:** Hər gün saat 02:00-da
- **Weekly:** Hər bazar günü saat 03:00-da
- **Monthly:** Hər ayın 1-i saat 04:00-da

---

## ✅ YOXLAMA SİYAHISI / CHECKLIST

- [ ] Production database yaradılıb
- [ ] `DATABASE_URL` environment variable əlavə edilib
- [ ] Database migration-ları tətbiq edilib
- [ ] Prisma client generate edilib
- [ ] Database connection test edilib
- [ ] Backup konfiqurasiyası aktivləşdirilib
- [ ] Connection pool parametrləri təyin edilib

---

## 🔍 PROBLEM HƏLL ETMƏ / TROUBLESHOOTING

### Problem 1: Migration xətası
```bash
# Migration status-unu yoxlayın
npx prisma migrate status

# Migration-ları reset edin (DİQQƏT: Məlumatlar silinəcək!)
npx prisma migrate reset
```

### Problem 2: Connection pool xətası
```bash
# Connection limit-i artırın
DATABASE_URL="...?connection_limit=50&pool_timeout=30"
```

### Problem 3: Timeout xətası
```bash
# Connection timeout-u artırın
DATABASE_URL="...?connect_timeout=20"
```

---

## 📚 ƏLAVƏ MƏLUMAT / ADDITIONAL INFORMATION

- **Prisma Documentation:** https://www.prisma.io/docs
- **Vercel Postgres:** https://vercel.com/docs/storage/vercel-postgres
- **Supabase:** https://supabase.com/docs

---

**Son Yeniləmə / Last Update:** 2025-01-28

