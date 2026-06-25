import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function check() {
  const { data: user } = await supabase.from('users').select('*').eq('email', 'saptech.online009@gmail.com').single()
  // Wait, users are in auth.users, but we might not be able to query it from here easily, let's query profiles
  const { data: profile } = await supabase.from('profiles').select('*').limit(10)
  
  const { data: orgs } = await supabase.from('organization_members').select('*')
  console.log('Profiles:', profile)
  console.log('Org Members:', orgs)
}
check()
