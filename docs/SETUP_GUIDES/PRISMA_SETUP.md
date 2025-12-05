# 🗄️ PRISMA SETUP GUIDE
# 🗄️ PRISMA QURAŞDIRMA TƏLİMATI

**Tarix / Date:** 2025-01-28  
**Status:** ✅ Hazır / Ready  
**Domain:** `ulustore.com` (Production)

---

## 📋 HAQQINDA / ABOUT

### Prisma nədir?

**Prisma** müasir **ORM (Object-Relational Mapping)** alətidir ki, TypeScript və JavaScript ilə database-lərlə işləməyi asanlaşdırır. Prisma, database schema-nı kod kimi təyin etməyə və type-safe database queries yazmağa imkan verir.

### Prisma-nın əsas xüsusiyyətləri:

- **Type-Safe Database Queries:** Auto-generated TypeScript types ilə compile-time-da error-ları tutur
- **Schema-First Approach:** Database schema-nı Prisma Schema Language (PSL) ilə təyin edirsiniz
- **Migration Management:** Database schema dəyişikliklərini version control ilə idarə edir
- **Prisma Studio:** Visual database browser və editor (GUI)
- **Prisma Console:** Cloud database management platform (https://console.prisma.io)
- **Auto-Generated Client:** Schema dəyişikliklərindən sonra avtomatik olaraq Prisma Client generate olunur
- **Query Builder:** Intuitive və type-safe query API
- **Multi-Database Support:** PostgreSQL, MySQL, SQLite, MongoDB, SQL Server

### Prisma Console nədir?

**Prisma Console** (https://console.prisma.io) Prisma-nın cloud database management platformudur. Bu platform vasitəsilə:

- **Database Connection Management:** Birdən çox database connection-ləri idarə edə bilərsiniz
- **Schema Visualization:** Database schema-nızı visual olaraq görə bilərsiniz
- **Query Performance Analysis:** Database query-lərinizin performansını analiz edə bilərsiniz
- **Migration History:** Bütün migration tarixçəsini görə bilərsiniz
- **Data Browser və Editor:** Database məlumatlarını browser və editor vasitəsilə idarə edə bilərsiniz
- **Team Collaboration:** Komanda üzvləri ilə database-ləri paylaşa bilərsiniz
- **Database Monitoring:** Database health və performance metrikalarını izləyə bilərsiniz

### Prisma-nın digər ORM-lərdən fərqləri:

- **TypeScript-First:** TypeScript ilə native dəstək
- **Schema-First:** Database schema-nı kod kimi təyin edirsiniz
- **Migration System:** Built-in migration management
- **Developer Experience:** Daha yaxşı autocomplete və error messages
- **Performance:** Optimized query generation

### Prisma-nın üstünlükləri:

- ✅ **Type Safety:** Compile-time-da type checking
- ✅ **Developer Experience:** Yaxşı autocomplete və error messages
- ✅ **Migration Management:** Schema dəyişikliklərini asanlıqla idarə edir
- ✅ **Prisma Studio:** Visual database browser
- ✅ **Prisma Console:** Cloud database management
- ✅ **Code Generation:** Auto-generated TypeScript types
- ✅ **Query Optimization:** Optimized SQL queries

---

## 🎯 NİYƏ LAZIMDIR / WHY DO WE NEED IT

### Bizim platformada nə üçün istifadə edirik:

1. **Type-Safe Database Queries:**
   - TypeScript ilə database query-ləri yazarkən compile-time-da error-ları tuturuq
   - Auto-generated types sayəsində manual type definition yazmağa ehtiyac yoxdur

2. **Schema Management:**
   - Database schema-nı kod kimi təyin edirik (`prisma/schema.prisma`)
   - Schema dəyişikliklərini version control ilə idarə edirik
   - Migration-lar vasitəsilə schema dəyişikliklərini tətbiq edirik

3. **Developer Experience:**
   - Prisma Client ilə database query-ləri yazmaq çox asandır
   - Autocomplete və type checking sayəsində daha az error
   - Prisma Studio ilə database məlumatlarını visual olaraq görə bilirik

4. **Migration Management:**
   - Database schema dəyişikliklərini migration faylları ilə idarə edirik
   - Migration tarixçəsini izləyirik
   - Rollback imkanı var

5. **Prisma Console:**
   - Cloud-də database-ləri idarə edirik
   - Schema visualization və query performance analysis
   - Team collaboration

6. **Code Generation:**
   - Schema dəyişikliklərindən sonra avtomatik olaraq Prisma Client generate olunur
   - TypeScript types avtomatik olaraq yaradılır

### Alternativlər və niyə Prisma seçilib:

- **TypeORM:** Daha çox decorator-based, Prisma daha çox schema-first
- **Sequelize:** Daha köhnə, Prisma daha modern və type-safe
- **Knex.js:** SQL query builder, Prisma daha yüksək səviyyəli abstraction
- **Drizzle ORM:** Yeni, Prisma daha mature və daha çox feature

**Niyə Prisma seçilib:**
- TypeScript ilə native dəstək
- Yaxşı developer experience
- Migration management
- Prisma Studio və Prisma Console
- Active community və documentation

---

## 🔐 QEYDİYYAT VƏ SETUP / REGISTRATION AND SETUP

### Addım 1: Prisma Console Account Yaradın (Optional)

**Prisma Console** cloud database management üçün istifadə olunur. Əgər cloud database management istəyirsinizsə:

1. **Prisma Console səhifəsinə gedin:**
   - URL: https://console.prisma.io
   - "Sign Up" və ya "Get Started" basın

2. **Qeydiyyat metodunu seçin:**
   - GitHub (tövsiyə edilir)
   - Email

3. **Account yaradın:**
   - Email və şifrə daxil edin
   - Email verification edin

4. **Database Connection Əlavə Edin:**
   - Prisma Console → Projects → "New Project"
   - Database connection string-i əlavə edin
   - Project adı: `ulustore-production`

**Qeyd:** Prisma Console optional-dır. Local development üçün Prisma Studio kifayətdir.

---

## 📦 PRISMA INSTALL / PRISMA QURAŞDIRMASI

### Addım 2: Prisma Install Edin

Prisma artıq `package.json`-da mövcuddur. Yoxlayın:

```bash
cd yusu-ecommerce
npm list prisma @prisma/client
```

Əgər yoxdursa:

```bash
npm install prisma @prisma/client
npm install -D prisma
```

---

## 📊 SCHEMA YARADILMASI / SCHEMA CREATION

### Addım 3: Prisma Schema

Prisma schema faylı artıq mövcuddur:

**Fayl yolu / File path:** `yusu-ecommerce/prisma/schema.prisma`

Schema faylında:
- **Models:** Database table-ları təyin edir
- **Relations:** Table-lar arasındakı əlaqələri təyin edir
- **Enums:** Enum dəyərlərini təyin edir
- **Indexes:** Database index-lərini təyin edir

**Schema nümunəsi:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## 🔄 MIGRATION YARADILMASI VƏ TƏTBİQ EDİLMƏSİ / MIGRATION CREATION AND DEPLOYMENT

### Addım 4: Migration Yaradın

Schema dəyişikliklərindən sonra migration yaradın:

```bash
cd yusu-ecommerce
npx prisma migrate dev --name migration_name
```

Bu komanda:
- Migration faylı yaradır (`prisma/migrations/`)
- Database-ə migration tətbiq edir
- Prisma Client generate edir

### Addım 5: Migration Tətbiq Edin (Production)

Production-da migration tətbiq etmək üçün:

```bash
npx prisma migrate deploy
```

**Vercel-də:**
- Build command-də avtomatik olaraq işləyir:
  ```json
  "build": "prisma generate && prisma migrate deploy && next build"
  ```

---

## 🔧 PRISMA CLIENT GENERATE / PRISMA CLIENT GENERASİYASI

### Addım 6: Prisma Client Generate Edin

Schema dəyişikliklərindən sonra Prisma Client generate edin:

```bash
npx prisma generate
```

**Avtomatik olaraq:**
- `postinstall` script-də avtomatik olaraq işləyir:
  ```json
  "postinstall": "prisma generate"
  ```

**Fayl yolu / File path:**
- Generated client: `node_modules/.prisma/client/`
- Types: `node_modules/@prisma/client/`

---

## 🎨 PRISMA STUDIO / PRISMA STUDIO

### Addım 7: Prisma Studio İstifadəsi

Prisma Studio visual database browser və editordur:

```bash
npx prisma studio
```

Bu komanda:
- Browser-da Prisma Studio açır (http://localhost:5555)
- Database məlumatlarını görə bilərsiniz
- Məlumatları edit edə bilərsiniz
- Query-ləri test edə bilərsiniz

**Qeyd:** Prisma Studio local development üçündür. Production üçün Prisma Console istifadə edin.

---

## ☁️ PRISMA CONSOLE / PRISMA CONSOLE

### Addım 8: Prisma Console İstifadəsi

**Prisma Console** cloud database management platformudur:

1. **Prisma Console-a daxil olun:**
   - URL: https://console.prisma.io
   - Login olun

2. **Project Yaradın:**
   - Projects → "New Project"
   - Project adı: `ulustore-production`
   - Database connection string-i əlavə edin

3. **Schema Sync:**
   - Prisma Console schema-nızı avtomatik olaraq sync edir
   - Schema dəyişikliklərini görə bilərsiniz

4. **Query Performance Analysis:**
   - Query performance metrikalarını görə bilərsiniz
   - Slow query-ləri identifikasiya edə bilərsiniz

5. **Migration History:**
   - Bütün migration tarixçəsini görə bilərsiniz
   - Migration status-u izləyə bilərsiniz

6. **Data Browser:**
   - Database məlumatlarını browser vasitəsilə görə bilərsiniz
   - Məlumatları edit edə bilərsiniz

---

## 🔑 DATABASE CONNECTION / VERİTABANI BAĞLANTISI

### Addım 9: Database Connection String

Database connection string `DATABASE_URL` environment variable-də saxlanılır:

**Hara yazılacaq / Where to add:**

**Vercel Environment Variables:**
- Key: `DATABASE_URL`
- Value: Connection string (Supabase-dən gəlir)

**Local `.env.production` faylı:**
```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**Fayl yolu / File path:**
- `yusu-ecommerce/env.production` (gitignore-da olmalıdır)
- Vercel: Project Settings → Environment Variables

**Connection Pooling:**
- Production üçün connection pooling tövsiyə edilir
- Connection string-də pooler URL istifadə edin:
  ```
  postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
  ```

---

## 📝 KONFİQURASİYA FAYLLARI / CONFIGURATION FILES

### `prisma/schema.prisma` (Mövcuddur)

Bu fayl artıq konfiqurasiya edilib. Yoxlayın:
- Database provider: `postgresql`
- Generator: `prisma-client-js`
- Models: Bütün database table-ları təyin edilib

**Fayl yolu / File path:** `yusu-ecommerce/prisma/schema.prisma`

### `src/lib/db.ts` (Mövcuddur)

Bu fayl Prisma Client instance yaradır:

```typescript
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
```

**Fayl yolu / File path:** `yusu-ecommerce/src/lib/db.ts`

---

## 🧪 TEST / TEST

### Database Connection Test

1. **Local mühitdə:**
   ```bash
   cd yusu-ecommerce
   npx prisma db pull
   ```

2. **Prisma Studio ilə:**
   ```bash
   npx prisma studio
   ```

3. **Vercel-də:**
   - Deployment zamanı avtomatik test edilir
   - Health check endpoint: `/api/health`

---

## 📚 ƏLAVƏ MƏLUMAT / ADDITIONAL INFORMATION

- **Prisma Documentation:** https://www.prisma.io/docs
- **Prisma Console:** https://console.prisma.io
- **Prisma Studio:** https://www.prisma.io/studio
- **Migration Guide:** https://www.prisma.io/docs/guides/migrate
- **Schema Reference:** https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference

---

## 🔒 TƏHLÜKƏSİZLİK / SECURITY

### Best Practices

- ⚠️ Database connection string-i git-də commit etməyin
- ⚠️ Connection string-i yalnız environment variables-də saxlayın
- ⚠️ Production və development üçün ayrı database-lər istifadə edin
- ⚠️ Migration fayllarını version control-də saxlayın
- ⚠️ Prisma Console-da database credentials-i təhlükəsiz saxlayın

---

## 💡 TİPS / MƏSLƏHƏTLƏR

- Schema dəyişikliklərindən sonra həmişə migration yaradın
- Migration-ları test edin production-a deploy etməzdən əvvəl
- Prisma Studio ilə local development-da database məlumatlarını görə bilərsiniz
- Prisma Console ilə cloud-də database-ləri idarə edə bilərsiniz
- Connection pooling istifadə edin (daha yaxşı performans)

---

**Son Yeniləmə / Last Update:** 2025-01-28

