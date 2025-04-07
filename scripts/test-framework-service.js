const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testFrameworkService() {
  console.log('Testing framework service...\n');

  // Test getting frameworks by slug
  const slugs = ['iso27001', 'nist-800-171', 'cmmc', 'iso27017', 'iso27018', 'iso27001-2022'];
  
  for (const slug of slugs) {
    console.log(`Testing framework: ${slug}`);
    const { data, error } = await supabase
      .from('frameworks')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error(`Error fetching ${slug}:`, error);
    } else {
      console.log('Found:', {
        id: data.id,
        name: data.name,
        slug: data.slug,
        categories: data.categories
      });
    }
    console.log();
  }
}

testFrameworkService();
