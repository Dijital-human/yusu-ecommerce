# Çoxdilli Funksiyanın Aktivləşdirilməsi - Agent Tapşırıqları
# Multilingual Function Activation - Agent Tasks

**Tarix / Date:** 2025-01-XX  
**Status:** Gözləyir / Pending  
**Prioritet:** Yüksək / High  
**Məqsəd / Goal:** Çoxdilli funksiyanı tam aktivləşdirmək və dil seçimi olduqda bütün səhifənin tərcümə olunmasını təmin etmək / Fully activate multilingual functionality and ensure all pages are translated when language is selected

---

## 🎯 PROBLEM / PROBLEM

1. **Mövcud vəziyyət:**
   - next-intl quraşdırılıb və konfiqurasiya edilib
   - Translation faylları mövcuddur (az, en, ru, tr, zh)
   - Middleware və layout düzgün konfiqurasiya edilib
   - Amma bəzi komponentlərdə hardcoded mətnlər ola bilər
   - Dil dəyişikliyi zamanı bütün səhifə tərcümə olunmur

2. **İstənilən vəziyyət:**
   - Bütün komponentlərdə `useTranslations` hook-u düzgün istifadə olunmalıdır
   - Hardcoded mətnlər olmamalıdır
   - Dil seçimi olduqda bütün səhifə tərcümə olunmalıdır
   - Bütün translation key-ləri bütün dillərdə mövcud olmalıdır

---

## ✅ TAPŞIRIQLAR / TASKS

### TAPŞIRIQ 1: Hardcoded Mətnləri Tapmaq və Tərcümə Key-ləri ilə Əvəz Etmək

**Fayllar:** Bütün komponentlər (`src/components/**/*.tsx`)

**Məqsəd:**
- Bütün komponentlərdə hardcoded mətnləri tapmaq
- Translation key-ləri əlavə etmək
- `useTranslations` hook-u istifadə etmək

**Addımlar:**
1. Bütün komponentlərdə hardcoded mətnləri axtar:
   - Dırnaq içində mətnlər: `"Text"`, `'Text'`
   - className içində mətnlər
   - placeholder mətnləri
   - button mətnləri
   - error mesajları
   - success mesajları
   - aria-label mətnləri

2. Hər bir hardcoded mətn üçün:
   - Uyğun translation key yarat
   - `messages/*.json` fayllarına əlavə et (az, en, ru, tr, zh)
   - Komponentdə `useTranslations` hook-u istifadə et
   - Hardcoded mətnləri `t('key')` ilə əvəz et

**Nümunə:**
```typescript
// ❌ YANLIŞ / WRONG
<button>Click me</button>
<input placeholder="Enter your name" />

// ✅ DÜZGÜN / CORRECT
const t = useTranslations('common');
<button>{t('clickMe')}</button>
<input placeholder={t('enterYourName')} />
```

---

### TAPŞIRIQ 2: Translation Key-lərinin Tamlığını Yoxlamaq

**Fayllar:** `messages/*.json` (az, en, ru, tr, zh)

**Məqsəd:**
- Bütün translation key-lərinin bütün dillərdə mövcud olduğunu yoxlamaq
- Çatışmayan key-ləri əlavə etmək
- Key strukturunun eyni olduğunu təmin etmək

**Addımlar:**
1. `messages/en.json` faylını əsas götür
2. Hər bir key üçün digər dillərdə (az, ru, tr, zh) mövcudluğunu yoxla
3. Çatışmayan key-ləri əlavə et
4. Key strukturunun eyni olduğunu təmin et

**Nümunə:**
```json
// messages/en.json
{
  "common": {
    "clickMe": "Click me",
    "enterYourName": "Enter your name"
  }
}

// messages/az.json
{
  "common": {
    "clickMe": "Mənə klik et",
    "enterYourName": "Adınızı daxil edin"
  }
}
```

---

### TAPŞIRIQ 3: Dil Dəyişikliyinin Düzgün İşləməsini Təmin Etmək

**Fayl:** `src/components/layout/Header.tsx`

**Məqsəd:**
- Dil dəyişikliyi zamanı bütün səhifənin tərcümə olunmasını təmin etmək
- `handleLanguageChange` funksiyasını təkmilləşdirmək

**Mövcud kod:**
```typescript
const handleLanguageChange = (newLocale: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("preferredLocale", newLocale);
  }
  router.replace(pathname, { locale: newLocale });
  setTimeout(() => {
    window.location.reload();
  }, 50);
};
```

**Təkmilləşdirmə:**
- `router.replace` düzgün işləyir, amma səhifə reload olunur
- Reload olmadan tərcümələrin yüklənməsini təmin etmək üçün:
  1. `NextIntlClientProvider`-in düzgün işlədiyini yoxla
  2. `getMessages()` funksiyasının düzgün işlədiyini yoxla
  3. Client-side tərcümələrin düzgün yeniləndiyini təmin et

---

### TAPŞIRIQ 4: Səhifə Komponentlərində Tərcümələrin Yüklənməsini Yoxlamaq

**Fayllar:** `src/app/[locale]/**/*.tsx`

**Məqsəd:**
- Bütün səhifə komponentlərində tərcümələrin düzgün yükləndiyini yoxlamaq
- Hardcoded mətnləri tapmaq və tərcümə key-ləri ilə əvəz etmək

**Addımlar:**
1. Bütün səhifə komponentlərini yoxla:
   - `src/app/[locale]/page.tsx` (HomePage)
   - `src/app/[locale]/products/page.tsx`
   - `src/app/[locale]/categories/page.tsx`
   - `src/app/[locale]/about/page.tsx`
   - və s.

2. Hər bir səhifədə:
   - `useTranslations` hook-unun istifadə olunduğunu yoxla
   - Hardcoded mətnləri tap
   - Translation key-ləri əlavə et

---

### TAPŞIRIQ 5: API Response Mesajlarının Tərcüməsi

**Fayllar:** `src/app/api/**/*.ts`

**Məqsəd:**
- API response mesajlarının tərcümə olunmasını təmin etmək
- Error mesajlarının tərcümə olunmasını təmin etmək

**Addımlar:**
1. API route-larda error mesajlarını yoxla
2. Error mesajları üçün translation key-ləri yarat
3. Client-side-də error mesajlarını tərcümə et

**Nümunə:**
```typescript
// API route
return NextResponse.json(
  { error: "PRODUCT_NOT_FOUND" }, // Translation key
  { status: 404 }
);

// Client-side
const t = useTranslations('errors');
const errorMessage = t('productNotFound');
```

---

### TAPŞIRIQ 6: Form Validation Mesajlarının Tərcüməsi

**Fayllar:** Form komponentləri

**Məqsəd:**
- Form validation mesajlarının tərcümə olunmasını təmin etmək
- Error mesajlarının tərcümə olunmasını təmin etmək

**Addımlar:**
1. Bütün form komponentlərini yoxla
2. Validation mesajlarını tap
3. Translation key-ləri əlavə et
4. `useTranslations` hook-u istifadə et

---

## 📋 QAYDALAR / RULES

1. **Kommentlər:**
   - Azərbaycan və İngilis dillərində
   - Format: `// Azərbaycan / English`

2. **Translation Key-ləri:**
   - Key-lər İngilis dilində olmalıdır (camelCase)
   - Key struktur eyni olmalıdır (bütün dillərdə)
   - Key-lər məntiqi qruplara bölünməlidir (common, navigation, errors, və s.)

3. **useTranslations Hook:**
   - Hər komponentdə uyğun namespace istifadə et
   - Fallback dəyərlər istifadə et: `t('key') || 'Fallback'`
   - Nested key-lər istifadə et: `t('section.key')`

4. **Hardcoded Mətnlər:**
   - Hardcoded mətnlər olmamalıdır
   - Bütün mətnlər translation key-ləri ilə əvəz olunmalıdır
   - Exception: Technical mətnlər (error codes, IDs, və s.)

5. **Dil Dəyişikliyi:**
   - Dil dəyişikliyi zamanı bütün səhifə tərcümə olunmalıdır
   - URL dəyişməlidir: `/az/...` → `/en/...`
   - localStorage-a seçilmiş dil yazılmalıdır

---

## ✅ TAMAMLANMA KRİTERİALARI / COMPLETION CRITERIA

1. ✅ Bütün komponentlərdə hardcoded mətnlər yoxdur
2. ✅ Bütün komponentlərdə `useTranslations` hook-u istifadə olunur
3. ✅ Bütün translation key-ləri bütün dillərdə mövcuddur (az, en, ru, tr, zh)
4. ✅ Translation key struktur eynidir (bütün dillərdə)
5. ✅ Dil seçimi olduqda bütün səhifə tərcümə olunur
6. ✅ Form validation mesajları tərcümə olunur
7. ✅ API error mesajları tərcümə olunur
8. ✅ URL dəyişir: `/az/...` → `/en/...`
9. ✅ localStorage-a seçilmiş dil yazılır
10. ✅ Linter xətaları yoxdur
11. ✅ Saytın işləməsi pozulmayıb

---

## 📝 QEYDLƏR / NOTES

### Translation Key Strukturu:
```json
{
  "common": {
    "welcome": "...",
    "loading": "...",
    "error": "..."
  },
  "navigation": {
    "home": "...",
    "products": "...",
    "categories": "..."
  },
  "errors": {
    "productNotFound": "...",
    "unauthorized": "..."
  }
}
```

### useTranslations Hook İstifadəsi:
```typescript
// Single namespace / Tək namespace
const t = useTranslations('common');
const text = t('welcome');

// Multiple namespaces / Çoxlu namespace-lər
const tCommon = useTranslations('common');
const tNav = useTranslations('navigation');
const tErrors = useTranslations('errors');

// Nested keys / Nested key-lər
const t = useTranslations('navigation');
const text = t('menu.home');
```

### Dil Dəyişikliyi:
- `router.replace(pathname, { locale: newLocale })` - URL dəyişir
- `window.location.reload()` - Səhifə yenilənir (tərcümələr yüklənir)
- `localStorage.setItem('preferredLocale', newLocale)` - Seçim saxlanılır

### Performans:
- Translation faylları server-side yüklənir
- Client-side tərcümələr cache olunur
- Lazy loading yoxdur (kiçik fayllar)

### Accessibility:
- `lang` atributu HTML elementində: `<div lang={locale}>`
- Screen reader support
- RTL dəstəyi (gələcək üçün)

---

## 🔍 YOXLAMA SİYAHISI / CHECKLIST

### Komponentlər:
- [ ] Header.tsx
- [ ] Footer.tsx
- [ ] HomePage.tsx
- [ ] ProductCard.tsx
- [ ] Cart.tsx
- [ ] SearchBar.tsx
- [ ] MegaMenu.tsx
- [ ] Bütün form komponentləri
- [ ] Bütün səhifə komponentləri

### Translation Faylları:
- [ ] messages/en.json - tam və düzgün
- [ ] messages/az.json - tam və düzgün
- [ ] messages/ru.json - tam və düzgün
- [ ] messages/tr.json - tam və düzgün
- [ ] messages/zh.json - tam və düzgün

### Funksionallıq:
- [ ] Dil dəyişikliyi işləyir
- [ ] Bütün səhifə tərcümə olunur
- [ ] URL dəyişir
- [ ] localStorage-a yazılır
- [ ] Form validation mesajları tərcümə olunur
- [ ] API error mesajları tərcümə olunur

---

---

## ✅ TAMAMLANMA STATUSU / COMPLETION STATUS

**Status:** 🔄 Davam edir / In Progress  
**Tarix / Date:** 2025-01-XX  
**Prioritet:** Yüksək / High  

### Yerinə yetirilən tapşırıqlar / Completed Tasks:

1. ✅ `Header.tsx`-də fallback dəyərlər silindi
2. ✅ `DynamicHomepage.tsx`-də fallback dəyərlər silindi
3. ✅ `MegaMenu.tsx`-də fallback dəyərlər silindi
4. ✅ Translation key-ləri əlavə edildi (`failedToLoadHomepage`)
5. ✅ Bütün dillərdə translation key-ləri əlavə edildi (az, en, ru, tr, zh)
6. ✅ Dil dəyişikliyi funksionallığı işləyir (səhifə reload olunur)

### Qalan tapşırıqlar / Remaining Tasks:

1. ⏳ Digər komponentlərdə hardcoded mətnləri tapmaq və tərcümə key-ləri ilə əvəz etmək
2. ⏳ Translation key-lərinin tamlığını yoxlamaq (bütün dillərdə)
3. ⏳ Səhifə komponentlərində tərcümələrin yüklənməsini yoxlamaq
4. ⏳ API response mesajlarının tərcüməsi
5. ⏳ Form validation mesajlarının tərcüməsi

**Təxmini müddət / Estimated time:** 5-7 gün / 5-7 days  
**Faktiki müddət / Actual time:** ~1 gün (davam edir) / ~1 day (in progress)

