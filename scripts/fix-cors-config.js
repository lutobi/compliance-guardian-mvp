#!/usr/bin/env node

/**
 * Supabase CORS Configuration Script
 * 
 * This script helps check and align the CORS configuration in Supabase 
 * with the local development server.
 * 
 * Usage:
 * 1. Make sure you have the SUPABASE_URL and SUPABASE_KEY environment variables set
 * 2. Run: node scripts/fix-cors-config.js
 */

const fetch = require('node-fetch');
const ora = require('ora');
const { prompt } = require('inquirer');
require('dotenv').config();

// Simple colored logging functions
const log = {
  blue: (text) => console.log(`\x1b[34m${text}\x1b[0m`),
  green: (text) => console.log(`\x1b[32m${text}\x1b[0m`),
  red: (text) => console.error(`\x1b[31m${text}\x1b[0m`),
  yellow: (text) => console.log(`\x1b[33m${text}\x1b[0m`)
};

// Development origins that should be allowed
const requiredOrigins = [
  'http://localhost:3000',
  'http://localhost:3008',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3008',
  'https://compliance-guardian-mvp.vercel.app'
];

async function main() {
  log.blue('🔧 Supabase CORS Configuration Tool');

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    log.red('❌ Missing environment variables. Please set:');
    log.yellow('   - NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL');
    log.yellow('   - NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_KEY');
    process.exit(1);
  }

  // Get current CORS configuration
  const spinner = ora('Fetching current CORS configuration...').start();
  try {
    const corsResponse = await fetch(`${supabaseUrl}/auth/v1/config`, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    if (!corsResponse.ok) {
      spinner.fail('Failed to fetch CORS configuration');
      log.red(`Error: ${corsResponse.status} ${corsResponse.statusText}`);
      const responseText = await corsResponse.text();
      log.red(responseText);
      process.exit(1);
    }

    const config = await corsResponse.json();
    spinner.succeed('Current CORS configuration fetched');

    const currentOrigins = config?.URI_ALLOW_LIST || [];
    log.green('Current allowed origins:');
    currentOrigins.forEach(origin => console.log(`  - ${origin}`));

    // Check if all required origins are present
    const missingOrigins = requiredOrigins.filter(origin => !currentOrigins.includes(origin));
    
    if (missingOrigins.length === 0) {
      log.green('✅ All required origins are already allowed.');
      return;
    }

    log.yellow('\nMissing required origins:');
    missingOrigins.forEach(origin => console.log(`  - ${origin}`));

    // Prompt to add missing origins
    const { shouldAdd } = await prompt({
      type: 'confirm',
      name: 'shouldAdd',
      message: 'Would you like to add these missing origins to the allowed list?',
      default: true,
    });

    if (!shouldAdd) {
      log.yellow('No changes made.');
      return;
    }

    // Add missing origins
    const updatingSpinner = ora('Updating CORS configuration...').start();
    const updatedOrigins = [...new Set([...currentOrigins, ...missingOrigins])];

    try {
      const updateResponse = await fetch(`${supabaseUrl}/auth/v1/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({
          URI_ALLOW_LIST: updatedOrigins
        })
      });

      if (!updateResponse.ok) {
        updatingSpinner.fail('Failed to update CORS configuration');
        log.red(`Error: ${updateResponse.status} ${updateResponse.statusText}`);
        const responseText = await updateResponse.text();
        log.red(responseText);
        process.exit(1);
      }

      updatingSpinner.succeed('CORS configuration updated successfully');
      
      log.green('\nUpdated allowed origins:');
      updatedOrigins.forEach(origin => console.log(`  - ${origin}`));
      
      log.blue('\n🎉 CORS configuration has been updated. You should now be able to connect from the specified origins.');
    } catch (error) {
      updatingSpinner.fail('Failed to update CORS configuration');
      log.red(`Error: ${error.message}`);
      process.exit(1);
    }
  } catch (error) {
    spinner.fail('Failed to fetch CORS configuration');
    log.red(`Error: ${error.message}`);
    process.exit(1);
  }
}

main().catch(error => {
  log.red(`Unexpected error: ${error.message}`);
  process.exit(1);
});
