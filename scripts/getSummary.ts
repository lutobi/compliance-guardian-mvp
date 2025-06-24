import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Usage: tsx scripts/getSummary.ts <assessmentId>
async function main() {
  let assessmentId = process.argv[2];
  // Initialize Supabase client for auto-selection of assessment
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Service Role Key environment variables.');
    process.exit(1);
  }
  const supabase = createClient(supabaseUrl, supabaseKey);
  if (!assessmentId) {
    const { data: assessments, error } = await supabase
      .from('assessments')
      .select('id')
      .limit(1);
    if (error || !assessments?.length) {
      console.error('No assessments found. Please create one or seed sample data.');
      process.exit(1);
    }
    assessmentId = assessments[0].id;
    console.log(`Using assessmentId: ${assessmentId}`);
  }

  const url = `http://localhost:3000/api/report/summary?assessmentId=${assessmentId}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`Error: HTTP ${res.status}`);
      const err = await res.text();
      console.error(err);
      process.exit(1);
    }
    const json = await res.json();
    console.log(JSON.stringify(json, null, 2));
  } catch (err) {
    console.error('Fetch error:', err);
    process.exit(1);
  }
}

main();
