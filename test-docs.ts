import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function testQuery() {
  const { data, error } = await supabase.from('document_categories').select('*').limit(1)
  console.log('Categories:', data, error)
  
  const { data: dData, error: dError } = await supabase.from('documents').select('*').limit(1)
  console.log('Documents:', dData, dError)
}

testQuery()
