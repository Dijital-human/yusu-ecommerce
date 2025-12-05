# 🗄️ SUPABASE SETUP GUIDE
# 🗄️ SUPABASE QURAŞDIRMA TƏLİMATI

**Tarix / Date:** 2025-01-28  
**Status:** ✅ Hazır / Ready  
**Domain:** `ulustore.com` (Production)

---

## 📋 MƏQSƏD / GOAL

Supabase-də database yaratmaq və connection string əldə etmək.

---

## 📋 HAQQINDA / ABOUT

### Supabase nədir?

**Supabase** open-source **Firebase alternative**-dir ki, PostgreSQL database hosting, real-time subscriptions, authentication, storage, və edge functions təmin edir. Supabase, Firebase-in open-source alternativi kimi yaradılıb və PostgreSQL database istifadə edir.

### Supabase-in əsas xüsusiyyətləri:

- **Managed PostgreSQL Database:** Production-ready PostgreSQL hosting
- **Real-Time Subscriptions:** Database dəyişikliklərinə real-time subscriptions
- **Authentication Service:** Built-in authentication (email, OAuth, magic links)
- **Storage Service:** File storage ilə CDN dəstəyi
- **Edge Functions:** Serverless functions (Deno-based)
- **Database GUI:** Supabase Studio (visual database browser)
- **Auto Backups:** Avtomatik database backups
- **Connection Pooling:** Built-in connection pooling

### Niyə lazımdır bizə:

1. **Managed PostgreSQL Database:**
   - Production-ready PostgreSQL hosting
   - Avtomatik backups və recovery
   - High availability və scalability
   - Connection pooling

2. **Real-Time Database Subscriptions:**
   - Database dəyişikliklərinə real-time subscriptions
   - WebSocket ilə real-time updates
   - Real-time collaboration features

3. **Built-In Authentication:**
   - Email/password authentication
   - OAuth providers (Google, GitHub, Facebook)
   - Magic links
   - JWT tokens

4. **Storage Service:**
   - File storage ilə CDN dəstəyi
   - Image optimization
   - File upload və download
   - Access control

5. **Edge Functions:**
   - Serverless functions (Deno-based)
   - Global edge network
   - Low latency
   - Auto-scaling

6. **Database GUI (Supabase Studio):**
   - Visual database browser
   - Table editor
   - Query builder
   - Data visualization

7. **Production-Ready Infrastructure:**
   - Auto-scaling
   - High availability
   - Global CDN
   - SSL/TLS encryption

### Alternativlər və niyə Supabase seçilib:

- **Firebase:** Google-un proprietary, Supabase open-source və PostgreSQL
- **AWS RDS:** Daha çox konfiqurasiya lazımdır, Supabase daha sadə
- **Heroku Postgres:** Daha bahalı, Supabase daha ucuz
- **PlanetScale:** MySQL-based, Supabase PostgreSQL-based

**Niyə Supabase seçilib:**
- Open-source və PostgreSQL-based
- Real-time subscriptions
- Built-in authentication və storage
- Yaxşı developer experience
- Production-ready infrastructure
- Free tier mövcuddur

---

## 🔐 QEYDİYYAT / REGISTRATION

### Addım 1: Supabase Account Yaradın

1. **Supabase səhifəsinə gedin:**
   - URL: https://supabase.com
   - "Start your project" və ya "Sign Up" basın

2. **Qeydiyyat metodunu seçin:**
   - GitHub (tövsiyə edilir)
   - Email

3. **Account yaradın:**
   - Email və şifrə daxil edin
   - Email verification edin

---

## 📦 PROJECT YARADILMASI / PROJECT CREATION

### Addım 2: Yeni Project Yaradın

1. **Supabase Dashboard-a daxil olun:**
   - https://app.supabase.com

2. **"New Project" basın**

3. **Project məlumatlarını daxil edin:**
   - **Organization:** Yeni organization yaradın və ya mövcud seçin
   - **Name:** `ulustore-production`
   - **Database Password:** Güclü şifrə yaradın (saxlayın!)
   - **Region:** Ən yaxın region seçin (məsələn, `West US` və ya `Europe West`)
   - **Pricing Plan:** Production üçün "Pro" plan seçin

4. **"Create new project" basın**
   - Project yaradılması 2-3 dəqiqə çəkə bilər

---

## 🔑 CONNECTION STRING ƏLDƏ ETMƏK / GETTING CONNECTION STRING

### Addım 3: Database Connection String

1. **Project → Settings → Database**

2. **Connection string-ləri görəcəksiniz:**

   **Direct Connection (Production):**
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

   **Connection Pooling (Recommended):**
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```

3. **Connection string-i kopyalayın**

**Hara yazılacaq / Where to add:**
- Vercel Environment Variables:
  - Key: `DATABASE_URL`
  - Value: Connection string (password ilə birlikdə)
- Local `.env.production` faylı:
  ```
  DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
  ```

**Fayl yolu / File path:**
- `yusu-ecommerce/env.production` (gitignore-da olmalıdır)
- Vercel: Project Settings → Environment Variables

---

## 🔐 DATABASE PASSWORD / VERİTABANI ŞİFRƏSİ

### Şifrəni Saxlayın

- ⚠️ **Şifrəni təhlükəsiz yerdə saxlayın**
- ⚠️ **Şifrəni git-də commit etməyin**
- ⚠️ **Şifrəni yalnız connection string-də istifadə edin**

Əgər şifrəni unutmusunuzsa:
1. Project → Settings → Database
2. "Reset database password" basın
3. Yeni şifrə yaradın

---

## 📊 DATABASE MIGRATION / VERİTABANI MİGRATİON

### Addım 4: Prisma Migration Tətbiq Edin

1. **Local mühitdə:**
   ```bash
   cd yusu-ecommerce
   npx prisma migrate deploy
   ```

2. **Və ya Vercel-də:**
   - Build command-də avtomatik olaraq işləyir:
     ```json
     "build": "prisma generate && prisma migrate deploy && next build"
     ```

---

## 🔒 DATABASE SECURITY / VERİTABANI TƏHLÜKƏSİZLİK

### Addım 5: Security Settings

1. **Project → Settings → Database**

2. **Connection Pooling aktivləşdirin:**
   - Production üçün connection pooling tövsiyə edilir
   - Connection pooler URL istifadə edin

3. **IP Whitelist (optional):**
   - Vercel IP-lərini whitelist-ə əlavə edin
   - Və ya "Allow all IPs" seçin (production üçün)

4. **SSL Mode:**
   - Production üçün SSL aktivdir
   - Connection string-də `sslmode=require` əlavə edin

---

## 📈 DATABASE MONITORING / VERİTABANI MONİTORİNQ

### Addım 6: Monitoring Setup

1. **Project → Database → Logs**
   - Database query log-larını görə bilərsiniz

2. **Project → Database → Connection Pooling**
   - Connection pool metrikalarını görə bilərsiniz

---

## 🧪 TEST / TEST

### Connection Test

1. **Local mühitdə:**
   ```bash
   cd yusu-ecommerce
   npx prisma db pull
   ```

2. **Vercel-də:**
   - Deployment zamanı avtomatik test edilir
   - Health check endpoint: `/api/health`

---

## 📚 ƏLAVƏ MƏLUMAT / ADDITIONAL INFORMATION

- **Supabase Documentation:** https://supabase.com/docs
- **Database Connection:** https://supabase.com/docs/guides/database/connecting-to-postgres
- **Connection Pooling:** https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler
- **Prisma Integration:** https://supabase.com/docs/guides/integrations/prisma

---

## 🔒 TƏHLÜKƏSİZLİK / SECURITY

- ⚠️ Database password-u git-də commit etməyin
- ⚠️ Connection string-i yalnız environment variables-də saxlayın
- ⚠️ Production və development üçün ayrı database-lər istifadə edin
- ⚠️ Database password-u müntəzəm olaraq rotate edin

---

## 💡 TİPS / MƏSLƏHƏTLƏR

- Connection pooling istifadə edin (daha yaxşı performans)
- Database backup-ları avtomatik olaraq yaradılır
- Supabase-də built-in monitoring və analytics var

---

**Son Yeniləmə / Last Update:** 2025-01-28

