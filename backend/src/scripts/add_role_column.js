import 'dotenv/config';
import { supabase } from '../config/db.js';

async function addRoleColumn() {
  // Add role column if it doesn't exist
  const { data, error } = await supabase.rpc('pg_try_advisory_lock', { key: 123456 }); // dummy lock to avoid race
  // Using raw SQL via supabase's `query` method is not directly available; we can use `supabase.from('users').select('role', { count: 'exact', head: true })` to check.
  // Instead, attempt to alter table; if column exists, error will be ignored.
  const sql = `ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user';`;
  const { error: alterError } = await supabase.rpc('run_sql', { sql });
  if (alterError) {
    console.error('Error altering table:', alterError);
  } else {
    console.log('Role column ensured.');
  }
}

addRoleColumn().then(() => {
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
