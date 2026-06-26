import { createBrowserClient } from '@supabase/ssr'
import { Database } from './types'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  }
  if (!supabaseKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseKey
  )
}
