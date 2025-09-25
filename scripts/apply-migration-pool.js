#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Extract project ref and region
const projectRef = 'nrfpsbbkynykubcaarpg';
const region = 'aws';  // Default to aws region

// Construct connection string using direct Postgres format
const connectionString = `postgres://postgres.${projectRef}:${process.env.SUPABASE_SERVICE_ROLE_KEY}@db.${projectRef}.supabase.co:5432/postgres`;

const pool = new Pool({ connectionString });

async function applyMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Connected to database');
    
    // Start transaction
    await client.query('BEGIN');

    console.log('\nReading migration SQL...');
    const sql = fs.readFileSync(path.join(__dirname, '../migrations/20250818_fix_workspaces.sql'), 'utf8');

    console.log('Applying migration...');
    await client.query(sql);
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('✅ Migration applied successfully');

  } catch (err) {
    // Rollback on error
    await client.query('ROLLBACK');
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

applyMigration();
