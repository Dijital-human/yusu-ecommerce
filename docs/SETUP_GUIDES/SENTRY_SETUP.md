# 🐛 SENTRY SETUP GUIDE
# 🐛 SENTRY QURAŞDIRMA TƏLİMATI

**Tarix / Date:** 2025-01-28  
**Status:** ✅ Hazır / Ready  
**Domain:** `ulustore.com` (Production)

---

## 📋 MƏQSƏD / GOAL

Sentry-də account yaratmaq, DSN əldə etmək və error tracking konfiqurasiya etmək.

---

## 📋 HAQQINDA / ABOUT

### Sentry nədir?

**Sentry** **error tracking və monitoring platform**-dur ki, production-da error-ları real-time izləmək, error stack traces və context təmin etmək, və performance monitoring təmin edir. Sentry, JavaScript, TypeScript, Python, və digər dilləri dəstəkləyir.

### Sentry-nin əsas xüsusiyyətləri:

- **Error Tracking:** Real-time error tracking və aggregation
- **Error Stack Traces:** Detailed error stack traces və context
- **Performance Monitoring:** API response time, database query time, page load time
- **Release Tracking:** Hansı release-də error var
- **Alert Rules:** Critical error-lar üçün bildirişlər
- **Source Maps Support:** Minified code üçün source maps
- **User Impact Analysis:** Error-ların user-lərə təsiri
- **Issue Grouping:** Similar error-ları qruplaşdırma

### Niyə lazımdır bizə:

1. **Production-da Error-ları Real-Time İzləmək:**
   - Production-da error-ları real-time görürük
   - Error stack traces və context
   - Error aggregation və grouping

2. **Error Stack Traces və Context:**
   - Detailed error stack traces
   - Error context (user, request, environment)
   - Breadcrumbs (user actions before error)

3. **Performance Monitoring:**
   - API response time tracking
   - Database query time tracking
   - Page load time tracking
   - Core Web Vitals monitoring

4. **Release Tracking:**
   - Hansı release-də error var
   - Release comparison
   - Regression detection

5. **Alert Rules:**
   - Critical error-lar üçün bildirişlər
   - Email və Slack notifications
   - Custom alert rules

6. **Error Aggregation və Grouping:**
   - Similar error-ları qruplaşdırma
   - Error trends və patterns
   - Error frequency tracking

7. **User Impact Analysis:**
   - Error-ların user-lərə təsiri
   - Affected user count
   - User journey analysis

### Alternativlər və niyə Sentry seçilib:

- **Rollbar:** Daha çox enterprise, Sentry daha çox developer-friendly
- **Bugsnag:** Daha çox mobile focus, Sentry daha çox web
- **LogRocket:** Daha çox session replay, Sentry daha çox error tracking
- **Datadog:** Daha çox infrastructure monitoring, Sentry daha çox application monitoring

**Niyə Sentry seçilib:**
- Yaxşı error tracking və monitoring
- Performance monitoring
- Release tracking
- Alert rules və notifications
- Source maps support
- Yaxşı developer experience
- Free tier mövcuddur

---

## 🔐 QEYDİYYAT / REGISTRATION

### Addım 1: Sentry Account Yaradın

1. **Sentry səhifəsinə gedin:**
   - URL: https://sentry.io
   - "Get Started" və ya "Sign Up" basın

2. **Qeydiyyat metodunu seçin:**
   - Email
   - GitHub (tövsiyə edilir)
   - Google

3. **Account məlumatlarını daxil edin:**
   - Email və şifrə
   - Organization name: `ulustore`

4. **Email verification edin**

---

## 📦 PROJECT YARADILMASI / PROJECT CREATION

### Addım 2: Yeni Project Yaradın

1. **Sentry Dashboard-a daxil olun:**
   - https://sentry.io/organizations/[org]/projects/

2. **"Create Project" basın**

3. **Project məlumatlarını daxil edin:**
   - **Platform:** `Next.js`
   - **Project Name:** `ulustore-ecommerce`
   - **Team:** Yeni team yaradın və ya mövcud seçin

4. **"Create Project" basın**

---

## 🔑 DSN ƏLDƏ ETMƏK / GETTING DSN

### Addım 3: DSN (Data Source Name)

1. **Project → Settings → Client Keys (DSN)**

2. **DSN kopyalayın:**
   ```
   https://[key]@[org].ingest.sentry.io/[project-id]
   ```

**Hara yazılacaq / Where to add:**

**Vercel Environment Variables:**
- Key: `SENTRY_DSN`
- Value: DSN (https://...)

- Key: `NEXT_PUBLIC_SENTRY_DSN`
- Value: Eyni DSN (client-side üçün)

**Local `.env.production` faylı:**
```
SENTRY_DSN=https://[key]@[org].ingest.sentry.io/[project-id]
NEXT_PUBLIC_SENTRY_DSN=https://[key]@[org].ingest.sentry.io/[project-id]
```

**Fayl yolu / File path:**
- `yusu-ecommerce/env.production` (gitignore-da olmalıdır)
- Vercel: Project Settings → Environment Variables

---

## 🔐 AUTH TOKEN (SOURCE MAPS ÜÇÜN) / AUTH TOKEN (FOR SOURCE MAPS)

### Addım 4: Auth Token Yaradın

1. **Sentry → Settings → Auth Tokens**

2. **"Create New Token" basın**

3. **Token məlumatları:**
   - **Name:** `vercel-source-maps`
   - **Scopes:** `project:releases` və `org:read`

4. **"Create Token" basın**

5. **Token kopyalayın:**
   ```
   ...
   ```
   ⚠️ **Token yalnız bir dəfə göstərilir, saxlayın!**

**Hara yazılacaq / Where to add:**

**Vercel Environment Variables:**
- Key: `SENTRY_AUTH_TOKEN`
- Value: Auth token

**Local `.env.production` faylı:**
```
SENTRY_AUTH_TOKEN=...
```

---

## 📊 ORGANIZATION VƏ PROJECT SLUG / ORGANIZATION AND PROJECT SLUG

### Addım 5: Organization və Project Slug

1. **Sentry → Settings → General**
   - **Organization Slug:** `ulustore` (və ya başqa)

2. **Project → Settings → General**
   - **Project Slug:** `ulustore-ecommerce`

**Hara yazılacaq / Where to add:**

**Vercel Environment Variables:**
- Key: `SENTRY_ORG`
- Value: Organization slug

- Key: `SENTRY_PROJECT`
- Value: Project slug

**Local `.env.production` faylı:**
```
SENTRY_ORG=ulustore
SENTRY_PROJECT=ulustore-ecommerce
```

---

## 🔔 ALERT RULES / XƏBƏRDARLIQ QAYDALARI

### Addım 6: Alert Rules Konfiqurasiya Edin

1. **Project → Settings → Alerts**

2. **"Create Alert Rule" basın**

3. **Alert məlumatları:**
   - **Name:** `Critical Errors`
   - **Conditions:** 
     - Error count > 10 in 1 hour
     - Error rate > 5% in 1 hour
   - **Actions:**
     - Email notification
     - Slack notification (optional)

4. **"Save Rule" basın**

---

## 📝 KONFİQURASİYA FAYLLARI / CONFIGURATION FILES

### `sentry.client.config.ts` (Mövcuddur)

Bu fayl artıq konfiqurasiya edilib. Yoxlayın:
- DSN düzgün konfiqurasiya edilib
- Tracing aktivdir

**Fayl yolu / File path:** `yusu-ecommerce/sentry.client.config.ts`

### `sentry.server.config.ts` (Mövcuddur)

Bu fayl artıq konfiqurasiya edilib. Yoxlayın:
- DSN düzgün konfiqurasiya edilib
- Server-side tracing aktivdir

**Fayl yolu / File path:** `yusu-ecommerce/sentry.server.config.ts`

---

## 🧪 TEST / TEST

### Error Tracking Test

1. **Test error göndərin:**
   ```typescript
   import * as Sentry from '@sentry/nextjs';
   
   Sentry.captureException(new Error('Test error'));
   ```

2. **Sentry Dashboard-da error-u görün**

---

## 📊 MONİTORİNQ / MONITORING

### Addım 7: Performance Monitoring

1. **Sentry Dashboard → Performance**
   - API response time
   - Database query time
   - Page load time

2. **Sentry Dashboard → Issues**
   - Error list
   - Error details
   - Error trends

---

## 🔒 TƏHLÜKƏSİZLİK / SECURITY

### Best Practices

- ⚠️ DSN-i git-də commit etməyin
- ⚠️ Auth Token-u git-də commit etməyin
- ⚠️ Production və development üçün ayrı project-lər istifadə edin
- ⚠️ Sensitive data-nı Sentry-ə göndərməyin (data scrubbing)

---

## 📚 ƏLAVƏ MƏLUMAT / ADDITIONAL INFORMATION

- **Sentry Documentation:** https://docs.sentry.io
- **Next.js Integration:** https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Source Maps:** https://docs.sentry.io/platforms/javascript/sourcemaps/
- **Alert Rules:** https://docs.sentry.io/product/alerts/

---

## 💡 TİPS / MƏSLƏHƏTLƏR

- Source maps upload üçün Vercel build-də konfiqurasiya edin
- Alert rules konfiqurasiya edin
- Performance monitoring aktivləşdirin
- Data scrubbing konfiqurasiya edin

---

**Son Yeniləmə / Last Update:** 2025-01-28

