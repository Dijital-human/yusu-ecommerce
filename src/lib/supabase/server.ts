/**
 * Supabase Server-Side Client / Supabase Server-Tərəf Klienti
 * API routes və server components üçün Supabase client
 * Supabase client for API routes and server components
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  // Development-da xəta göstərmə, yalnız warning
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      '⚠️ Supabase service role key is not set. Server-side Supabase features will not work.'
    )
  }
}

/**
 * Supabase admin client for server-side usage
 * Server-side istifadə üçün Supabase admin klienti
 * 
 * ⚠️ DİQQƏT: Service role key bütün icazələrə malikdir!
 * ⚠️ WARNING: Service role key has all permissions!
 * 
 * Bu client yalnız server-side-də istifadə edilməlidir.
 * This client should only be used server-side.
 */
export const supabaseAdmin = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null

/**
 * Supabase client with anon key for server-side usage (limited permissions)
 * Server-side istifadə üçün anon key ilə Supabase klienti (məhdud icazələr)
 */
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabaseServer = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null

/**
 * Type-safe Supabase admin client
 * Type-safe Supabase admin klienti
 */
export type SupabaseAdminClient = typeof supabaseAdmin extends null
  ? null
  : ReturnType<typeof createClient>

