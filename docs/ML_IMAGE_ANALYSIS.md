# ML Image Analysis System / ML Rəsim Analizi Sistemi

## Overview / Ümumi Baxış

Bu sistem öz ML modelimizlə rəsim analizi və vizual axtarış funksionallığını təmin edir. Sistem TensorFlow.js və MobileNet pre-trained model istifadə edərək rəsimlərdən embeddings çıxarır və oxşar məhsulları tapmaq üçün vector similarity search istifadə edir.

This system provides image analysis and visual search functionality using our custom ML model. The system uses TensorFlow.js and MobileNet pre-trained model to extract embeddings from images and uses vector similarity search to find similar products.

## Architecture / Arxitektura

```
┌─────────────────┐
│   API Endpoints │
│  /api/ml/*      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Visual Search   │
│   Service       │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌─────────┐ ┌──────────────┐
│ Image   │ │ Vector       │
│Classifier│ │ Search       │
└────┬────┘ └──────┬───────┘
     │             │
     ▼             ▼
┌─────────┐ ┌──────────────┐
│Embeddings│ │ Redis Cache  │
│ Service  │ │              │
└─────────┘ └──────────────┘
```

## Components / Komponentlər

### 1. Image Classifier (`src/lib/ml/image-classifier.ts`)

MobileNet pre-trained model istifadə edərək rəsimləri analiz edir və xüsusiyyətləri çıxarır.

**Features / Xüsusiyyətlər:**
- Pre-trained MobileNet v2 model
- Image preprocessing (resize, normalize)
- Feature extraction (embeddings)
- Label detection (object classification)
- Dominant color extraction
- Lazy loading (model yalnız lazım olduqda yüklənir)
- Singleton pattern (model bir dəfə yüklənir)

**Usage / İstifadə:**

#### Frontend Test (Search Səhifəsində) / Frontend Test (Search Page)

Search səhifəsində kamera butonuna klik edib rəsim çəkəndə, rəsim avtomatik analiz edilir və nəticələr browser console-da göstərilir:

1. Search səhifəsinə get (`/search`)
2. Kamera butonuna klik et
3. Rəsim çək və ya galeriyadan yüklə
4. Browser console-u aç (F12)
5. Console-da nəticələri gör

**Console Output / Console Çıxışı:**
```
🔍 Rəsim analizi başladı...
📤 API-yə sorğu göndərilir...
✅ Rəsim Analizi Nəticələri:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Labels (Nə olduğu): [...]
🎯 Objects (Obyektlər): [...]
🎨 Dominant Colors (Rənglər): [...]
⏱️ Processing Time: 234ms
🤖 Model Version: mobilenet_v2_1.0_224
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Top Labels:
  1. cat - 95.0%
  2. pet - 87.3%
  ...

🎯 Detected Objects:
  1. cat - 95.0% confidence
  2. pet - 87.3% confidence
  ...

🎨 Dominant Colors:
  1. rgb(255, 128, 64)
  ...

✨ Analiz tamamlandı!
```

#### Programmatic Usage / Proqramatik İstifadə

```typescript
import { getImageClassifier, isMLModelEnabled } from '@/lib/ml/image-classifier';

if (isMLModelEnabled()) {
  const classifier = getImageClassifier();
  const features = await classifier.extractFeatures(imageBuffer);
  
  console.log(features.labels);      // [{ className: 'cat', probability: 0.95 }, ...]
  console.log(features.embeddings);  // [0.123, -0.456, ...]
  console.log(features.dominantColors); // ['rgb(255, 128, 64)', ...]
  console.log(features.objects);    // [{ name: 'cat', confidence: 0.95 }, ...]
}
```

### 2. Image Embeddings (`src/lib/ml/image-embeddings.ts`)

Embeddings çıxarma, cache-ləmə və saxlama funksionallığını təmin edir.

**Features / Xüsusiyyətlər:**
- Embedding extraction from image buffer or URL
- Redis cache integration (24-hour TTL)
- Embedding normalization (L2 normalization)
- Cache hit/miss tracking

**Usage / İstifadə:**
```typescript
import { getOrExtractEmbeddings, extractImageEmbeddings } from '@/lib/ml/image-embeddings';

// Extract with cache / Cache ilə çıxar
const { embedding, cached } = await getOrExtractEmbeddings(imageUrl);

// Extract directly / Birbaşa çıxar
const embedding = await extractImageEmbeddings(imageBuffer);
```

### 3. Vector Search (`src/lib/ml/vector-search.ts`)

Embeddings arasında similarity search funksionallığını təmin edir.

**Features / Xüsusiyyətlər:**
- Cosine similarity calculation
- Euclidean distance calculation
- Top-K similar items search
- Batch similarity search

**Usage / İstifadə:**
```typescript
import { findTopKSimilar, cosineSimilarity } from '@/lib/ml/vector-search';

// Find top 10 similar products / Top 10 oxşar məhsul tap
const similarItems = findTopKSimilar(
  queryEmbedding,
  productEmbeddings,
  10,      // k
  0.5,     // minSimilarity
  true     // useCosine
);

// Calculate similarity between two embeddings / İki embedding arasında oxşarlıq hesabla
const similarity = cosineSimilarity(embedding1, embedding2);
```

### 4. Visual Search Service (`src/lib/search/visual-search.ts`)

ML model və vector search istifadə edərək rəsim ilə məhsul axtarışı təmin edir.

**Features / Xüsusiyyətlər:**
- Image feature extraction
- Product similarity search
- Category filtering
- Fallback to label-based search

**Usage / İstifadə:**
```typescript
import { searchProductsByImage, indexProductImage } from '@/lib/search/visual-search';

// Search products by image / Rəsim ilə məhsulları axtar
const results = await searchProductsByImage({
  imageUrl: 'https://example.com/image.jpg',
  maxResults: 20,
  minSimilarity: 0.5,
  categoryId: 'category-id'
});

// Index product image / Məhsul rəsimini indekslə
await indexProductImage(productId, imageUrl);
```

## API Endpoints / API Endpoint-ləri

### 1. Image Analysis API

**POST** `/api/ml/image-analysis`

Rəsimi analiz edir və xüsusiyyətləri çıxarır.

**Request / Sorğu:**
```typescript
FormData {
  image?: File;        // Image file / Rəsim faylı
  imageUrl?: string;   // Image URL / Rəsim URL-i
}
```

**Response / Cavab:**
```json
{
  "success": true,
  "data": {
    "features": {
      "labels": [
        { "className": "cat", "probability": 0.95 }
      ],
      "embeddings": [0.123, -0.456, ...],
      "dominantColors": ["rgb(255, 128, 64)"],
      "objects": [
        { "name": "cat", "confidence": 0.95 }
      ]
    },
    "processingTime": 234,
    "modelVersion": "mobilenet_v2_1.0_224"
  }
}
```

**GET** `/api/ml/image-analysis`

ML model statusunu qaytarır.

**Response / Cavab:**
```json
{
  "success": true,
  "data": {
    "enabled": true,
    "ready": true,
    "modelVersion": "mobilenet_v2_1.0_224"
  }
}
```

### 2. Image Search API

**POST** `/api/ml/image-search`

Rəsim ilə məhsulları axtarır.

**Request / Sorğu:**
```typescript
FormData {
  image?: File;
  imageUrl?: string;
  maxResults?: number;      // Default: 20
  minSimilarity?: number;   // Default: 0.5 (0-1)
  categoryId?: string;
}
```

**Response / Cavab:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "productId": "product-id",
        "similarity": 0.87,
        "confidence": 0.87,
        "matchedFeatures": ["cat", "pet", "animal"]
      }
    ],
    "count": 10,
    "mlModelEnabled": true
  }
}
```

### 3. Embeddings API

**POST** `/api/ml/embeddings`

Rəsimdən embeddings çıxarır.

**Request / Sorğu:**
```typescript
FormData {
  image?: File;
  imageUrl?: string;
  useCache?: boolean;  // Default: false
}
```

**Response / Cavab:**
```json
{
  "success": true,
  "data": {
    "embedding": [0.123, -0.456, ...],
    "dimension": 128,
    "cached": false
  }
}
```

## Configuration / Konfiqurasiya

### Environment Variables / Mühit Dəyişənləri

```bash
# Enable ML model / ML modeli aktivləşdir
ML_MODEL_ENABLED="true"

# Model type / Model növü
ML_MODEL_TYPE="mobilenet"

# Embedding dimension / Embedding ölçüsü
ML_EMBEDDING_DIMENSION="128"

# Enable embedding cache / Embedding cache aktivləşdir
ML_CACHE_ENABLED="true"

# Visual search / Vizual axtarış
VISUAL_SEARCH_ENABLED="true"
VISUAL_SEARCH_PROVIDER="custom"
```

## Auto-Indexing / Avtomatik İndeksləmə

Sistem avtomatik olaraq yeni məhsullar yaradılanda və ya rəsmlər yenilənəndə visual search üçün rəsmləri indeksləyir.

**Integration Points / İnteqrasiya Nöqtələri:**
- `createProduct()` - Yeni məhsul yaradılanda
- `updateProduct()` - Məhsul rəsmləri yenilənəndə

**Note / Qeyd:** Indexing asinxron olaraq arxa planda işləyir və məhsul yaradılmasını bloklamır.

## Performance Optimization / Performans Optimallaşdırması

### 1. Model Caching / Model Cache-ləmə

Model bir dəfə yüklənir və singleton pattern ilə saxlanılır.

### 2. Embedding Caching / Embedding Cache-ləmə

Embeddings Redis-də 24 saat müddətinə cache-lənir.

### 3. Async Processing / Asinxron İşləmə

Image indexing asinxron olaraq arxa planda işləyir.

### 4. Batch Processing / Batch İşləmə

Çoxlu rəsmləri batch şəklində işləmək mümkündür.

## Troubleshooting / Problemlərin Həlli

### Model yüklənmir / Model not loading

**Problem:** `Failed to initialize MobileNet model`

**Həll / Solution:**
1. `ML_MODEL_ENABLED="true"` olduğunu yoxlayın
2. `@tensorflow/tfjs-node` və `@tensorflow-models/mobilenet` quraşdırıldığını yoxlayın
3. İnternet bağlantısını yoxlayın (model ilk dəfə yüklənərkən lazımdır)

### Embeddings cache-lənmir / Embeddings not caching

**Problem:** Embeddings hər dəfə yenidən çıxarılır

**Həll / Solution:**
1. `ML_CACHE_ENABLED="true"` olduğunu yoxlayın
2. Redis bağlantısını yoxlayın
3. Cache TTL-i yoxlayın (default: 24 saat)

### Visual search nəticə vermir / Visual search returns no results

**Problem:** Visual search boş nəticə qaytarır

**Həll / Solution:**
1. `VISUAL_SEARCH_ENABLED="true"` olduğunu yoxlayın
2. `ML_MODEL_ENABLED="true"` olduğunu yoxlayın
3. Məhsul rəsmlərinin indeksləndiyini yoxlayın
4. `minSimilarity` dəyərini azaldın (default: 0.5)

## Future Enhancements / Gələcək Təkmilləşdirmələr

1. **Custom Model Training / Öz Modelimizi Təlim Etmək**
   - E-commerce məhsulları üçün xüsusi model təlimi
   - Fine-tuning mövcud modellərlə

2. **Vector Database Integration / Vector Veritabanı İnteqrasiyası**
   - PostgreSQL `pgvector` extension
   - Pinecone, Weaviate, və ya Qdrant inteqrasiyası

3. **Multi-Model Support / Çoxlu Model Dəstəyi**
   - EfficientNet model dəstəyi
   - Model ensemble (bir neçə modelin kombinasiyası)

4. **Real-time Indexing / Real-time İndeksləmə**
   - WebSocket ilə real-time indexing status
   - Progress tracking

5. **Advanced Filtering / Təkmilləşdirilmiş Filtrləmə**
   - Color-based filtering
   - Style-based filtering
   - Brand-based filtering

## Related Documentation / Əlaqəli Dokumentasiya

- [Search Engine Documentation](./SEARCH_ENGINE.md)
- [Visual Search API](./SEARCH_ENGINE.md#visual-search)

## Support / Dəstək

Suallar və problemlər üçün:
- GitHub Issues
- Documentation: `/docs/ML_IMAGE_ANALYSIS.md`

