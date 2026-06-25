const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...vals] = line.split('=');
  if (key && vals.length) env[key.trim()] = vals.join('=').trim();
});

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data: authData } = await sb.auth.admin.listUsers()
  const { data: profiles } = await sb.from('profiles').select('*')
  const { data: memberships } = await sb.from('organization_members').select('user_id, role, organizations(id, name, slug)').eq('status', 'active')
  const { data: employees } = await sb.from('employees').select('id, user_id, organization_id')

  const users = authData.users.map(u => {
    const profile = profiles.find(p => p.id === u.id)
    const userMemberships = memberships.filter(m => m.user_id === u.id)
    
    return {
      id: u.id,
      email: u.email,
      createdAt: u.created_at,
      lastSignInAt: u.last_sign_in_at,
      role: profile?.role || 'user',
      isBanned: !!u.banned_until,
      memberships: userMemberships.map(m => {
        const emp = employees?.find(e => e.user_id === u.id && e.organization_id === m.organizations?.id)
        return {
          orgId: m.organizations?.id,
          orgName: m.organizations?.name,
          role: m.role,
          employeeId: emp?.id
        }
      })
    }
  })

  console.log(JSON.stringify(users, null, 2))
}
test()
