# Production Deployment Checklist / Canlı Sayt Yükləmə Siyahısı

## 1. Domain və Hosting / Domain and Hosting

### Domain Satın Alma / Domain Purchase
- [ ] Domain adı seçin / Choose domain name
- [ ] Domain registrar-də qeydiyyat / Register at domain registrar
- [ ] DNS serverləri yadda saxlayın / Save DNS servers

### Hosting Seçimi / Hosting Choice
- [ ] Vercel (pulsuz, Next.js üçün mükəmməl)
- [ ] DigitalOcean Droplet ($5/ay)
- [ ] AWS EC2 (daha mürəkkəb)
- [ ] VPS provider (Hostinger, Namecheap)

## 2. SSL və Təhlükəsizlik / SSL and Security

### Cloudflare Setup
- [ ] Cloudflare hesabı yaradın / Create Cloudflare account
- [ ] Domain əlavə edin / Add domain
- [ ] DNS qeydləri əlavə edin / Add DNS records
- [ ] SSL aktivləşdirin / Enable SSL

### Let's Encrypt (Alternativ)
- [ ] Certbot quraşdırın / Install Certbot
- [ ] SSL sertifikatı əldə edin / Get SSL certificate
- [ ] Avtomatik yeniləmə quraşdırın / Setup auto-renewal

## 3. Database və Backend / Database and Backend

### Database Seçimi / Database Choice
- [ ] Vercel Postgres (pulsuz)
- [ ] Supabase (pulsuz)
- [ ] PlanetScale (pulsuz)
- [ ] Self-hosted PostgreSQL

### Environment Variables
- [ ] Production environment faylları / Production env files
- [ ] API keys və secrets / API keys and secrets
- [ ] Database connection strings / Database connection strings

## 4. Deployment / Yükləmə

### Vercel Deployment (Ən Asan)
- [ ] Vercel hesabı yaradın / Create Vercel account
- [ ] GitHub repo bağlayın / Connect GitHub repo
- [ ] Environment variables əlavə edin / Add env variables
- [ ] Custom domain əlavə edin / Add custom domain

### VPS Deployment
- [ ] Server quraşdırın / Setup server
- [ ] Docker quraşdırın / Install Docker
- [ ] Nginx quraşdırın / Install Nginx
- [ ] SSL sertifikatı əlavə edin / Add SSL certificate

## 5. Testing və Monitoring / Test və İzləmə

### Functionality Test
- [ ] Bütün səhifələr işləyir / All pages work
- [ ] Subdomain-lər işləyir / Subdomains work
- [ ] SSL işləyir / SSL works
- [ ] Mobile responsive / Mobile responsive

### Performance Test
- [ ] Page speed test / Səhifə sürəti testi
- [ ] Google PageSpeed Insights
- [ ] GTmetrix test
- [ ] Mobile performance test

### SEO Test
- [ ] Google Search Console
- [ ] Meta tags yoxla / Check meta tags
- [ ] Sitemap yaradın / Create sitemap
- [ ] robots.txt əlavə edin / Add robots.txt

## 6. Go Live / Canlıya Çıxma

### Pre-launch
- [ ] Backup yaradın / Create backup
- [ ] Error monitoring quraşdırın / Setup error monitoring
- [ ] Analytics quraşdırın / Setup analytics
- [ ] Contact forms test edin / Test contact forms

### Launch
- [ ] DNS dəyişdirin / Change DNS
- [ ] SSL aktivləşdirin / Enable SSL
- [ ] Google Search Console əlavə edin / Add to GSC
- [ ] Social media linklər / Social media links

### Post-launch
- [ ] Performance monitor edin / Monitor performance
- [ ] User feedback toplayın / Collect user feedback
- [ ] Regular backup / Müntəzəm backup
- [ ] Security updates / Təhlükəsizlik yeniləmələri

## 7. Budget / Büdcə

### Minimum (Pulsuz)
- Domain: $10-15/il
- Hosting: Pulsuz (Vercel)
- SSL: Pulsuz (Cloudflare)
- **Ümumi: $10-15/il**

### Recommended (Tövsiyə Edilən)
- Domain: $10-15/il
- Hosting: $5-20/ay
- SSL: Pulsuz (Cloudflare)
- **Ümumi: $70-255/il**

### Premium (Premium)
- Domain: $10-15/il
- Hosting: $20-50/ay
- CDN: $5-20/ay
- Monitoring: $10-30/ay
- **Ümumi: $420-1140/il**
