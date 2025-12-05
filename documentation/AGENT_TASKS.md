# AGENT ÜÇÜN TAPŞIRIQLAR / AGENT TASKS
## Addım-Addım Tətbiq və Test Planı

**Tarix / Date:** 2025-01-27  
**Status:** Hazırlanıb / Ready

---

## 📋 TAPŞIRIQLAR / TASKS

### 🔴 Prioritet 1: Performans və Optimizasiya

---

## FASE 11: DATABASE OPTIMIZATION (Prioritet 1)

### Tapşırıq 11.1: N+1 Query Problem-ləri Həll Et ✅

**Məqsəd:** Query helper-lərdə N+1 problem-ləri aradan qaldır

**Tamamlanan Addımlar:**
1. ✅ `src/lib/db/selectors.ts` faylını yenilədi
   - `orderIncludeBasic` - product-un category və seller məlumatlarını əlavə etdi
   - `orderIncludeDetailed` - product-un category və seller məlumatlarını əlavə etdi
2. ✅ `src/lib/db/queries/order-queries.ts` faylını yoxladı
   - `getOrderWithDetailed()` funksiyasında bütün lazımi relation-lar include edilib
   - Order items, products, users üçün eager loading tətbiq edilib
3. ✅ `src/services/order.service.ts` faylını yoxladı
   - `getUserOrders()` funksiyasında `orderIncludeBasic` istifadə edir (eager loading)
   - Order items və products üçün eager loading tətbiq edilib
4. ✅ Build test: Uğurla tamamlandı

**Dəyişikliklər:**
- `orderIncludeBasic` - product-un category və seller məlumatlarını əlavə etdi (N+1 problemi həll edildi)
- `orderIncludeDetailed` - product-un category və seller məlumatlarını əlavə etdi (N+1 problemi həll edildi)

**Test Addımları:**
1. **Manual Test:**
   ```bash
   # Product queries test
   # GET /api/products - Query sayını yoxla
   # Database log-larına bax və query sayını say
   
   # Order queries test
   # GET /api/orders - Query sayını yoxla
   # Database log-larına bax və query sayını say
   ```

2. **Performance Test:**
   ```bash
   # Prisma query logging aktiv et
   # src/lib/db/index.ts faylında:
   # log: ['query', 'info', 'warn', 'error']
   
   # Sonra API endpoint-ləri çağır və query sayını yoxla
   ```

3. **Expected Results:**
   - `getProductsWithFilters()` - 1-2 query (əvvəl 10+ query)
   - `getOrderWithDetailed()` - 1-2 query (əvvəl 5+ query)
   - `getUserOrders()` - 1-2 query (əvvəl N+1 query)

**Gözlənilən nəticə:** Query sayı 50-70% azalmalıdır

---

### Tapşırıq 11.2: Eager Loading Strategy ✅

**Məqsəd:** Bütün query helper-lərdə eager loading tətbiq et

**Tamamlanan Addımlar:**
1. ✅ `src/lib/db/selectors.ts` faylını yoxladı
   - `productIncludeBasic` - category, seller, reviews relation-ları artıq var
   - `orderIncludeBasic` - items, customer, seller relation-ları artıq var (11.1-də yeniləndi)
2. ✅ `src/lib/db/queries/product-queries.ts` faylını yoxladı
   - `getProductById()` funksiyasında bütün lazımi relation-lar include edilib
   - `getProductsWithFilters()` funksiyasında `productIncludeBasic` istifadə edir (eager loading)
3. ✅ `src/lib/db/queries/order-queries.ts` faylını yenilədi
   - `getOrderDetailsForEmail()` - product-un category və seller məlumatlarını əlavə etdi
   - `getOrderForTracking()` - product-un category və seller məlumatlarını əlavə etdi
   - Bütün order query funksiyalarında eager loading tətbiq edildi
4. ✅ Build test: Uğurla tamamlandı

**Dəyişikliklər:**
- `getOrderDetailsForEmail()` - product-un category və seller məlumatlarını əlavə etdi (eager loading)
- `getOrderForTracking()` - product-un category və seller məlumatlarını əlavə etdi (eager loading)

**Test Addımları:**
1. **Before/After Comparison:**
   ```bash
   # Əvvəl query time ölç
   # GET /api/products/[id] - Response time ölç
   # GET /api/orders/[id] - Response time ölç
   
   # Sonra eager loading tətbiq et və yenidən ölç
   ```

2. **Database Query Analysis:**
   ```bash
   # Prisma Studio-da query-ləri yoxla
   # npx prisma studio
   # Query execution plan-ı yoxla
   ```

3. **Expected Results:**
   - Product query time: 50-70% azalma
   - Order query time: 50-70% azalma
   - Response time: 40-60% azalma

**Gözlənilən nəticə:** Query time 50-70% azalmalıdır

---

### Tapşırıq 11.3: Query Batching ✅

**Məqsəd:** Çoxlu query-ləri batch-lərə böl

**Tamamlanan Addımlar:**
1. ✅ `src/lib/db/queries/batch-queries.ts` faylı yaradıldı
   - `batchGetProducts(ids: string[], includeReviews?: boolean)` funksiyası yaradıldı
   - `batchGetOrders(ids: string[], includeDetailed?: boolean)` funksiyası yaradıldı
   - `batchGetUsers(ids: string[])` funksiyası yaradıldı
   - Bütün funksiyalar eager loading istifadə edir və input ID-lərinin sırasını saxlayır
2. ✅ Service layer-lərdə batch query-ləri istifadə edildi
   - `src/lib/recommendations/recommendation-engine.ts` - `batchGetProducts()` istifadə edir
   - `getFrequentlyBoughtTogether()` funksiyasında batch query tətbiq edildi
3. ✅ Build test: Uğurla tamamlandı

**Dəyişikliklər:**
- `src/lib/db/queries/batch-queries.ts` - Yeni batch query helper faylı yaradıldı
- `src/lib/recommendations/recommendation-engine.ts` - `batchGetProducts()` istifadə edir (10 query → 1 query)

**Test Addımları:**
1. **Batch Query Test:**
   ```typescript
   // Test script yarat: src/scripts/test-batch-queries.ts
   // 10 product ID ilə test et
   // Query sayını və time-ı ölç
   ```

2. **Performance Comparison:**
   ```bash
   # Əvvəl: 10 ayrı query = 10x query time
   # Sonra: 1 batch query = 1x query time
   # Performance artımını hesabla
   ```

3. **Expected Results:**
   - Batch query: 60-80% daha sürətli
   - Query sayı: 90% azalma (10 query → 1 query)

**Gözlənilən nəticə:** Batch query-lər 60-80% daha sürətli olmalıdır

---

### Tapşırıq 11.4: Database Connection Pooling Optimization ✅

**Məqsəd:** Prisma connection pool parametrlərini optimizasiya et

**Tamamlanan Addımlar:**
1. ✅ `src/lib/db.ts` faylı yeniləndi
   - `getConnectionPoolConfig()` funksiyası əlavə edildi
   - Connection pool parametrləri environment variables-dan oxunur
   - Default dəyərlər: connectionLimit=10, poolTimeout=10, connectTimeout=5
2. ✅ Connection pool monitoring funksiyaları əlavə edildi
   - `getConnectionPoolMetrics()` - Connection pool metrikalarını alır
   - `optimizeDatabaseUrl()` - DATABASE_URL-i connection pool parametrləri ilə optimizasiya edir
3. ✅ Environment variable faylları yeniləndi
   - `env.example` - Connection pool parametrləri əlavə edildi
   - `env.production.example` - Production üçün connection pool parametrləri əlavə edildi (connectionLimit=20)
4. ✅ Health check endpoint yeniləndi
   - `src/app/api/health/route.ts` - Connection pool metrics əlavə edildi
   - Health check endpoint connection pool metrikalarını qaytarır
5. ✅ Build test: Uğurla tamamlandı

**Dəyişikliklər:**
- `src/lib/db.ts` - Connection pool konfiqurasiyası və monitoring funksiyaları əlavə edildi
- `src/app/api/health/route.ts` - Connection pool metrics health check-ə əlavə edildi
- `env.example` və `env.production.example` - Connection pool parametrləri əlavə edildi

**Test Addımları:**
1. **Connection Pool Monitoring:**
   ```bash
   # Database connection sayını izlə
   # PostgreSQL-də:
   # SELECT count(*) FROM pg_stat_activity WHERE datname = 'your_database';
   ```

2. **Load Test:**
   ```bash
   # Concurrent request-lər göndər
   # Connection pool-un düzgün işlədiyini yoxla
   # Max connection limit-ə çatıb-çatmadığını yoxla
   ```

3. **Expected Results:**
   - Connection pool: Optimal istifadə
   - Connection errors: 0
   - Connection wait time: Minimum

**Gözlənilən nəticə:** Connection pool daha səmərəli işləməlidir

---

## FASE 10: ADVANCED CACHING STRATEGY (Prioritet 1)

### Tapşırıq 10.1: Cache Warming Strategy ✅

**Məqsəd:** Əsas məlumatları proaktiv cache-lə

**Tamamlanan Addımlar:**
1. ✅ `src/lib/cache/cache-warmer.ts` faylı yaradıldı
   - `warmProductCache()` funksiyası yaradıldı - populyar, yeni və ən yüksək reytinqli məhsulları cache edir
   - `warmCategoryCache()` funksiyası yaradıldı - bütün kateqoriyaları və ana kateqoriyaları cache edir
   - `warmPopularProductsCache()` funksiyası yaradıldı - recommendation engine istifadə edərək populyar məhsulları cache edir
   - `warmAllCaches()` funksiyası yaradıldı - bütün cache-ləri hərtərəfli istiləşdirir
2. ✅ Cache warming API endpoint yaradıldı
   - `src/app/api/cache/warm/route.ts` - POST və GET metodları ilə cache warming endpoint-i
   - POST: Cache-i istiləşdirir (type parametri ilə: all, products, categories, popular)
   - GET: Cache statusunu yoxlayır
3. ✅ Build test: Uğurla tamamlandı

**Dəyişikliklər:**
- `src/lib/cache/cache-warmer.ts` - Cache warming funksiyaları yaradıldı
- `src/app/api/cache/warm/route.ts` - Cache warming API endpoint yaradıldı

**İstifadə:**
```bash
# Cache-i istiləşdir
POST /api/cache/warm?type=all&productLimit=50&popularLimit=20

# Cache statusunu yoxla
GET /api/cache/warm
```

**Scheduled Cache Warming:**
- Cron job və ya scheduled task ilə `/api/cache/warm` endpoint-ini çağırmaq olar
- Vercel Cron Jobs və ya digər scheduler-lər istifadə edilə bilər

**Test Addımları:**
1. **Cache Warming Test:**
   ```bash
   # Application start-dan sonra cache-də nələrin olduğunu yoxla
   # Redis-də:
   # redis-cli
   # KEYS product:*
   # KEYS category:*
   ```

2. **Cache Hit Rate Test:**
   ```bash
   # 100 request göndər
   # Cache hit/miss sayını hesabla
   # Hit rate = (hits / total) * 100
   ```

3. **Expected Results:**
   - Cache warming: Startup-da cache doldurulur
   - Cache hit rate: 90%+
   - Response time: Cache hit-də 80-90% azalma

**Gözlənilən nəticə:** Cache hit rate 90%+ olmalıdır

---

### Tapşırıq 10.2: Smart Cache Invalidation ✅

**Məqsəd:** Cache invalidation-u avtomatik və ağıllı et

**Tamamlanan Addımlar:**
1. ✅ `src/lib/cache/cache-invalidator.ts` faylı yaradıldı
   - `invalidateProductCache(productId: string)` funksiyası yaradıldı - məhsul cache-ini və əlaqəli cache-ləri ləğv edir
   - `invalidateCategoryCache(categoryId: string)` funksiyası yaradıldı - kateqoriya cache-ini və uşaq/ana kateqoriya cache-lərini ləğv edir
   - `invalidateOrderCache(orderId: string, userId?: string)` funksiyası yaradıldı - sifariş cache-ini ləğv edir
   - `invalidateUserCache(userId: string)` funksiyası yaradıldı - istifadəçi cache-ini ləğv edir
   - `invalidateRelatedCaches(resourceType, resourceId, additionalContext?)` funksiyası yaradıldı - əlaqəli cache-ləri ağıllı şəkildə ləğv edir
   - `invalidateAllCaches()` funksiyası yaradıldı - bütün cache-ləri ləğv edir
2. ✅ Service layer-lərdə cache invalidation tətbiq edildi
   - `src/services/product.service.ts` - product create/update/delete-də smart cache invalidation istifadə edir
   - `src/services/category.service.ts` - category create/update/delete-də smart cache invalidation istifadə edir
   - `src/services/order.service.ts` - order create/update-də smart cache invalidation istifadə edir
3. ✅ Build test: Uğurla tamamlandı

**Dəyişikliklər:**
- `src/lib/cache/cache-invalidator.ts` - Smart cache invalidation funksiyaları yaradıldı
- `src/services/product.service.ts` - Smart cache invalidator istifadə edir
- `src/services/category.service.ts` - Smart cache invalidator istifadə edir
- `src/services/order.service.ts` - Smart cache invalidator istifadə edir

**Xüsusiyyətlər:**
- Ağıllı cache invalidation - əlaqəli cache-ləri avtomatik tapır və ləğv edir
- Parent/child category cache invalidation - ana və uşaq kateqoriya cache-ləri də ləğv edilir
- Product-category relationship handling - məhsul kateqoriyası dəyişəndə həm köhnə həm də yeni kateqoriya cache-ləri ləğv edilir

**Test Addımları:**
1. **Cache Invalidation Test:**
   ```bash
   # 1. Product cache-lə
   # GET /api/products - Cache-də saxla
   
   # 2. Product update et
   # PUT /api/products/[id] - Cache invalidate olmalıdır
   
   # 3. Product get et
   # GET /api/products/[id] - Yeni data cache-dən gəlməlidir
   ```

2. **Cache Consistency Test:**
   ```bash
   # Product update-dən sonra cache-də köhnə data qalıb-qalmadığını yoxla
   # Redis-də:
   # GET product:123
   # Yeni data olmalıdır
   ```

3. **Expected Results:**
   - Cache invalidation: 100% accuracy
   - Cache consistency: 100%
   - Stale data: 0%

**Gözlənilən nəticə:** Cache consistency 100% olmalıdır

---

### Tapşırıq 10.3: Cache Hit Rate Monitoring ✅

**Məqsəd:** Cache performance-ı izlə

**Tamamlanan Addımlar:**
1. ✅ `src/lib/cache/cache-metrics.ts` faylı yaradıldı
   - `CacheMetricsStore` sinifi yaradıldı - cache hit/miss counter-ləri və performance metrikaları toplayır
   - `recordCacheHit()`, `recordCacheMiss()`, `recordCacheError()`, `recordCacheEviction()` funksiyaları
   - `getCacheMetrics()`, `getCacheMetricsSummary()`, `resetCacheMetrics()` funksiyaları
   - Response time tracking - son 1000 nümunəni saxlayır və orta hesablayır
2. ✅ Cache wrapper-da metrics tracking əlavə edildi
   - `src/lib/cache/cache-wrapper.ts` - `get()` funksiyasında metrics tracking əlavə edildi
   - Hər cache get əməliyyatında hit/miss və response time qeyd edilir
3. ✅ Monitoring endpoint yaradıldı
   - `src/app/api/monitoring/cache/route.ts` - GET və POST metodları ilə cache monitoring endpoint-i
   - GET: Cache metrikalarını qaytarır (summary və ya full metrics)
   - POST: Cache metrikalarını sıfırlayır (admin tələb olunur)
   - Redis info dəstəyi - Redis stats və memory məlumatlarını göstərir
4. ✅ Build test: Uğurla tamamlandı

**Dəyişikliklər:**
- `src/lib/cache/cache-metrics.ts` - Cache metrics tracking sistemi yaradıldı
- `src/lib/cache/cache-wrapper.ts` - Metrics tracking əlavə edildi
- `src/app/api/monitoring/cache/route.ts` - Cache monitoring API endpoint yaradıldı

**Metrikalar:**
- Hit rate: Cache hit faizi
- Miss rate: Cache miss faizi
- Total requests: Ümumi sorğu sayı
- Average response time: Orta response time
- Cache size: Cache ölçüsü
- Evictions: Cache eviction sayı
- Errors: Cache xəta sayı

**İstifadə:**
```bash
# Cache metrikalarını al
GET /api/monitoring/cache

# Yalnız xülasə
GET /api/monitoring/cache?summary=true

# Metrikaları sıfırla (admin tələb olunur)
POST /api/monitoring/cache/reset
```

**Test Addımları:**
1. **Metrics Collection Test:**
   ```bash
   # 100 request göndər
   # GET /api/monitoring/cache - Metrics yoxla
   # Hit rate, miss rate, total requests
   ```

2. **Real-time Monitoring Test:**
   ```bash
   # Dashboard-da real-time metrics görünməlidir
   # Cache hit rate real-time update olmalıdır
   ```

3. **Expected Results:**
   - Metrics collection: 100% accuracy
   - Real-time updates: Working
   - Dashboard: Functional

**Gözlənilən nəticə:** Cache hit rate real-time izlənir

---

## FASE 12: MONITORING & OBSERVABILITY (Prioritet 1)

### Tapşırıq 12.1: Distributed Tracing (OpenTelemetry) ✅

**Məqsəd:** Request tracing tətbiq et

**Tamamlanan Addımlar:**
1. ✅ OpenTelemetry package-ləri quraşdırıldı
   - `@opentelemetry/api`, `@opentelemetry/sdk-node`, `@opentelemetry/instrumentation-http`, `@opentelemetry/instrumentation-fetch`, `@opentelemetry/exporter-trace-otlp-http` quraşdırıldı
2. ✅ `src/lib/monitoring/tracing.ts` faylı yaradıldı
   - `initializeTracing()`, `shutdownTracing()`, `getTracer()` funksiyaları
   - `traceFunction()`, `traceDatabaseQuery()`, `traceCacheOperation()`, `traceServiceCall()` helper funksiyaları
   - `getCurrentSpan()`, `addSpanAttributes()`, `recordSpanException()` funksiyaları
3. ✅ `src/instrumentation.ts` faylı yaradıldı
   - Next.js instrumentation hook - tətbiq başladıqda tracing-i avtomatik işə salır
4. ✅ API route-larda tracing tətbiq edildi
   - `src/app/api/products/route.ts` - GET və POST metodlarında tracing əlavə edildi
   - `traceFunction()` istifadə edilərək span-lar yaradılır
5. ✅ Build test: Uğurla tamamlandı

**Dəyişikliklər:**
- `src/lib/monitoring/tracing.ts` - Distributed tracing utility yaradıldı
- `src/instrumentation.ts` - Next.js instrumentation hook yaradıldı
- `src/app/api/products/route.ts` - Tracing tətbiq edildi
- `src/lib/api/tracing-middleware.ts` - Tracing middleware helper yaradıldı (istifadə üçün hazırdır)

**Konfiqurasiya:**
- Environment variables:
  - `OTEL_ENABLED=true` - Tracing-i aktivləşdirir
  - `OTEL_SERVICE_NAME=yusu-ecommerce` - Service adı
  - `OTEL_EXPORTER_ENDPOINT=http://localhost:4318/v1/traces` - Trace exporter endpoint

**Test Addımları:**
1. **Tracing Test:**
   ```bash
   # Request göndər
   # GET /api/products
   # Trace data-nı yoxla
   # Jaeger və ya Zipkin-də trace görünməlidir
   ```

2. **Trace Completeness Test:**
   ```bash
   # Trace-də bütün span-lar olmalıdır:
   # - HTTP request
   # - Database query
   # - Cache lookup
   # - Service call
   ```

3. **Expected Results:**
   - Tracing: 100% coverage
   - Trace data: Complete
   - Performance: Minimal overhead (<5%)

**Gözlənilən nəticə:** Bütün request-lər trace edilir

---

### Tapşırıq 12.2: APM (Application Performance Monitoring) ✅

**Məqsəd:** Application performance-ı izlə

**Tamamlanan Addımlar:**
1. ✅ APM tool seçimi (Sentry, New Relic, Datadog və s.)
   - `src/lib/monitoring/apm.ts` faylı yaradıldı
   - APMProvider interface yaradıldı
   - InMemoryAPMProvider (fallback) və SentryAPMProvider tətbiq edildi
   - New Relic və Datadog provider-ləri üçün TODO qeyd edildi
2. ✅ Critical path-lərdə APM tətbiq edildi
   - `src/app/api/orders/route.ts` - POST metodunda APM tracking əlavə edildi
   - `src/app/api/payment/create-intent/route.ts` - POST metodunda APM tracking əlavə edildi
   - Transaction tracking, error tracking, user context tətbiq edildi
3. ✅ `src/instrumentation.ts` - APM initialization əlavə edildi
4. ✅ Environment variables konfiqurasiyası
   - `env.example` və `env.production.example` fayllarına APM konfiqurasiyası əlavə edildi
   - `APM_ENABLED`, `APM_PROVIDER`, `APM_SERVICE_NAME`, `APM_SAMPLE_RATE` environment variables

**Dəyişikliklər:**
- `src/lib/monitoring/apm.ts` - APM utility yaradıldı
- `src/app/api/orders/route.ts` - APM tracking əlavə edildi
- `src/app/api/payment/create-intent/route.ts` - APM tracking əlavə edildi
- `src/instrumentation.ts` - APM initialization əlavə edildi
- `env.example` və `env.production.example` - APM konfiqurasiyası əlavə edildi

**Konfiqurasiya:**
- Environment variables:
  - `APM_ENABLED=true` - APM-i aktivləşdirir
  - `APM_PROVIDER=sentry` - APM provider (sentry, newrelic, datadog, custom, none)
  - `APM_SERVICE_NAME=yusu-ecommerce` - Service adı
  - `APM_SAMPLE_RATE=1.0` - Sample rate (0.0-1.0)

**Test Addımları:**
1. **APM Integration Test:**
   ```bash
   # Critical endpoint-ləri çağır
   # POST /api/orders - APM-də görünməlidir
   # POST /api/payment/create-intent - APM-də görünməlidir
   ```

2. **Performance Metrics Test:**
   ```bash
   # APM-də aşağıdakı metrics görünməlidir:
   # - Response time
   # - Throughput
   # - Error rate
   # - Database query time
   ```

3. **Expected Results:**
   - APM integration: Working
   - Metrics collection: 100%
   - Alert system: Functional

**Gözlənilən nəticə:** Application performance real-time izlənir

---

### Tapşırıq 12.3: Real-time Dashboards ✅

**Məqsəd:** Monitoring dashboard yarat

**Tamamlanan Addımlar:**
1. ✅ `src/app/api/monitoring/dashboard/route.ts` - Dashboard API endpoint yaradıldı
   - Aqreqat metrikaları qaytarır (cache, API, database, Redis, system)
   - Time range dəstəyi (1h, 6h, 24h, 7d, 30d)
   - Paralel metrics collection
2. ✅ `src/app/[locale]/admin/monitoring/page.tsx` - Dashboard UI komponenti yaradıldı
   - Real-time updates (10 saniyədə bir avtomatik yenilənmə)
   - Time range selector
   - Auto refresh toggle
   - System overview cards (products, orders, users, categories)
   - Performance metrics cards (cache, API, database, Redis)
   - Error handling və loading states
3. ✅ Dashboard features:
   - Cache performance metrics (hit rate, requests, response time)
   - API performance metrics (response time, error rate, P95/P99)
   - Database performance metrics (query time, slow queries, connection pool)
   - Redis status və metrics
   - System stats (counts, recent activity)

**Dəyişikliklər:**
- `src/app/api/monitoring/dashboard/route.ts` - Dashboard API endpoint yaradıldı
- `src/app/[locale]/admin/monitoring/page.tsx` - Dashboard UI komponenti yaradıldı
- `src/lib/monitoring/apm.ts` - Sentry import xətası düzəldildi (eval istifadə edilərək)

**Konfiqurasiya:**
- Dashboard URL: `/admin/monitoring`
- Auto refresh interval: 10 saniyə
- Time ranges: 1h, 6h, 24h, 7d, 30d

**Test Addımları:**
1. **Dashboard UI Test:**
   ```bash
   # Dashboard-a daxil ol
   # /admin/monitoring
   # Bütün metrics görünməlidir
   ```

2. **Real-time Updates Test:**
   ```bash
   # Dashboard-da real-time update olmalıdır
   # Metrics 5-10 saniyədə bir yenilənməlidir
   ```

3. **Expected Results:**
   - Dashboard: Functional
   - Real-time updates: Working
   - Metrics accuracy: 100%

**Gözlənilən nəticə:** Real-time monitoring dashboard mövcuddur

---

### Tapşırıq 12.4: Alert System ✅

**Məqsəd:** Alert sistemi yarat

**Tamamlanan Addımlar:**
1. ✅ `src/lib/monitoring/alerts.ts` - Alert sistemi yaradıldı
   - Alert types: api_error_rate, api_response_time, database_query_time, database_connection_pool, cache_hit_rate, cache_response_time
   - Alert severity levels: info, warning, critical
   - Default alert rules (6 qayda)
   - Alert checking interval (60 saniyə default)
   - Alert resolution tracking
2. ✅ `src/app/api/monitoring/alerts/route.ts` - Alert API endpoints yaradıldı
   - GET: Alert-ləri al (activeOnly, limit, check parametrləri ilə)
   - POST: Alert qaydası yarat/yenilə
   - DELETE: Alert qaydasını sil
3. ✅ `src/app/api/monitoring/alerts/[id]/route.ts` - Fərdi alert idarəetməsi
   - GET: Alert qaydasını ID-yə görə al
   - PATCH: Alert-i həll et
4. ✅ `src/instrumentation.ts` - Alert checking başlatıldı
   - Server-side-da alert checking interval başladılır
5. ✅ Environment variables əlavə edildi
   - `ALERT_ENABLED` - Alert sistemi aktivləşdirmək üçün
   - `ALERT_CHECK_INTERVAL` - Alert yoxlama intervalı (millisaniyələrlə)

**Dəyişikliklər:**
- `src/lib/monitoring/alerts.ts` - Alert sistemi yaradıldı
- `src/app/api/monitoring/alerts/route.ts` - Alert API endpoints yaradıldı
- `src/app/api/monitoring/alerts/[id]/route.ts` - Fərdi alert idarəetməsi yaradıldı
- `src/instrumentation.ts` - Alert checking initialize edildi
- `env.example` və `env.production.example` - Alert konfiqurasiya dəyişənləri əlavə edildi

**Konfiqurasiya:**
- Alert checking interval: 60 saniyə (default)
- Alert types: 6 default alert type (API error rate, API response time, database query time, database connection pool, cache hit rate, cache response time)
- Alert severity: info, warning, critical

**Test Addımları:**
1. **Alert System Test:**
   ```bash
   # Alert sistemi işləyir
   # GET /api/monitoring/alerts?check=true
   # Alert-lər düzgün yaradılır
   ```

2. **Alert Rules Test:**
   ```bash
   # Alert qaydaları düzgün işləyir
   # POST /api/monitoring/alerts - Yeni qayda yarat
   # GET /api/monitoring/alerts - Qaydaları al
   # DELETE /api/monitoring/alerts?ruleId=xxx - Qaydanı sil
   ```

3. **Expected Results:**
   - Alert system: Working
   - Alert checking: Running
   - Alert rules: Functional
   - Alert resolution: Working

**Gözlənilən nəticə:** Alert sistemi mövcuddur və işləyir

**Alert Sisteminin İstifadə Yerləri:**
1. ✅ **Avtomatik Alert Checking** - `src/instrumentation.ts`-də başladılır, 60 saniyədə bir metrikaları yoxlayır
2. ✅ **Kritik API Endpoint-lərdə:**
   - `/api/orders` (POST) - Order yaratma xətaları və yüksək response time
   - `/api/payment/create-intent` (POST) - Payment processing xətaları və yüksək response time
3. ✅ **Alert Helper Funksiyaları** - `src/lib/monitoring/alert-helpers.ts` yaradıldı:
   - `triggerAPIErrorAlert()` - API xətaları üçün
   - `triggerAPIResponseTimeAlert()` - Yüksək response time üçün
   - `triggerOrderErrorAlert()` - Order xətaları üçün
   - `triggerPaymentErrorAlert()` - Payment xətaları üçün
   - `triggerDatabaseErrorAlert()` - Database xətaları üçün
   - `triggerDatabaseQueryTimeAlert()` - Yavaş sorğular üçün
   - `triggerCacheAlert()` - Cache problemləri üçün
   - `triggerInventoryAlert()` - Inventory problemləri üçün
4. ✅ **Sənədləşdirmə** - `docs/ALERT_SYSTEM_USAGE.md` yaradıldı

**Əlavə Məlumat:**
- Alert sistemi kritik endpoint-lərdə avtomatik olaraq işləyir
- Alert-lər dashboard-da görüntülənə bilər (`/admin/monitoring`)
- Alert-lər API vasitəsilə idarə edilə bilər (`/api/monitoring/alerts`)
- Alert-lər log edilir və monitoring sisteminə göndərilir

---

## 🟡 Prioritet 2: Arxitektura və Genişlənmə

---

## FASE 8: EVENT-DRIVEN ARCHITECTURE (Prioritet 2)

### Tapşırıq 8.1: Event Bus Yarat

**Məqsəd:** Event-driven architecture əsasını qur

**Addımlar:**
1. `src/lib/events/event-bus.ts` faylı yarat
2. Event type-ləri təyin et
3. Test et: Event bus düzgün işləyir

**Test Addımları:**
1. **Event Bus Functionality Test:**
   ```typescript
   // Test script: src/scripts/test-event-bus.ts
   // Event emit et
   // Event handler çağırıldığını yoxla
   ```

2. **Event Ordering Test:**
   ```bash
   # Event-lərin düzgün sırada işlədiyini yoxla
   # Multiple event emit et
   # Handler-lərin düzgün çağırıldığını yoxla
   ```

3. **Expected Results:**
   - Event emit: Working
   - Event handlers: Called correctly
   - Event ordering: Preserved

**Gözlənilən nəticə:** Event bus sistemi mövcuddur

---

### Tapşırıq 8.2: Order Events

**Məqsəd:** Order əməliyyatları üçün event-lər yarat

**Addımlar:**
1. `src/lib/events/order-events.ts` faylı yarat
2. `src/services/order.service.ts` faylını yenilə
3. Event handler-ləri tətbiq et
4. Test et: Order events düzgün işləyir

**Test Addımları:**
1. **Order Created Event Test:**
   ```bash
   # POST /api/orders - Order yarat
   # order.created event emit olmalıdır
   # Event handler-lər çağırılmalıdır
   ```

2. **Event Handler Test:**
   ```bash
   # Email notification göndərildiyini yoxla
   # Cache invalidation işlədiyini yoxla
   # Analytics update olduğunu yoxla
   ```

3. **Expected Results:**
   - Events: Emitted correctly
   - Handlers: Called correctly
   - Side effects: Working

**Gözlənilən nəticə:** Order əməliyyatları event-driven-dır

---

### Tapşırıq 8.3: Product Events

**Məqsəd:** Product əməliyyatları üçün event-lər yarat

**Addımlar:**
1. `src/lib/events/product-events.ts` faylı yarat
2. `src/services/product.service.ts` faylını yenilə
3. Event handler-ləri tətbiq et
4. Test et: Product events düzgün işləyir

**Test Addımları:**
1. **Product Created Event Test:**
   ```bash
   # POST /api/products - Product yarat
   # product.created event emit olmalıdır
   ```

2. **Cache Invalidation Test:**
   ```bash
   # Product update-dən sonra cache invalidate olmalıdır
   # Search index update olmalıdır
   ```

3. **Expected Results:**
   - Events: Emitted correctly
   - Cache invalidation: Working
   - Search index: Updated

**Gözlənilən nəticə:** Product əməliyyatları event-driven-dır

---

### Tapşırıq 8.4: User Events

**Məqsəd:** User əməliyyatları üçün event-lər yarat

**Addımlar:**
1. `src/lib/events/user-events.ts` faylı yarat
2. `src/services/user.service.ts` faylını yenilə
3. Event handler-ləri tətbiq et
4. Test et: User events düzgün işləyir

**Test Addımları:**
1. **User Registered Event Test:**
   ```bash
   # POST /api/auth/signup - User yarat
   # user.registered event emit olmalıdır
   # Welcome email göndərilməlidir
   ```

2. **Event Handler Test:**
   ```bash
   # Welcome email göndərildiyini yoxla
   # Analytics update olduğunu yoxla
   ```

3. **Expected Results:**
   - Events: Emitted correctly
   - Welcome email: Sent
   - Analytics: Updated

**Gözlənilən nəticə:** User əməliyyatları event-driven-dır

---

## FASE 9: API VERSIONING (Prioritet 2)

### Tapşırıq 9.1: API Versioning Struktur Yarat

**Məqsəd:** API versioning strukturunu qur

**Addımlar:**
1. `src/app/api/v1/` qovluğu yarat
2. Version middleware yarat
3. Default version təyin et
4. Test et: API versioning düzgün işləyir

**Test Addımları:**
1. **Version Routing Test:**
   ```bash
   # GET /api/v1/products - v1 API işləməlidir
   # GET /api/products - Default v1-ə redirect olmalıdır
   ```

2. **Backward Compatibility Test:**
   ```bash
   # Köhnə endpoint-lər işləməlidir
   # GET /api/products - Hələ də işləməlidir
   ```

3. **Expected Results:**
   - Version routing: Working
   - Backward compatibility: Maintained
   - Default version: v1

**Gözlənilən nəticə:** API versioning struktur mövcuddur

---

### Tapşırıq 9.2: Backward Compatibility

**Məqsəd:** Köhnə API versiyalarını dəstəklə

**Addımlar:**
1. Version compatibility layer yarat
2. Response transformation yarat
3. Deprecation warnings əlavə et
4. Test et: Backward compatibility düzgün işləyir

**Test Addımları:**
1. **Response Transformation Test:**
   ```bash
   # Köhnə versiya üçün response format transformation
   # GET /api/v1/products - Yeni format
   # GET /api/products - Köhnə format (transformed)
   ```

2. **Deprecation Warning Test:**
   ```bash
   # Köhnə versiya üçün deprecation header
   # X-API-Deprecated: true
   # X-API-Deprecation-Date: 2025-06-01
   ```

3. **Expected Results:**
   - Response transformation: Working
   - Deprecation warnings: Present
   - Backward compatibility: 100%

**Gözlənilən nəticə:** Köhnə API versiyaları dəstəklənir

---

## 📝 TƏTBİQ QAYDALARI / IMPLEMENTATION RULES

1. **Backward Compatibility:** Bütün dəyişikliklər geri uyğun olmalıdır
2. **Testing:** Hər tapşırıqdan sonra test et
3. **Gradual Migration:** Bir anda bütün kodları dəyişmə, addım-addım
4. **Documentation:** Hər yeni funksiya üçün documentation yaz
5. **Code Review:** Hər dəyişiklik REFACTORING_PLAN.md-dəki qaydalara uyğun olmalıdır

---

## 🎯 TÖVSİYƏ OLUNAN SIRA / RECOMMENDED ORDER

1. **FASE 11.1-11.2:** Database Optimization (N+1 queries, Eager loading) - Ən çox performans təsiri
2. **FASE 10.1-10.2:** Advanced Caching (Cache warming, Smart invalidation) - Performans artımı
3. **FASE 12.1-12.2:** Monitoring (Tracing, APM) - Debugging və monitoring
4. **FASE 8:** Event-Driven Architecture - Scalability
5. **FASE 9:** API Versioning - Backward compatibility

---

## ✅ TAMAMLANMA YOXLAMASI / COMPLETION CHECKLIST

Hər tapşırıqdan sonra:
- [ ] Kod yazıldı və test edildi
- [ ] Build uğurla tamamlandı (`npm run build`)
- [ ] REFACTORING_PLAN.md yeniləndi
- [ ] Documentation əlavə edildi
- [ ] Backward compatibility yoxlanıldı
- [ ] Test addımları yerinə yetirildi
- [ ] Expected results əldə edildi

---

**Qeyd:** Bu tapşırıqlar agent üçün hazırlanıb və addım-addım tətbiq edilə bilər. Hər tapşırıq müstəqil olaraq tətbiq edilə bilər və test edilə bilər.

