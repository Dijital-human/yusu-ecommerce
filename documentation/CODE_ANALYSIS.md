# Kod Analizi - Təkrar və Çaxışan Kodlar / Code Analysis - Duplicate and Conflicting Code

## Tarix / Date: 2025-01-27

## 1. VALIDATION TƏKRARLARI / VALIDATION DUPLICATES

### 1.1 Product ID Validation
**Problem:** Product ID validasiyası 5+ yerdə təkrarlanır

**Yerlər:**
- `src/app/api/cart/route.ts` (sətir 51-53)
- `src/app/api/products/[id]/route.ts` (sətir 19)
- `src/app/api/products/[id]/reviews/route.ts` (sətir 82)
- `src/app/api/wishlist/route.ts` (sətir 56)
- `src/app/api/orders/route.ts` (implicit - items array-də)

**Həll:** `validateProductId()` helper artıq mövcuddur, amma istifadə edilmir

---

### 1.2 Quantity Validation
**Problem:** Quantity validasiyası 3+ yerdə təkrarlanır

**Yerlər:**
- `src/app/api/cart/route.ts` (sətir 55-57, 139-141)
- `src/app/api/orders/route.ts` (sətir 107-109)
- `src/app/api/products/[id]/reviews/route.ts` (sətir 87-89)

**Həll:** `validateQuantity()` helper artıq mövcuddur, amma istifadə edilmir

---

### 1.3 Email Validation
**Problem:** Email validasiyası 3+ yerdə təkrarlanır

**Yerlər:**
- `src/app/api/auth/signup/route.ts` (sətir 28-30)
- `src/app/api/auth/verify-email/route.ts` (sətir 81-88)
- `src/app/api/auth/forgot-password/route.ts` (ehtimal)

**Həll:** `validateEmail()` helper artıq mövcuddur, amma istifadə edilmir

---

### 1.4 Required Fields Validation
**Problem:** "Missing required fields" pattern-i 10+ yerdə təkrarlanır

**Yerlər:**
- `src/app/api/products/route.ts` (sətir 127-129)
- `src/app/api/orders/route.ts` (sətir 107-113)
- `src/app/api/auth/signup/route.ts` (sətir 28-30)
- `src/app/api/categories/route.ts` (ehtimal)
- Və s.

**Həll:** Generic validation helper yaratmaq

---

## 2. PRISMA QUERY TƏKRARLARI / PRISMA QUERY DUPLICATES

### 2.1 Product findUnique with isActive Check
**Problem:** Eyni pattern 5+ yerdə təkrarlanır

**Pattern:**
```typescript
const product = await prisma.product.findUnique({
  where: { id: productId, isActive: true }
});
if (!product) {
  return notFoundResponse("Product");
}
```

**Yerlər:**
- `src/app/api/cart/route.ts` (sətir 60-66, 172-178)
- `src/app/api/products/[id]/route.ts` (sətir 22-63)
- `src/app/api/products/[id]/reviews/route.ts` (sətir 92-101)
- `src/app/api/wishlist/route.ts` (sətir 56)
- `src/app/api/orders/route.ts` (implicit)

**Həll:** `getProductById()` query helper yaratmaq

---

### 2.2 Product findMany with Pagination and Filtering
**Problem:** Eyni pattern 3 yerdə təkrarlanır

**Yerlər:**
- `src/app/api/products/route.ts` (sətir 58-81)
- `src/app/api/search/route.ts` (sətir 103-114)
- `src/app/api/categories/[id]/products/route.ts` (sətir 94-110)

**Ortaq kod:**
- Pagination (skip, take)
- Price filtering (gte, lte)
- Category filtering
- Search filtering (OR clause)
- Stock filtering
- calculateAverageRating və parseProductImages

**Həll:** `getProductsWithFilters()` query helper yaratmaq

---

### 2.3 Order findUnique Pattern
**Problem:** Order query-ləri 3+ yerdə təkrarlanır

**Yerlər:**
- `src/app/api/orders/[id]/route.ts` (sətir 28-35)
- `src/app/api/orders/track/route.ts` (sətir 60-103)
- `src/app/api/payment/webhook/route.ts` (sətir 102-111)

**Həll:** Artıq `getOrderWithBasic()` helper var, amma tam istifadə edilmir

---

### 2.4 User findUnique Pattern
**Problem:** User query-ləri auth route-larda təkrarlanır

**Yerlər:**
- `src/app/api/auth/signup/route.ts` (sətir 33-35)
- `src/app/api/auth/verify-email/route.ts` (sətir 92-100)
- `src/app/api/auth/forgot-password/route.ts` (ehtimal)
- `src/app/api/auth/reset-password/route.ts` (ehtimal)

**Həll:** `getUserByEmail()` query helper yaratmaq

---

## 3. ERROR HANDLING TƏKRARLARI / ERROR HANDLING DUPLICATES

### 3.1 Prisma Unique Constraint Error (P2002)
**Problem:** Eyni error handling 2+ yerdə təkrarlanır

**Yerlər:**
- `src/app/api/auth/signup/route.ts` (sətir 64-68)
- `src/app/api/products/[id]/reviews/route.ts` (sətir 139-141)

**Pattern:**
```typescript
if (error.code === "P2002" || error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
  return errorResponse/badRequestResponse("Already exists message");
}
```

**Həll:** `handlePrismaUniqueError()` helper yaratmaq

---

### 3.2 Product Not Found Check
**Problem:** Eyni check 5+ yerdə təkrarlanır

**Pattern:**
```typescript
if (!product || !product.isActive) {
  return notFoundResponse("Product");
}
```

**Həll:** Query helper-də daxil etmək

---

## 4. TYPE TƏRİFLƏRİ TƏKRARLARI / TYPE DEFINITION DUPLICATES

### 4.1 Order Item Types
**Problem:** Order item strukturları müxtəlif yerlərdə təriflənir

**Yerlər:**
- `src/app/api/orders/route.ts` - `OrderItemRequest`, `OrderRequest`
- `src/lib/notifications/seller-order-email.ts` - `OrderItem`, `OrderForSellerEmail`

**Həll:** Mərkəzləşdirilmiş types faylı yaratmaq

---

## 5. HELPER FUNKSİYALAR TƏKRARLARI / HELPER FUNCTION DUPLICATES

### 5.1 calculateAverageRating və parseProductImages
**Problem:** Bu funksiyalar hər product query-dən sonra çağırılır

**Yerlər:**
- `src/app/api/products/route.ts` (sətir 83-98)
- `src/app/api/search/route.ts` (sətir 116-133)
- `src/app/api/categories/[id]/products/route.ts` (sətir 112-129)
- `src/app/api/products/[id]/route.ts` (sətir 66-67)

**Həll:** Query helper-də daxil etmək və ya transform helper yaratmaq

---

## 6. ÇAXIŞAN KODLAR / CONFLICTING CODE

### 6.1 Product Query Include Patterns
**Problem:** Müxtəlif yerlərdə fərqli include pattern-ləri istifadə olunur

**Nümunələr:**
- `productIncludeBasic` - search/route.ts
- Custom include - products/route.ts
- Detailed include - products/[id]/route.ts

**Həll:** Selector-ləri standartlaşdırmaq və istifadə etmək

---

### 6.2 Price Conversion
**Problem:** Price conversion müxtəlif yerlərdə fərqli şəkildə edilir

**Nümunələr:**
- `parseFloat(price)` - products/route.ts
- `Number(price)` - orders/route.ts
- `typeof price === 'string' ? parseFloat(price) : price` - orders/route.ts

**Həll:** `parsePrice()` helper yaratmaq

---

## 7. TÖVSİYƏ OLUNAN REFACTORING / RECOMMENDED REFACTORING

### Prioritet 1: Yüksək (Dərhal həll edilməlidir)
1. ✅ Validation helper-ləri API route-larda tətbiq et
2. ✅ Product query helper-ləri yarat və istifadə et
3. ✅ Error handling helper-ləri yarat

### Prioritet 2: Orta (Yaxın zamanda həll edilməlidir)
4. ✅ Price conversion helper yarat
5. ✅ Type definition-ları mərkəzləşdir
6. ✅ Product transform helper-ləri yarat

### Prioritet 3: Aşağı (Uzun müddətli)
7. ✅ Query selector-ləri standartlaşdır
8. ✅ Documentation yaxşılaşdır

---

## 8. STATİSTİKALAR / STATISTICS

- **Təkrar validation kodları:** 15+ yerdə
- **Təkrar Prisma query-ləri:** 20+ yerdə
- **Təkrar error handling:** 5+ yerdə
- **Təkrar type tərifləri:** 3+ yerdə
- **Çaxışan pattern-lər:** 5+ yerdə

**Ümumi potensial kod azalması:** ~30-40% kod təkrarlanması azaldıla bilər

