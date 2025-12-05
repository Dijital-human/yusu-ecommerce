# 🚀 VERCEL SETUP GUIDE
# 🚀 VERCEL QURAŞDIRMA TƏLİMATI

**Tarix / Date:** 2025-01-28  
**Status:** ✅ Hazır / Ready  
**Domain:** `ulustore.com` (Production)

---

## 📋 MƏQSƏD / GOAL

Vercel-də proyekt yaratmaq, domain konfiqurasiya etmək və deployment setup etmək.

---

## 📋 HAQQINDA / ABOUT

### Vercel nədir?

**Vercel** frontend **deployment platform**-dur ki, Next.js creators tərəfindən yaradılıb. Vercel, frontend application-ləri deploy etmək, global edge network ilə content delivery, və serverless functions təmin edir.

### Vercel-in əsas xüsusiyyətləri:

- **Frontend Deployment:** Next.js, React, Vue, və digər frontend frameworks
- **Global Edge Network:** CDN ilə global content delivery
- **Automatic SSL Certificates:** Avtomatik SSL/TLS sertifikatları
- **Preview Deployments:** Pull request preview deployments
- **Serverless Functions:** Edge functions və serverless API routes
- **Automatic Scaling:** Auto-scaling based on traffic
- **Built-In Analytics:** Web analytics və performance monitoring
- **Zero-Configuration Deployment:** Minimal configuration ilə deployment

### Niyə lazımdır bizə:

1. **Sürətli Deployment (GitHub Push = Auto Deploy):**
   - GitHub push = avtomatik deployment
   - CI/CD pipeline built-in
   - Manual deployment lazım deyil

2. **Global Edge Network (CDN):**
   - Global CDN ilə content delivery
   - Low latency worldwide
   - Edge caching

3. **Automatic SSL Certificates:**
   - Avtomatik SSL/TLS sertifikatları
   - HTTPS by default
   - Certificate renewal avtomatik

4. **Preview Deployments:**
   - Pull request preview deployments
   - Test environment hər PR üçün
   - Staging environment

5. **Serverless Functions:**
   - Edge functions (global edge network)
   - Serverless API routes
   - Auto-scaling

6. **Automatic Scaling:**
   - Traffic-ə görə auto-scaling
   - High availability
   - No server management

7. **Built-In Analytics:**
   - Web analytics (page views, visitors)
   - Performance monitoring (Core Web Vitals)
   - Real-time analytics

8. **Zero-Configuration Deployment:**
   - Minimal configuration
   - Framework detection
   - Automatic build optimization

### Alternativlər və niyə Vercel seçilib:

- **Netlify:** Daha çox static sites, Vercel daha çox Next.js və dynamic apps
- **AWS Amplify:** Daha çox konfiqurasiya lazımdır, Vercel daha sadə
- **Heroku:** Daha çox backend focus, Vercel daha çox frontend
- **Cloudflare Pages:** Daha çox static sites, Vercel daha çox dynamic apps

**Niyə Vercel seçilib:**
- Next.js creators tərəfindən yaradılıb
- Yaxşı Next.js dəstəyi və optimization
- Global edge network
- Preview deployments
- Serverless functions
- Yaxşı developer experience
- Free tier mövcuddur

---

## 🔐 QEYDİYYAT / REGISTRATION

### Addım 1: Vercel Account Yaradın

1. **Vercel səhifəsinə gedin:**
   - URL: https://vercel.com
   - "Sign Up" düyməsini basın

2. **Qeydiyyat metodunu seçin:**
   - GitHub (tövsiyə edilir)
   - GitLab
   - Bitbucket
   - Email

3. **Account yaradın:**
   - GitHub istifadə edirsinizsə, GitHub account ilə login olun
   - Permissions verin

---

## 📦 PROYECT YARADILMASI / PROJECT CREATION

### Addım 2: Proyekt Import Edin

1. **Vercel Dashboard-a daxil olun:**
   - https://vercel.com/dashboard

2. **"Add New..." → "Project" seçin**

3. **GitHub repository-ni seçin:**
   - `yusu-ecommerce` repository-ni tapın
   - "Import" basın

4. **Proyekt konfiqurasiyası:**
   - **Framework Preset:** Next.js
   - **Root Directory:** `yusu-ecommerce` (əgər monorepo-dursa)
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`

5. **"Deploy" basın**

---

## 🌐 DOMAIN KONFİQURASİYASI / DOMAIN CONFIGURATION

### Addım 3: Custom Domain Əlavə Edin

1. **Proyekt Settings-ə gedin:**
   - Proyekt → Settings → Domains

2. **Domain əlavə edin:**
   - `ulustore.com` yazın
   - "Add" basın

3. **DNS qeydlərini konfiqurasiya edin:**
   - Vercel-də göstərilən DNS qeydlərini domain registrar-də əlavə edin:
     ```
     Type: A
     Name: @
     Value: 76.76.21.21
     
     Type: CNAME
     Name: www
     Value: cname.vercel-dns.com
     ```

4. **SSL sertifikatı:**
   - Vercel avtomatik olaraq SSL sertifikatı yaradır
   - 24 saat ərzində aktivləşir

### Addım 4: Subdomain-lər Əlavə Edin

Hər subdomain üçün ayrı Vercel proyekti yaradın:

#### Seller Subdomain (`seller.ulustore.com`)

1. `yusu-seller` repository-ni import edin
2. Domain kimi `seller.ulustore.com` əlavə edin
3. DNS qeydi:
   ```
   Type: CNAME
   Name: seller
   Value: cname.vercel-dns.com
   ```

#### Courier Subdomain (`courier.ulustore.com`)

1. `yusu-courier` repository-ni import edin
2. Domain kimi `courier.ulustore.com` əlavə edin
3. DNS qeydi:
   ```
   Type: CNAME
   Name: courier
   Value: cname.vercel-dns.com
   ```

#### Admin Subdomain (`admin.ulustore.com`)

1. `yusu-admin` repository-ni import edin
2. Domain kimi `admin.ulustore.com` əlavə edin
3. DNS qeydi:
   ```
   Type: CNAME
   Name: admin
   Value: cname.vercel-dns.com
   ```

---

## 🔑 API KEY VƏ CREDENTIALS / API KEYS AND CREDENTIALS

### Vercel Token (GitHub Actions üçün)

1. **Vercel Dashboard → Settings → Tokens**
2. **"Create Token" basın**
3. **Token adı:** `github-actions-production`
4. **Scope:** Full Account
5. **Token-u kopyalayın** (yalnız bir dəfə göstərilir)

**Hara yazılacaq / Where to add:**
- GitHub Repository → Settings → Secrets → Actions
- Secret adı: `VERCEL_TOKEN`
- Dəyər: Token-u yapışdırın

### Vercel Organization ID

1. **Vercel Dashboard → Settings → General**
2. **Organization ID-ni kopyalayın**

**Hara yazılacaq / Where to add:**
- GitHub Repository → Settings → Secrets → Actions
- Secret adı: `VERCEL_ORG_ID`
- Dəyər: Organization ID-ni yapışdırın

### Vercel Project ID

1. **Proyekt → Settings → General**
2. **Project ID-ni kopyalayın**

**Hara yazılacaq / Where to add:**
- GitHub Repository → Settings → Secrets → Actions
- Secret adı: `VERCEL_PROJECT_ID`
- Dəyər: Project ID-ni yapışdırın

---

## ⚙️ ENVIRONMENT VARIABLES / MÜHİT DƏYİŞƏNLƏRİ

### Vercel-də Environment Variables Əlavə Edin

1. **Proyekt → Settings → Environment Variables**

2. **Production environment üçün əlavə edin:**

   ```
   NODE_ENV=production
   NEXTAUTH_URL=https://ulustore.com
   NEXT_PUBLIC_APP_URL=https://ulustore.com
   NEXT_PUBLIC_SELLER_URL=https://seller.ulustore.com
   NEXT_PUBLIC_COURIER_URL=https://courier.ulustore.com
   NEXT_PUBLIC_ADMIN_URL=https://admin.ulustore.com
   ```

3. **Digər environment variables:**
   - Bütün API key-ləri və connection string-ləri burada əlavə edin
   - Hər servisin setup guide-ında detallar var

---

## 📝 KONFİQURASİYA FAYLLARI / CONFIGURATION FILES

### `vercel.json` (Mövcuddur)

Bu fayl artıq konfiqurasiya edilib. Yoxlayın:
- Domain URL-ləri düzgündür
- Cron jobs konfiqurasiya edilib
- Function limits təyin edilib

**Fayl yolu / File path:** `yusu-ecommerce/vercel.json`

---

## ✅ TEST / TEST

### Deployment Test

1. **GitHub-a push edin:**
   ```bash
   git push origin main
   ```

2. **Vercel Dashboard-da deployment status-u yoxlayın**

3. **Domain-i test edin:**
   - https://ulustore.com
   - https://seller.ulustore.com
   - https://courier.ulustore.com
   - https://admin.ulustore.com

---

## 📚 ƏLAVƏ MƏLUMAT / ADDITIONAL INFORMATION

- **Vercel Documentation:** https://vercel.com/docs
- **Domain Setup:** https://vercel.com/docs/concepts/projects/domains
- **Environment Variables:** https://vercel.com/docs/concepts/projects/environment-variables
- **GitHub Integration:** https://vercel.com/docs/concepts/git

---

## 🔒 TƏHLÜKƏSİZLİK / SECURITY

- ⚠️ Vercel token-u git-də commit etməyin
- ⚠️ Token-u yalnız GitHub Secrets-də saxlayın
- ⚠️ Token-u müntəzəm olaraq rotate edin

---

**Son Yeniləmə / Last Update:** 2025-01-28

