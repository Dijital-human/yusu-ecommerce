# Nested Dropdown Menyu Təkmilləşdirməsi - Agent Tapşırıqları
# Nested Dropdown Menu Enhancement - Agent Tasks

**Tarix / Date:** 2025-01-XX  
**Status:** Gözləyir / Pending  
**Prioritet:** Yüksək / High  
**Məqsəd / Goal:** `yusu-ecommerce` layihəsində istifadəçi dropdown menyusunda `yusu-seller`-dəki kimi nested dropdown funksionallığı əlavə etmək / Add nested dropdown functionality to user dropdown menu in `yusu-ecommerce` project like in `yusu-seller`

---

## 🎯 PROBLEM / PROBLEM

1. **Mövcud vəziyyət:**
   - `ExpandableLanguageMenu` və `ExpandableCurrencyMenu` komponentləri genişlənən menyu kimi işləyir (aşağıya doğru açılır)
   - İstifadəçi `yusu-seller`-dəki kimi nested dropdown istəyir (sağa doğru açılır)

2. **İstənilən vəziyyət:**
   - İstifadəçi butonuna klik olunduqda dropdown açılır
   - "Language" elementinə hover/klik olunduqda sağa doğru nested dropdown açılır və dillər görünür
   - "Currency" elementinə hover/klik olunduqda sağa doğru nested dropdown açılır və valyutalar görünür
   - `yusu-seller` layihəsindəki kimi işləməlidir

---

## ✅ TAPŞIRIQLAR / TASKS

### TAPŞIRIQ 1: Header.tsx-də Nested Dropdown İmplementasiyası

**Fayl:** `src/components/layout/Header.tsx`

**Dəyişikliklər:**

1. **Import əlavə et:**
   ```typescript
   import {
     DropdownMenu,
     DropdownMenuContent,
     DropdownMenuItem,
     DropdownMenuTrigger,
     DropdownMenuSub,           // Yeni
     DropdownMenuSubTrigger,    // Yeni
     DropdownMenuSubContent,    // Yeni
     DropdownMenuSeparator,     // Yeni (əgər yoxdursa)
   } from "@/components/ui/DropdownMenu";
   import { Globe, DollarSign, Check } from "lucide-react"; // Check əlavə et
   ```

2. **Language və Currency üçün nested dropdown yarat:**
   - `ExpandableLanguageMenu` və `ExpandableCurrencyMenu` komponentlərini sil
   - `DropdownMenuSub`, `DropdownMenuSubTrigger`, `DropdownMenuSubContent` istifadə et
   - `yusu-seller/src/components/layout/SellerNavigation.tsx` faylındakı kimi implementasiya et

3. **Dil sıralaması:** az, en, ru, tr, zh
4. **Valyuta sıralaması:** USD, AZN, EUR, TRY, RUB, CNY (USD başlayacaq)

---

## 📋 QAYDALAR / RULES

1. **Kommentlər:**
   - Azərbaycan və İngilis dillərində
   - Format: `// Azərbaycan / English`

2. **Kod keyfiyyəti:**
   - `yusu-seller` layihəsindəki kimi implementasiya et
   - Təkrar kod olmamalıdır
   - Məntiqsiz funksiyalar olmamalıdır

3. **UI:**
   - UI elementləri İngilis dilində olmalıdır
   - Tərcümə key-ləri ilə tərcümə olunmalıdır (az, en, ru, tr, zh)

4. **Nested Dropdown:**
   - `DropdownMenuSub`, `DropdownMenuSubTrigger`, `DropdownMenuSubContent` istifadə et
   - Sağa doğru açılmalıdır (Radix UI default davranışı)
   - Smooth animasiya olmalıdır

5. **Responsive:**
   - Mobil cihazlarda düzgün işləməlidir
   - Touch-friendly (min tap target 44x44px)

---

## ✅ TAMAMLANMA KRİTERİALARI / COMPLETION CRITERIA

1. ✅ İstifadəçi dropdown menyusunda "Language" elementinə hover/klik olunduqda nested dropdown açılır
2. ✅ Nested dropdown-da bütün dillər görünür (🇦🇿 Azərbaycan, 🇬🇧 English, 🇷🇺 Русский, 🇹🇷 Türkçe, 🇨🇳 中文)
3. ✅ Dil sıralaması: az, en, ru, tr, zh
4. ✅ Dil seçildikdə səhifənin dili dəyişir
5. ✅ Seçilmiş dil yanında checkmark (✓) görünür
6. ✅ İstifadəçi dropdown menyusunda "Currency" elementinə hover/klik olunduqda nested dropdown açılır
7. ✅ Nested dropdown-da bütün valyutalar görünür (🇺🇸 USD, 🇦🇿 AZN, 🇪🇺 EUR, 🇹🇷 TRY, 🇷🇺 RUB, 🇨🇳 CNY)
8. ✅ Valyuta sıralaması: USD, AZN, EUR, TRY, RUB, CNY
9. ✅ Valyuta seçildikdə dəyişir və localStorage-a yazılır
10. ✅ Seçilmiş valyuta yanında checkmark (✓) görünür
11. ✅ Nested dropdown sağa doğru açılır (Radix UI default)
12. ✅ Smooth animasiya işləyir
13. ✅ Responsive dizayn işləyir
14. ✅ Linter xətaları yoxdur
15. ✅ Saytın işləməsi pozulmayıb

---

## 📝 QEYDLƏR / NOTES

### Nested Dropdown Prinsipləri:
- `DropdownMenuSub` - nested dropdown container
- `DropdownMenuSubTrigger` - trigger button (Globe/DollarSign icon + text)
- `DropdownMenuSubContent` - nested dropdown content (dillər/valyutalar listi)
- Radix UI avtomatik olaraq sağa doğru açır

### Dillər / Languages (sıralama: az, en, ru, tr, zh):
```typescript
const languages = [
  { code: 'az', name: 'Azərbaycan', flag: '🇦🇿' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
];
```

### Valyutalar / Currencies (sıralama: USD, AZN, EUR, TRY, RUB, CNY):
```typescript
const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'AZN', symbol: '₼', name: 'Azerbaijani Manat', flag: '🇦🇿' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira', flag: '🇹🇷' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble', flag: '🇷🇺' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', flag: '🇨🇳' },
];
```

### Performans:
- Nested dropdown Radix UI tərəfindən optimizasiya edilir
- Smooth animasiyalar performanslıdır
- Lazy loading yoxdur (kiçik komponentlər)

### Accessibility:
- Keyboard navigation (Radix UI tərəfindən təmin olunur)
- Screen reader support
- Focus states
- ARIA labels

---

---

## ✅ TAMAMLANMA STATUSU / COMPLETION STATUS

**Status:** ✅ Tamamlandı / Completed  
**Tarix / Date:** 2025-01-XX  
**Prioritet:** Yüksək / High  

### Yerinə yetirilən tapşırıqlar / Completed Tasks:

1. ✅ `Header.tsx`-də `ExpandableLanguageMenu` və `ExpandableCurrencyMenu` komponentləri silindi
2. ✅ `DropdownMenuSub`, `DropdownMenuSubTrigger`, `DropdownMenuSubContent` istifadə edərək nested dropdown yaradıldı
3. ✅ `yusu-seller` layihəsindəki kimi implementasiya edildi
4. ✅ Language üçün nested dropdown funksionallığı təmin edildi
5. ✅ Currency üçün nested dropdown funksionallığı təmin edildi
6. ✅ Dil sıralaması: az, en, ru, tr, zh
7. ✅ Valyuta sıralaması: USD, AZN, EUR, TRY, RUB, CNY
8. ✅ Seçilmiş dil və valyuta yanında checkmark (✓) görünür
9. ✅ Nested dropdown sağa doğru açılır (Radix UI default)
10. ✅ Smooth animasiya işləyir
11. ✅ Responsive dizayn işləyir
12. ✅ Linter xətaları yoxdur
13. ✅ Saytın işləməsi pozulmayıb

### Dəyişikliklər / Changes:

- `Header.tsx`-də import-lar yeniləndi
- `useRouter`, `usePathname` (i18n routing-dən) əlavə edildi
- `languages` və `currencies` array-ləri təyin edildi
- `currency` state-i əlavə edildi
- `handleLanguageChange` və `handleCurrencyChange` funksiyaları əlavə edildi
- `ExpandableLanguageMenu` və `ExpandableCurrencyMenu` komponentləri nested dropdown ilə əvəz edildi

**Təxmini müddət / Estimated time:** 2-3 saat / 2-3 hours  
**Faktiki müddət / Actual time:** ~1 saat / ~1 hour

