/**
 * Supabase Client-Side Client / Supabase Client-Tərəf Klienti
 * Browser-də istifadə üçün Supabase client
 * Supabase client for use in the browser
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Development-da xəta göstərmə, yalnız warning
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      '⚠️ Supabase environment variables are not set. Client-side Supabase features will not work.'
    )
  }
}

/**
 * Supabase client for client-side usage
 * Client-side istifadə üçün Supabase klienti
 */
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

/**
 * Type-safe Supabase client
 * Type-safe Supabase klienti
 */
export type SupabaseClient = typeof supabase extends null ? null : ReturnType<typeof createClient>

