import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function run() {
  const { data, error } = await supabase
    .from('employees')
    .select('id, full_name, user_id, organization_id, organization_member_id')
    .ilike('full_name', '%Saptak%')

  if (error) console.error(error)
  else console.log('EMPLOYEES:', data)
}

run()
