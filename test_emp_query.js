const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const client = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await client
    .from('employees')
    .select(`
      id, full_name, organization_id, department_id, manager_id,
      manager:employees!manager_id(id, full_name, profile_photo, email),
      organizations(id, name),
      departments!employees_department_id_fkey(id, name, branch_id)
    `)
    .limit(1);

  if (error) {
    console.error("Error:", JSON.stringify(error, null, 2));
  } else {
    console.log("Success! Data:", data);
  }
}

run();
