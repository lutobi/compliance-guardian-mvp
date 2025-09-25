#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://nrfpsbbkynykubcaarpg.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZnBzYmJreW55a3ViY2FhcnBnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzA5MTc5OCwiZXhwIjoyMDYyNjY3Nzk4fQ.CsnQzzrLrxBV3RmON9ZYEOXJxchmCFSWsF648WVYQKg';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

async function applyMigration() {
  try {
    // Get access token via service_role grant
    console.log('Getting access token...');
    const { data: { session }, error: authError } = await supabase.auth.signInWithServiceRole();
    if (authError) throw authError;

    const accessToken = session.access_token;
    console.log('✅ Got access token');

    // Read migration SQL
    console.log('\nReading migration SQL...');
    const sql = fs.readFileSync(path.join(__dirname, '../migrations/20250818_fix_workspaces.sql'), 'utf8');

    // Try different API endpoints with the access token
    const endpoints = [
      // Management API
      {
        url: `https://api.supabase.com/v1/projects/nrfpsbbkynykubcaarpg/sql`,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      },
      // REST API
      {
        url: `${supabaseUrl}/rest/v1/sql`,
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      },
      // PgREST API
      {
        url: `${supabaseUrl}/rest/v1/rpc/exec_sql`,
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        }
      }
    ];

    console.log('Applying migration...');
    let success = false;

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint.url, {
          method: 'POST',
          headers: endpoint.headers,
          body: JSON.stringify({ query: sql })
        });

        if (response.ok) {
          success = true;
          break;
        }
      } catch (err) {
        console.warn(`Endpoint failed:`, err.message);
      }
    }

    if (!success) {
      throw new Error('All endpoints failed');
    }

    console.log('✅ Migration applied successfully');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

applyMigration();
