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
    .select('id, full_name, user_id, organization_id')
    .ilike('full_name', '%Saptak%')

  if (error) console.error(error)
  else console.log('EMPLOYEES:', data)

  if (data?.[0]?.user_id) {
    const { data: memberData } = await supabase
      .from('organization_members')
      .select('*')
      .eq('user_id', data[0].user_id)
    console.log('MEMBERS:', memberData)
  }
}

run()
