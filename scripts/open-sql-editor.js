#!/usr/bin/env node

const { exec } = require('child_process');

const projectRef = 'nrfpsbbkynykubcaarpg';
const sqlEditorUrl = `https://supabase.com/dashboard/project/${projectRef}/sql/new`;

console.log('Opening Supabase SQL Editor...');
console.log(`URL: ${sqlEditorUrl}`);

// Open URL in default browser
const command = process.platform === 'darwin' 
  ? `open "${sqlEditorUrl}"`
  : process.platform === 'win32'
    ? `start "${sqlEditorUrl}"`
    : `xdg-open "${sqlEditorUrl}"`;

exec(command, (error) => {
  if (error) {
    console.error('Failed to open browser:', error);
    process.exit(1);
  }
  console.log('✅ SQL Editor opened in browser');
});
