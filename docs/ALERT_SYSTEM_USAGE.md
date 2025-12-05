# Alert System Usage Guide / Alert Sistemi İstifadə Bələdçisi

## 📋 Ümumi Məlumat / General Information

Alert sistemi sistemin kritik komponentlərində problemləri real-time aşkar etmək və bildiriş göndərmək üçün yaradılmışdır. Bu sənəd alert sisteminin haralarda və necə istifadə ediləcəyini izah edir.

The alert system is designed to detect problems in critical components of the system in real-time and send notifications. This document explains where and how the alert system will be used.

---

## 🎯 Alert Sisteminin İstifadə Yerləri / Alert System Usage Locations

### 1. **Avtomatik Alert Checking / Automatic Alert Checking**

Alert sistemi avtomatik olaraq işləyir və `src/instrumentation.ts` faylında başladılır:

- **Interval:** 60 saniyə (default, `ALERT_CHECK_INTERVAL` environment variable ilə konfiqurasiya edilə bilər)
- **Yoxlanılan Metrikalar / Checked Metrics:**
  - API error rate (API xəta dərəcəsi)
  - API response time (API cavab vaxtı)
  - Database query time (Veritabanı sorğu vaxtı)
  - Database connection pool usage (Veritabanı connection pool istifadəsi)
  - Cache hit rate (Cache hit rate)
  - Cache response time (Cache cavab vaxtı)

**Fayl:** `src/lib/monitoring/alerts.ts` - `checkAlerts()` funksiyası

---

### 2. **Kritik API Endpoint-lərdə / Critical API Endpoints**

#### 2.1. Order Creation (`/api/orders` - POST)

**Fayl:** `src/app/api/orders/route.ts`

**Alert-lər:**
- ✅ Yüksək response time (2 saniyədən çox) - `triggerAPIResponseTimeAlert()`
- ✅ Order yaratma xətası - `triggerOrderErrorAlert()`
- ✅ API xətası (5xx status codes) - `triggerAPIErrorAlert()`

**Nümunə:**
```typescript
try {
  // Order creation logic
  const responseTime = Date.now() - startTime;
  await triggerAPIResponseTimeAlert('/api/orders', responseTime, 2000);
} catch (error) {
  await triggerOrderErrorAlert(orderId, 'create', error);
}
```

---

#### 2.2. Payment Intent Creation (`/api/payment/create-intent` - POST)

**Fayl:** `src/app/api/payment/create-intent/route.ts`

**Alert-lər:**
- ✅ Yüksək response time (3 saniyədən çox) - `triggerAPIResponseTimeAlert()`
- ✅ Payment processing xətası - `triggerPaymentErrorAlert()`
- ✅ API xətası (5xx status codes) - `triggerAPIErrorAlert()`

**Nümunə:**
```typescript
try {
  // Payment intent creation logic
  const responseTime = Date.now() - startTime;
  await triggerAPIResponseTimeAlert('/api/payment/create-intent', responseTime, 3000);
} catch (error) {
  await triggerPaymentErrorAlert(orderId, paymentProvider, error);
}
```

---

### 3. **Error Handler-da / In Error Handler**

**Fayl:** `src/lib/api/error-handler.ts`

**Alert-lər:**
- ✅ Kritik xətalar (5xx status codes) - `triggerAPIErrorAlert()`

**Qeyd:** `handleApiError()` funksiyası async olmalıdır və kritik xətalar üçün alert tetikləyir.

---

### 4. **Database Operations-da / In Database Operations**

**Fayl:** `src/lib/monitoring/alert-helpers.ts`

**Alert-lər:**
- ✅ Database xətası - `triggerDatabaseErrorAlert()`
- ✅ Yavaş database sorğuları (500ms-dən çox) - `triggerDatabaseQueryTimeAlert()`

**İstifadə yerləri:**
- Service layer-lərdə (`src/services/*.service.ts`)
- Query helper-lərdə (`src/lib/db/queries/*.ts`)

**Nümunə:**
```typescript
try {
  const startTime = Date.now();
  const result = await prisma.product.findMany();
  const queryTime = Date.now() - startTime;
  
  await triggerDatabaseQueryTimeAlert('SELECT * FROM Product', queryTime, 500);
} catch (error) {
  await triggerDatabaseErrorAlert('getProducts', error);
}
```

---

### 5. **Cache Operations-da / In Cache Operations**

**Fayl:** `src/lib/monitoring/alert-helpers.ts`

**Alert-lər:**
- ✅ Cache problemləri - `triggerCacheAlert()`

**İstifadə yerləri:**
- `src/lib/cache/cache-wrapper.ts`
- `src/lib/cache/cache-invalidator.ts`

**Nümunə:**
```typescript
try {
  await redis.set(key, value);
} catch (error) {
  await triggerCacheAlert('set', error, { key });
}
```

---

### 6. **Inventory Management-da / In Inventory Management**

**Fayl:** `src/lib/monitoring/alert-helpers.ts`

**Alert-lər:**
- ✅ Inventory problemləri - `triggerInventoryAlert()`

**İstifadə yerləri:**
- `src/lib/inventory/inventory-manager.ts`
- `src/app/api/inventory/stock/route.ts`

**Nümunə:**
```typescript
if (stockLevel < threshold) {
  await triggerInventoryAlert(productId, `Low stock: ${stockLevel}`, 'warning');
}
```

---

## 🔧 Alert Helper Funksiyaları / Alert Helper Functions

Bütün alert helper funksiyaları `src/lib/monitoring/alert-helpers.ts` faylında yerləşir:

### 1. `triggerAlert()`
Ümumi alert tetikləmə funksiyası. Bütün alert növləri üçün istifadə edilə bilər.

### 2. `triggerAPIErrorAlert()`
API xətaları üçün alert tetikləyir.

### 3. `triggerAPIResponseTimeAlert()`
Yüksək API response time üçün alert tetikləyir.

### 4. `triggerDatabaseErrorAlert()`
Veritabanı xətaları üçün alert tetikləyir.

### 5. `triggerDatabaseQueryTimeAlert()`
Yavaş veritabanı sorğuları üçün alert tetikləyir.

### 6. `triggerCacheAlert()`
Cache problemləri üçün alert tetikləyir.

### 7. `triggerPaymentErrorAlert()`
Ödəniş emalı xətaları üçün alert tetikləyir.

### 8. `triggerOrderErrorAlert()`
Sifariş emalı xətaları üçün alert tetikləyir.

### 9. `triggerInventoryAlert()`
İnventar problemləri üçün alert tetikləyir.

---

## 📊 Default Alert Rules / Default Alert Qaydaları

Alert sistemi 6 default alert qaydası ilə gəlir:

1. **High API Error Rate** (critical) - 5% error rate limit
2. **High API Response Time** (warning) - 1 saniyə limit
3. **High Database Query Time** (warning) - 500ms limit
4. **Database Connection Pool Exhausted** (critical) - 80% pool usage limit
5. **Low Cache Hit Rate** (warning) - 70% hit rate limit
6. **High Cache Response Time** (warning) - 50ms limit

---

## 🔔 Alert Notification Channels / Alert Bildiriş Kanalları

**Hazırda:**
- ✅ Logging (logger vasitəsilə)
- ✅ In-memory alert storage
- ✅ API endpoint-lər vasitəsilə alert-ləri görüntüləmək

**Gələcəkdə əlavə ediləcək:**
- 📧 Email notifications
- 💬 Slack notifications
- 📱 SMS notifications
- 🔔 Push notifications
- 📊 Dashboard notifications

---

## 📍 Alert-lərin Görüntülənməsi / Viewing Alerts

### API Endpoint-lər:

1. **GET `/api/monitoring/alerts`**
   - Bütün alert-ləri alır
   - Query parametrləri:
     - `activeOnly=true` - Yalnız aktiv alert-ləri alır
     - `limit=100` - Limit sayı
     - `check=true` - Alert yoxlamasını tetikləyir

2. **GET `/api/monitoring/alerts/[id]`**
   - Fərdi alert qaydasını alır

3. **POST `/api/monitoring/alerts`**
   - Yeni alert qaydası yaradır/yeniləyir

4. **DELETE `/api/monitoring/alerts?ruleId=xxx`**
   - Alert qaydasını silir

5. **PATCH `/api/monitoring/alerts/[id]`**
   - Alert-i həll edir

### Dashboard:

- **URL:** `/admin/monitoring`
- Alert-lər dashboard-da göstəriləcək (gələcəkdə əlavə ediləcək)

---

## ⚙️ Konfiqurasiya / Configuration

### Environment Variables:

```bash
# Alert sistemi aktivləşdir (default: false, production-da true)
ALERT_ENABLED="true"

# Alert yoxlama intervalı millisaniyələrlə (default: 60000 = 60 saniyə)
ALERT_CHECK_INTERVAL="60000"
```

---

## 🎯 Best Practices / Ən Yaxşı Təcrübələr

1. **Kritik əməliyyatlarda alert istifadə edin:**
   - Order creation
   - Payment processing
   - Database critical operations
   - Cache critical operations

2. **Alert severity-ni düzgün seçin:**
   - `critical` - Sistemin işləməsinə mane olan xətalar
   - `warning` - Diqqət tələb edən, amma kritik olmayan problemlər
   - `info` - Məlumat məqsədli alert-lər

3. **Alert metadata əlavə edin:**
   - Order ID
   - User ID
   - Endpoint
   - Operation name
   - Digər kontekst məlumatları

4. **Alert-ləri həll edin:**
   - Alert-lər həll edildikdə `resolveAlert()` funksiyasını çağırın
   - Alert-lər avtomatik olaraq həll edilə bilər (şərt artıq yerinə yetirilmirsə)

---

## 📝 Nümunə Kod / Example Code

```typescript
import { 
  triggerAPIErrorAlert, 
  triggerAPIResponseTimeAlert,
  triggerOrderErrorAlert 
} from '@/lib/monitoring/alert-helpers';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let orderId: string | undefined;
  
  try {
    // Business logic
    const order = await createOrder(data);
    orderId = order.id;
    
    const responseTime = Date.now() - startTime;
    
    // Check for high response time
    await triggerAPIResponseTimeAlert('/api/orders', responseTime, 2000);
    
    return successResponse(order);
  } catch (error) {
    // Trigger alert for order error
    if (orderId) {
      await triggerOrderErrorAlert(orderId, 'create', error, {
        userId: user.id,
        endpoint: '/api/orders',
      });
    } else {
      await triggerAPIErrorAlert('/api/orders', 500, error, {
        userId: user.id,
        operation: 'create_order',
      });
    }
    
    return handleApiError(error, 'create order');
  }
}
```

---

## 🔍 Monitoring və Debugging

Alert-ləri monitoring etmək üçün:

1. **Dashboard:** `/admin/monitoring`
2. **API:** `/api/monitoring/alerts`
3. **Logs:** Logger vasitəsilə alert-lər log edilir

---

## 📚 Əlavə Məlumat / Additional Information

- Alert sistemi `src/lib/monitoring/alerts.ts` faylında yerləşir
- Alert helper funksiyaları `src/lib/monitoring/alert-helpers.ts` faylında yerləşir
- Alert API endpoints `src/app/api/monitoring/alerts/` qovluğunda yerləşir
- Alert sistemi `src/instrumentation.ts` faylında başladılır

---

**Son yenilənmə / Last Updated:** 2024

