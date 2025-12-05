# Ecommerce Email Test Summary / E-commerce Email Test Xülasəsi

| Tarix | Provider | Message ID | Test Email | Status | Qeydlər |
|-------|----------|------------|------------|--------|---------|
| 2025-11-25 | Resend | 267419d1-fd9d-4b84-aab9-1b8b00071181 | dijital_human@icloud.com | ✅ dev | `.env.local`-da Resend API açarı + `EMAIL_FROM=onboarding@resend.dev` ilə `npm run test:email` 737 ms-də uğurla tamamlandı; hazırda yalnız Resend aktivdir (fallback üçün SMTP/SENDGRID konfiqurasiyası tələb olunur). |

Hər `npm run test:email` icrasından sonra bu cədvəli yeniləyin:
- Tarixi UTC formatında qeyd edin.
- İşləyən provider-i və Message ID-ni əlavə edin.
- Qeydlərdə dev/prod mühitini, istifadə olunan `.env` parametrlərini və nəticəni qısaca yazın.

