const fs = require('fs');
const path = require('path');

const sql = fs.readFileSync(path.join(__dirname, '../migrations/20250818_fix_workspaces.sql'), 'utf8');

// Split into statements and format for dashboard
const statements = sql
  .split(';')
  .filter(stmt => stmt.trim())
  .map(stmt => stmt.trim() + ';')
  .join('\n\n');

console.log(statements);
