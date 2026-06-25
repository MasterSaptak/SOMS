import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const envPath = path.resolve(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const env = {}
envContent.split('\n').forEach(line => {
  const [key, ...vals] = line.split('=')
  if (key && vals.length) {
    env[key.trim()] = vals.join('=').trim()
  }
})

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

async function checkFix() {
  const adminEmail = 'saptech.online009@gmail.com'
  
  const { data: orgs } = await supabase.from('organizations').select('*').limit(1)
  const org = orgs[0]

  const { data: users } = await supabase.auth.admin.listUsers()
  const adminUser = users.users.find(u => u.email === adminEmail)

  console.log('Org ID:', org.id)
  
  // check employees
  const { data: emp } = await supabase.from('employees').select('*').eq('user_id', adminUser.id).single()
  console.log('Employee Org ID:', emp?.organization_id)

  if (emp && emp.organization_id !== org.id) {
     console.log('Updating employee org_id...')
     await supabase.from('employees').update({ organization_id: org.id }).eq('id', emp.id)
  }

  // check all employees to ensure they point to the primary org if they have a dangling org_id
  const { data: allEmp } = await supabase.from('employees').select('id, organization_id')
  for (const e of allEmp) {
    if (e.organization_id !== org.id) {
       console.log('Updating org_id for employee:', e.id)
       await supabase.from('employees').update({ organization_id: org.id }).eq('id', e.id)
    }
  }

  console.log('Done.')
}

checkFix()
