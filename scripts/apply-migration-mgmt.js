#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const projectRef = 'nrfpsbbkynykubcaarpg';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceKey) {
  console.error('Missing env: SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

async function applyMigration() {
  try {
    console.log('Reading migration SQL...');
    const sql = fs.readFileSync(path.join(__dirname, '../migrations/20250818_fix_workspaces.sql'), 'utf8');

    console.log('Applying migration via Management API...');
    const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`
      },
      body: JSON.stringify({
        query: sql
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to apply migration');
    }

    console.log('✅ Migration applied successfully');
  } catch (err) {
    console.error('❌ Failed to apply migration:', err.message);
    process.exit(1);
  }
}

applyMigration();
