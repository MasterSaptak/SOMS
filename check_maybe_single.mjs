import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function run() {
  const { data, error } = await supabase
    .from('organization_members')
    .select('id, organization_id, role, status')
    .eq('user_id', '3b5bd9dd-9dab-4e6d-8149-c088a631cae2')
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()
    
  console.log('DATA:', data)
  console.log('ERROR:', error)
}

run()
