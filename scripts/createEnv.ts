import fs from 'fs';
import path from 'path';
import readline from 'readline';

const existingUrl = process.env.SUPABASE_URL;
const existingKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans.trim()); }));
}

async function main() {
  let url = existingUrl;
  let key = existingKey;
  if (url && key) {
    console.log('Using SUPABASE_URL and SERVICE_ROLE_KEY from environment.');
  } else {
    console.log('This will generate a .env.local file in your project root.');
    url = await prompt('Enter your SUPABASE_URL: ');
    key = await prompt('Enter your SUPABASE_SERVICE_ROLE_KEY: ');
  }

  if (!url || !key) {
    console.error('Both values are required. Exiting.');
    process.exit(1);
  }

  const content = `SUPABASE_URL=${url}\nSUPABASE_SERVICE_ROLE_KEY=${key}\n`;
  const target = path.resolve(__dirname, '../.env.local');
  fs.writeFileSync(target, content, { encoding: 'utf8', flag: 'w' });
  console.log(`.env.local created at ${target}`);
}

main().catch(err => {
  console.error('Error creating .env.local:', err);
  process.exit(1);
});
