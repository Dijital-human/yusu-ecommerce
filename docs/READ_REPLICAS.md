# Read Replicas / Read Replica-lar

## Ümumi Məlumat / Overview

Read Replica sistemi database read performansını artırmaq üçün read/write separation təmin edir. Read queries read replica-ya göndərilir, write queries isə primary database-ə göndərilir.

## Komponentlər / Components

### 1. Replica Client (`src/lib/db/replica.ts`)

Read replica Prisma client və health check sistemi:
- Read replica Prisma client instance yaradır
- Connection pool optimizasiyası
- Health check funksiyaları
- Connection pool metrics

**Funksiyalar:**
- `getReplicaPrisma()` - Read replica Prisma client-i al
- `checkReplicaHealth()` - Replica health yoxla
- `getReplicaPoolMetrics()` - Connection pool metrikalarını al
- `disconnectReplica()` - Replica client-i bağla
- `getReplicaConfigPublic()` - Konfiqurasiya al

### 2. Query Client Helper (`src/lib/db/query-client.ts`)

Read/write separation helper funksiyaları:
- `getReadClient()` - Read əməliyyatları üçün client al (replica və ya primary)
- `getWriteClient()` - Write əməliyyatları üçün client al (həmişə primary)
- `executeRead()` - Read əməliyyatını yerinə yetir
- `executeWrite()` - Write əməliyyatını yerinə yetir

## Konfiqurasiya / Configuration

### Environment Variables

```bash
# Database Read Replica Configuration
DATABASE_REPLICA_ENABLED="true"                    # Read replica aktivləşdir
DATABASE_REPLICA_URL="postgresql://..."            # Read replica database URL
DATABASE_REPLICA_CONNECTION_LIMIT="20"            # Connection limit
DATABASE_REPLICA_POOL_TIMEOUT="10"                 # Pool timeout (seconds)
DATABASE_REPLICA_CONNECT_TIMEOUT="5"               # Connection timeout (seconds)
```

## İstifadə / Usage

### Query Helper-lərdə Avtomatik İstifadə

Bütün query helper fayllarında read client avtomatik olaraq istifadə edilir:

```typescript
// product-queries.ts
import { getReadClient } from "@/lib/db/query-client";

export async function getProductById(productId: string) {
  const readClient = getReadClient(); // Replica istifadə edir (əgər aktivdirsə)
  const product = await readClient.product.findUnique({
    where: { id: productId },
  });
  return product;
}
```

### Manual İstifadə

```typescript
import { getReadClient, getWriteClient } from "@/lib/db/query-client";

// Read operation / Read əməliyyatı
const readClient = getReadClient();
const products = await readClient.product.findMany();

// Write operation / Write əməliyyatı
const writeClient = getWriteClient();
await writeClient.product.create({
  data: { name: "New Product" },
});
```

### Execute Helper Funksiyaları

```typescript
import { executeRead, executeWrite } from "@/lib/db/query-client";

// Read operation / Read əməliyyatı
const products = await executeRead(async (client) => {
  return await client.product.findMany();
});

// Write operation / Write əməliyyatı
const product = await executeWrite(async (client) => {
  return await client.product.create({
    data: { name: "New Product" },
  });
});
```

## Health Check

Health check endpoint-də replica statusu görünür:

```bash
GET /api/health
```

Response:
```json
{
  "services": {
    "database": {
      "status": "healthy",
      "replica": {
        "healthy": true,
        "latency": "5ms"
      },
      "replicaPool": {
        "enabled": true,
        "activeConnections": 5,
        "maxConnections": 20,
        "utilizationPercent": 25
      }
    }
  }
}
```

## Production Setup / Production Quraşdırması

### 1. Database Replica Quraşdırması

PostgreSQL-də read replica quraşdırın (database admin tərəfindən):
- Streaming replication konfiqurasiya edin
- Replica server-i konfiqurasiya edin
- Connection string-i hazırlayın

### 2. Environment Variables

Production environment variables-ı təyin edin:
```bash
DATABASE_REPLICA_ENABLED="true"
DATABASE_REPLICA_URL="postgresql://user:pass@replica-host:5432/db?connection_limit=20&pool_timeout=10&connect_timeout=5"
DATABASE_REPLICA_CONNECTION_LIMIT="20"
DATABASE_REPLICA_POOL_TIMEOUT="10"
DATABASE_REPLICA_CONNECT_TIMEOUT="5"
```

### 3. Monitoring

Replica health və metrics monitoring:
- Health check endpoint-dən replica statusunu yoxlayın
- Connection pool utilization-ı izləyin
- Replica latency-ni izləyin

## Performance Benefits / Performans Faydaları

1. **Read Performance**: Read queries read replica-ya göndərilir, primary database yükü azalır
2. **Scalability**: Read replica-ları artıraraq read capacity artırıla bilər
3. **High Availability**: Primary database problemlərində read operations davam edə bilər (failover ilə)

## Failover Logic / Failover Məntiqi

Əgər read replica aktiv deyilsə və ya xəta verirsə, `getReadClient()` avtomatik olaraq primary client qaytarır. Bu, backward compatibility təmin edir və replica olmadan da sistem işləyə bilər.

## Qeydlər / Notes

1. **Write Operations**: Bütün write operations həmişə primary database-ə göndərilir
2. **Read-after-Write Consistency**: Yeni yazılmış data read replica-da dərhal görünməyə bilər (replication lag)
3. **Connection Pooling**: Replica üçün ayrı connection pool istifadə olunur
4. **Health Monitoring**: Replica health düzgün izlənilməlidir

## Troubleshooting / Problemlərin Həlli

### Replica bağlantısı uğursuz olur

1. Replica server-inin işlədiyini yoxlayın
2. Network connectivity yoxlayın
3. Connection string-in düzgün olduğunu yoxlayın
4. Health check endpoint-dən status yoxlayın

### Yüksək latency

1. Replica server performansını yoxlayın
2. Network latency-ni yoxlayın
3. Connection pool konfiqurasiyasını optimizasiya edin

### Read-after-Write Consistency Problemləri

1. Replication lag-ı yoxlayın
2. Kritik read operations üçün primary client istifadə edin
3. Cache invalidation strategiyasını optimizasiya edin

