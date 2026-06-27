import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data } = await supabase.from('users').select('id, email').eq('email', 'saptech.online009@gmail.com').single();
  console.log('user_id:', data?.id);
  const { data: emp } = await supabase.from('employees').select('id, full_name, user_id').eq('user_id', data?.id).single();
  console.log('emp:', emp);
}

main().catch(console.error);
