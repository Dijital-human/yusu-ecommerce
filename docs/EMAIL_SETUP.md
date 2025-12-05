# Marketplace Email Setup / Marketplace Email Bələdçisi

## 1. İcmal / Overview
- Marketplace tətbiqi həm transactional (order confirmation) həm də marketing email-ləri göndərir.
- Unified EmailService (Resend primary, SMTP fallback, optional SendGrid) ilə bütün modullar standartlaşdırılır.

## 2. Env Dəyərləri
```bash
RESEND_API_KEY="re_xxx"
EMAIL_FROM="onboarding@resend.dev"   # domen yoxdursa
TEST_EMAIL="store-test@example.com"

SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"

SENDGRID_API_KEY=""
```
- Production: Resend-də `noreply@yourdomain.com` domenini təsdiqlə, `EMAIL_FROM`-u yenilə.
- Marketing kampaniyaları üçün SendGrid templateləri istifadə ediləcəksə API açarını doldur.

## 3. Test Axını
```bash
npm run test:email
npx tsx scripts/test-resend-api.ts
```
- Domainsiz mod: yalnız `TEST_EMAIL` ünvanına mesaj gedir.
- QA nəticələrini `docs/EMAIL_TEST_SUMMARY.md` faylında saxla (tarix, provider, messageId).

## 4. İnteqrasiya
- Order confirmation, password reset, marketing scheduler kimi bütün servislər `src/lib/email` moduluna keçməlidir.
- Marketplace UI-dən gələn CSV/market kampaniyaları Resend → SMTP → SendGrid fallback qaydasını izləyəcək.

## 5. Production Checklist
1. Resend → Domains → DNS TXT/CNAME → “Verify”.
2. Prod env-də `RESEND_API_KEY`, `EMAIL_FROM`, `SENDGRID_API_KEY` (əgər istifadə olunacaqsa) doldur.
3. `npm run test:email` qaçır, nəticəni QA log-a əlavə et.
4. Manual: test order → müşteri email → spam yoxlanışı.

Ətraflı multi-app plan üçün `../yusu-seller/docs/EMAIL_ROLLOUT_PLAN.md` sənədinə bax. Domain/hostinq hazır olana kimi `onboarding@resend.dev` + `TEST_EMAIL` rejimində davam edə bilərsən.

