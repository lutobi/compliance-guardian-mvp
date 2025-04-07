const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.NEXT_PUBLIC_SUPABASE_URL.replace('https://', 'postgresql://postgres:your-password@'),
  ssl: {
    rejectUnauthorized: false
  }
});

async function createFrameworksTable() {
  console.log('Creating frameworks table...');

  try {
    await pool.query(`
      -- Enable UUID extension if not already enabled
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      -- Drop existing table if it exists
      DROP TABLE IF EXISTS frameworks;

      -- Create frameworks table
      CREATE TABLE frameworks (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        slug TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        version TEXT,
        categories TEXT[],
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    console.log('Frameworks table created successfully');
  } catch (error) {
    console.error('Error creating table:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createFrameworksTable();
