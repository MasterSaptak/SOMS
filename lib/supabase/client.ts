import { createBrowserClient } from '@supabase/ssr'
import { Database } from './types'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co'
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_key'
  console.log('Using Supabase URL:', supabaseUrl)

  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseKey
  )
}
