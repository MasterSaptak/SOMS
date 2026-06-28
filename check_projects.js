require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
async function run() {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await sb.from('projects').select('*').limit(1);
  if (error) console.error(error);
  else if (data && data.length > 0) console.log("Columns:", Object.keys(data[0]));
  else {
    const { data: d2, error: e2 } = await sb.rpc('get_table_columns', { table_name: 'projects' });
    if(e2) {
      console.log("No data, trying insert to get error...");
      const res = await sb.from('projects').insert({}).select();
      console.log(res.error.message);
    }
  }
}
run();
