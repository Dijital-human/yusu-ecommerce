# Supabase Client Konfiqurasiyası / Supabase Client Configuration

Bu papka Supabase client konfiqurasiyasını ehtiva edir.

This folder contains Supabase client configuration.

---

## 📋 **Fayllar / Files**

- **`client.ts`** - Client-side (Browser) üçün Supabase client
- **`server.ts`** - Server-side (API Routes) üçün Supabase client
- **`index.ts`** - Mərkəzləşdirilmiş export-lar

---

## 🚀 **İstifadə / Usage**

### **Client-Side (Browser) üçün:**

```typescript
import { supabase } from '@/lib/supabase/client'

// Component-də istifadə
export function MyComponent() {
  const handleClick = async () => {
    if (!supabase) {
      console.error('Supabase client is not configured')
      return
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(10)

    if (error) {
      console.error('Error:', error)
      return
    }

    console.log('Data:', data)
  }

  return <button onClick={handleClick}>Load Products</button>
}
```

### **Server-Side (API Routes) üçün:**

```typescript
import { supabaseAdmin, supabaseServer } from '@/lib/supabase/server'

// Admin client (bütün icazələr)
export async function GET() {
  if (!supabaseAdmin) {
    return Response.json({ error: 'Supabase admin client is not configured' }, { status: 500 })
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ data })
}

// Server client (məhdud icazələr)
export async function POST() {
  if (!supabaseServer) {
    return Response.json({ error: 'Supabase server client is not configured' }, { status: 500 })
  }

  const { data, error } = await supabaseServer
    .from('products')
    .select('*')
    .limit(10)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ data })
}
```

---

## ⚙️ **Environment Variables**

`.env.local` faylına əlavə edin:

```bash
# Supabase Project URL
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT_REF].supabase.co"

# Supabase Anon/Public Key (Client-side üçün)
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"

# Supabase Service Role Key (Server-side üçün)
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
```

---

## ⚠️ **Təhlükəsizlik / Security**

1. **Service Role Key:**
   - ⚠️ Bu key-i git-ə commit etməyin!
   - ⚠️ Yalnız server-side-də istifadə edin!
   - ⚠️ Bütün icazələrə malikdir!

2. **Anon Key:**
   - ✅ Client-side-də istifadə edilə bilər
   - ✅ Məhdud icazələrə malikdir
   - ✅ Row Level Security (RLS) ilə qorunur

---

## 📚 **Əlavə Məlumat / Additional Information**

- **Supabase Docs:** https://supabase.com/docs
- **Supabase JS Client:** https://supabase.com/docs/reference/javascript/introduction

---

**Son yeniləmə / Last updated:** 2025-01-27

