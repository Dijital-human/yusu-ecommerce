# Log Aggregation (ELK Stack) / Log Aggregation (ELK Stack)

## Ümumi Məlumat / Overview

Log Aggregation sistemi ELK Stack (Elasticsearch, Logstash, Kibana) ilə inteqrasiya üçün strukturlaşdırılmış logging və log shipping funksionallığı təmin edir.

## Komponentlər / Components

### 1. Log Aggregator (`src/lib/logging/log-aggregator.ts`)

Mərkəzləşdirilmiş log aggregation sistemi:
- Strukturlaşdırılmış log qeydləri yaradır
- Log-ları buffer-ə toplayır və batch şəklində Logstash-ə göndərir
- Log level-ləri idarə edir (debug, info, warn, error, fatal)
- Context tracking (userId, requestId, sessionId və s.)
- Automatic flushing (batch size və interval əsasında)

**Funksiyalar:**
- `logDebug()` - Debug mesajı log et
- `logInfo()` - Info mesajı log et
- `logWarn()` - Warning mesajı log et
- `logError()` - Error mesajı log et
- `logFatal()` - Fatal xəta log et (dərhal flush)
- `flushAllLogs()` - Bütün gözləyən log-ları flush et
- `initializeLogAggregator()` - Log aggregator-i işə sal
- `getLogAggregatorStatus()` - Status al

### 2. Logstash Client (`src/lib/logging/logstash-client.ts`)

Logstash-ə bağlantı və log shipping:
- HTTP, TCP, UDP protokollarını dəstəkləyir
- Retry logic (konfiqurasiya olunan cəhd sayı və gecikmə)
- Connection timeout
- Service metadata əlavə edir (service name, environment, version)

**Funksiyalar:**
- `sendLogsToLogstash()` - Log-ları Logstash-ə göndər
- `testLogstashConnection()` - Logstash bağlantısını test et
- `getLogstashStatus()` - Status al

### 3. Monitoring API (`src/app/api/monitoring/logs/route.ts`)

Log aggregation statusu və idarəetməsi üçün API endpoint:
- `GET /api/monitoring/logs` - Status al
- `GET /api/monitoring/logs?test=true` - Logstash bağlantısını test et
- `POST /api/monitoring/logs/flush` - Bütün log-ları flush et

## Konfiqurasiya / Configuration

### Environment Variables

```bash
# Log Aggregation Configuration (ELK Stack)
LOGSTASH_ENABLED="true"                    # Logstash inteqrasiyası aktivləşdir
LOGSTASH_HOST="logstash.yourdomain.com"     # Logstash host
LOGSTASH_PORT="5000"                       # Logstash port
LOGSTASH_PROTOCOL="tcp"                    # Protocol: tcp, udp, http
LOGSTASH_SERVICE_NAME="yusu-ecommerce"      # Service adı
LOGSTASH_BATCH_SIZE="100"                  # Batch ölçüsü
LOGSTASH_FLUSH_INTERVAL="5000"             # Flush interval (ms)
LOGSTASH_TIMEOUT="5000"                    # Connection timeout (ms)
LOGSTASH_RETRY_ATTEMPTS="3"                # Retry cəhdləri
LOGSTASH_RETRY_DELAY="1000"                # Retry gecikməsi (ms)
```

## İstifadə / Usage

### Basic Logging

```typescript
import { logInfo, logError, logWarn } from '@/lib/logging/log-aggregator';

// Info log
logInfo('User logged in', 'İstifadəçi daxil oldu', {
  userId: 'user123',
  requestId: 'req456',
});

// Error log
try {
  // Some operation
} catch (error) {
  logError(
    'Failed to process order',
    'Sifarişi emal etmək uğursuz oldu',
    error instanceof Error ? error : new Error(String(error)),
    {
      userId: 'user123',
      orderId: 'order789',
    },
    {
      endpoint: '/api/orders',
      method: 'POST',
    }
  );
}

// Warning log
logWarn('Low stock warning', 'Aşağı stok xəbərdarlığı', undefined, {
  productId: 'prod123',
  currentStock: 5,
});
```

### Manual Flush

```typescript
import { flushAllLogs } from '@/lib/logging/log-aggregator';

// Flush all pending logs
await flushAllLogs();
```

### Status Check

```typescript
import { getLogAggregatorStatus } from '@/lib/logging/log-aggregator';

const status = getLogAggregatorStatus();
console.log(status);
// {
//   enabled: true,
//   logstashEnabled: true,
//   bufferSize: 45,
//   config: { ... }
// }
```

## Log Structure / Log Strukturu

Hər log qeydi aşağıdakı struktura malikdir:

```typescript
{
  timestamp: "2025-01-27T12:00:00.000Z",
  level: "info",
  message: "User logged in",
  messageAz: "İstifadəçi daxil oldu",
  context: {
    userId: "user123",
    requestId: "req456",
    endpoint: "/api/auth/login",
    method: "POST",
  },
  error: {  // Yalnız error/fatal log-lar üçün
    name: "Error",
    message: "Error message",
    stack: "Error stack trace",
  },
  metadata: {  // Əlavə metadata
    customField: "value",
  },
  service: {  // Logstash tərəfindən əlavə edilir
    name: "yusu-ecommerce",
    environment: "production",
    version: "1.0.0",
  },
}
```

## Kibana Dashboard Setup / Kibana Dashboard Quraşdırması

### 1. Logstash Configuration

Logstash-də aşağıdakı konfiqurasiya tələb olunur:

```ruby
input {
  tcp {
    port => 5000
    codec => json
  }
  http {
    port => 5000
    codec => json
  }
}

filter {
  json {
    source => "message"
  }
  
  date {
    match => [ "timestamp", "ISO8601" ]
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "yusu-ecommerce-logs-%{+YYYY.MM.dd}"
  }
}
```

### 2. Kibana Index Pattern

1. Kibana-da **Management > Index Patterns**-ə gedin
2. `yusu-ecommerce-logs-*` index pattern yaradın
3. Time field kimi `timestamp` seçin

### 3. Kibana Visualizations

**Log Level Distribution:**
- Visualization type: Pie Chart
- Aggregation: Terms
- Field: `level.keyword`

**Error Rate Over Time:**
- Visualization type: Line Chart
- X-axis: Date Histogram (`timestamp`)
- Y-axis: Count
- Filter: `level: error`

**Top Errors:**
- Visualization type: Data Table
- Aggregation: Terms
- Field: `error.message.keyword`
- Size: 10

**Request Endpoints:**
- Visualization type: Bar Chart
- Aggregation: Terms
- Field: `context.endpoint.keyword`

### 4. Kibana Dashboard

Yuxarıdakı visualizations-ı birləşdirərək dashboard yaradın:
- Log Level Distribution
- Error Rate Over Time
- Top Errors
- Request Endpoints
- Recent Logs Table

## Performance Considerations / Performans Məsələləri

1. **Batch Size**: Yüksək trafikli saytlar üçün `LOGSTASH_BATCH_SIZE`-i artırın (məsələn, 200-500)
2. **Flush Interval**: Aşağı gecikmə tələb olunarsa `LOGSTASH_FLUSH_INTERVAL`-i azaldın (məsələn, 3000ms)
3. **Protocol**: 
   - **TCP**: Etibarlı, sıralı çatdırılma (production üçün tövsiyə olunur)
   - **UDP**: Sürətli, aşağı gecikmə, çatdırılma zəmanəti yoxdur (kritik olmayan log-lar üçün)
   - **HTTP**: Konfiqurasiya etmək asandır, cloud üçün yaxşıdır
4. **Retry Logic**: Network problemləri üçün retry cəhdləri və gecikməni konfiqurasiya edin

## Troubleshooting / Problemlərin Həlli

### Log-lar Logstash-ə çatdırılmır

1. Logstash server-inin işlədiyini yoxlayın
2. Network connectivity yoxlayın (`telnet LOGSTASH_HOST LOGSTASH_PORT`)
3. `GET /api/monitoring/logs?test=true` endpoint-ini çağırın
4. Logstash logs-una baxın

### Yüksək memory istifadəsi

1. `LOGSTASH_BATCH_SIZE`-i azaldın
2. `LOGSTASH_FLUSH_INTERVAL`-i azaldın
3. Buffer ölçüsünü yoxlayın (`GET /api/monitoring/logs`)

### Log-lar Kibana-da görünmür

1. Elasticsearch index pattern-inin düzgün konfiqurasiya edildiyini yoxlayın
2. Logstash output konfiqurasiyasını yoxlayın
3. Elasticsearch index-lərinin yaradıldığını yoxlayın

## İnteqrasiya / Integration

Log aggregator avtomatik olaraq `src/instrumentation.ts`-də işə salınır. Əlavə konfiqurasiya tələb olunmur.

## Test / Testing

```bash
# Status yoxla
curl http://localhost:3000/api/monitoring/logs \
  -H "Authorization: Bearer YOUR_TOKEN"

# Logstash bağlantısını test et
curl http://localhost:3000/api/monitoring/logs?test=true \
  -H "Authorization: Bearer YOUR_TOKEN"

# Log-ları flush et
curl -X POST http://localhost:3000/api/monitoring/logs/flush \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Növbəti Addımlar / Next Steps

1. Kibana dashboard-larını konfiqurasiya edin
2. Alert rules yaradın (məsələn, error rate yüksək olduqda)
3. Log retention policy təyin edin
4. Log rotation konfiqurasiya edin

