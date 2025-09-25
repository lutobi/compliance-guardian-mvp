#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://nrfpsbbkynykubcaarpg.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZnBzYmJreW55a3ViY2FhcnBnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzA5MTc5OCwiZXhwIjoyMDYyNjY3Nzk4fQ.CsnQzzrLrxBV3RmON9ZYEOXJxchmCFSWsF648WVYQKg';

// Initialize client with admin auth
const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

async function applyMigration() {
  try {
    // First verify admin access
    console.log('Verifying admin access...');
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) throw usersError;
    console.log('✅ Admin access verified');

    // Read and split migration SQL
    console.log('\nReading migration SQL...');
    const sql = fs.readFileSync(path.join(__dirname, '../migrations/20250818_fix_workspaces.sql'), 'utf8');
    const statements = sql.split(';').filter(s => s.trim());
    console.log(`Found ${statements.length} SQL statements`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (!statement) continue;

      console.log(`\nExecuting statement ${i + 1}/${statements.length}...`);
      
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      if (error) {
        console.warn(`⚠️ Statement ${i + 1} failed:`, error.message);
        continue;
      }
      
      console.log(`✅ Statement ${i + 1} executed successfully`);
    }

    console.log('\n✅ Migration completed');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

applyMigration();
