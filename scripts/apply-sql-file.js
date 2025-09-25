#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load env from .env and .env.local if available
dotenv.config();
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  dotenv.config({ path: path.join(process.cwd(), '.env.local') });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function main() {
  try {
    const fileArg = process.argv[2];
    if (!fileArg) {
      console.error('Usage: node scripts/apply-sql-file.js <path-to-sql>');
      process.exit(1);
    }

    if (!supabaseUrl || !serviceKey) {
      console.error('Missing env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      process.exit(1);
    }

    const sqlPath = path.isAbsolute(fileArg) ? fileArg : path.join(process.cwd(), fileArg);
    if (!fs.existsSync(sqlPath)) {
      console.error(`SQL file not found: ${sqlPath}`);
      process.exit(1);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');
    if (!sql.trim()) {
      console.error('SQL file is empty');
      process.exit(1);
    }

    // Apply via Supabase SQL Editor API
    const res = await fetch(`${supabaseUrl}/pg/sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      },
      body: JSON.stringify({
        query: sql,
        db_schema: 'public'
      })
    });

    if (!res.ok) {
      let errText;
      try { errText = await res.text(); } catch { errText = `${res.status} ${res.statusText}`; }
      throw new Error(`SQL apply failed: ${errText}`);
    }

    const result = await res.json().catch(() => ({}));
    console.log('✅ SQL applied successfully:', path.basename(sqlPath));
    if (result?.execution_details) {
      console.log('Details:', result.execution_details);
    }
  } catch (err) {
    console.error('❌ Failed to apply SQL:', err.message);
    process.exit(1);
  }
}

main();
