#!/usr/bin/env node

const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

dotenv.config();
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  dotenv.config({ path: '.env.local' });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create client with debug logging
const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js/2.33.1'
    }
  }
});

async function applyMigration() {
  try {
    // First verify we can authenticate
    console.log('Verifying authentication...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError) {
      throw new Error(`Auth failed: ${authError.message}`);
    }
    console.log('Auth successful:', authData);

    // Try to access a protected resource
    console.log('\nTesting database access...');
    const { data: testData, error: testError } = await supabase
      .from('_migrations')
      .select('*')
      .limit(1);
    
    if (testError) {
      throw new Error(`Database access failed: ${testError.message}`);
    }
    console.log('Database access successful');

    // Read and apply migration
    console.log('\nReading migration SQL...');
    const sql = fs.readFileSync(path.join(__dirname, '../migrations/20250818_fix_workspaces.sql'), 'utf8');

    console.log('Applying migration...');
    const { error: sqlError } = await supabase.rpc('exec_sql', { sql });

    if (sqlError) {
      throw new Error(`Migration failed: ${sqlError.message}`);
    }

    console.log('✅ Migration applied successfully');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

applyMigration();
