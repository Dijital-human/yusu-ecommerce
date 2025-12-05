# Event Bus / Event Bus

## Ümumi Məlumat / Overview

Event Bus sistemi event-driven architecture üçün mərkəzi event management təmin edir. Bu sistem loose coupling və async processing imkanı verir.

## Komponentlər / Components

### 1. Event Types (`src/lib/events/types.ts`)

Event type-ləri və interface-ləri:
- `EventType` - Bütün event tipləri
- `EventPriority` - Event prioriteti (low, normal, high, critical)
- `EventPayload` - Event payload interface
- `EventMetadata` - Event metadata interface
- `Event` - Event interface
- `EventHandler` - Event handler funksiya tipi

**Event Tipləri:**
- Order events: `order.created`, `order.updated`, `order.cancelled`, `order.completed`, `order.payment.failed`, `order.payment.succeeded`
- Product events: `product.created`, `product.updated`, `product.deleted`, `product.stock.low`, `product.stock.out`
- User events: `user.registered`, `user.updated`, `user.deleted`, `user.login`, `user.logout`
- Cart events: `cart.item.added`, `cart.item.removed`, `cart.cleared`
- Wishlist events: `wishlist.item.added`, `wishlist.item.removed`

### 2. Event Bus (`src/lib/events/event-bus.ts`)

Mərkəzi event bus sistemi:
- Event handler registration
- Event queue management
- Async event processing
- Priority-based handler execution
- Retry logic for critical events

**Funksiyalar:**
- `on()` - Event handler qeydiyyatdan keçir
- `off()` - Event handler qeydiyyatdan çıxar
- `emit()` - Event emit et
- `getEventBusStatus()` - Event bus statusunu al
- `clearQueue()` - Event queue-nu təmizlə
- `getHandlers()` - Event tipi üçün handler-ləri al
- `initializeEventBus()` - Event bus-i işə sal

## Konfiqurasiya / Configuration

### Environment Variables

```bash
# Event Bus Configuration
EVENT_BUS_ENABLED="true"                    # Event bus aktivləşdir
EVENT_BUS_MAX_QUEUE_SIZE="1000"            # Maksimum event queue ölçüsü
EVENT_BUS_PROCESSING_INTERVAL="100"        # Event processing intervalı (ms)
EVENT_BUS_RETRY_ATTEMPTS="3"               # Retry cəhdləri
EVENT_BUS_RETRY_DELAY="1000"               # Retry gecikməsi (ms)
```

## İstifadə / Usage

### Event Handler Qeydiyyatdan Keçirmə

```typescript
import { on } from '@/lib/events/event-bus';

// Simple handler / Sadə handler
on('order.created', async (event) => {
  console.log('Order created:', event.payload);
});

// Handler with options / Seçimlərlə handler
on('order.created', async (event) => {
  // Handle order created
}, {
  priority: 'high',
  async: true, // Default: true
});
```

### Event Emit Etmə

```typescript
import { emit } from '@/lib/events/event-bus';

// Simple emit / Sadə emit
emit('order.created', {
  orderId: 'order123',
  userId: 'user456',
  totalAmount: 100.00,
});

// Emit with metadata / Metadata ilə emit
emit('order.created', {
  orderId: 'order123',
  userId: 'user456',
  totalAmount: 100.00,
}, {
  userId: 'user456',
  requestId: 'req789',
  priority: 'high',
});
```

### Event Handler Qeydiyyatdan Çıxarma

```typescript
import { off } from '@/lib/events/event-bus';

const handler = async (event) => {
  console.log('Order created:', event.payload);
};

on('order.created', handler);

// Later, remove handler / Sonra handler-i çıxar
off('order.created', handler);
```

### Event Bus Status

```typescript
import { getEventBusStatus } from '@/lib/events/event-bus';

const status = getEventBusStatus();
console.log(status);
// {
//   enabled: true,
//   queueSize: 5,
//   registeredHandlers: 10,
//   isProcessing: true,
//   config: { ... }
// }
```

## Event Priority / Event Prioriteti

Event handler-ləri prioritet sırası ilə yerinə yetirilir:
1. **critical** - Ən yüksək prioritet
2. **high** - Yüksək prioritet
3. **normal** - Normal prioritet (default)
4. **low** - Aşağı prioritet

## Async vs Sync Handlers

### Async Handler (Default)

```typescript
on('order.created', async (event) => {
  // Async operations / Async əməliyyatlar
  await sendEmail(event.payload);
}, {
  async: true, // Default
});
```

### Sync Handler

```typescript
on('order.created', (event) => {
  // Sync operations / Sync əməliyyatlar
  updateCache(event.payload);
}, {
  async: false,
});
```

## Retry Logic / Retry Məntiqi

Kritik event-lər üçün avtomatik retry:
- Retry attempts: `EVENT_BUS_RETRY_ATTEMPTS` (default: 3)
- Retry delay: Exponential backoff (EVENT_BUS_RETRY_DELAY * attempt)

## Event Queue / Event Queue

Event-lər queue-da saxlanılır və batch-lərlə emal olunur:
- Max queue size: `EVENT_BUS_MAX_QUEUE_SIZE` (default: 1000)
- Processing interval: `EVENT_BUS_PROCESSING_INTERVAL` (default: 100ms)
- Batch size: 10 events per batch

## İnteqrasiya / Integration

Event bus avtomatik olaraq `src/instrumentation.ts`-də işə salınır. Əlavə konfiqurasiya tələb olunmur.

## Best Practices / Ən Yaxşı Təcrübələr

1. **Event Naming**: Event adları `resource.action` formatında olmalıdır (məsələn, `order.created`)
2. **Payload Structure**: Event payload strukturlaşdırılmış olmalıdır
3. **Error Handling**: Handler-lərdə error handling təmin edilməlidir
4. **Async Operations**: Uzun sürən əməliyyatlar üçün async handler istifadə edin
5. **Priority**: Kritik əməliyyatlar üçün yüksək prioritet təyin edin

## Troubleshooting / Problemlərin Həlli

### Event-lər işləmir

1. Event bus-in aktiv olduğunu yoxlayın (`EVENT_BUS_ENABLED=true`)
2. Handler-lərin düzgün qeydiyyatdan keçdiyini yoxlayın
3. Event queue statusunu yoxlayın (`getEventBusStatus()`)

### Yüksək queue size

1. `EVENT_BUS_MAX_QUEUE_SIZE`-i artırın
2. `EVENT_BUS_PROCESSING_INTERVAL`-i azaldın
3. Handler performansını optimizasiya edin

### Event handler uğursuz olur

1. Handler error handling əlavə edin
2. Retry logic-i yoxlayın
3. Log-ları yoxlayın

