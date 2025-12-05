# 🔧 SETUP GUIDES / QURAŞDIRMA TƏLİMATLARI

**Tarix / Date:** 2025-01-28  
**Status:** ✅ Hazır / Ready  
**Domain:** `ulustore.com` (Production)

---

## 📋 MƏQSƏD / GOAL

Bu papka bütün third-party servislərin qeydiyyatı, API key-lərinin əldə edilməsi və konfiqurasiyası üçün ətraflı təlimatları ehtiva edir.

---

## 📚 SƏNƏDLƏR / DOCUMENTS

### Core Services / Əsas Xidmətlər

1. **[VERCEL_SETUP.md](./VERCEL_SETUP.md)** - Vercel deployment və domain konfiqurasiyası
2. **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Supabase database setup və connection string
3. **[PRISMA_SETUP.md](./PRISMA_SETUP.md)** - Prisma ORM konfiqurasiyası və migration

### Payment Services / Ödəniş Xidmətləri

4. **[STRIPE_SETUP.md](./STRIPE_SETUP.md)** - Stripe payment gateway qeydiyyatı və API key-ləri
5. **[PAYPAL_SETUP.md](./PAYPAL_SETUP.md)** - PayPal integration və API credentials

### Communication Services / Əlaqə Xidmətləri

6. **[RESEND_SETUP.md](./RESEND_SETUP.md)** - Resend email service qeydiyyatı və API key
7. **[TWILIO_SETUP.md](./TWILIO_SETUP.md)** - Twilio SMS service qeydiyyatı və credentials

### Analytics & Marketing / Analitika və Marketinq

8. **[GOOGLE_ANALYTICS_SETUP.md](./GOOGLE_ANALYTICS_SETUP.md)** - Google Analytics 4 qeydiyyatı və tracking ID
9. **[FACEBOOK_PIXEL_SETUP.md](./FACEBOOK_PIXEL_SETUP.md)** - Facebook Pixel qeydiyyatı və Pixel ID
10. **[GOOGLE_ADS_SETUP.md](./GOOGLE_ADS_SETUP.md)** - Google Ads conversion tracking və ID

### Monitoring & Error Tracking / Monitorinq və Xəta İzləmə

11. **[SENTRY_SETUP.md](./SENTRY_SETUP.md)** - Sentry error tracking qeydiyyatı və DSN

### Search & Other Services / Axtarış və Digər Xidmətlər

12. **[MEILISEARCH_SETUP.md](./MEILISEARCH_SETUP.md)** - Meilisearch search engine setup və API key
13. **[REDIS_SETUP.md](./REDIS_SETUP.md)** - Redis cache setup və connection string

### Authentication & Verification / Autentifikasiya və Təsdiq

14. **[AUTHENTICATION_VERIFICATION_SETUP.md](./AUTHENTICATION_VERIFICATION_SETUP.md)** - Email və telefon verification texnologiyaları, qeydiyyat və giriş prosesləri

---

## 🚀 QUICK START / SÜRƏTLİ BAŞLANĞIC

### Prioritet Sırası / Priority Order

1. **Vercel** - Deployment platform
2. **Supabase** - Database
3. **Stripe** - Payment processing
4. **Resend** - Email service
5. **Sentry** - Error tracking
6. **Google Analytics** - Analytics
7. **Facebook Pixel** - Marketing tracking
8. **Digər servislər** - İstəyə bağlı

---

## 📝 ENVIRONMENT VARIABLES / MÜHİT DƏYİŞƏNLƏRİ

Bütün API key-lər və connection string-lər `env.production` faylında və Vercel environment variables-də saxlanılmalıdır.

**Fayl yolu / File path:** `yusu-ecommerce/env.production` (gitignore-da olmalıdır)  
**Vercel:** Project Settings → Environment Variables

---

## ✅ CHECKLIST / SİYAHI

Hər servis üçün:
- [ ] Qeydiyyatdan keçin
- [ ] API key-ləri və ya credentials əldə edin
- [ ] Environment variables-ə əlavə edin
- [ ] Konfiqurasiya fayllarını yeniləyin
- [ ] Test edin

---

## 🔒 TƏHLÜKƏSİZLİK / SECURITY

- ⚠️ **API key-ləri git-də commit etməyin**
- ⚠️ **Production və development üçün ayrı key-lər istifadə edin**
- ⚠️ **Key-ləri müntəzəm olaraq rotate edin**
- ⚠️ **Key-ləri yalnız lazım olan yerlərdə istifadə edin**

---

## 📞 DƏSTƏK / SUPPORT

Hər servisin öz dəstək səhifəsi var. Sənədlərdə link-lər verilmişdir.

---

**Son Yeniləmə / Last Update:** 2025-01-28

