# API Versioning / API Versiyalaşdırma

## Ümumi Məlumat / Overview

API versioning sistemi backward compatibility və gradual migration təmin edir. Bu sistem köhnə API endpoint-lərinin işləməsinə davam etməsinə imkan verir, eyni zamanda yeni versiyaları tətbiq etməyə imkan verir.

## Struktur / Structure

```
src/app/api/
  v1/
    products/
    orders/
    cart/
    categories/
  products/  (backward compatibility - redirects to v1)
  orders/   (backward compatibility - redirects to v1)
  cart/     (backward compatibility - redirects to v1)
  categories/ (backward compatibility - redirects to v1)
```

## Version Middleware / Versiya Middleware-i

### `src/lib/api/version-middleware.ts`

Version middleware aşağıdakı funksiyaları təmin edir:

- **Version Extraction**: Request-dən versiya çıxarılması (URL path, Accept header, X-API-Version header)
- **Version Headers**: Response-a versiya header-ləri əlavə edilməsi
- **Deprecation Warnings**: Köhnəlmiş versiyalar üçün xəbərdarlıq
- **Redirect/Proxy**: Köhnə endpoint-lərdən yeni versiyalara yönləndirmə

## İstifadə / Usage

### Versioned Endpoint Yaratmaq

```typescript
import { withVersioning, DEFAULT_VERSION } from "@/lib/api/version-middleware";

async function GETHandler(request: NextRequest, version: string) {
  // Handler logic / Handler məntiqi
  return NextResponse.json({ data: '...' });
}

export const GET = withVersioning(GETHandler);
```

### Backward Compatibility

Köhnə endpoint-lər avtomatik olaraq v1-ə yönləndirilir:

```typescript
import { redirectToVersion, proxyToVersion } from "@/lib/api/version-middleware";

// GET request-lər üçün redirect
export async function GET(request: NextRequest) {
  return redirectToVersion(request, 'v1');
}

// POST/PUT/DELETE request-lər üçün proxy
export async function POST(request: NextRequest) {
  return proxyToVersion(request, 'v1');
}
```

## Version Detection / Versiya Aşkarlanması

Versiya aşağıdakı üsullarla aşkarlanır (prioritet sırası ilə):

1. **URL Path**: `/api/v1/products`
2. **Accept Header**: `Accept: application/json; version=v1`
3. **X-API-Version Header**: `X-API-Version: v1`

Əgər versiya təyin edilməyibsə, default versiya (v1) istifadə olunur.

## Response Headers / Cavab Header-ləri

Bütün versiyalaşdırılmış endpoint-lər aşağıdakı header-ləri qaytarır:

- `X-API-Version`: İstifadə olunan API versiyası
- `X-API-Deprecated`: Versiyanın köhnəlmiş olub-olmadığı (true/false)
- `X-API-Deprecation-Date`: Köhnəlmə tarixi (əgər köhnəlmişdirsə)
- `X-API-Sunset`: Sunset tarixi (əgər köhnəlmişdirsə)

## Deprecation / Köhnəlmə

Versiya köhnəldikdə:

1. `X-API-Deprecated: true` header-i əlavə edilir
2. Köhnəlmə tarixi `X-API-Deprecation-Date` header-ində göstərilir
3. Sunset tarixi `X-API-Sunset` header-ində göstərilir
4. Log-larda xəbərdarlıq yazılır

## Best Practices / Ən Yaxşı Təcrübələr

1. **Gradual Migration**: Yeni versiyaları addım-addım tətbiq edin
2. **Backward Compatibility**: Köhnə endpoint-ləri dəstəkləyin
3. **Clear Documentation**: Versiya dəyişikliklərini sənədləşdirin
4. **Deprecation Timeline**: Köhnəlmə zamanı təyin edin və kommunikasiya edin
5. **Version Headers**: Həmişə versiya header-ləri əlavə edin

## Migration Guide / Migrasiya Bələdçisi

### Köhnə Endpoint-dən Yeni Versiyaya Keçid

1. **URL Path-də versiya əlavə edin**:
   ```
   /api/products → /api/v1/products
   ```

2. **Header-də versiya təyin edin**:
   ```
   X-API-Version: v1
   ```

3. **Accept header-də versiya təyin edin**:
   ```
   Accept: application/json; version=v1
   ```

## Troubleshooting / Problemlərin Həlli

### Redirect Loop / Redirect Döngüsü

Əgər redirect döngüsü baş verirsə:
1. Version middleware-də versiya aşkarlanmasını yoxlayın
2. URL path-də versiya prefiksini yoxlayın
3. Log-ları yoxlayın

### Proxy Failures / Proxy Uğursuzluqları

Əgər proxy uğursuz olursa:
1. Versioned endpoint-in mövcud olduğunu yoxlayın
2. Network connectivity-ni yoxlayın
3. Error log-larını yoxlayın

