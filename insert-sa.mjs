import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: user } = await supabase.auth.admin.listUsers();
  const saptech = user.users.find(u => u.email === 'saptech.online009@gmail.com');
  
  if (!saptech) {
    console.log('Super admin not found');
    return;
  }

  // Check if they are in an org
  const { data: org } = await supabase.from('organizations').select('id').limit(1).single();

  // Also add them to organization_members so they pass all normal auth checks!
  const { data: member } = await supabase.from('organization_members').upsert({
    organization_id: org.id,
    user_id: saptech.id,
    role: 'super_admin',
    status: 'active'
  }, { onConflict: 'organization_id, user_id' }).select().single();

  // Insert employee record
  const { data: emp, error } = await supabase.from('employees').upsert({
    user_id: saptech.id,
    organization_member_id: member?.id,
    organization_id: org.id,
    full_name: 'Super Admin',
    email: 'saptech.online009@gmail.com',
    employee_id_string: 'SA-001',
    employment_status: 'active'
  }, { onConflict: 'user_id' }).select().single();

  console.log('Upserted employee:', emp?.id, error);
}

main().catch(console.error);
