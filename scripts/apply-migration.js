const fs = require('fs');
const path = require('path');
const https = require('https');

const supabaseUrl = 'https://nrfpsbbkynykubcaarpg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZnBzYmJreW55a3ViY2FhcnBnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzA5MTc5OCwiZXhwIjoyMDYyNjY3Nzk4fQ.CsnQzzrLrxBV3RmON9ZYEOXJxchmCFSWsF648WVYQKg';

async function executeSql(sql) {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      }
    };

    const req = https.request(`${supabaseUrl}/rest/v1/rpc/exec_sql`, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify({ query: sql }));
    req.end();
  });
}

async function runMigration() {
  const sql = fs.readFileSync(path.join(__dirname, '../migrations/20250818_fix_workspaces.sql'), 'utf8');
  
  console.log('Running migration...');
  try {
    await executeSql(sql);
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
