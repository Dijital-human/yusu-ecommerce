# 🔑 API Keys və Quraşdırma Təlimatları
# 🔑 API Keys and Setup Instructions

**Tarix / Date:** 2025-01-28  
**Status:** Hazırdır / Ready

---

## ✅ TAMAMLANAN İŞLƏR / COMPLETED WORK

Bütün tapşırıqlar tamamlandı! Aşağıdakı funksionallıqlar tətbiq edildi:

1. ✅ CDN Upload (Supabase Storage)
2. ✅ Database Queries (Promotions, Email Marketing, GDPR)
3. ✅ PayPal Payment Provider
4. ✅ DHL & FedEx Shipping Providers
5. ✅ Notification Channels (Email, Slack, SMS)
6. ✅ Currency API Integration (ExchangeRate & Fixer.io)
7. ✅ Validation Helpers in API Routes
8. ✅ Code Quality Check

---

## 🔑 LAZIM OLAN API KEY-LƏRİ / REQUIRED API KEYS

### 1. PayPal Payment Provider
```env
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_ENVIRONMENT=sandbox  # və ya 'production'
```
**Alınma:** https://developer.paypal.com/  
**Qeyd:** İlk test üçün sandbox istifadə edin

---

### 2. DHL Shipping Provider
```env
DHL_API_KEY=your_dhl_api_key
DHL_API_SECRET=your_dhl_api_secret
DHL_ENVIRONMENT=sandbox  # və ya 'production'
```
**Alınma:** https://developer.dhl.com/  
**Qeyd:** Developer Portal-dan qeydiyyatdan keçin

---

### 3. FedEx Shipping Provider
```env
FEDEX_API_KEY=your_fedex_api_key
FEDEX_API_SECRET=your_fedex_api_secret
FEDEX_ENVIRONMENT=sandbox  # və ya 'production'
```
**Alınma:** https://developer.fedex.com/  
**Qeyd:** Developer Portal-dan qeydiyyatdan keçin

---

### 4. Currency Exchange API

**Seçim 1: ExchangeRate API (Tövsiyə edilir)**
```env
EXCHANGERATE_API_KEY=your_exchangerate_api_key
CURRENCY_API_PROVIDER=exchangerate
```
**Alınma:** https://www.exchangerate-api.com/  
**Plan:** Pulsuz (1500 requests/month) və ya Premium ($10/month)

**Seçim 2: Fixer.io API**
```env
FIXER_API_KEY=your_fixer_api_key
CURRENCY_API_PROVIDER=fixer
```
**Alınma:** https://fixer.io/  
**Plan:** Pulsuz (100 requests/month) və ya Premium ($10/month)

---

### 5. Slack Notifications (İstəyə bağlı)
```env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SLACK_DEFAULT_CHANNEL=#alerts
SLACK_ALERT_CHANNEL=#critical-alerts
```
**Alınma:** Slack workspace → Settings → Apps → Incoming Webhooks

---

### 6. Alert Notifications (İstəyə bağlı)
```env
ALERT_EMAIL_RECIPIENTS=admin@ulustore.com,devops@ulustore.com
ALERT_PHONE_NUMBERS=+1234567890,+0987654321
```
**Qeyd:** Kritik alert-lər üçün email və SMS

---

### 7. Cron Secret
```env
CRON_SECRET=your_strong_random_secret_key_min_32_chars
```
**Qeyd:** Güclü, unikal secret key (min 32 simvol)

---

## 🗄️ PRISMA MODELLƏRİ / PRISMA MODELS

Aşağıdakı modelləri `prisma/schema.prisma` faylına əlavə edin:

```prisma
// Promotion Model / Promosiya Modeli
model Promotion {
  id                String   @id @default(cuid())
  name              String
  description       String?
  type              String   // 'percentage', 'fixed', 'buy_x_get_y', 'free_shipping'
  status            String   // 'draft', 'active', 'scheduled', 'expired', 'cancelled'
  startDate         DateTime
  endDate           DateTime
  discountValue     Decimal
  minPurchaseAmount Decimal?
  maxDiscountAmount Decimal?
  applicableTo      String?  // 'all', 'category', 'product', 'seller'
  applicableIds     String[]
  couponCode        String?  @unique
  usageLimit        Int?
  usageCount        Int      @default(0)
  userLimit         Int?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([status])
  @@index([couponCode])
  @@index([startDate, endDate])
  @@map("promotions")
}

// Newsletter Subscription Model / Newsletter Abunəliyi Modeli
model NewsletterSubscription {
  id            String   @id @default(cuid())
  email         String   @unique
  userId        String?
  subscribed    Boolean  @default(true)
  subscribedAt  DateTime @default(now())
  unsubscribedAt DateTime?
  preferences   Json?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([email])
  @@index([subscribed])
  @@map("newsletter_subscriptions")
}

// Consent Model / Razılıq Modeli
model Consent {
  id         String   @id @default(cuid())
  userId     String
  type       String   // 'marketing', 'analytics', 'necessary', 'functional'
  granted    Boolean  @default(false)
  grantedAt  DateTime?
  revokedAt  DateTime?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@unique([userId, type])
  @@index([userId])
  @@index([type])
  @@map("consents")
}

// Promotion Usage Model / Promosiya İstifadəsi Modeli
model PromotionUsage {
  id           String   @id @default(cuid())
  promotionId  String
  userId       String
  orderId      String?
  usedAt       DateTime @default(now())

  @@index([promotionId])
  @@index([userId])
  @@index([orderId])
  @@map("promotion_usage")
}
```

**Migration əməliyyatı:**
```bash
cd yusu-ecommerce
npx prisma migrate dev --name add_promotions_newsletter_consent
```

---

## 🚀 VERCEL DEPLOYMENT

### Step 1: Environment Variables
Vercel Dashboard-da:
1. **Project → Settings → Environment Variables**
2. Hər bir key-i əlavə edin (yuxarıdakı siyahıdan)
3. **Production** environment üçün seçin
4. **Save**

### Step 2: Deploy
```bash
git add .
git commit -m "Complete all tasks: CDN, Payments, Shipping, Notifications, Currency API"
git push origin main
```

Vercel avtomatik olaraq deploy edəcək.

---

## ✅ YOXLAMA / VERIFICATION

Deploy-dan sonra yoxlayın:

1. **Currency Rates:** `https://ulustore.com/api/currency/rates`
2. **PayPal:** Test payment yaradın
3. **DHL/FedEx:** Shipping rates sorğusu göndərin
4. **Slack:** Alert göndərin
5. **Email:** Newsletter subscription test edin

---

## 📝 QEYDLƏR / NOTES

1. **API Keys:** Bütün key-lər Vercel-də environment variables kimi təyin edilməlidir
2. **Prisma Models:** Migration-dan əvvəl schema-ya modelləri əlavə edin
3. **Sandbox Testing:** İlk test üçün sandbox mühitindən istifadə edin
4. **Error Handling:** Bütün API-lər graceful error handling ilə təchiz edilib

---

**Son Yeniləmə / Last Updated:** 2025-01-28

