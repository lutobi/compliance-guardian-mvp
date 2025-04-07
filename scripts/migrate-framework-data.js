const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const frameworkData = {
  'nist-800-171': {
    name: 'NIST SP 800-171',
    description: 'Protecting Controlled Unclassified Information in Nonfederal Systems and Organizations',
    version: 'Rev. 2',
    categories: ['government', 'security', 'compliance']
  },
  'iso-27001': {
    name: 'ISO/IEC 27001',
    description: 'Information Security Management System (ISMS)',
    version: '2013',
    categories: ['international', 'security', 'management']
  },
  'cmmc': {
    name: 'Cybersecurity Maturity Model Certification',
    description: 'Department of Defense Cybersecurity Requirements',
    version: '2.0',
    categories: ['government', 'defense', 'security']
  }
};

async function migrateFrameworkData() {
  console.log('Migrating framework data...');

  for (const [slug, framework] of Object.entries(frameworkData)) {
    console.log(`Migrating framework: ${slug}`);

    const { data: existingFramework, error: fetchError } = await supabase
      .from('frameworks')
      .select('id')
      .eq('slug', slug)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error(`Error fetching framework ${slug}:`, fetchError);
      continue;
    }

    if (!existingFramework) {
      const { error: insertError } = await supabase
        .from('frameworks')
        .insert({
          slug,
          name: framework.name,
          description: framework.description,
          version: framework.version,
          categories: framework.categories || []
        });

      if (insertError) {
        console.error(`Error inserting framework ${slug}:`, insertError);
      } else {
        console.log(`Created framework: ${slug}`);
      }
    } else {
      console.log(`Framework ${slug} already exists`);
    }
  }

  console.log('Framework data migration complete');
}

migrateFrameworkData();
