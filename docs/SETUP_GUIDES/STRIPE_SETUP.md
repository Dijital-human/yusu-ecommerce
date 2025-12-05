# 💳 STRIPE SETUP GUIDE
# 💳 STRIPE QURAŞDIRMA TƏLİMATI

**Tarix / Date:** 2025-01-28  
**Status:** ✅ Hazır / Ready  
**Domain:** `ulustore.com` (Production)

---

## 📋 MƏQSƏD / GOAL

Stripe-də account yaratmaq, API key-ləri əldə etmək və payment processing konfiqurasiya etmək.

---

## 📋 HAQQINDA / ABOUT

### Stripe nədir?

**Stripe** global **payment processing platform**-dur ki, online ödənişləri emal etməyə imkan verir. Stripe, credit card, debit card, və digər ödəniş metodlarını dəstəkləyir və PCI DSS compliant-dir.

### Stripe-in əsas xüsusiyyətləri:

- **Payment Processing:** Credit card, debit card, və digər ödəniş metodları
- **Global Payment Processing:** 40+ ölkədə ödəniş emalı
- **PCI DSS Compliant:** Card data saxlamaq lazım deyil, Stripe idarə edir
- **Fraud Detection və Prevention:** Built-in fraud detection
- **Subscription Management:** Recurring payments və subscription management
- **Webhooks:** Real-time payment event notifications
- **Payment Methods:** Credit cards, debit cards, digital wallets (Apple Pay, Google Pay)
- **Multi-Currency:** 135+ valyuta dəstəyi

### Niyə lazımdır bizə:

1. **Təhlükəsiz Ödəniş Emalı:**
   - PCI DSS compliance (bizim card data saxlamaq lazım deyil)
   - Stripe card data-nı təhlükəsiz şəkildə idarə edir
   - Encryption və tokenization

2. **Çoxlu Ödəniş Metodları Dəstəyi:**
   - Credit cards və debit cards
   - Digital wallets (Apple Pay, Google Pay)
   - Bank transfers
   - Local payment methods

3. **Global Payment Processing:**
   - 40+ ölkədə ödəniş emalı
   - Multi-currency dəstəyi (135+ valyuta)
   - Local payment methods

4. **Real-Time Payment Processing:**
   - Instant payment confirmation
   - Real-time payment status updates
   - Webhook-lar ilə real-time notifications

5. **Fraud Detection və Prevention:**
   - Built-in fraud detection
   - Machine learning ilə fraud prevention
   - Risk scoring və 3D Secure dəstəyi

6. **Subscription və Recurring Payments:**
   - Subscription management
   - Recurring payments
   - Invoice management
   - Payment retry logic

### Alternativlər və niyə Stripe seçilib:

- **PayPal:** Daha çox focus consumer payments-ə, Stripe daha çox developer-friendly
- **Square:** Daha çox focus in-person payments-ə, Stripe daha çox online payments
- **Adyen:** Daha çox enterprise, Stripe daha çox developer-friendly
- **Braintree:** PayPal-ın alt şirkəti, Stripe daha modern API

**Niyə Stripe seçilib:**
- Developer-friendly API və documentation
- PCI DSS compliance (card data saxlamaq lazım deyil)
- Global payment processing
- Fraud detection və prevention
- Subscription management
- Yaxşı developer experience

---

## 🔐 QEYDİYYAT / REGISTRATION

### Addım 1: Stripe Account Yaradın

1. **Stripe səhifəsinə gedin:**
   - URL: https://stripe.com
   - "Sign up" basın

2. **Account məlumatlarını daxil edin:**
   - Email
   - Şifrə
   - Business name: `Ulustore`
   - Country: `Azerbaijan`

3. **Email verification edin**

4. **Business information doldurun:**
   - Business type
   - Business address
   - Tax ID (optional)

---

## 🔑 API KEY-LƏRİ ƏLDƏ ETMƏK / GETTING API KEYS

### Addım 2: API Keys Əldə Edin

1. **Stripe Dashboard-a daxil olun:**
   - https://dashboard.stripe.com

2. **Developers → API keys**

3. **Test mode və ya Live mode:**

   **Test Mode (Development üçün):**
   - Test API key-ləri görünür
   - Test card-lar istifadə edə bilərsiniz

   **Live Mode (Production üçün):**
   - "Activate your account" basın
   - Business verification tamamlayın
   - Live API key-ləri görünür

4. **API key-ləri kopyalayın:**

   **Publishable Key:**
   ```
   pk_live_51...
   ```

   **Secret Key:**
   ```
   sk_live_51...
   ```

**Hara yazılacaq / Where to add:**

**Vercel Environment Variables:**
- Key: `STRIPE_PUBLISHABLE_KEY`
- Value: Publishable key (pk_live_...)

- Key: `STRIPE_SECRET_KEY`
- Value: Secret key (sk_live_...)

**Local `.env.production` faylı:**
```
STRIPE_PUBLISHABLE_KEY=pk_live_51...
STRIPE_SECRET_KEY=sk_live_51...
```

**Fayl yolu / File path:**
- `yusu-ecommerce/env.production` (gitignore-da olmalıdır)
- Vercel: Project Settings → Environment Variables

---

## 🔔 WEBHOOK KONFİQURASİYASI / WEBHOOK CONFIGURATION

### Addım 3: Webhook Endpoint Yaradın

1. **Developers → Webhooks**

2. **"Add endpoint" basın**

3. **Endpoint məlumatları:**
   - **Endpoint URL:** `https://ulustore.com/api/payment/webhook`
   - **Description:** `Production Payment Webhook`
   - **Events to send:** Aşağıdakı event-ləri seçin:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `charge.succeeded`
     - `charge.failed`
     - `customer.created`
     - `customer.updated`

4. **"Add endpoint" basın**

5. **Webhook signing secret kopyalayın:**
   ```
   whsec_...
   ```

**Hara yazılacaq / Where to add:**

**Vercel Environment Variables:**
- Key: `STRIPE_WEBHOOK_SECRET`
- Value: Webhook signing secret (whsec_...)

**Local `.env.production` faylı:**
```
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 🧪 TEST MODE / TEST MODU

### Development üçün Test Key-lər

**Test Publishable Key:**
```
pk_test_51...
```

**Test Secret Key:**
```
sk_test_51...
```

**Test Card Numbers:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

**Hara yazılacaq / Where to add:**
- Local `.env.local` faylı:
  ```
  STRIPE_PUBLISHABLE_KEY=pk_test_51...
  STRIPE_SECRET_KEY=sk_test_51...
  ```

---

## 📊 DASHBOARD VƏ MONİTORİNQ / DASHBOARD AND MONITORING

### Addım 4: Dashboard Setup

1. **Dashboard → Settings → Business settings**
   - Business information yeniləyin
   - Logo əlavə edin

2. **Dashboard → Settings → Branding**
   - Payment page branding konfiqurasiya edin

3. **Dashboard → Settings → Emails**
   - Email notification-ları konfiqurasiya edin

---

## 🔒 TƏHLÜKƏSİZLİK / SECURITY

### Best Practices

- ⚠️ Secret key-i git-də commit etməyin
- ⚠️ Secret key-i yalnız server-side-də istifadə edin
- ⚠️ Publishable key-i client-side-də istifadə edə bilərsiniz
- ⚠️ Webhook signature-ları verify edin
- ⚠️ Production və test üçün ayrı key-lər istifadə edin

---

## 📝 KONFİQURASİYA FAYLLARI / CONFIGURATION FILES

### `src/lib/payments/stripe.ts` (Mövcuddur)

Bu fayl artıq konfiqurasiya edilib. Yoxlayın:
- Stripe client düzgün initialize olunur
- Webhook signature verification aktivdir

**Fayl yolu / File path:** `yusu-ecommerce/src/lib/payments/stripe.ts`

---

## 🧪 TEST / TEST

### Payment Test

1. **Test mode-da:**
   - Test card ilə payment test edin
   - Webhook endpoint-i test edin

2. **Live mode-da:**
   - Kiçik məbləğlə real payment test edin
   - Webhook-ları yoxlayın

---

## 📚 ƏLAVƏ MƏLUMAT / ADDITIONAL INFORMATION

- **Stripe Documentation:** https://stripe.com/docs
- **API Reference:** https://stripe.com/docs/api
- **Webhooks Guide:** https://stripe.com/docs/webhooks
- **Testing:** https://stripe.com/docs/testing

---

## 💡 TİPS / MƏSLƏHƏTLƏR

- Test mode-da test edin, sonra live mode-a keçin
- Webhook endpoint-ini local test üçün Stripe CLI istifadə edin
- Payment method-ları müxtəlif ölkələr üçün aktivləşdirin

---

**Son Yeniləmə / Last Update:** 2025-01-28

