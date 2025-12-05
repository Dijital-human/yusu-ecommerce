# Email Verification Migration Guide / Email Təsdiq Migration Təlimatı

## Migration Faylı
**Path:** `prisma/migrations/20250128000000_add_email_verification_fields/migration.sql`

## SQL Migration

```sql
-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailVerificationToken" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailVerificationTokenExpiry" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "users_emailVerificationToken_idx" ON "users"("emailVerificationToken");
CREATE INDEX IF NOT EXISTS "users_emailVerified_idx" ON "users"("emailVerified");
```

## Migration Tətbiq Etmək

### Seçim 1: Prisma CLI ilə (Database Connection Varsa)

```bash
cd yusu-ecommerce
npx prisma migrate deploy
```

### Seçim 2: Supabase Dashboard-dan Manual Tətbiq

1. **Supabase Dashboard-a daxil olun:**
   - https://supabase.com/dashboard
   - Project-inizi seçin

2. **SQL Editor-a gedin:**
   - Sol menyudan "SQL Editor" seçin
   - "New query" düyməsini basın

3. **SQL-i çalıştırın:**
   - Yuxarıdakı SQL kodunu kopyalayın
   - SQL Editor-a yapışdırın
   - "Run" düyməsini basın

### Seçim 3: Vercel-də Avtomatik Migration

Vercel-də deploy zamanı migration avtomatik tətbiq olunacaq, əgər:

1. **Environment Variables təyin edilib:**
   - `DATABASE_URL` - PostgreSQL connection string
   - `NEXTAUTH_SECRET` - Secret key
   - `NEXTAUTH_URL` - `https://ulustore.com`

2. **Build Command-də migration var:**
   ```json
   {
     "scripts": {
       "build": "prisma generate && prisma migrate deploy && next build"
     }
   }
   ```

## Migration Status Yoxlamaq

```bash
cd yusu-ecommerce
npx prisma migrate status
```

## Schema Yeniləmək

Migration tətbiq edildikdən sonra:

```bash
cd yusu-ecommerce
npx prisma generate
```

## Test Etmək

Migration uğurla tətbiq edildikdən sonra:

1. **Schema yoxlama:**
   ```bash
   npx prisma db pull
   ```

2. **Application test:**
   ```bash
   npm run dev
   ```

3. **Signup test:**
   - Real email ilə signup edin
   - Email-də verification link-i yoxlayın
   - Link-ə klik edib email-i təsdiq edin

## Qeyd

- Migration `IF NOT EXISTS` istifadə edir, ona görə də təhlükəsizdir
- Əgər column-lar artıq varsa, xəta verməyəcək
- Index-lər də `IF NOT EXISTS` ilə yaradılır

