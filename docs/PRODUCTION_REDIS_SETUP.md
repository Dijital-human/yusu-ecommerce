# 🔴 Production Redis Setup / Production Redis Quraşdırması

**Tarix / Date:** 2025-01-28  
**Status:** ✅ Hazır / Ready  
**Domain:** `ulustore.com` (Production)

---

## 📋 MƏQSƏD / GOAL

Production mühitində Redis cache konfiqurasiyası və best practices.

---

## 🚀 REDIS INSTANCE SETUP

### Option 1: Vercel Redis (Recommended) / Vercel Redis (Tövsiyə edilir)

Vercel-də Redis instance yaratmaq:

1. Vercel Dashboard → Project Settings → Storage
2. "Create Database" → "Redis"
3. Region seçin (production region-a yaxın)
4. Plan seçin (Production üçün minimum "Pro" plan)

### Option 2: Upstash Redis (Alternative) / Upstash Redis (Alternativ)

1. Upstash Console-da yeni Redis database yaradın
2. Region seçin
3. Connection string-i əldə edin

### Option 3: Self-hosted Redis (Advanced) / Self-hosted Redis (Qabaqcıl)

1. Redis server quraşdırın (Docker və ya native)
2. SSL/TLS konfiqurasiya edin
3. Authentication konfiqurasiya edin
4. Connection string yaradın

---

## 🔧 ENVIRONMENT VARIABLES

Production environment variables əlavə edin:

```bash
# Redis Connection / Redis Bağlantısı
REDIS_URL=redis://default:password@host:port
# və ya
REDIS_URL=rediss://default:password@host:port  # SSL ilə

# Redis Configuration / Redis Konfiqurasiyası
REDIS_ENABLED=true
REDIS_TTL=3600  # Default TTL in seconds / Default TTL saniyələrlə
```

---

## 📝 CACHE KEY NAMING CONVENTION

Cache key-ləri üçün konvensiya:

```
{prefix}:{resource}:{identifier}:{version}
```

Nümunələr:
- `products:list:page:1:limit:12`
- `product:detail:id:123`
- `user:cart:userId:456`
- `categories:all:v1`

---

## 🔄 CACHE INVALIDATION STRATEGY

### Tag-based Invalidation / Tag əsaslı Invalidation

```typescript
// Product cache invalidation / Məhsul cache invalidation
await invalidateCacheByTag('product:123');
await invalidateCacheByTag('products:list');
```

### Time-based Invalidation / Vaxt əsaslı Invalidation

```typescript
// TTL-based expiration / TTL əsaslı expiration
await cache.set('key', value, 3600); // 1 hour / 1 saat
```

### Manual Invalidation / Manual Invalidation

```typescript
// Delete specific cache key / Xüsusi cache key sil
await cache.delete('product:123');
```

---

## ⚡ CACHE WARMING

Cache warming üçün cron job:

```typescript
// Vercel Cron Job / Vercel Cron Job
// vercel.json
{
  "crons": [
    {
      "path": "/api/cache/warm",
      "schedule": "0 */6 * * *"  // Every 6 hours / Hər 6 saatda bir
    }
  ]
}
```

---

## 📊 MONITORING

### Redis Metrics / Redis Metrikaları

- Cache hit rate
- Cache miss rate
- Average response time
- Memory usage
- Connection count

### Monitoring Tools / Monitorinq Alətləri

- Vercel Analytics
- Upstash Console
- Redis CLI monitoring commands

---

## 🔒 SECURITY BEST PRACTICES

1. **Authentication:** Redis password istifadə edin
2. **SSL/TLS:** Production-da `rediss://` istifadə edin
3. **Network:** Redis-i private network-də saxlayın
4. **Access Control:** IP whitelist konfiqurasiya edin

---

## 🧪 TESTING

### Redis Connection Test / Redis Bağlantı Testi

```bash
npm run test:redis
```

### Cache Performance Test / Cache Performans Testi

```bash
npm run test:cache
```

---

## 📚 ƏLAVƏ MƏLUMAT / ADDITIONAL INFORMATION

- **Redis Documentation:** https://redis.io/docs/
- **Vercel Redis:** https://vercel.com/docs/storage/vercel-redis
- **Upstash Redis:** https://docs.upstash.com/redis

---

**Son Yeniləmə / Last Update:** 2025-01-28

