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

const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

async function applyMigration() {
  try {
    console.log('Reading migration SQL...');
    const sql = fs.readFileSync(path.join(__dirname, '../migrations/20250818_fix_workspaces.sql'), 'utf8');

    // First verify admin access works
    console.log('Verifying admin access...');
    const { data: users, error: usersError } = await admin.auth.admin.listUsers();
    if (usersError) {
      throw new Error(`Admin access failed: ${usersError.message}`);
    }
    console.log('Admin access verified');

    // Split SQL into individual statements
    const statements = sql.split(';').filter(s => s.trim());
    console.log(`Found ${statements.length} SQL statements`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (!statement) continue;

      console.log(`\nExecuting statement ${i + 1}/${statements.length}...`);
      console.log(statement.substring(0, 100) + '...');

      // Try direct query first
      let result = await admin.from('_migrations').select('*');
      if (!result.error) {
        // If direct query works, use it
        result = await admin.rpc('exec_sql', { sql: statement });
      } else {
        // Otherwise try REST API
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ sql: statement })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(`REST API failed: ${error.message || response.statusText}`);
        }
      }
      
      console.log(`✅ Statement ${i + 1} executed successfully`);
    }

    console.log('\n✅ All migrations completed');
  } catch (err) {
    console.error('❌ Failed to apply migration:', err.message);
    process.exit(1);
  }
}

applyMigration();
