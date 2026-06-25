import { createClient } from '@supabase/supabase-js'

// We don't need dotenv since process.env is injected by Next.js if we run via next, 
// but in a plain TS node script, we DO need dotenv. Let's just use a plain MJS file and load .env.local manually by reading it.
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

async function fixAdmin() {
  const adminEmail = 'saptech.online009@gmail.com'
  
  // 1. Get the admin user
  const { data: users, error: usersErr } = await supabase.auth.admin.listUsers()
  if (usersErr) {
    console.error('Error fetching users', usersErr)
    return
  }
  
  const adminUser = users.users.find(u => u.email === adminEmail)
  if (!adminUser) {
    console.log('Admin user not found in auth.users')
    return
  }
  
  console.log('Found admin user:', adminUser.id)

  // 2. Get the primary organization
  const { data: orgs } = await supabase.from('organizations').select('*').limit(1)
  let org = null
  if (!orgs || orgs.length === 0) {
    console.log('No organizations found, creating one...')
    const { data: newOrg, error: orgError } = await supabase.from('organizations').insert({
      name: 'Default Organization',
      slug: 'default-org'
    }).select().single()
    if (orgError) {
      console.error('Failed to create org:', orgError)
      return
    }
    org = newOrg
  } else {
    org = orgs[0]
  }
  console.log('Using org:', org.id)

  // 3. Ensure organization_members
  const { data: orgMember } = await supabase.from('organization_members').select('*').eq('user_id', adminUser.id).eq('organization_id', org.id).single()
  if (!orgMember) {
    console.log('Adding admin to organization_members')
    await supabase.from('organization_members').insert({
      user_id: adminUser.id,
      organization_id: org.id,
      role: 'owner'
    })
  }

  // 4. Ensure employees
  const { data: emp } = await supabase.from('employees').select('*').eq('user_id', adminUser.id).single()
  if (!emp) {
    console.log('Adding admin to employees')
    await supabase.from('employees').insert({
      user_id: adminUser.id,
      organization_id: org.id,
      full_name: 'Saptech Online',
      email: adminEmail,
      status: 'active'
    })
  } else {
      console.log('Admin already in employees:', emp.id)
  }

  console.log('Done.')
}

fixAdmin()
