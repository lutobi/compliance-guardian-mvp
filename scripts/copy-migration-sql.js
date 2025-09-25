#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const sql = fs.readFileSync(path.join(__dirname, '../migrations/20250818_fix_workspaces.sql'), 'utf8');

// Use pbcopy on macOS to copy to clipboard
const pbcopy = exec('pbcopy');
pbcopy.stdin.write(sql);
pbcopy.stdin.end();

console.log('✅ Migration SQL copied to clipboard');
console.log('Please paste this into the Supabase SQL Editor at:');
console.log('https://supabase.com/dashboard/project/nrfpsbbkynykubcaarpg/sql/new');
