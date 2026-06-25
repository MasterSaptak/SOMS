// @ts-nocheck
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUsers() {
  // Check employees table
  const { data: employees, error: err1 } = await supabase.from('employees').select('id, full_name, organization_id').limit(10);
  console.log("Employees:", employees);

  // Check organization_members table
  const { data: orgMembers, error: err2 } = await supabase.from('organization_members').select('id, user_id, organization_id').limit(10);
  console.log("Org Members:", orgMembers);

  // Check auth users
  const { data: authUsers, error: err3 } = await supabase.auth.admin.listUsers();
  console.log("Auth Users count:", authUsers?.users?.length);
}

checkUsers();
