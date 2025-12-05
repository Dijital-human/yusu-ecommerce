# 📱📧 AUTHENTICATION VƏ VERIFICATION TEXNOLOGİYALARI SETUP TAPŞIRIĞI
# 📱📧 AUTHENTICATION AND VERIFICATION TECHNOLOGIES SETUP TASK

**Tarix / Date:** 2025-01-28  
**Status:** ⏳ Gözləyir / Pending  
**Prioritet:** Yüksək / High  
**Domain:** `ulustore.com` (Production)

---

## 🎯 MƏQSƏD / GOAL

Telefon və email ilə istifadəçi, satıcı, kuryer və admin giriş təsdiqi üçün istifadə olunan texnologiyalar haqqında ətraflı sənətləşmə yaratmaq.

---

## 📋 TAPŞIRIQ / TASK

### Tapşırıq: Authentication və Verification Texnologiyaları Sənətləşməsi

**Fayl yolu / File path:** `yusu-ecommerce/docs/SETUP_GUIDES/AUTHENTICATION_VERIFICATION_SETUP.md`

**Tapşırıqlar:**

1. **Email Verification Texnologiyası:**
   - Resend email service istifadəsi
   - Email verification token generasiyası (crypto.randomBytes)
   - Email verification link göndərmə prosesi
   - Email verification endpoint-ləri (`/api/auth/verify-email`)
   - İstifadəçi, satıcı, kuryer və admin üçün email verification prosesi
   - Environment variables və konfiqurasiya (RESEND_API_KEY, EMAIL_FROM)
   - Token expiry (24 saat)
   - Rate limiting (10 dəqiqədə 3 token)

2. **Telefon/SMS Verification Texnologiyası:**
   - Twilio SMS service istifadəsi
   - OTP (One-Time Password) generasiyası (6 rəqəmli kod)
   - SMS göndərmə prosesi (`sendOTP()` funksiyası)
   - SMS verification endpoint-ləri (yaradılmalıdır)
   - İstifadəçi, satıcı, kuryer və admin üçün telefon verification prosesi
   - Environment variables və konfiqurasiya (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)
   - OTP expiry (10 dəqiqə)
   - Rate limiting (5 dəqiqədə 3 OTP)

3. **Two-Factor Authentication (2FA):**
   - Email + SMS kombinasiyası
   - TOTP (Time-based One-Time Password) istifadəsi (optional, Google Authenticator)
   - 2FA aktivləşdirmə prosesi
   - 2FA verification prosesi
   - Backup codes generasiyası

4. **NextAuth.js Integration:**
   - NextAuth.js konfiqurasiyası (`src/lib/auth/config.ts`)
   - Email provider konfiqurasiyası (CredentialsProvider)
   - Phone provider konfiqurasiyası (custom provider yaradılmalıdır)
   - OAuth providers (Google, Facebook, Apple)
   - Session management (JWT strategy, 30 gün)
   - Role-based access control (CUSTOMER, SELLER, COURIER, ADMIN)

5. **Qeydiyyat Prosesi:**
   - İstifadəçi qeydiyyatı (`/api/auth/signup`):
     - Email + telefon daxil edilir
     - Email verification link göndərilir
     - SMS OTP göndərilir
     - Hər ikisi təsdiqləndikdən sonra account aktivləşir
   - Satıcı qeydiyyatı:
     - Email + telefon + business information
     - Email verification + SMS verification
     - Admin tərəfindən business verification
   - Kuryer qeydiyyatı:
     - Email + telefon + identity information
     - Email verification + SMS verification
     - Admin tərəfindən identity verification
   - Admin qeydiyyatı:
     - Yalnız mövcud admin tərəfindən yaradıla bilər
     - Email verification tələb olunur

6. **Giriş Prosesi:**
   - Email ilə giriş (`/api/auth/signin`):
     - Email + password
     - Email verified yoxlaması
   - Telefon ilə giriş (yaradılmalıdır):
     - Telefon nömrəsi
     - SMS OTP göndərilir
     - OTP ilə giriş
   - OAuth ilə giriş:
     - Google, Facebook, Apple
     - Email verification avtomatik (OAuth provider-dən)
   - Password reset (`/api/auth/forgot-password`):
     - Email ilə reset link göndərilir
     - Token expiry (1 saat)
   - Account recovery:
     - Email və ya telefon ilə recovery
     - Identity verification

---

## 📝 SƏNƏDLƏŞMƏ TƏLƏBLƏRİ / DOCUMENTATION REQUIREMENTS

### Hər bölmə üçün:

1. **Texnologiya Təsviri:**
   - Hansı texnologiya istifadə olunur
   - Nə üçün bu texnologiya seçilib
   - Alternativlər (əgər varsa)

2. **Qeydiyyat və Setup:**
   - Servis-də qeydiyyatdan keçmə addımları
   - API key-ləri və ya credentials əldə etmə
   - Konfiqurasiya addımları

3. **API Key-lər və Credentials:**
   - Hansı API key-lər lazımdır
   - Haradan əldə edilir
   - Hara yazılacağı (environment variables, konfiqurasiya faylları)
   - Məzmun:
     - Resend API key əldə etmə
     - Twilio Account SID, Auth Token, Phone Number əldə etmə
     - NextAuth Secret generasiyası
     - OAuth client ID və secret-ləri (Google, Facebook, Apple)

4. **Konfiqurasiya:**
   - Environment variables:
     - `RESEND_API_KEY`
     - `EMAIL_FROM`
     - `TWILIO_ACCOUNT_SID`
     - `TWILIO_AUTH_TOKEN`
     - `TWILIO_PHONE_NUMBER`
     - `NEXTAUTH_SECRET`
     - `NEXTAUTH_URL`
     - `GOOGLE_CLIENT_ID`
     - `GOOGLE_CLIENT_SECRET`
     - `FACEBOOK_CLIENT_ID`
     - `FACEBOOK_CLIENT_SECRET`
   - Konfiqurasiya faylları:
     - `src/lib/email/index.ts`
     - `src/lib/sms/index.ts`
     - `src/lib/auth/config.ts`
     - `src/services/user.service.ts`
   - Code integration addımları

5. **İstifadə:**
   - İstifadəçi, satıcı, kuryer və admin üçün proses:
     - Qeydiyyat addımları
     - Email verification addımları
     - SMS verification addımları
     - Giriş addımları
   - API endpoint-ləri:
     - `POST /api/auth/signup` - Qeydiyyat
     - `GET /api/auth/verify-email?token=...` - Email verification
     - `POST /api/auth/verify-email` - Email verification yenidən göndərmə
     - `POST /api/auth/send-otp` - SMS OTP göndərmə (yaradılmalıdır)
     - `POST /api/auth/verify-otp` - SMS OTP verification (yaradılmalıdır)
     - `POST /api/auth/signin` - Giriş
     - `POST /api/auth/forgot-password` - Şifrə sıfırlama
   - UI komponentləri:
     - Signup form
     - Email verification page
     - SMS OTP input component
     - Login form

6. **Test:**
   - Test addımları:
     - Email verification test
     - SMS OTP test
     - Login test
     - Password reset test
   - Test credentials:
     - Resend test API key
     - Twilio test credentials
   - Test scenarios:
     - İstifadəçi qeydiyyatı və verification
     - Satıcı qeydiyyatı və verification
     - Kuryer qeydiyyatı və verification
     - Admin qeydiyyatı və verification

---

## 🔍 MÖVCUD KOD ANALİZİ / EXISTING CODE ANALYSIS

### Email Verification:
- **Service:** Resend (`src/lib/email/index.ts`)
- **API Route:** `/api/auth/verify-email` (`src/app/api/auth/verify-email/route.ts`)
- **Service Layer:** `verifyEmail()`, `sendVerificationEmail()` (`src/services/user.service.ts`)
- **UI:** `/auth/verify-email` (`src/app/[locale]/auth/verify-email/page.tsx`)
- **Token Generation:** `crypto.randomBytes(32).toString('hex')`
- **Token Expiry:** 24 saat

### SMS/Phone Verification:
- **Service:** Twilio (`src/lib/sms/index.ts`)
- **OTP Function:** `sendOTP(phone: string, code: string)`
- **API Route:** (Yoxlanılmalıdır - `/api/auth/send-otp` və `/api/auth/verify-otp` yaradılmalıdır)
- **OTP Generation:** (Yoxlanılmalıdır - 6 rəqəmli kod generasiyası)

### Authentication:
- **Framework:** NextAuth.js (`src/lib/auth/config.ts`)
- **Providers:** 
  - CredentialsProvider (Email/Password)
  - GoogleProvider
  - FacebookProvider
  - AppleProvider (commented out)
- **Session Strategy:** JWT
- **Session Max Age:** 30 gün

---

## 📚 ƏLAVƏ MƏLUMAT / ADDITIONAL INFORMATION

### İstifadə olunan servislər:
- **Resend:** Email service (Email verification üçün)
- **Twilio:** SMS service (Telefon verification üçün)
- **NextAuth.js:** Authentication framework
- **Prisma:** Database ORM (User data storage)
- **bcryptjs:** Password hashing

### Role-lər:
- **CUSTOMER:** İstifadəçi
- **SELLER:** Satıcı
- **COURIER:** Kuryer
- **ADMIN:** Admin

### Database Fields (User Model):
- `email` - Email ünvanı
- `emailVerified` - Email təsdiqlənibmi
- `emailVerificationToken` - Email verification token
- `emailVerificationTokenExpiry` - Token expiry tarixi
- `phone` - Telefon nömrəsi
- `phoneVerified` - Telefon təsdiqlənibmi (yaradılmalıdır)
- `otpCode` - OTP kodu (yaradılmalıdır)
- `otpExpiry` - OTP expiry tarixi (yaradılmalıdır)
- `role` - İstifadəçi rolu

---

## ✅ TAMAMLANMA KRİTERİYALARI / COMPLETION CRITERIA

- [ ] Email verification texnologiyası sənədləşdirilib
- [ ] Telefon/SMS verification texnologiyası sənədləşdirilib
- [ ] Two-Factor Authentication sənədləşdirilib
- [ ] NextAuth.js integration sənədləşdirilib
- [ ] Qeydiyyat prosesi sənədləşdirilib (bütün role-lər üçün)
- [ ] Giriş prosesi sənədləşdirilib
- [ ] API key-lər və credentials əldə etmə addımları yazılıb
- [ ] Environment variables və konfiqurasiya addımları yazılıb
- [ ] Test addımları yazılıb
- [ ] Code examples və nümunələr əlavə edilib
- [ ] Database schema dəyişiklikləri dokumentasiya edilib (əgər lazımdırsa)

---

## 🎯 İSTİFADƏ TƏLİMATI / USAGE INSTRUCTIONS

**Agent Mode-da işləyərkən:**

1. Bu tapşırıq sənədini oxuyun
2. Mövcud kodu analiz edin:
   - `src/lib/email/index.ts`
   - `src/lib/sms/index.ts`
   - `src/lib/auth/config.ts`
   - `src/app/api/auth/` (bütün route-lar)
   - `src/services/user.service.ts`
   - `prisma/schema.prisma` (User model)
3. `docs/SETUP_GUIDES/AUTHENTICATION_VERIFICATION_SETUP.md` faylını yaradın
4. Bütün tapşırıqları yerinə yetirin
5. Sənədləşməni tamamlayın

**İstifadə:**
- "@AGENT_TASK_AUTHENTICATION_VERIFICATION_SETUP.md oxu və tapşırığı yerinə yetir" yazaraq agent işə başlayacaq

---

**Son Yeniləmə / Last Update:** 2025-01-28

