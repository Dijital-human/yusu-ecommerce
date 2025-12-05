# Admin API Integration Guide / Admin API İnteqrasiya Bələdçisi

## 📋 Ümumi Məlumat / Overview

Bu sənəd `yusu-admin` proyektinin `yusu-ecommerce` proyektinin backend API-lərindən necə istifadə edəcəyini izah edir.

This document explains how the `yusu-admin` project will use the backend APIs from the `yusu-ecommerce` project.

## 🔗 API Base URL

`yusu-admin` proyektində environment variable-da `NEXT_PUBLIC_API_URL` təyin edilməlidir:

```env
NEXT_PUBLIC_API_URL=https://api.yusu.com
# və ya development üçün
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 📡 Mövcud API Endpoint-ləri / Available API Endpoints

### 1. Customer Management / Müştəri İdarəetməsi

#### GET `/api/admin/customers/[id]`
Fərdi müştəri detallarını əldə edir / Get individual customer details

**Response:**
```json
{
  "success": true,
  "data": {
    "customer": {
      "id": "string",
      "name": "string",
      "email": "string",
      "phone": "string",
      "isActive": boolean,
      "addresses": [...],
      "_count": {
        "orders": number,
        "cartItems": number,
        "wishlistItems": number,
        "reviews": number
      }
    },
    "cartItems": [...],
    "wishlistItems": [...],
    "orders": [...],
    "recentActivity": [...],
    "favoriteProducts": [...]
  }
}
```

### 2. Notification Management / Bildiriş İdarəetməsi

#### POST `/api/admin/notifications/send`
Bildiriş göndərir / Send notification

**Request Body:**
```json
{
  "title": "string",
  "message": "string",
  "type": "info" | "warning" | "error" | "success",
  "targetType": "all" | "segment",
  "segment": {
    "role": "string",
    "isActive": boolean,
    "location": {
      "country": "string",
      "city": "string"
    }
  },
  "scheduledAt": "ISO date string (optional)"
}
```

#### GET `/api/admin/notifications/templates`
Bildiriş şablonlarını əldə edir / Get notification templates

#### POST `/api/admin/notifications/templates`
Yeni şablon yaradır / Create new template

#### PUT `/api/admin/notifications/templates`
Şablon yeniləyir / Update template

#### DELETE `/api/admin/notifications/templates?id=templateId`
Şablon silir / Delete template

#### GET `/api/admin/notifications/history`
Bildiriş tarixçəsini əldə edir / Get notification history

**Query Parameters:**
- `page` - Page number
- `limit` - Items per page
- `startDate` - Start date filter
- `endDate` - End date filter

### 3. Analytics / Analitika

#### GET `/api/admin/analytics/location`
Location-based analitika əldə edir / Get location-based analytics

**Response:**
```json
{
  "success": true,
  "data": {
    "locationStats": [...],
    "countryDistribution": [...],
    "cityDistribution": [...]
  }
}
```

#### GET `/api/admin/analytics/device`
Device-based analitika əldə edir / Get device-based analytics

**Response:**
```json
{
  "success": true,
  "data": {
    "deviceTypes": [...],
    "browsers": [...],
    "operatingSystems": [...]
  }
}
```

### 4. Monitoring / Monitorinq

#### GET `/api/admin/monitoring/logs`
Monitorinq loglarını əldə edir / Get monitoring logs

**Query Parameters:**
- `page` - Page number
- `limit` - Items per page
- `level` - Log level filter (info, warn, error, debug)
- `search` - Search term
- `startDate` - Start date filter
- `endDate` - End date filter

#### GET `/api/monitoring/logs`
Log aggregation statusunu əldə edir / Get log aggregation status

#### GET `/api/monitoring/dashboard`
Dashboard metrikalarını əldə edir / Get dashboard metrics

## 🔐 Authentication / Autentifikasiya

Bütün API endpoint-ləri admin authentication tələb edir / All API endpoints require admin authentication.

`yusu-admin` proyektində API çağırışlarında session cookie-ləri avtomatik göndərilməlidir / Session cookies should be automatically sent in API calls from `yusu-admin` project.

## 📝 İstifadə Nümunəsi / Usage Example

```typescript
// yusu-admin proyektində
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function fetchCustomerDetails(customerId: string) {
  const response = await fetch(`${API_URL}/api/admin/customers/${customerId}`, {
    credentials: 'include', // Session cookie-ləri göndərmək üçün
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch customer details');
  }
  
  const data = await response.json();
  return data.data;
}
```

## ⚠️ Qeydlər / Notes

1. **CORS Configuration:** `yusu-ecommerce` proyektində CORS konfiqurasiyası `yusu-admin` domain-ini icazə verməlidir
2. **Session Management:** Hər iki proyekt eyni session store-dan istifadə etməlidir (Redis və ya database)
3. **Error Handling:** Bütün API çağırışlarında error handling tətbiq edilməlidir
4. **Rate Limiting:** API endpoint-ləri rate limiting ilə qorunmalıdır

## 🔄 Real-time Updates / Real-vaxt Yeniləmələr

`yusu-ecommerce` proyektində baş verən hadisələr event-driven architecture vasitəsilə `yusu-admin` proyektinə real-time bildirilə bilər:

- Server-Sent Events (SSE) `/api/realtime` endpoint-i vasitəsilə
- WebSocket connection (gələcəkdə tətbiq edilə bilər)

## 📚 Əlavə Sənədlər / Additional Documentation

- [Event Bus Documentation](./EVENT_BUS.md)
- [API Versioning Documentation](./API_VERSIONING.md)
- [Monitoring Documentation](./MONITORING.md)

