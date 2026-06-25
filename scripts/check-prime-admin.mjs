import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  const { data: users, error: err } = await supabase.auth.admin.listUsers()
  if (err) {
      console.error('List Users Error:', err)
      return
  }
  const user = users.users.find(u => u.email === 'saptech.online009@gmail.com')
  if (!user) {
    console.log('User not found in auth.users')
    return
  }
  console.log('User ID:', user.id)

  const { data: emp, error } = await supabase.from('employees').select('id, user_id').eq('user_id', user.id).single()
  console.log('Employee Record:', emp, error)

  if (emp) {
      // test the full query
      const { data: fullEmp, error: fullErr } = await supabase.from('employees')
      .select(`
          *,
          department:departments(*),
          team:teams(*),
          designation:designations(*),
          workLocation:work_locations(*),
          manager:employees!manager_id(id, full_name, email, profile_photo)
        `)
        .eq('id', emp.id)
        .single()

      console.log('Full Query Error:', fullErr?.message || fullErr)
  }
}
run().catch(console.error)
