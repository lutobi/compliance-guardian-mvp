const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
const content = fs.readFileSync(envPath, 'utf8');

const envVars = content.split('\n').reduce((acc, line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    acc[match[1]] = match[2];
  }
  return acc;
}, {});

console.log(JSON.stringify({
  projectId: envVars.NEXT_PUBLIC_SUPABASE_PROJECT_ID,
  url: envVars.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
}, null, 2));
