import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in backend/.env');
}

// Keep this service-role client on the server only. Never expose the key in Vite/frontend variables.
export const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

export async function connectDB() {
  const { error } = await supabase.from('movies').select('id').limit(1);
  if (error && !/relation .* does not exist|Could not find the table/i.test(error.message)) {
    throw new Error(`Supabase connection failed: ${error.message}`);
  }
  if (error) {
    throw new Error('Connected to Supabase, but tables are missing. Run backend/supabase/schema.sql in the Supabase SQL Editor.');
  }
  console.log('Supabase connected.');
}
