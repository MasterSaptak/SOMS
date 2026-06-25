import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15cHJvamVjdCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzA0MDY3MjAwLCJleHAiOjIwMTk2MDMyMDB9.h2p...' // Need real key or just use NEXT_PUBLIC_SUPABASE_URL, wait, actually we can just read from .env.local

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
)

async function run() {
  const { data: users } = await supabase.auth.admin.listUsers()
  const user = users.users.find(u => u.email === 'saptech.online009@gmail.com')
  if (!user) {
    console.log('User not found in auth.users')
    return
  }
  console.log('User ID:', user.id)

  const { data: emp, error } = await supabase.from('employees').select('*').eq('user_id', user.id)
  console.log('Employee Record:', emp, error)
}
run().catch(console.error)
