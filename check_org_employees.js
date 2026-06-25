// @ts-nocheck
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkOrgEmployees() {
  const { data, error } = await supabase.from('employees').select('id, full_name, organization_id');
  console.log("All employees count:", data.length);
  const byOrg = {};
  for (const emp of data) {
    if (!byOrg[emp.organization_id]) byOrg[emp.organization_id] = 0;
    byOrg[emp.organization_id]++;
  }
  console.log("Employees by organization:", byOrg);
}

checkOrgEmployees();
