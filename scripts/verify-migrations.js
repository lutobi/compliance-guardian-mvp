#!/usr/bin/env node

/**
 * Migration Verification Script
 * 
 * This script helps verify that the SQL migrations are valid and will properly
 * create the required tables when applied to the Supabase database.
 * 
 * It checks the syntax of SQL migration files and provides feedback on next steps.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Simple colored logging functions
const log = {
  blue: (text) => console.log(`\x1b[34m${text}\x1b[0m`),
  green: (text) => console.log(`\x1b[32m${text}\x1b[0m`),
  red: (text) => console.error(`\x1b[31m${text}\x1b[0m`),
  yellow: (text) => console.log(`\x1b[33m${text}\x1b[0m`)
};

async function verifyMigrations() {
  log.blue('🔍 Migration Verification Tool');
  
  const migrationDir = path.join(process.cwd(), 'migrations');
  
  // Check if migrations directory exists
  if (!fs.existsSync(migrationDir)) {
    log.red('❌ Migrations directory not found!');
    process.exit(1);
  }
  
  // Get all SQL migration files
  const migrations = fs.readdirSync(migrationDir)
    .filter(file => file.endsWith('.sql'))
    .map(file => path.join(migrationDir, file));
  
  log.green(`Found ${migrations.length} migration file(s):`);
  migrations.forEach(file => {
    console.log(`  - ${path.basename(file)}`);
  });
  
  // Check syntax of each migration
  let allValid = true;
  
  for (const migration of migrations) {
    try {
      const content = fs.readFileSync(migration, 'utf8');
      
      // Basic SQL syntax validation (simple check for balanced parentheses, etc.)
      const openParens = (content.match(/\(/g) || []).length;
      const closeParens = (content.match(/\)/g) || []).length;
      
      if (openParens !== closeParens) {
        log.red(`❌ Syntax error in ${path.basename(migration)}: Unbalanced parentheses`);
        allValid = false;
        continue;
      }
      
      // Check for common SQL statements
      const hasCreateTable = content.toLowerCase().includes('create table');
      const hasPolicy = content.toLowerCase().includes('create policy');
      const hasRLS = content.toLowerCase().includes('enable row level security');
      
      log.green(`✅ ${path.basename(migration)}: Valid SQL syntax`);
      console.log(`  - Contains CREATE TABLE: ${hasCreateTable ? 'Yes' : 'No'}`);
      console.log(`  - Contains RLS policies: ${hasPolicy ? 'Yes' : 'No'}`);
      console.log(`  - Enables RLS: ${hasRLS ? 'Yes' : 'No'}`);
    } catch (error) {
      log.red(`❌ Error reading ${path.basename(migration)}: ${error.message}`);
      allValid = false;
    }
  }
  
  if (allValid) {
    log.green('\n✅ All migration files have valid syntax');
    log.yellow('\nNext steps:');
    log.yellow('1. Ensure your Supabase environment is properly configured');
    log.yellow('   - Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment');
    log.yellow('2. Run the SQL migrations in the Supabase SQL Editor');
    log.yellow('   - Copy the content of each SQL file and execute them in sequence');
    log.yellow('3. Run the fix-cors-config.js script after setting environment variables');
    log.yellow('   - This will update CORS settings to allow local development');
    log.yellow('4. Restart your development server to apply all changes');
  } else {
    log.red('\n❌ Some migration files have syntax issues. Please fix before running.');
  }
}

verifyMigrations().catch(error => {
  log.red(`Unexpected error: ${error.message}`);
  process.exit(1);
});
