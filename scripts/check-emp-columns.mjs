import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  const res = await supabase.rpc('execute_sql', { query: "SELECT column_name FROM information_schema.columns WHERE table_name = 'employees';" })
  console.log("Employees Columns:", res.error || res.data)
  
  if (res.error) {
      // If execute_sql doesn't exist, we can't easily query schema columns without it. Let's just try to select 1 row.
      const { data, error } = await supabase.from('employees').select('*').limit(1)
      console.log("Employees 1 row:", error || Object.keys(data?.[0] || {}))
  }
}
run().catch(console.error)
