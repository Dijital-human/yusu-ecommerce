# Search Engine Integration Guide / Axtarış Mühərriki İnteqrasiya Bələdçisi

## 📋 Ümumi Məlumat / Overview

Bu sənəd Meilisearch axtarış mühərriki inteqrasiyasını izah edir. Sistem full-text search, fuzzy matching, və advanced filtering dəstəkləyir.

This document explains the Meilisearch search engine integration. The system supports full-text search, fuzzy matching, and advanced filtering.

---

## 🔧 Konfiqurasiya / Configuration

### Environment Variables

```env
# Search Engine Configuration / Axtarış Mühərriki Konfiqurasiyası
SEARCH_ENGINE_ENABLED="true"
MEILISEARCH_HOST="http://localhost:7700"
MEILISEARCH_API_KEY="your-api-key"  # Optional for production / Production üçün istəyə bağlı
SEARCH_INDEX_BATCH_SIZE="100"
```

### Meilisearch Setup

1. **Docker ilə:**
   ```bash
   docker run -d \
     -p 7700:7700 \
     -v $(pwd)/meili_data:/meili_data \
     getmeili/meilisearch:latest
   ```

2. **Manual install:**
   ```bash
   curl -L https://install.meilisearch.com | sh
   ./meilisearch
   ```

---

## 📡 API Endpoints

### 1. Search Products / Məhsulları Axtar

**GET** `/api/search`

**Query Parameters:**
- `q` - Search query (required) / Axtarış sorğusu (tələb olunur)
- `page` - Page number (default: 1) / Səhifə nömrəsi (default: 1)
- `limit` - Results per page (default: 12) / Səhifədə nəticə sayı (default: 12)
- `sortBy` - Sort field: `relevance`, `price`, `rating`, `createdAt` (default: `relevance`)
- `sortOrder` - Sort order: `asc`, `desc` (default: `desc`)
- `category` - Category ID filter / Kateqoriya ID filtri
- `minPrice` - Minimum price / Minimum qiymət
- `maxPrice` - Maximum price / Maksimum qiymət
- `rating` - Minimum rating / Minimum reytinq
- `inStock` - Filter in-stock products only / Yalnız stokda olan məhsulları filtrlə

**Example:**
```bash
GET /api/search?q=laptop&page=1&limit=12&sortBy=price&minPrice=100&maxPrice=1000
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "product-id",
      "name": "Product Name",
      "description": "Product description",
      "price": 99.99,
      "images": ["image1.jpg"],
      "category": { "id": "cat-id", "name": "Category" },
      "seller": { "id": "seller-id", "name": "Seller" },
      "stock": 10,
      "rating": 4.5,
      "reviewCount": 20
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 100,
    "totalPages": 9
  }
}
```

---

### 2. Search Suggestions / Axtarış Təklifləri

**GET** `/api/search/suggestions`

**Query Parameters:**
- `q` - Search query (min 2 characters) / Axtarış sorğusu (minimum 2 simvol)
- `limit` - Number of suggestions (default: 5) / Təklif sayı (default: 5)

**Example:**
```bash
GET /api/search/suggestions?q=lapt
```

**Response:**
```json
{
  "success": true,
  "data": [
    "laptop",
    "laptop bag",
    "laptop stand"
  ]
}
```

---

### 3. Search Analytics / Axtarış Analitikası

**GET** `/api/search/analytics`

**Query Parameters:**
- `days` - Number of days to analyze (default: 7) / Analiz ediləcək gün sayı (default: 7)
- `limit` - Number of popular searches (default: 10) / Populyar axtarış sayı (default: 10)

**Example:**
```bash
GET /api/search/analytics?days=7&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSearches": 1500,
    "uniqueQueries": 450,
    "avgResultsPerQuery": 25,
    "noResultsQueries": 50,
    "popularSearches": [
      {
        "query": "laptop",
        "count": 120,
        "avgResultsCount": 45
      }
    ]
  }
}
```

**Note:** Admin authentication required / Admin autentifikasiyası tələb olunur

---

### 4. Reindex Products / Məhsulları Yenidən İndekslə

**POST** `/api/search/reindex`

**Request Body:**
```json
{
  "initialize": true,  // Initialize index settings / İndeks tənzimlərini başlat
  "productIds": ["id1", "id2"]  // Optional: specific products / İstəyə bağlı: xüsusi məhsullar
}
```

**Example:**
```bash
POST /api/search/reindex
{
  "initialize": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": 1000,
    "failed": 0,
    "total": 1000,
    "message": "Reindexing completed: 1000 succeeded, 0 failed"
  }
}
```

**Note:** Admin authentication required / Admin autentifikasiyası tələb olunur

---

## 🔍 Search Features / Axtarış Xüsusiyyətləri

### 1. Full-Text Search / Tam Mətn Axtarışı

- Searches in product name, description, category name, and seller name
- Məhsul adı, təsvir, kateqoriya adı və satıcı adında axtarış

### 2. Fuzzy Matching / Fuzzy Uyğunlaşdırma

- Typo tolerance: 1 typo for words ≥4 chars, 2 typos for words ≥8 chars
- Typo tolerantlığı: ≥4 simvol üçün 1 typo, ≥8 simvol üçün 2 typo

### 3. Advanced Filtering / Genişləndirilmiş Filtrləmə

- Category filtering / Kateqoriya filtri
- Price range filtering / Qiymət aralığı filtri
- Rating filtering / Reytinq filtri
- Stock availability filtering / Stok mövcudluğu filtri

### 4. Search Ranking / Axtarış Sıralaması

- Relevance-based ranking / Uyğunluğa əsaslanan sıralama
- Word matching priority / Söz uyğunluğu prioriteti
- Typo tolerance / Typo tolerantlığı
- Proximity matching / Yaxınlıq uyğunlaşdırması

---

## 🔄 Auto-Indexing / Avtomatik İndeksləmə

Məhsullar avtomatik olaraq indekslənir:

1. **Product Created** - Yeni məhsul yaradılanda avtomatik indekslənir
2. **Product Updated** - Məhsul yeniləndikdə avtomatik yenidən indekslənir
3. **Product Deleted** - Məhsul silindikdə avtomatik indeksdən silinir

**Implementation:**
- `src/services/product.service.ts` - Auto-indexing on create/update/delete
- `src/lib/search/search-indexer.ts` - Indexing functions

---

## 📊 Search Analytics / Axtarış Analitikası

Search analytics avtomatik olaraq izlənir:

- Total searches / Ümumi axtarışlar
- Unique queries / Unikal sorğular
- Average results per query / Sorğuya görə orta nəticələr
- No results queries / Nəticəsi olmayan sorğular
- Popular searches / Populyar axtarışlar

**Storage:**
- In-memory cache (24 hours TTL) / Yaddaş cache (24 saat TTL)
- Production-da veritabanında SearchQuery model olmalıdır

---

## 🛠️ Manual Operations / Manual Əməliyyatlar

### Initialize Search Index / Axtarış İndeksini Başlat

```typescript
import { initializeSearchIndex } from '@/lib/search/search-indexer';

await initializeSearchIndex();
```

### Index Single Product / Tək Məhsulu İndekslə

```typescript
import { indexProduct } from '@/lib/search/search-engine';

await indexProduct('product-id');
```

### Batch Index Products / Məhsulları Batch İndekslə

```typescript
import { batchIndexProducts } from '@/lib/search/search-indexer';

const result = await batchIndexProducts(['id1', 'id2'], 100);
// result: { success: 2, failed: 0, total: 2 }
```

### Reindex All Products / Bütün Məhsulları Yenidən İndekslə

```typescript
import { reindexAllProducts } from '@/lib/search/search-engine';

await reindexAllProducts();
```

---

## 🔄 Fallback Behavior / Fallback Davranışı

Əgər search engine aktiv deyilsə və ya uğursuz olarsa:

1. **Search API** - Database fallback istifadə edir (`getProductsWithFilters`)
2. **Suggestions API** - Popular searches cache-dən istifadə edir
3. **Analytics API** - Cache-dən məlumat qaytarır

---

## 📈 Performance / Performans

### Expected Performance / Gözlənilən Performans

- **Search response time:** < 100ms (Meilisearch ilə)
- **Indexing time:** ~1ms per product / Məhsul başına ~1ms
- **Batch indexing:** ~1000 products/second / Saniyədə ~1000 məhsul

### Optimization Tips / Optimizasiya Məsləhətləri

1. **Index Settings** - Searchable, filterable, və sortable attributes düzgün konfiqurasiya edin
2. **Batch Size** - Batch indexing üçün optimal batch size istifadə edin (default: 100)
3. **Cache** - Popular searches cache-də saxlanılır (24 saat TTL)

---

## 🧪 Testing / Test

### Test Search Engine Connection / Axtarış Mühərriki Bağlantısını Test Et

```bash
# Meilisearch health check
curl http://localhost:7700/health
```

### Test Search API / Axtarış API-sini Test Et

```bash
# Search products
curl "http://localhost:3000/api/search?q=laptop&limit=10"

# Get suggestions
curl "http://localhost:3000/api/search/suggestions?q=lapt"
```

### Test Reindexing / Yenidən İndeksləməni Test Et

```bash
# Reindex all products
curl -X POST "http://localhost:3000/api/search/reindex" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"initialize": true}'
```

---

## 📝 Notes / Qeydlər

1. **Production Setup:**
   - Meilisearch server ayrı instance-də işləməlidir
   - API key konfiqurasiya edilməlidir
   - Index settings production-da optimize edilməlidir

2. **Backward Compatibility:**
   - Search engine aktiv deyilsə, database fallback istifadə edilir
   - Bütün mövcud API endpoint-ləri işləməyə davam edir

3. **Future Enhancements:**
   - Search query history veritabanında saxlanılmalıdır
   - Advanced analytics və reporting
   - A/B testing for search ranking

---

## 🔗 Related Documentation / Əlaqəli Dokumentasiya

- [API Versioning](./API_VERSIONING.md)
- [Event-Driven Architecture](./EVENT_BUS.md)
- [Cache Strategy](./CACHE_STRATEGY.md)

