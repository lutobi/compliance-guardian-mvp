#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars');
  process.exit(1);
}

async function applyMigration() {
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  const sql = fs.readFileSync(path.join(__dirname, '../migrations/20250818_fix_workspaces.sql'), 'utf8');
  
  console.log('Applying migration...');
  const { data, error } = await supabase.rpc('exec_sql', { query: sql });
  
  if (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }

  console.log('Migration successful:', data);
}

applyMigration().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
