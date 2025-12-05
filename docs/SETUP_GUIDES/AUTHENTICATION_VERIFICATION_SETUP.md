# 📱📧 AUTHENTICATION VƏ VERIFICATION TEXNOLOGİYALARI SETUP GUIDE
# 📱📧 AUTHENTICATION AND VERIFICATION TECHNOLOGIES SETUP GUIDE

**Tarix / Date:** 2025-01-28  
**Status:** ✅ Hazır / Ready  
**Domain:** `ulustore.com` (Production)

---

## 📋 MƏQSƏD / GOAL

Bu sənəd telefon və email ilə istifadəçi, satıcı, kuryer və admin giriş təsdiqi üçün istifadə olunan texnologiyaların qeydiyyatı, API key-lərinin əldə edilməsi və konfiqurasiyası üçün ətraflı təlimatları ehtiva edir.

---

## 📋 HAQQINDA / ABOUT

### Authentication və Verification Sistemləri

**Authentication və Verification** platformamızda təhlükəsiz user authentication, email və telefon verification, və role-based access control təmin edir. Bu sistemlər istifadəçi, satıcı, kuryer və admin rolları üçün təhlükəsiz giriş və təsdiq proseslərini idarə edir.

### İstifadə olunan texnologiyalar:

- **Email Verification (Resend):** Email ilə user verification
- **SMS Verification (Twilio):** Telefon ilə user verification və OTP
- **Two-Factor Authentication (2FA):** İki faktorlu təhlükəsizlik
- **NextAuth.js:** Authentication framework (OAuth, Credentials, JWT)
- **OAuth Providers:** Google, Facebook, Apple social login
- **JWT Tokens:** Secure session management
- **Role-Based Access Control (RBAC):** User rollarına görə access control

### Niyə lazımdır bizə:

1. **Təhlükəsiz User Authentication:**
   - Email və telefon ilə user verification
   - Password-based authentication
   - OAuth ilə social login (Google, Facebook, Apple)
   - Two-factor authentication (2FA)

2. **Email və Telefon Verification:**
   - User registration zamanı email verification
   - Phone number verification ilə OTP
   - Password reset üçün email və SMS
   - Account recovery

3. **OAuth ilə Social Login:**
   - Google, Facebook, Apple ilə login
   - User experience improvement
   - Faster registration process

4. **Two-Factor Authentication (2FA):**
   - İki faktorlu təhlükəsizlik
   - SMS və ya authenticator app ilə 2FA
   - Enhanced security

5. **Session Management:**
   - JWT tokens ilə secure session management
   - Session expiration və refresh
   - Multi-device session support

6. **Role-Based Access Control:**
   - User rollarına görə access control
   - Customer, Seller, Courier, Admin rolları
   - Permission-based access

7. **Password Reset və Account Recovery:**
   - Email və SMS ilə password reset
   - Account recovery process
   - Security questions (optional)

### Alternativlər və niyə bu texnologiyalar seçilib:

- **Firebase Auth:** Google-un proprietary, NextAuth.js daha çox flexibility
- **Auth0:** Daha çox enterprise, NextAuth.js daha çox developer-friendly
- **AWS Cognito:** Daha çox konfiqurasiya lazımdır, NextAuth.js daha sadə
- **Supabase Auth:** Supabase-də built-in, NextAuth.js daha çox control

**Niyə bu texnologiyalar seçilib:**
- NextAuth.js: Developer-friendly, flexible, OAuth dəstəyi
- Resend: Modern email API, yüksək deliverability
- Twilio: Global SMS coverage, OTP services
- JWT: Secure session management, stateless authentication

---

## 🔐 EMAIL VERIFICATION TEXNOLOGİYASI

### Texnologiya Təsviri

**İstifadə olunan servis:** Resend  
**Nə üçün seçilib:** 
- Modern email API
- Yüksək deliverability rate
- Developer-friendly
- Domain verification dəstəyi
- Template dəstəyi

**Alternativlər:**
- SendGrid
- Mailgun
- AWS SES
- Postmark

### Qeydiyyat və Setup

#### Addım 1: Resend Account Yaradın

1. **Resend səhifəsinə gedin:**
   - URL: https://resend.com
   - "Get Started" və ya "Sign Up" basın

2. **Qeydiyyat metodunu seçin:**
   - Email və ya GitHub (tövsiyə edilir)

3. **Account məlumatlarını daxil edin:**
   - Email və şifrə
   - Business name: `Ulustore`

4. **Email verification edin**

#### Addım 2: API Key Əldə Edin

1. **Resend Dashboard → API Keys**
2. **"Create API Key" basın**
3. **API Key məlumatları:**
   - **Name:** `ulustore-production`
   - **Permission:** `Full Access`
4. **API Key kopyalayın:** `re_...`

**Hara yazılacaq / Where to add:**

**Vercel Environment Variables:**
- Key: `RESEND_API_KEY`
- Value: API key (re_...)

**Local `.env.production` faylı:**
```
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@ulustore.com
```

**Fayl yolu / File path:**
- `yusu-ecommerce/env.production` (gitignore-da olmalıdır)
- Vercel: Project Settings → Environment Variables

#### Addım 3: Domain Verification

1. **Resend Dashboard → Domains**
2. **"Add Domain" basın**
3. **Domain daxil edin:** `ulustore.com`
4. **DNS qeydlərini əlavə edin:**
   ```
   Type: TXT
   Name: @
   Value: resend._domainkey.ulustore.com
   
   Type: CNAME
   Name: resend
   Value: resend.ulustore.com
   ```
5. **Verification gözləyin** (24 saat)

### Email Verification Prosesi

#### İstifadəçi Qeydiyyatı

1. **Qeydiyyat formu:**
   - Email və telefon daxil edilir
   - `POST /api/auth/signup` çağırılır

2. **Email verification link göndərilir:**
   - Token generasiyası: `crypto.randomBytes(32).toString('hex')`
   - Token expiry: 24 saat
   - Email göndərilir: `sendEmailVerification()`

3. **Email verification:**
   - İstifadəçi email-dəki link-ə basır
   - `GET /api/auth/verify-email?token=...` çağırılır
   - Token verify edilir
   - `emailVerified = true` olur

#### Satıcı/Kuryer Qeydiyyatı

1. **Qeydiyyat formu:**
   - Email, telefon və əlavə məlumatlar
   - `POST /api/auth/signup` çağırılır

2. **Email verification:**
   - Eyni proses (yuxarıda)

3. **Admin təsdiqi:**
   - Admin tərəfindən `isApproved = true` edilir
   - `approvedAt` və `approvedBy` doldurulur

#### Admin Qeydiyyatı

1. **Yalnız mövcud admin tərəfindən:**
   - Admin panel-dən yeni admin yaradılır
   - Email verification tələb olunur

### Code Integration

**Fayl yolu / File path:** `yusu-ecommerce/src/lib/email/index.ts`

```typescript
// Email verification göndərmə
await sendEmailVerification({
  email: user.email,
  token: verificationToken,
  name: user.name,
});
```

**Fayl yolu / File path:** `yusu-ecommerce/src/services/user.service.ts`

```typescript
// Email verification
export async function verifyEmail(token: string) {
  // Token verify edilir
  // emailVerified = true edilir
}

// Email verification göndərmə
export async function sendVerificationEmail(email: string) {
  // Token generasiyası
  // Email göndərmə
}
```

---

## 📱 TELEFON/SMS VERIFICATION TEXNOLOGİYASI

### Texnologiya Təsviri

**İstifadə olunan servis:** Twilio  
**Nə üçün seçilib:**
- Global SMS coverage
- Yüksək deliverability rate
- Real-time delivery status
- Developer-friendly API
- OTP dəstəyi

**Alternativlər:**
- AWS SNS
- MessageBird
- Vonage (Nexmo)
- Plivo

### Qeydiyyat və Setup

#### Addım 1: Twilio Account Yaradın

1. **Twilio səhifəsinə gedin:**
   - URL: https://www.twilio.com
   - "Sign up" basın

2. **Account məlumatlarını daxil edin:**
   - Email, şifrə, full name
   - Phone number (verification üçün)

3. **Email və phone verification edin**

#### Addım 2: API Credentials Əldə Edin

1. **Twilio Console → Dashboard**
2. **Account SID və Auth Token:**
   - **Account SID:** `AC...`
   - **Auth Token:** `...` (show/hide düyməsi ilə)

**Hara yazılacaq / Where to add:**

**Vercel Environment Variables:**
- Key: `TWILIO_ACCOUNT_SID`
- Value: Account SID (AC...)

- Key: `TWILIO_AUTH_TOKEN`
- Value: Auth Token

**Local `.env.production` faylı:**
```
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
```

#### Addım 3: Phone Number Alın

1. **Twilio Console → Phone Numbers → Buy a number**
2. **Phone number seçin:**
   - Country: `Azerbaijan` və ya `United States`
   - Capabilities: `SMS`
3. **Phone number kopyalayın:** `+994...`

**Hara yazılacaq / Where to add:**

**Vercel Environment Variables:**
- Key: `TWILIO_PHONE_NUMBER`
- Value: Phone number (+994...)

**Local `.env.production` faylı:**
```
TWILIO_PHONE_NUMBER=+994...
```

### SMS OTP Verification Prosesi

#### OTP Generasiyası

**6 rəqəmli kod generasiyası:**
```typescript
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
```

**OTP Expiry:** 10 dəqiqə

#### SMS OTP Göndərmə

**API Endpoint:** `POST /api/auth/send-otp` (yaradılmalıdır)

**Request Body:**
```json
{
  "phone": "+994501234567"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully / OTP uğurla göndərildi"
}
```

**Code Integration:**

**Fayl yolu / File path:** `yusu-ecommerce/src/lib/sms/index.ts`

```typescript
// OTP göndərmə
await sendOTP(phone, otpCode);
```

#### SMS OTP Verification

**API Endpoint:** `POST /api/auth/verify-otp` (yaradılmalıdır)

**Request Body:**
```json
{
  "phone": "+994501234567",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Phone verified successfully / Telefon uğurla təsdiqləndi"
}
```

### Telefon Verification Prosesi

#### İstifadəçi Qeydiyyatı

1. **Qeydiyyat formu:**
   - Telefon nömrəsi daxil edilir
   - `POST /api/auth/send-otp` çağırılır

2. **SMS OTP göndərilir:**
   - 6 rəqəmli kod generasiya olunur
   - SMS göndərilir
   - OTP database-də saxlanılır (expiry ilə)

3. **OTP verification:**
   - İstifadəçi OTP daxil edir
   - `POST /api/auth/verify-otp` çağırılır
   - OTP verify edilir
   - `phoneVerified = true` olur

#### Satıcı/Kuryer Qeydiyyatı

1. **Eyni proses** (yuxarıda)
2. **Admin təsdiqi** lazımdır

### Database Schema Dəyişiklikləri

**Fayl yolu / File path:** `yusu-ecommerce/prisma/schema.prisma`

User model-ə əlavə edilməlidir:
```prisma
phoneVerified         Boolean   @default(false)
otpCode              String?
otpExpiry            DateTime?
phoneVerificationAttempts Int @default(0)
lastOTPSentAt        DateTime?
```

**Migration yaratmaq:**
```bash
npx prisma migrate dev --name add_phone_verification_fields
```

---

## 🔐 TWO-FACTOR AUTHENTICATION (2FA)

### Texnologiya Təsviri

**İstifadə olunan metod:** Email + SMS kombinasiyası  
**Alternativ:** TOTP (Time-based One-Time Password) - Google Authenticator

### 2FA Aktivləşdirmə

1. **User Settings → Security → Enable 2FA**
2. **Email verification:**
   - Email verification link göndərilir
   - Email verify edilir
3. **SMS verification:**
   - SMS OTP göndərilir
   - OTP verify edilir
4. **2FA aktivləşir:**
   - `twoFactorEnabled = true`
   - Backup codes generasiya olunur

### 2FA Verification (Giriş zamanı)

1. **Email + Password ilə giriş**
2. **2FA tələb olunur:**
   - SMS OTP göndərilir
   - OTP daxil edilir
3. **Giriş tamamlanır**

### Backup Codes

**10 backup code generasiyası:**
```typescript
function generateBackupCodes(): string[] {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
  }
  return codes;
}
```

**Hara saxlanılır:** Database-də encrypted formada

---

## 🔑 NEXTAUTH.JS INTEGRATION

### Texnologiya Təsviri

**İstifadə olunan framework:** NextAuth.js  
**Nə üçün seçilib:**
- Industry standard
- Multiple provider dəstəyi
- Session management
- Security best practices
- TypeScript dəstəyi

### Konfiqurasiya

#### Addım 1: NextAuth Secret Generasiyası

**Secret generasiyası:**
```bash
openssl rand -base64 32
```

**Hara yazılacaq / Where to add:**

**Vercel Environment Variables:**
- Key: `NEXTAUTH_SECRET`
- Value: Generated secret (minimum 32 karakter)

**Local `.env.production` faylı:**
```
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://ulustore.com
```

#### Addım 2: OAuth Providers Setup

**Google OAuth:**

1. **Google Cloud Console → APIs & Services → Credentials**
2. **"Create Credentials" → "OAuth client ID"**
3. **Application type:** Web application
4. **Authorized redirect URIs:**
   - `https://ulustore.com/api/auth/callback/google`
5. **Client ID və Client Secret kopyalayın**

**Hara yazılacaq / Where to add:**

**Vercel Environment Variables:**
- Key: `GOOGLE_CLIENT_ID`
- Value: Client ID

- Key: `GOOGLE_CLIENT_SECRET`
- Value: Client Secret

**Facebook OAuth:**

1. **Facebook Developers → Create App**
2. **App Type:** Consumer
3. **Facebook Login → Settings**
4. **Valid OAuth Redirect URIs:**
   - `https://ulustore.com/api/auth/callback/facebook`
5. **App ID və App Secret kopyalayın**

**Hara yazılacaq / Where to add:**

**Vercel Environment Variables:**
- Key: `FACEBOOK_CLIENT_ID`
- Value: App ID

- Key: `FACEBOOK_CLIENT_SECRET`
- Value: App Secret

**Apple OAuth (Optional):**

1. **Apple Developer → Certificates, Identifiers & Profiles**
2. **Services ID yaradın**
3. **Client ID və Client Secret əldə edin**

**Hara yazılacaq / Where to add:**

**Vercel Environment Variables:**
- Key: `APPLE_CLIENT_ID`
- Value: Client ID

- Key: `APPLE_CLIENT_SECRET`
- Value: Client Secret

### Code Integration

**Fayl yolu / File path:** `yusu-ecommerce/src/lib/auth/config.ts`

```typescript
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      // Email/Password authentication
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],
};
```

---

## 📝 QEYDİYYAT PROSESİ / REGISTRATION PROCESS

### İstifadəçi (CUSTOMER) Qeydiyyatı

#### Addım 1: Qeydiyyat Formu

1. **Səhifə:** `/auth/signup`
2. **Məlumatlar:**
   - Name (tələb olunur)
   - Email (tələb olunur)
   - Password (tələb olunur, min 8 karakter)
   - Phone (tələb olunur)

3. **Form submit:**
   - `POST /api/auth/signup` çağırılır
   - Validation edilir
   - User yaradılır

#### Addım 2: Email Verification

1. **Email verification link göndərilir:**
   - Token generasiya olunur
   - Email göndərilir (`sendEmailVerification()`)

2. **İstifadəçi email-dəki link-ə basır:**
   - `GET /api/auth/verify-email?token=...` çağırılır
   - Token verify edilir
   - `emailVerified = true` olur

#### Addım 3: SMS Verification

1. **SMS OTP göndərilir:**
   - `POST /api/auth/send-otp` çağırılır
   - 6 rəqəmli kod generasiya olunur
   - SMS göndərilir

2. **OTP verification:**
   - İstifadəçi OTP daxil edir
   - `POST /api/auth/verify-otp` çağırılır
   - OTP verify edilir
   - `phoneVerified = true` olur

#### Addım 4: Account Aktivləşməsi

- Email və telefon hər ikisi verify edildikdən sonra:
  - Account aktivləşir
  - Giriş edə bilər

### Satıcı (SELLER) Qeydiyyatı

#### Addım 1: Qeydiyyat Formu

1. **Səhifə:** `/seller/register`
2. **Məlumatlar:**
   - Name (tələb olunur)
   - Email (tələb olunur)
   - Password (tələb olunur)
   - Phone (tələb olunur)
   - Business name (tələb olunur)
   - Business address (tələb olunur)
   - Tax ID (optional)
   - Business license (optional)

3. **Form submit:**
   - `POST /api/auth/signup` çağırılır
   - Role: `SELLER`
   - User yaradılır
   - `isApproved = false` (default)

#### Addım 2: Email və SMS Verification

- Eyni proses (İstifadəçi qeydiyyatı kimi)

#### Addım 3: Admin Təsdiqi

1. **Admin panel-də:**
   - Pending sellers siyahısı görünür
   - Seller məlumatları yoxlanılır

2. **Admin təsdiqi:**
   - `isApproved = true` edilir
   - `approvedAt` və `approvedBy` doldurulur
   - Seller-ə bildiriş göndərilir

3. **Seller aktivləşir:**
   - Seller panel-ə daxil ola bilər
   - Məhsul əlavə edə bilər

### Kuryer (COURIER) Qeydiyyatı

#### Addım 1: Qeydiyyat Formu

1. **Səhifə:** `/courier/register`
2. **Məlumatlar:**
   - Name (tələb olunur)
   - Email (tələb olunur)
   - Password (tələb olunur)
   - Phone (tələb olunur)
   - Identity document (tələb olunur)
   - Vehicle information (optional)
   - License number (optional)

3. **Form submit:**
   - `POST /api/auth/signup` çağırılır
   - Role: `COURIER`
   - User yaradılır
   - `isApproved = false` (default)

#### Addım 2: Email və SMS Verification

- Eyni proses (İstifadəçi qeydiyyatı kimi)

#### Addım 3: Admin Təsdiqi

1. **Admin panel-də:**
   - Pending couriers siyahısı görünür
   - Courier məlumatları və identity document yoxlanılır

2. **Admin təsdiqi:**
   - `isApproved = true` edilir
   - Courier aktivləşir

### Admin Qeydiyyatı

#### Yalnız Mövcud Admin Tərəfindən

1. **Admin panel → Users → Create Admin**
2. **Məlumatlar:**
   - Email (tələb olunur)
   - Name (tələb olunur)
   - Role: `ADMIN`
   - Admin role: `SUPER_ADMIN`, `SYSTEM_ADMIN`, və s.

3. **Email verification:**
   - Email verification link göndərilir
   - Admin email-i verify edir

4. **Password setup:**
   - Admin password set edir
   - Account aktivləşir

---

## 🔑 GİRİŞ PROSESİ / LOGIN PROCESS

### Email ilə Giriş

#### Addım 1: Giriş Formu

1. **Səhifə:** `/auth/signin`
2. **Məlumatlar:**
   - Email
   - Password

3. **Form submit:**
   - `POST /api/auth/signin` çağırılır
   - NextAuth.js CredentialsProvider istifadə olunur

#### Addım 2: Authentication

1. **Email və password verify edilir:**
   - Database-də user tapılır
   - Password hash compare edilir
   - Email verified yoxlanılır (production-da)

2. **Session yaradılır:**
   - JWT token generasiya olunur
   - Session cookie set edilir
   - Max age: 30 gün

#### Addım 3: Role-based Redirect

- **CUSTOMER:** `/` (Ana səhifə)
- **SELLER:** `/seller/dashboard`
- **COURIER:** `/courier/dashboard`
- **ADMIN:** `/admin/dashboard`

### Telefon ilə Giriş

#### Addım 1: Telefon Giriş Formu

1. **Səhifə:** `/auth/signin-phone` (yaradılmalıdır)
2. **Məlumatlar:**
   - Phone number

3. **Form submit:**
   - `POST /api/auth/send-otp` çağırılır
   - SMS OTP göndərilir

#### Addım 2: OTP Verification

1. **OTP daxil edilir:**
   - 6 rəqəmli kod

2. **Form submit:**
   - `POST /api/auth/verify-otp-login` çağırılır (yaradılmalıdır)
   - OTP verify edilir
   - User tapılır

3. **Session yaradılır:**
   - JWT token generasiya olunur
   - Giriş tamamlanır

### OAuth ilə Giriş

#### Google ilə Giriş

1. **"Sign in with Google" düyməsi:**
   - Google OAuth flow başlayır
   - Google login səhifəsi açılır

2. **Google təsdiqi:**
   - İstifadəçi Google account ilə login olur
   - Permission verir

3. **Callback:**
   - `GET /api/auth/callback/google` çağırılır
   - User yaradılır və ya tapılır
   - Email verification avtomatik (Google-dən verified)
   - Session yaradılır

#### Facebook ilə Giriş

- Eyni proses (Google kimi)

### Password Reset

#### Addım 1: Şifrə Sıfırlama Sorğusu

1. **Səhifə:** `/auth/forgot-password`
2. **Email daxil edilir:**
   - `POST /api/auth/forgot-password` çağırılır

3. **Reset link göndərilir:**
   - Token generasiya olunur
   - Email göndərilir
   - Token expiry: 1 saat

#### Addım 2: Şifrə Sıfırlama

1. **Email-dəki link-ə basılır:**
   - `GET /auth/reset-password?token=...` səhifəsi açılır

2. **Yeni şifrə daxil edilir:**
   - `POST /api/auth/reset-password` çağırılır
   - Token verify edilir
   - Şifrə yenilənir

### Account Recovery

#### Email ilə Recovery

1. **Recovery formu:**
   - Email daxil edilir
   - `POST /api/auth/recover-account` çağırılır (yaradılmalıdır)

2. **Recovery link göndərilir:**
   - Email-də recovery link
   - Identity verification

#### Telefon ilə Recovery

1. **Recovery formu:**
   - Phone number daxil edilir
   - `POST /api/auth/recover-account-phone` çağırılır (yaradılmalıdır)

2. **SMS OTP göndərilir:**
   - OTP verification
   - Account recovery

---

## 🧪 TEST / TEST

### Email Verification Test

1. **Test email göndərmə:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/verify-email \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com"}'
   ```

2. **Email-dəki link-ə basın**

3. **Verification status-u yoxlayın**

### SMS OTP Test

1. **Test OTP göndərmə:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/send-otp \
     -H "Content-Type: application/json" \
     -d '{"phone": "+994501234567"}'
   ```

2. **SMS-dəki OTP-ni yoxlayın**

3. **OTP verification:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/verify-otp \
     -H "Content-Type: application/json" \
     -d '{"phone": "+994501234567", "otp": "123456"}'
   ```

### Test Credentials

**Resend Test:**
- Test API key istifadə edin
- Test email-lər göndərilir

**Twilio Test:**
- Test Account SID və Auth Token
- Test phone number: `+15005550006`
- Test OTP: `123456` (test mode-da)

---

## 📊 ENVIRONMENT VARIABLES CHECKLIST / MÜHİT DƏYİŞƏNLƏRİ SİYAHISI

### Email Service / Email Xidməti

- [ ] `RESEND_API_KEY` - Resend API key
- [ ] `EMAIL_FROM` - Email göndərən ünvan (noreply@ulustore.com)

### SMS Service / SMS Xidməti

- [ ] `TWILIO_ACCOUNT_SID` - Twilio Account SID
- [ ] `TWILIO_AUTH_TOKEN` - Twilio Auth Token
- [ ] `TWILIO_PHONE_NUMBER` - Twilio Phone Number

### Authentication / Autentifikasiya

- [ ] `NEXTAUTH_SECRET` - NextAuth secret (minimum 32 karakter)
- [ ] `NEXTAUTH_URL` - NextAuth URL (https://ulustore.com)

### OAuth Providers / OAuth Provayderlər

- [ ] `GOOGLE_CLIENT_ID` - Google OAuth Client ID
- [ ] `GOOGLE_CLIENT_SECRET` - Google OAuth Client Secret
- [ ] `FACEBOOK_CLIENT_ID` - Facebook OAuth App ID
- [ ] `FACEBOOK_CLIENT_SECRET` - Facebook OAuth App Secret
- [ ] `APPLE_CLIENT_ID` - Apple OAuth Client ID (optional)
- [ ] `APPLE_CLIENT_SECRET` - Apple OAuth Client Secret (optional)

### Database / Veritabanı

- [ ] `DATABASE_URL` - Database connection string

---

## 🔒 TƏHLÜKƏSİZLİK BEST PRACTICES / TƏHLÜKƏSİZLİK ƏN YAXŞI TƏCRÜBƏLƏR

### Email Verification

- ⚠️ Token expiry: 24 saat
- ⚠️ Rate limiting: 10 dəqiqədə 3 token
- ⚠️ Token yalnız bir dəfə istifadə oluna bilər
- ⚠️ Token verify edildikdən sonra silinir

### SMS OTP

- ⚠️ OTP expiry: 10 dəqiqə
- ⚠️ Rate limiting: 5 dəqiqədə 3 OTP
- ⚠️ OTP yalnız bir dəfə istifadə oluna bilər
- ⚠️ OTP verify edildikdən sonra silinir

### Password Security

- ⚠️ Minimum 8 karakter
- ⚠️ Password hash: bcryptjs
- ⚠️ Password reset token expiry: 1 saat
- ⚠️ Password reset token yalnız bir dəfə istifadə oluna bilər

### Session Security

- ⚠️ JWT token expiry: 30 gün
- ⚠️ Secure cookies (HTTPS)
- ⚠️ SameSite cookie attribute
- ⚠️ HttpOnly cookies

---

## 📚 ƏLAVƏ MƏLUMAT / ADDITIONAL INFORMATION

### API Endpoint-ləri

**Authentication:**
- `POST /api/auth/signup` - Qeydiyyat
- `POST /api/auth/signin` - Giriş (NextAuth.js)
- `GET /api/auth/signout` - Çıxış (NextAuth.js)

**Email Verification:**
- `GET /api/auth/verify-email?token=...` - Email verification
- `POST /api/auth/verify-email` - Email verification yenidən göndərmə

**SMS OTP (Yaradılmalıdır):**
- `POST /api/auth/send-otp` - SMS OTP göndərmə
- `POST /api/auth/verify-otp` - SMS OTP verification
- `POST /api/auth/verify-otp-login` - SMS OTP ilə giriş

**Password Reset:**
- `POST /api/auth/forgot-password` - Şifrə sıfırlama sorğusu
- `POST /api/auth/reset-password` - Şifrə sıfırlama

**Account Recovery (Yaradılmalıdır):**
- `POST /api/auth/recover-account` - Email ilə recovery
- `POST /api/auth/recover-account-phone` - Telefon ilə recovery

### Code Faylları

**Email Service:**
- `src/lib/email/index.ts` - Email service library
- `src/lib/email/core/email-service.ts` - Email service core

**SMS Service:**
- `src/lib/sms/index.ts` - SMS service library

**Authentication:**
- `src/lib/auth/config.ts` - NextAuth.js configuration
- `src/app/api/auth/[...nextauth]/route.ts` - NextAuth.js API route

**User Service:**
- `src/services/user.service.ts` - User business logic

**API Routes:**
- `src/app/api/auth/signup/route.ts` - Signup endpoint
- `src/app/api/auth/verify-email/route.ts` - Email verification endpoint
- `src/app/api/auth/forgot-password/route.ts` - Password reset endpoint

### Database Schema

**User Model Fields:**
- `email` - Email ünvanı
- `emailVerified` - Email təsdiqlənibmi
- `emailVerificationToken` - Email verification token
- `emailVerificationTokenExpiry` - Token expiry tarixi
- `phone` - Telefon nömrəsi
- `phoneVerified` - Telefon təsdiqlənibmi (yaradılmalıdır)
- `otpCode` - OTP kodu (yaradılmalıdır)
- `otpExpiry` - OTP expiry tarixi (yaradılmalıdır)
- `phoneVerificationAttempts` - Verification cəhdləri (yaradılmalıdır)
- `lastOTPSentAt` - Son OTP göndərilmə tarixi (yaradılmalıdır)
- `role` - İstifadəçi rolu (CUSTOMER, SELLER, COURIER, ADMIN)
- `isApproved` - Təsdiqlənibmi (SELLER və COURIER üçün)
- `isActive` - Aktivdir

---

## 💡 TİPS / MƏSLƏHƏTLƏR

### Email Verification

- Email verification link-ini production-da HTTPS istifadə edin
- Token expiry müddətini məqbul edin (24 saat)
- Rate limiting konfiqurasiya edin
- Email template-ləri professional görün

### SMS OTP

- OTP expiry müddətini qısa saxlayın (10 dəqiqə)
- Rate limiting konfiqurasiya edin
- OTP formatını aydın edin (6 rəqəmli)
- SMS məzmununu qısa və aydın saxlayın

### Security

- Bütün API key-ləri environment variables-də saxlayın
- Production və development üçün ayrı credentials istifadə edin
- Rate limiting konfiqurasiya edin
- Error mesajlarında sensitive məlumat verməyin

---

## 📞 DƏSTƏK / SUPPORT

- **Resend Support:** https://resend.com/docs
- **Twilio Support:** https://www.twilio.com/docs
- **NextAuth.js Documentation:** https://next-auth.js.org
- **Prisma Documentation:** https://www.prisma.io/docs

---

**Son Yeniləmə / Last Update:** 2025-01-28

