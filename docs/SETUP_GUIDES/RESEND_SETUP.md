# 📧 RESEND SETUP GUIDE
# 📧 RESEND QURAŞDIRMA TƏLİMATI

**Tarix / Date:** 2025-01-28  
**Status:** ✅ Hazır / Ready  
**Domain:** `ulustore.com` (Production)

---

## 📋 MƏQSƏD / GOAL

Resend-də account yaratmaq, API key əldə etmək və email service konfiqurasiya etmək.

---

## 📋 HAQQINDA / ABOUT

### Resend nədir?

**Resend** müasir **email API service**-dir ki, developer-friendly email göndərmə xidməti təmin edir. Resend, SMTP server quraşdırmaq lazım olmadan, sadə API çağırışları ilə email göndərməyə imkan verir.

### Resend-in əsas xüsusiyyətləri:

- **Modern Email API:** RESTful API ilə email göndərmə
- **Yüksək Deliverability Rate:** Email-lər spam-ə düşmür, inbox-a çatır
- **Developer-Friendly:** Sadə API, yaxşı documentation
- **Domain Verification:** SPF, DKIM, DMARC dəstəyi
- **Email Templates:** Reusable email template-ləri
- **Email Analytics:** Email open rate, click rate, delivery rate tracking
- **Webhooks:** Real-time email event notifications
- **React Email:** React ilə email template-ləri yaratmaq

### Niyə lazımdır bizə:

1. **Email Göndərmə Prosesini Sadələşdirir:**
   - SMTP server quraşdırmaq lazım deyil
   - Sadə API çağırışları ilə email göndəririk
   - Infrastructure management lazım deyil

2. **Yüksək Deliverability Rate:**
   - Email-lər spam-ə düşmür
   - Domain verification ilə email reputation qorunur
   - SPF, DKIM, DMARC dəstəyi

3. **Email Template-ləri və Personalization:**
   - Reusable email template-ləri
   - React Email ilə email template-ləri yaratmaq
   - Dynamic content və personalization

4. **Email Analytics və Tracking:**
   - Email open rate tracking
   - Click rate tracking
   - Delivery rate tracking
   - Bounce və complaint tracking

5. **Production-Ready Email Infrastructure:**
   - Scalable email infrastructure
   - High availability
   - Global email delivery
   - Email queue management

### Alternativlər və niyə Resend seçilib:

- **SendGrid:** Daha köhnə, Resend daha modern və developer-friendly
- **Mailgun:** Daha çox feature, Resend daha sadə və yaxşı developer experience
- **AWS SES:** Daha çox konfiqurasiya lazımdır, Resend daha sadə
- **Postmark:** Daha çox focus transactional email-lərə, Resend daha çox feature

**Niyə Resend seçilib:**
- Modern və developer-friendly API
- Yaxşı documentation və developer experience
- React Email dəstəyi
- Yüksək deliverability rate
- Sadə və intuitive API

---

## 🔐 QEYDİYYAT / REGISTRATION

### Addım 1: Resend Account Yaradın

1. **Resend səhifəsinə gedin:**
   - URL: https://resend.com
   - "Get Started" və ya "Sign Up" basın

2. **Qeydiyyat metodunu seçin:**
   - Email
   - GitHub (tövsiyə edilir)

3. **Account məlumatlarını daxil edin:**
   - Email və şifrə
   - Business name: `Ulustore`

4. **Email verification edin**

---

## 🔑 API KEY ƏLDƏ ETMƏK / GETTING API KEY

### Addım 2: API Key Yaradın

1. **Resend Dashboard-a daxil olun:**
   - https://resend.com/api-keys

2. **"Create API Key" basın**

3. **API Key məlumatları:**
   - **Name:** `ulustore-production`
   - **Permission:** `Full Access` (production üçün)
   - **Domain:** `ulustore.com` (optional)

4. **"Add" basın**

5. **API Key kopyalayın:**
   ```
   re_...
   ```
   ⚠️ **API Key yalnız bir dəfə göstərilir, saxlayın!**

**Hara yazılacaq / Where to add:**

**Vercel Environment Variables:**
- Key: `RESEND_API_KEY`
- Value: API key (re_...)

**Local `.env.production` faylı:**
```
RESEND_API_KEY=re_...
```

**Fayl yolu / File path:**
- `yusu-ecommerce/env.production` (gitignore-da olmalıdır)
- Vercel: Project Settings → Environment Variables

---

## 📧 DOMAIN VERİFİKASİYASI / DOMAIN VERIFICATION

### Addım 3: Domain Əlavə Edin

1. **Resend Dashboard → Domains**

2. **"Add Domain" basın**

3. **Domain daxil edin:**
   - `ulustore.com`

4. **DNS qeydlərini əlavə edin:**
   - Resend-də göstərilən DNS qeydlərini domain registrar-də əlavə edin:
     ```
     Type: TXT
     Name: @
     Value: resend._domainkey.ulustore.com
     
     Type: CNAME
     Name: resend
     Value: resend.ulustore.com
     ```

5. **Verification gözləyin:**
   - DNS propagation 24 saat çəkə bilər
   - Verification status-u dashboard-da görünür

---

## 📨 EMAIL FROM ADDRESS / EMAIL GÖNDƏRƏN ÜNVAN

### Addım 4: Email From Address

Verification edildikdən sonra:

**Hara yazılacaq / Where to add:**

**Vercel Environment Variables:**
- Key: `EMAIL_FROM`
- Value: `noreply@ulustore.com` və ya `support@ulustore.com`

**Local `.env.production` faylı:**
```
EMAIL_FROM=noreply@ulustore.com
```

**Fayl yolu / File path:**
- `yusu-ecommerce/env.production` (gitignore-da olmalıdır)
- Vercel: Project Settings → Environment Variables

---

## 📝 EMAIL TEMPLATES / EMAIL ŞABLONLARI

### Addım 5: Email Templates (Optional)

1. **Resend Dashboard → Email Templates**

2. **Template yaradın:**
   - Order confirmation
   - Password reset
   - Welcome email
   - və s.

---

## 🧪 TEST / TEST

### Email Test

1. **Resend Dashboard → Logs**
   - Email log-larını görə bilərsiniz

2. **Test email göndərin:**
   ```bash
   curl -X POST https://api.resend.com/emails \
     -H "Authorization: Bearer re_..." \
     -H "Content-Type: application/json" \
     -d '{
       "from": "noreply@ulustore.com",
       "to": "test@example.com",
       "subject": "Test Email",
       "html": "<p>Test email</p>"
     }'
   ```

---

## 📊 MONİTORİNQ / MONITORING

### Addım 6: Monitoring Setup

1. **Resend Dashboard → Logs**
   - Email delivery status-u görə bilərsiniz
   - Bounce və complaint-ləri izləyə bilərsiniz

2. **Resend Dashboard → Analytics**
   - Email open rate
   - Click rate
   - Delivery rate

---

## 🔒 TƏHLÜKƏSİZLİK / SECURITY

### Best Practices

- ⚠️ API key-i git-də commit etməyin
- ⚠️ API key-i yalnız server-side-də istifadə edin
- ⚠️ Production və development üçün ayrı key-lər istifadə edin
- ⚠️ API key-i müntəzəm olaraq rotate edin

---

## 📝 KONFİQURASİYA FAYLLARI / CONFIGURATION FILES

### `src/lib/email/resend.ts` (Mövcuddur)

Bu fayl artıq konfiqurasiya edilib. Yoxlayın:
- Resend client düzgün initialize olunur
- Email sending funksiyaları işləyir

**Fayl yolu / File path:** `yusu-ecommerce/src/lib/email/resend.ts`

---

## 📚 ƏLAVƏ MƏLUMAT / ADDITIONAL INFORMATION

- **Resend Documentation:** https://resend.com/docs
- **API Reference:** https://resend.com/docs/api-reference
- **Domain Setup:** https://resend.com/docs/dashboard/domains/introduction
- **Email Templates:** https://resend.com/docs/dashboard/emails/templates

---

## 💡 TİPS / MƏSLƏHƏTLƏR

- Domain verification üçün DNS qeydlərini düzgün əlavə edin
- SPF və DKIM qeydlərini yoxlayın
- Email deliverability üçün domain reputation-a diqqət edin

---

**Son Yeniləmə / Last Update:** 2025-01-28

