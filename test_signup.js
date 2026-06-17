const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ocqrkuoinbmfyoragcaz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jcXJrdW9pbmJtZnlvcmFnY2F6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2ODMwMzMsImV4cCI6MjA5NzI1OTAzM30.SRtvKjHGO0fxRcnV3sremq5eZte0WZz82IWFOoPqWLQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Trying to sign up...');
  const { data, error } = await supabase.auth.signUp({
    email: 'test_signup_error@gmail.com',
    password: 'password123'
  });
  console.log('Data:', data);
  console.log('Error:', error);
}

test();
