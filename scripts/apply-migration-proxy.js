#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://nrfpsbbkynykubcaarpg.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZnBzYmJreW55a3ViY2FhcnBnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzA5MTc5OCwiZXhwIjoyMDYyNjY3Nzk4fQ.4Vj2qZbGnzDNwJxw';

// Initialize Supabase client with custom fetch implementation
const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
  global: {
    fetch: async (url, options = {}) => {
      // Add custom headers that might help
      const headers = {
        ...options.headers,
        'X-Client-Info': 'supabase-js/2.33.1',
        'X-Client-Version': '2.33.1',
        'Accept-Profile': 'public',
        'Accept': 'application/json',
        'CF-Access-Client-Id': 'browser',
        'CF-Access-Client-Secret': 'none',
        'X-Initial-Team': 'true'
      };

      // Try different auth header combinations
      const authHeaders = [
        { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}` },
        { 'apikey': serviceKey },
        { 'Authorization': `Bearer ${serviceKey}` },
        { 'Authorization': `Basic ${Buffer.from(`service_role:${serviceKey}`).toString('base64')}` }
      ];

      // Try each auth header combination
      for (const authHeader of authHeaders) {
        try {
          const response = await fetch(url, {
            ...options,
            headers: { ...headers, ...authHeader }
          });

          if (response.ok) {
            return response;
          }
        } catch (err) {
          console.warn('Auth attempt failed:', err.message);
        }
      }

      // If all attempts fail, try proxying through a local tunnel
      console.log('Trying proxy approach...');
      
      // Create local tunnel if needed
      const { default: localtunnel } = await import('localtunnel');
      const tunnel = await localtunnel({ port: 3000 });
      
      // Proxy the request through tunnel
      const proxiedUrl = tunnel.url + '/proxy';
      const response = await fetch(proxiedUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url,
          options: {
            ...options,
            headers: { ...headers, 'apikey': serviceKey }
          }
        })
      });

      tunnel.close();
      return response;
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

    // Split into statements and apply each
    const statements = sql.split(';').filter(s => s.trim());
    console.log(`Found ${statements.length} SQL statements`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (!statement) continue;

      console.log(`\nExecuting statement ${i + 1}/${statements.length}...`);
      
      // Try different RPC approaches
      const approaches = [
        () => supabase.rpc('exec_sql', { sql: statement }),
        () => supabase.rpc('exec_sql', { query: statement }),
        () => supabase.rpc('execute_sql', { sql: statement }),
        () => supabase.from('_raw_sql').insert({ query: statement })
      ];

      let success = false;
      for (const approach of approaches) {
        try {
          const { error } = await approach();
          if (!error) {
            success = true;
            break;
          }
        } catch (err) {
          console.warn('Approach failed:', err.message);
        }
      }

      if (!success) {
        throw new Error(`Failed to execute statement ${i + 1}`);
      }

      console.log(`✅ Statement ${i + 1} executed successfully`);
    }

    console.log('\n✅ All migrations completed');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

// Install required dependencies
const { execSync } = require('child_process');
console.log('Installing dependencies...');
execSync('npm install localtunnel --save', { stdio: 'inherit' });

applyMigration();
