const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const client = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await client
    .from('team_members')
    .select(`
      is_primary, role_id,
      team_member_roles(name),
      teams(id, name, code, department_id, branch_id)
    `)
    .limit(1);

  if (error) {
    console.error("Error team_members:", JSON.stringify(error, null, 2));
  } else {
    console.log("Success team_members! Data:", data);
  }
}

run();
