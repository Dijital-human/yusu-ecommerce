# İstifadəçi Dropdown Menyu Təkmilləşdirməsi - Agent Tapşırıqları
# User Dropdown Menu Enhancement - Agent Tasks

**Tarix / Date:** 2025-01-XX  
**Status:** Gözləyir / Pending  
**Prioritet:** Yüksək / High  
**Məqsəd / Goal:** İstifadəçi dropdown menyusunu Alibaba, Trendyol kimi iri saytlardakı kimi dizayn etmək və genişlənən Language/Currency menyuları əlavə etmək / Design user dropdown menu like Alibaba, Trendyol with expandable Language/Currency menus

---

## 🎯 PROBLEM / PROBLEM

1. **Mövcud dizayn Alibaba/Trendyol kimi deyil**
   - İstifadəçi dropdown menyusu sadə görünür
   - Language və Currency nested dropdown kimi işləyir, amma genişlənən menyu yoxdur
   - Dizayn modern deyil

2. **Genişlənən menyu yoxdur**
   - Language və Currency-ə klik olunduqda kiçik menyu açılır
   - İstifadəçi istəyir ki, açılan menyu genişlənərək bütün dillər və valyutalar görünsün

---

## ✅ TAPŞIRIQLAR / TASKS

### TAPŞIRIQ 1: İstifadəçi Dropdown Menyusunu Yenidən Dizayn Etmək

**Fayl:** `src/components/layout/Header.tsx`

**Məqsəd:**
- Alibaba, Trendyol kimi modern dizayn
- İstifadəçi məlumatları (ad, email, avatar) yuxarıda
- Menyu elementləri: Profil, Sifarişlər, İstək siyahısı, Language, Currency, Tənzimləmələr
- Çıxış butonu aşağıda

**Dizayn tələbləri:**
1. **Header bölməsi:**
   - Avatar (gradient dairə)
   - İstifadəçi adı (bold)
   - Email (kiçik, gray)
   - Border-bottom separator

2. **Menyu elementləri:**
   - Hər element icon + text
   - Hover effect (bg-gray-50, text-primary-600)
   - Smooth transition
   - Language və Currency genişlənən menyu kimi

3. **Footer bölməsi:**
   - Çıxış butonu (qırmızı rəng)
   - Border-top separator

---

### TAPŞIRIQ 2: Genişlənən Language Menyu Komponenti Yaratmaq

**Fayl:** `src/components/ui/ExpandableLanguageMenu.tsx` (yeni fayl)

**Məqsəd:**
- Language butonuna klik olunduqda genişlənən menyu
- Açılanda bütün dillər görünür (🇦🇿 Azərbaycan, 🇬🇧 English, 🇹🇷 Türkçe, 🇷🇺 Русский, 🇨🇳 中文)
- Smooth animasiya ilə açılır/bağlanır
- Dil seçildikdə səhifənin dili dəyişir

**Funksionallıq:**
1. **Collapsed state:**
   - Icon (Globe) + "Language / Dil" text
   - ChevronRight icon (sağa baxır)

2. **Expanded state:**
   - ChevronDown icon (aşağıya baxır)
   - Bütün dillər listi görünür
   - Hər dil: flag + name + checkmark (seçilmiş dil üçün)

3. **Animasiya:**
   - `max-height` transition
   - `opacity` transition
   - Smooth expand/collapse

---

### TAPŞIRIQ 3: Genişlənən Currency Menyu Komponenti Yaratmaq

**Fayl:** `src/components/ui/ExpandableCurrencyMenu.tsx` (yeni fayl)

**Məqsəd:**
- Currency butonuna klik olunduqda genişlənən menyu
- Açılanda bütün valyutalar görünür (🇺🇸 USD, 🇪🇺 EUR, 🇦🇿 AZN, 🇹🇷 TRY, 🇷🇺 RUB, 🇨🇳 CNY)
- Smooth animasiya ilə açılır/bağlanır
- Valyuta seçildikdə dəyişir və localStorage-a yazılır

**Funksionallıq:**
1. **Collapsed state:**
   - Icon (DollarSign) + "Currency / Valyuta" text
   - ChevronRight icon (sağa baxır)

2. **Expanded state:**
   - ChevronDown icon (aşağıya baxır)
   - Bütün valyutalar listi görünür
   - Hər valyuta: flag + name + symbol + code + checkmark (seçilmiş valyuta üçün)

3. **Animasiya:**
   - `max-height` transition
   - `opacity` transition
   - Smooth expand/collapse

---

### TAPŞIRIQ 4: Header.tsx-də Yeni Komponentləri İstifadə Etmək

**Fayl:** `src/components/layout/Header.tsx`

**Dəyişikliklər:**
1. `ExpandableLanguageMenu` və `ExpandableCurrencyMenu` import et
2. Mövcud `LanguageSwitcher nested={true}` və `CurrencySwitcher nested={true}` sil
3. Yeni komponentləri əlavə et
4. Dizaynı təkmilləşdir (Alibaba/Trendyol kimi)

---

## 📋 QAYDALAR / RULES

1. **Kommentlər:**
   - Azərbaycan və İngilis dillərində
   - Format: `// Azərbaycan / English`

2. **Kod keyfiyyəti:**
   - Təkrar kod olmamalıdır
   - Məntiqsiz funksiyalar olmamalıdır
   - İstifadə olunmayan kod silinməlidir

3. **UI:**
   - UI elementləri İngilis dilində olmalıdır
   - Tərcümə oluna bilməlidir (az, en, ru, tr, zh)

4. **Animasiya:**
   - Smooth transition (300ms)
   - `max-height` və `opacity` istifadə et
   - `ease-in-out` timing function

5. **Responsive:**
   - Mobil cihazlarda düzgün işləməlidir
   - Touch-friendly (min tap target 44x44px)

---

## ✅ TAMAMLANMA KRİTERİALARI / COMPLETION CRITERIA

1. ✅ İstifadəçi dropdown menyusu Alibaba/Trendyol kimi dizayn edilib
2. ✅ Profil, Sifarişlər, İstək siyahısı, Tənzimləmələr linkləri işləyir
3. ✅ Language genişlənən menyu işləyir (klik ilə açılır/bağlanır)
4. ✅ Currency genişlənən menyu işləyir (klik ilə açılır/bağlanır)
5. ✅ Dil seçildikdə səhifənin dili dəyişir
6. ✅ Valyuta seçildikdə dəyişir və localStorage-a yazılır
7. ✅ Smooth animasiya işləyir
8. ✅ Responsive dizayn işləyir
9. ✅ Linter xətaları yoxdur
10. ✅ Saytın işləməsi pozulmayıb

---

## 📝 QEYDLƏR / NOTES

### Dizayn Prinsipləri:
- Modern, clean dizayn
- Alibaba/Trendyol ilhamı
- Qırmızı rəng palitrası (primary colors)
- Smooth animasiyalar
- User-friendly interface

### Genişlənən Menyu:
- `max-height` transition istifadə et (0 → 96)
- `opacity` transition istifadə et (0 → 1)
- `duration-300` və `ease-in-out` istifadə et
- Chevron icon dəyişir (ChevronRight → ChevronDown)

### Performans:
- Animasiyalar performanslıdır (transform, opacity)
- GPU acceleration istifadə olunur
- Lazy loading yoxdur (kiçik komponentlər)

### Accessibility:
- Keyboard navigation
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

1. ✅ İstifadəçi dropdown menyusu Alibaba/Trendyol kimi dizayn edilib
2. ✅ `ExpandableLanguageMenu` komponenti yaradılıb və işləyir
3. ✅ `ExpandableCurrencyMenu` komponenti yaradılıb və işləyir
4. ✅ Header.tsx-də yeni komponentlər inteqrasiya edilib
5. ✅ Çoxdilli tərcümə key-ləri əlavə edilib (az, en, ru, tr, zh)
6. ✅ UI elementləri yalnız bir dildə (en) və tərcümə olunur
7. ✅ Smooth animasiyalar işləyir
8. ✅ Responsive dizayn işləyir
9. ✅ Linter xətaları yoxdur

### Translation Key-ləri / Translation Keys:

- `navigation.language` - Dil adı / Language name
- `navigation.currency` - Valyuta adı / Currency name
- `navigation.languageLabel` - Language menyu başlığı / Language menu title
- `navigation.currencyLabel` - Currency menyu başlığı / Currency menu title

**Təxmini müddət / Estimated time:** 3-4 saat / 3-4 hours  
**Faktiki müddət / Actual time:** ~2 saat / ~2 hours

