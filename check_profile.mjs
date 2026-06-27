import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function run() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', '3b5bd9dd-9dab-4e6d-8149-c088a631cae2')

  if (error) console.error(error)
  else console.log('PROFILES:', data)
}

run()
