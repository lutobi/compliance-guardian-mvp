const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testFrameworkService() {
  console.log('Testing updated framework service...\n');

  // Test listing all frameworks
  console.log('Listing all frameworks:');
  const { data: frameworks, error: listError } = await supabase
    .from('frameworks')
    .select('*')
    .order('name');

  if (listError) {
    console.error('Error listing frameworks:', listError);
  } else {
    console.log('Found', frameworks.length, 'frameworks:');
    frameworks.forEach(framework => {
      console.log({
        id: framework.id,
        slug: framework.slug,
        data: {
          name: framework.name,
          version: framework.version,
          categories: framework.categories
        }
      });
    });
  }
  console.log();

  // Test getting framework by slug
  const testSlug = 'iso27001';
  console.log(`Testing getFrameworkBySlug('${testSlug}'):`);
  const { data: framework, error: getError } = await supabase
    .from('frameworks')
    .select('*')
    .eq('slug', testSlug)
    .single();

  if (getError) {
    console.error(`Error fetching ${testSlug}:`, getError);
  } else {
    console.log('Found:', {
      id: framework.id,
      slug: framework.slug,
      data: {
        name: framework.name,
        version: framework.version,
        categories: framework.categories
      }
    });
  }
}

testFrameworkService();
