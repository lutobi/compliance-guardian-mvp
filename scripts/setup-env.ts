#!/usr/bin/env tsx
import fs from 'fs';
import readline from 'readline';

async function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans.trim()); }));
}

(async () => {
  console.log('Creating .env.example and .env.local in project root');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || await prompt('SUPABASE_URL: ');
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || await prompt('NEXT_PUBLIC_SUPABASE_ANON_KEY: ');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || await prompt('SUPABASE_SERVICE_ROLE_KEY (optional): ');

  const exampleContent = [
    '# Copy to .env.local and fill in your values',
    'SUPABASE_URL=',
    'NEXT_PUBLIC_SUPABASE_URL=',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY=',
    'SUPABASE_SERVICE_ROLE_KEY=',
  ].join('\n') + '\n';

  const localContent = [
    `SUPABASE_URL=${supabaseUrl}`,
    `NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}`,
    `NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}`,
    serviceKey ? `SUPABASE_SERVICE_ROLE_KEY=${serviceKey}` : ''
  ].filter(Boolean).join('\n') + '\n';

  fs.writeFileSync('.env.example', exampleContent, 'utf8');
  fs.writeFileSync('.env.local', localContent, 'utf8');

  console.log('✅ .env.example and .env.local created');
})();
