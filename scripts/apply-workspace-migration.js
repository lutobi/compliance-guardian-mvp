#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function applyMigration() {
  try {
    console.log('Applying workspace migration...');
    const sql = fs.readFileSync(path.join(__dirname, '../migrations/20250818_fix_workspaces.sql'), 'utf8');
    
    const { error } = await supabase.rpc('exec_sql', { sql });
    if (error) throw error;

    console.log('✅ Migration applied successfully');
  } catch (err) {
    console.error('❌ Failed to apply migration:', err.message);
    process.exit(1);
  }
}

applyMigration();
