#!/usr/bin/env node

const dotenv = require('dotenv');
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

async function applyMigration() {
  try {
    console.log('Reading migration SQL...');
    const sql = fs.readFileSync(path.join(__dirname, '../migrations/20250818_fix_workspaces.sql'), 'utf8');

    // Split SQL into individual statements
    const statements = sql.split(';').filter(s => s.trim());
    console.log(`Found ${statements.length} SQL statements`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (!statement) continue;

      console.log(`\nExecuting statement ${i + 1}/${statements.length}...`);
      console.log(statement.substring(0, 100) + '...');

      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'X-Client-Info': 'supabase-js/2.33.1',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          query: statement,
          params: []
        })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`Failed to execute statement ${i + 1}:`, error);
        continue;
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
