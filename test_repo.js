// @ts-nocheck
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testRepository() {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  let query = sb
    .from('employees')
    .select('id, user_id, employee_id_string, full_name, email, phone, profile_photo, employment_status, employment_type, lifecycle_status, department, designation, organization_id, reports_to_employee_id, joining_date, created_at, updated_at', { count: 'exact' })

  // Simulate repository code
  const limit = 50;
  const offset = 0;
  query = query.order('full_name').range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  console.log("Error:", error);
  console.log("Count:", count);
  console.log("Data length:", data ? data.length : 0);
}

testRepository();
