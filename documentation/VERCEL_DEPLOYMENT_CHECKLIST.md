# Vercel Deployment Checklist / Vercel Deploy Çeklisti

## ✅ Pre-Deployment Checklist / Deploy Öncəsi Çeklist

### 1. Environment Variables / Mühit Dəyişənləri

Vercel Dashboard-da aşağıdakı environment variables-ı təyin edin:

#### **Required / Tələb Olunan:**

```env
# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres

# NextAuth
NEXTAUTH_URL=https://ulustore.com
NEXTAUTH_SECRET=[Güclü secret key - min 32 simvol]

# App URL
NEXT_PUBLIC_APP_URL=https://ulustore.com

# Email (Resend və ya SMTP)
RESEND_API_KEY=re_[your_resend_api_key]
EMAIL_FROM=noreply@ulustore.com

# və ya SMTP:
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@ulustore.com
SMTP_PASSWORD=[app_password]
```

#### **Optional / İstəyə Bağlı:**

```env
# Email Verification (Production üçün)
REQUIRE_EMAIL_VERIFICATION=true

# OAuth Providers
GOOGLE_CLIENT_ID=[google_client_id]
GOOGLE_CLIENT_SECRET=[google_client_secret]
FACEBOOK_CLIENT_ID=[facebook_client_id]
FACEBOOK_CLIENT_SECRET=[facebook_client_secret]

# Stripe Payment
STRIPE_PUBLISHABLE_KEY=pk_live_[key]
STRIPE_SECRET_KEY=sk_live_[key]
STRIPE_WEBHOOK_SECRET=whsec_[key]
```

### 2. Database Migration / Veritabanı Migration

#### **Seçim A: Vercel Build-də Avtomatik**

`package.json`-da build command:
```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

#### **Seçim B: Manual Migration**

Supabase Dashboard-dan SQL Editor-da migration-i tətbiq edin:
```sql
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailVerificationToken" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailVerificationTokenExpiry" TIMESTAMP(3);
CREATE INDEX IF NOT EXISTS "users_emailVerificationToken_idx" ON "users"("emailVerificationToken");
CREATE INDEX IF NOT EXISTS "users_emailVerified_idx" ON "users"("emailVerified");
```

### 3. Domain Configuration / Domain Konfiqurasiyası

1. **Vercel Dashboard-da:**
   - Project → Settings → Domains
   - `ulustore.com` əlavə edin
   - DNS records-ı təyin edin (Vercel təlimatlarına görə)

2. **DNS Records:**
   - A Record: `@` → Vercel IP
   - CNAME Record: `www` → cname.vercel-dns.com

### 4. Build Settings / Build Tənzimləri

Vercel Dashboard-da:
- **Framework Preset:** Next.js
- **Root Directory:** `yusu-ecommerce` (əgər monorepo-dursa)
- **Build Command:** `npm run build` (avtomatik təyin olunacaq)
- **Output Directory:** `.next` (avtomatik təyin olunacaq)
- **Install Command:** `npm install`

### 5. Environment Variables Yoxlama / Mühit Dəyişənləri Yoxlama

Deploy-dan əvvəl yoxlayın:
- ✅ `DATABASE_URL` - Düzgün format və parol
- ✅ `NEXTAUTH_SECRET` - Güclü və unikal
- ✅ `NEXTAUTH_URL` - Domain ilə uyğun
- ✅ `RESEND_API_KEY` və ya `SMTP_*` - Email üçün

## 🚀 Deployment Steps / Deploy Addımları

### Step 1: Git Push
```bash
git add .
git commit -m "Add email verification and prepare for production"
git push origin main
```

### Step 2: Vercel Deploy
1. Vercel Dashboard-da "Deployments" bölməsinə gedin
2. Yeni deployment avtomatik başlayacaq
3. Build log-larını izləyin

### Step 3: Migration Yoxlama
Build log-larında axtarın:
```
✅ Prisma migrations applied
```

Əgər migration xətası varsa:
- Supabase Dashboard-dan manual tətbiq edin
- Və ya `DATABASE_URL`-i yoxlayın

### Step 4: Domain Test
1. `https://ulustore.com` açın
2. Signup səhifəsinə gedin
3. Real email ilə test signup edin
4. Email-də verification link-i yoxlayın

## 🔍 Post-Deployment Checklist / Deploy Sonrası Çeklist

### 1. Functionality Test / Funksionallıq Testi

- [ ] Ana səhifə yüklənir
- [ ] Signup formu işləyir
- [ ] Email verification email-i göndərilir
- [ ] Verification link-i işləyir
- [ ] Sign in işləyir
- [ ] Password reset işləyir

### 2. Performance Test / Performans Testi

- [ ] Page load time < 3 saniyə
- [ ] API response time < 500ms
- [ ] Database queries optimize edilib

### 3. Security Check / Təhlükəsizlik Yoxlaması

- [ ] HTTPS aktivdir
- [ ] Environment variables gizlidir
- [ ] Password hash edilir
- [ ] Email verification tələb olunur (production-da)

### 4. Monitoring Setup / Monitorinq Quraşdırması

- [ ] Error tracking (Sentry və ya Vercel Analytics)
- [ ] Log monitoring
- [ ] Performance monitoring

## ⚠️ Troubleshooting / Problemlərin Həlli

### Problem 1: Migration Failed
**Həll:** Supabase Dashboard-dan manual SQL tətbiq edin

### Problem 2: Email Not Sending
**Həll:** 
- `RESEND_API_KEY` və ya `SMTP_*` variables-ı yoxlayın
- Resend Dashboard-da domain təsdiq edin

### Problem 3: Database Connection Error
**Həll:**
- `DATABASE_URL` formatını yoxlayın
- Supabase project-in statusunu yoxlayın
- Connection pool limit-ləri yoxlayın

### Problem 4: Build Failed
**Həll:**
- Build log-larını yoxlayın
- `package.json` dependencies yoxlayın
- Node version-u yoxlayın (22.x tələb olunur)

## 📞 Support / Dəstək

Əgər problem yaşayırsınızsa:
1. Vercel build log-larını yoxlayın
2. Supabase Dashboard-da database status-u yoxlayın
3. Environment variables-ı yenidən yoxlayın

