# 📱 TWILIO SETUP GUIDE
# 📱 TWILIO QURAŞDIRMA TƏLİMATI

**Tarix / Date:** 2025-01-28  
**Status:** ✅ Hazır / Ready  
**Domain:** `ulustore.com` (Production)

---

## 📋 MƏQSƏD / GOAL

Twilio-də account yaratmaq, API credentials əldə etmək və SMS service konfiqurasiya etmək.

---

## 📋 HAQQINDA / ABOUT

### Twilio nədir?

**Twilio** cloud **communications platform**-dur ki, SMS, Voice, Video, və digər communication API-ləri təmin edir. Twilio, global SMS coverage, phone number management, və programmable communication təmin edir.

### Twilio-nun əsas xüsusiyyətləri:

- **SMS API:** Global SMS göndərmə və qəbul etmə
- **Voice API:** Voice call-lar etmək və qəbul etmək
- **Video API:** Video call-lar və conferencing
- **Phone Number Management:** Phone number alınması və idarə edilməsi
- **OTP və Verification Services:** SMS-based OTP və verification
- **WhatsApp Business API:** WhatsApp ilə mesaj göndərmə
- **Global Coverage:** 180+ ölkədə SMS coverage
- **Real-Time Communication:** WebSocket ilə real-time messaging

### Niyə lazımdır bizə:

1. **SMS Göndərmə (OTP, Notifications):**
   - User registration üçün OTP göndərmə
   - Password reset üçün OTP göndərmə
   - Order confirmation və notification SMS-ləri
   - Two-factor authentication (2FA)

2. **Global SMS Coverage:**
   - 180+ ölkədə SMS göndərmə
   - Local phone numbers
   - International SMS

3. **Phone Number Verification:**
   - User phone number verification
   - OTP-based verification
   - Phone number validation

4. **Real-Time SMS Delivery Status:**
   - SMS delivery status tracking
   - Delivery receipts
   - Failed delivery notifications

5. **Voice və Video Call Capabilities:**
   - Voice call-lar (customer support üçün)
   - Video call-lar (future feature)
   - Conferencing

6. **WhatsApp Business API:**
   - WhatsApp ilə mesaj göndərmə
   - Customer support üçün WhatsApp integration

7. **Programmable Communication:**
   - API ilə communication control
   - Custom communication workflows
   - Integration ilə digər servislərlə

### Alternativlər və niyə Twilio seçilib:

- **Vonage (Nexmo):** Daha çox enterprise, Twilio daha çox developer-friendly
- **MessageBird:** Daha çox European focus, Twilio daha çox global
- **AWS SNS:** Daha çox konfiqurasiya lazımdır, Twilio daha sadə
- **SendGrid SMS:** Daha çox email focus, Twilio daha çox communication

**Niyə Twilio seçilib:**
- Global SMS coverage (180+ ölkə)
- Developer-friendly API və documentation
- Phone number management
- OTP və verification services
- WhatsApp Business API dəstəyi
- Yaxşı developer experience

---

## 🔐 QEYDİYYAT / REGISTRATION

### Addım 1: Twilio Account Yaradın

1. **Twilio səhifəsinə gedin:**
   - URL: https://www.twilio.com
   - "Sign up" basın

2. **Account məlumatlarını daxil edin:**
   - Email
   - Şifrə
   - Full name
   - Phone number (verification üçün)

3. **Email və phone verification edin**

4. **Account type seçin:**
   - Personal və ya Business

---

## 🔑 API CREDENTIALS ƏLDƏ ETMƏK / GETTING API CREDENTIALS

### Addım 2: API Credentials

1. **Twilio Console-a daxil olun:**
   - https://console.twilio.com

2. **Account SID və Auth Token:**
   - Dashboard-da görünür:
     - **Account SID:** `AC...`
     - **Auth Token:** `...` (show/hide düyməsi ilə görünür)

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

**Fayl yolu / File path:**
- `yusu-ecommerce/env.production` (gitignore-da olmalıdır)
- Vercel: Project Settings → Environment Variables

---

## 📱 PHONE NUMBER ALMAQ / GETTING PHONE NUMBER

### Addım 3: Phone Number Alın

1. **Twilio Console → Phone Numbers → Buy a number**

2. **Phone number seçin:**
   - Country: `Azerbaijan` və ya `United States`
   - Capabilities: `SMS` və ya `Voice + SMS`
   - Number type: `Local` və ya `Toll-free`

3. **"Buy" basın**

4. **Phone number kopyalayın:**
   ```
   +994...
   ```

**Hara yazılacaq / Where to add:**

**Vercel Environment Variables:**
- Key: `TWILIO_PHONE_NUMBER`
- Value: Phone number (+994...)

**Local `.env.production` faylı:**
```
TWILIO_PHONE_NUMBER=+994...
```

---

## 🧪 TEST CREDENTIALS / TEST CREDENTIALS

### Development üçün Test Credentials

Twilio-də test credentials avtomatik olaraq verilir:

**Test Account SID:**
```
AC...
```

**Test Auth Token:**
```
...
```

**Hara yazılacaq / Where to add:**
- Local `.env.local` faylı:
  ```
  TWILIO_ACCOUNT_SID=AC...
  TWILIO_AUTH_TOKEN=...
  TWILIO_PHONE_NUMBER=+15005550006  # Test number
  ```

---

## 📊 DASHBOARD VƏ MONİTORİNQ / DASHBOARD AND MONITORING

### Addım 4: Dashboard Setup

1. **Twilio Console → Monitor → Logs**
   - SMS log-larını görə bilərsiniz
   - Delivery status-u izləyə bilərsiniz

2. **Twilio Console → Monitor → Usage**
   - SMS usage və cost görə bilərsiniz

---

## 🔒 TƏHLÜKƏSİZLİK / SECURITY

### Best Practices

- ⚠️ Auth Token-u git-də commit etməyin
- ⚠️ Credentials-i yalnız server-side-də istifadə edin
- ⚠️ Production və test üçün ayrı credentials istifadə edin
- ⚠️ Auth Token-u müntəzəm olaraq rotate edin

---

## 📝 KONFİQURASİYA FAYLLARI / CONFIGURATION FILES

### `src/lib/sms/twilio.ts` (Mövcuddur)

Bu fayl artıq konfiqurasiya edilib. Yoxlayın:
- Twilio client düzgün initialize olunur
- SMS sending funksiyaları işləyir

**Fayl yolu / File path:** `yusu-ecommerce/src/lib/sms/twilio.ts`

---

## 🧪 TEST / TEST

### SMS Test

1. **Test mode-da:**
   - Test phone number ilə SMS göndərin
   - Delivery status-u yoxlayın

2. **Production-da:**
   - Real phone number ilə SMS göndərin
   - Delivery log-larını yoxlayın

---

## 💰 PRICING / QİYMƏT

### SMS Pricing

- Twilio SMS pricing country-ə görə dəyişir
- Dashboard-da pricing görə bilərsiniz
- Free trial credit verilir

---

## 📚 ƏLAVƏ MƏLUMAT / ADDITIONAL INFORMATION

- **Twilio Documentation:** https://www.twilio.com/docs
- **SMS API:** https://www.twilio.com/docs/sms
- **Phone Numbers:** https://www.twilio.com/docs/phone-numbers
- **Pricing:** https://www.twilio.com/pricing

---

## 💡 TİPS / MƏSLƏHƏTLƏR

- Test credentials ilə development-da test edin
- Production-da real phone number istifadə edin
- SMS delivery rate-i monitor edin
- Cost-ləri izləyin

---

**Son Yeniləmə / Last Update:** 2025-01-28

