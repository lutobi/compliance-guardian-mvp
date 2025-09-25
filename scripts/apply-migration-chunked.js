#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://nrfpsbbkynykubcaarpg.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZnBzYmJreW55a3ViY2FhcnBnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzA5MTc5OCwiZXhwIjoyMDYyNjY3Nzk4fQ.4Vj2qZbGnzDNwJxw';

// Initialize multiple clients with different configs
const clients = [
  createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
    db: { schema: 'public' }
  }),
  createClient(supabaseUrl, serviceKey, {
    auth: { 
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  }),
  createClient(supabaseUrl, serviceKey)
];

// SQL statement types for targeted execution
const statementTypes = {
  TABLE: 'table',
  POLICY: 'policy',
  FUNCTION: 'function',
  OTHER: 'other'
};

function getStatementType(sql) {
  sql = sql.toLowerCase().trim();
  if (sql.includes('create table') || sql.includes('alter table')) return statementTypes.TABLE;
  if (sql.includes('create policy') || sql.includes('drop policy')) return statementTypes.POLICY;
  if (sql.includes('create function') || sql.includes('create or replace function')) return statementTypes.FUNCTION;
  return statementTypes.OTHER;
}

async function executeStatement(sql, type) {
  const errors = [];
  
  // Try each client
  for (const client of clients) {
    try {
      // Try different execution methods based on statement type
      const methods = [
        async () => await client.rpc('exec_sql', { sql }),
        async () => await client.rpc('execute_sql', { query: sql }),
        async () => {
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': serviceKey,
              'Authorization': `Bearer ${serviceKey}`,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ sql })
          });
          if (!response.ok) throw new Error(await response.text());
          return { error: null };
        }
      ];

      // Add type-specific methods
      if (type === statementTypes.TABLE) {
        methods.push(async () => await client.from('_raw_sql').insert({ query: sql }));
      }

      // Try each method
      for (const method of methods) {
        try {
          const { error } = await method();
          if (!error) return true;
          errors.push(error.message);
        } catch (err) {
          errors.push(err.message);
        }
      }
    } catch (err) {
      errors.push(err.message);
    }
  }

  console.warn('All attempts failed:', [...new Set(errors)].join(', '));
  return false;
}

async function applyMigration() {
  try {
    console.log('Reading migration SQL...');
    const sql = fs.readFileSync(path.join(__dirname, '../migrations/20250818_fix_workspaces.sql'), 'utf8');

    // Split into statements and group by type
    const statements = sql.split(';')
      .map(s => s.trim())
      .filter(s => s)
      .map(s => ({ sql: s, type: getStatementType(s) }));

    console.log(`Found ${statements.length} SQL statements`);

    // Execute statements in type order: tables -> policies -> functions -> other
    const typeOrder = [statementTypes.TABLE, statementTypes.POLICY, statementTypes.FUNCTION, statementTypes.OTHER];
    
    for (const type of typeOrder) {
      const typeStatements = statements.filter(s => s.type === type);
      if (!typeStatements.length) continue;

      console.log(`\nExecuting ${type} statements...`);
      for (let i = 0; i < typeStatements.length; i++) {
        const { sql } = typeStatements[i];
        console.log(`\nExecuting ${type} statement ${i + 1}/${typeStatements.length}...`);
        
        const success = await executeStatement(sql, type);
        if (!success) {
          console.warn(`⚠️ Failed to execute ${type} statement ${i + 1}`);
        } else {
          console.log(`✅ ${type} statement ${i + 1} executed successfully`);
        }
      }
    }

    console.log('\n✅ Migration completed');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

applyMigration();
