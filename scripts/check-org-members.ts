import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function check() {
  const { data: profile } = await supabase.from('profiles').select('*').limit(10)
  const { data: orgs } = await supabase.from('organization_members').select('*')
  console.log('Profiles:', profile)
  console.log('Org Members:', orgs)
}
check()
