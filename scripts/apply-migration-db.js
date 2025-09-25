#!/usr/bin/env node

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Extract project ref from URL
const projectRef = 'nrfpsbbkynykubcaarpg';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZnBzYmJreW55a3ViY2FhcnBnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzA5MTc5OCwiZXhwIjoyMDYyNjY3Nzk4fQ.4Vj2qZbGnzDNwJxw';

// Construct connection string using project ref pattern
const connectionString = `postgresql://postgres:${serviceKey}@db.${projectRef}.supabase.co:5432/postgres`;

async function applyMigration() {
  const client = new Client({ connectionString });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully');

    console.log('\nReading migration SQL...');
    const sql = fs.readFileSync(path.join(__dirname, '../migrations/20250818_fix_workspaces.sql'), 'utf8');

    console.log('Applying migration...');
    await client.query(sql);
    console.log('✅ Migration applied successfully');

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyMigration();
