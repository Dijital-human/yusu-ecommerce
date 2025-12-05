# API Keys və Konfiqurasiya Tələbləri
# API Keys and Configuration Requirements

**Tarix / Date:** 2025-01-28  
**Status:** Production üçün lazımdır / Required for production

---

## 🔑 TƏLƏB OLUNAN API KEY-LƏRİ / REQUIRED API KEYS

### 1. Supabase (Mövcuddur / Already Configured)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=product-media
```

**Qeyd:** Supabase Storage CDN üçün istifadə olunur.

---

### 2. PayPal Payment Provider
```env
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
PAYPAL_ENVIRONMENT=sandbox  # və ya 'production'
```

**Alınma yeri / Where to get:**
- https://developer.paypal.com/
- Sandbox üçün test hesabı yaradın
- Production üçün business hesabı lazımdır

---

### 3. DHL Shipping Provider
```env
DHL_API_KEY=your-dhl-api-key
DHL_API_SECRET=your-dhl-api-secret
DHL_ENVIRONMENT=sandbox  # və ya 'production'
```

**Alınma yeri / Where to get:**
- https://developer.dhl.com/
- DHL Developer Portal-dan qeydiyyatdan keçin
- API credentials alın

---

### 4. FedEx Shipping Provider
```env
FEDEX_API_KEY=your-fedex-api-key
FEDEX_API_SECRET=your-fedex-api-secret
FEDEX_ENVIRONMENT=sandbox  # və ya 'production'
```

**Alınma yeri / Where to get:**
- https://developer.fedex.com/
- FedEx Developer Portal-dan qeydiyyatdan keçin
- API credentials alın

---

### 5. Currency Exchange API
**Seçim 1: ExchangeRate API (Tövsiyə edilir / Recommended)**
```env
EXCHANGERATE_API_KEY=your-exchangerate-api-key
CURRENCY_API_PROVIDER=exchangerate
```

**Alınma yeri / Where to get:**
- https://www.exchangerate-api.com/
- Pulsuz plan mövcuddur (1500 requests/month)
- Premium plan: $10/month (unlimited requests)

**Seçim 2: Fixer.io API**
```env
FIXER_API_KEY=your-fixer-api-key
CURRENCY_API_PROVIDER=fixer
```

**Alınma yeri / Where to get:**
- https://fixer.io/
- Pulsuz plan mövcuddur (100 requests/month)
- Premium plan: $10/month (unlimited requests)

---

### 6. Slack Notifications (İstəyə bağlı / Optional)
```env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SLACK_DEFAULT_CHANNEL=#alerts
SLACK_ALERT_CHANNEL=#critical-alerts
```

**Alınma yeri / Where to get:**
- Slack workspace-də Settings → Apps → Incoming Webhooks
- Yeni webhook yaradın
- Webhook URL-i kopyalayın

---

### 7. Alert Notifications (İstəyə bağlı / Optional)
```env
ALERT_EMAIL_RECIPIENTS=admin@ulustore.com,devops@ulustore.com
ALERT_PHONE_NUMBERS=+1234567890,+0987654321
```

**Qeyd:** Kritik alert-lər üçün email və SMS bildirişləri.

---

### 8. Cron Job Secret
```env
CRON_SECRET=your-strong-random-secret-key-min-32-chars
```

**Qeyd:** Currency rates cron job üçün təhlükəsizlik secret-i.

---

## 📋 PRODUCTION ENVIRONMENT VARIABLES

Bütün environment variables `env.production.example` faylında sənədləşdirilib. Production-da Vercel-də bu dəyişənləri təyin edin:

1. Vercel Dashboard → Project → Settings → Environment Variables
2. Hər bir key-i əlavə edin
3. Production environment üçün seçin

---

## 🔒 TƏHLÜKƏSİZLİK QEYDLƏRİ / SECURITY NOTES

1. **API Keys:** Heç vaxt kod bazasına commit etməyin
2. **Secrets:** Güclü, unikal secret key-lər istifadə edin
3. **Environment:** Production və development üçün ayrı key-lər istifadə edin
4. **Rotation:** Key-ləri müntəzəm olaraq yeniləyin

---

## ✅ YOXLAMA / VERIFICATION

Bütün key-ləri təyin etdikdən sonra yoxlayın:

```bash
# Environment variables yoxla
npm run env:check

# Test email göndər
npm run test:email
```

---

## 📞 DƏSTƏK / SUPPORT

Əgər API key-ləri almaqda problem yaşayırsınızsa:
1. Hər bir provider-in documentation-ına baxın
2. Support team ilə əlaqə saxlayın
3. Sandbox mühitində test edin

---

**Son Yeniləmə / Last Updated:** 2025-01-28

