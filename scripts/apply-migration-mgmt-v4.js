#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

const projectRef = 'nrfpsbbkynykubcaarpg';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZnBzYmJreW55a3ViY2FhcnBnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzA5MTc5OCwiZXhwIjoyMDYyNjY3Nzk4fQ.CsnQzzrLrxBV3RmON9ZYEOXJxchmCFSWsF648WVYQKg';

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(responseData));
          } catch {
            resolve(responseData);
          }
        } else {
          reject(new Error(`${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function applyMigration() {
  try {
    console.log('Reading migration SQL...');
    const sql = fs.readFileSync(path.join(__dirname, '../migrations/20250818_fix_workspaces.sql'), 'utf8');

    // Try Management API
    console.log('Applying migration via Management API...');
    const options = {
      hostname: 'api.supabase.com',
      port: 443,
      path: `/v1/projects/${projectRef}/sql`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`
      }
    };

    const result = await makeRequest(options, JSON.stringify({ query: sql }));
    console.log('✅ Migration applied successfully');
    console.log('Result:', result);
  } catch (err) {
    console.error('❌ Error:', err.message);
    
    // If Management API fails, try direct database connection
    try {
      console.log('\nTrying direct database connection...');
      const { Client } = require('pg');
      
      const connectionString = `postgresql://postgres.${projectRef}:${serviceKey}@db.${projectRef}.supabase.co:6543/postgres`;
      const client = new Client({ connectionString });
      
      await client.connect();
      await client.query(sql);
      await client.end();
      
      console.log('✅ Migration applied successfully via direct connection');
    } catch (dbErr) {
      console.error('❌ Database connection failed:', dbErr.message);
      process.exit(1);
    }
  }
}

applyMigration();
