#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  dotenv.config({ path: '.env.local' });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const projectRef = supabaseUrl.match(/https:\/\/(.*?)\.supabase\.co/)[1];

if (!supabaseUrl || !serviceKey) {
  console.error('Missing env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

async function applyMigration() {
  try {
    console.log('Reading migration SQL...');
    const sql = fs.readFileSync(path.join(__dirname, '../migrations/20250818_fix_workspaces.sql'), 'utf8');

    console.log('Getting access token...');
    const authResponse = await fetch('https://api.supabase.com/v1/projects', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${serviceKey}`
      }
    });

    if (!authResponse.ok) {
      const error = await authResponse.json();
      throw new Error(`Auth failed: ${error.message || authResponse.statusText}`);
    }

    console.log('Applying migration via Management API...');
    const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`,
        'X-Client-Info': 'supabase-js/2.33.1'
      },
      body: JSON.stringify({
        query: sql,
        use_prepared_statements: false,
        consistent_read: true
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to apply migration');
    }

    const result = await response.json();
    console.log('✅ Migration applied successfully:', result);
  } catch (err) {
    console.error('❌ Failed to apply migration:', err.message);
    process.exit(1);
  }
}

applyMigration();
