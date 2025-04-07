const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function setupFrameworksTable() {
  console.log('Setting up frameworks table...');
  
  const { data, error } = await supabase
    .from('frameworks')
    .select('id')
    .limit(1);

  if (error) {
    console.log('Table does not exist, creating...');
    const { error: createError } = await supabase
      .from('frameworks')
      .insert({
        slug: 'test',
        name: 'Test Framework',
        description: 'Test framework to initialize table',
        version: '1.0.0',
        categories: ['test']
      });

    if (createError) {
      console.error('Error creating table:', createError);
      process.exit(1);
    }

    console.log('Frameworks table created successfully');
  } else {
    console.log('Frameworks table already exists');
  }
}

setupFrameworksTable();
