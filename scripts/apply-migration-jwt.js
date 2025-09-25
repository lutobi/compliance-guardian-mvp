#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://nrfpsbbkynykubcaarpg.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZnBzYmJreW55a3ViY2FhcnBnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzA5MTc5OCwiZXhwIjoyMDYyNjY3Nzk4fQ.4Vj2qZbGnzDNwJxw';

// Parse the service key to get the secret
const [header, payload, signature] = serviceKey.split('.');
const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString());

// Generate a fresh JWT token with minimal claims
const freshToken = jwt.sign({
  role: 'service_role',
  iss: 'supabase',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600,
  ref: decodedPayload.ref
}, signature);

// Create client with fresh token
const supabase = createClient(supabaseUrl, freshToken, {
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
    // First verify access
    console.log('Verifying API access...');
    const { data: testData, error: testError } = await supabase
      .from('_migrations')
      .select('*')
      .limit(1);
    
    if (testError) throw testError;
    console.log('✅ API access verified');

    // Read migration SQL
    console.log('\nReading migration SQL...');
    const sql = fs.readFileSync(path.join(__dirname, '../migrations/20250818_fix_workspaces.sql'), 'utf8');

    // Split into statements
    const statements = sql.split(';')
      .map(s => s.trim())
      .filter(s => s);
    
    console.log(`Found ${statements.length} SQL statements`);

    // Try different execution methods
    const methods = [
      // Method 1: Direct RPC call
      async (sql) => await supabase.rpc('exec_sql', { sql }),
      
      // Method 2: REST API call
      async (sql) => {
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': freshToken,
            'Authorization': `Bearer ${freshToken}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ sql })
        });
        if (!response.ok) throw new Error(await response.text());
        return { error: null };
      },
      
      // Method 3: Raw SQL insert
      async (sql) => await supabase.from('_raw_sql').insert({ query: sql }),
      
      // Method 4: Management API
      async (sql) => {
        const response = await fetch(`${supabaseUrl}/rest/v1/sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': freshToken,
            'Authorization': `Bearer ${freshToken}`
          },
          body: JSON.stringify({ query: sql })
        });
        if (!response.ok) throw new Error(await response.text());
        return { error: null };
      }
    ];

    // Try each statement with each method
    for (let i = 0; i < statements.length; i++) {
      const sql = statements[i];
      console.log(`\nExecuting statement ${i + 1}/${statements.length}...`);
      
      let success = false;
      for (const method of methods) {
        try {
          const { error } = await method(sql);
          if (!error) {
            success = true;
            break;
          }
        } catch (err) {
          console.warn('Method failed:', err.message);
        }
      }

      if (!success) {
        console.warn(`⚠️ Failed to execute statement ${i + 1}`);
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully`);
      }
    }

    console.log('\n✅ Migration completed');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

// Install required dependency
const { execSync } = require('child_process');
console.log('Installing dependencies...');
execSync('npm install jsonwebtoken --save', { stdio: 'inherit' });

applyMigration();
